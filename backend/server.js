import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { getPool, sql } from "./db.js";

import multer from "multer";
import {
  uploadAudioToBlob,
  streamAudioFromBlob,
  deleteAudioFromBlob,
} from "./blobStorage.js";

const app = express();
app.get("/", (req, res) => {
  res.json({
    name: "SoundSphere API",
    status: "running",
    healthCheck: "/api/health",
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json());


app.get("/api/health", async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query("SELECT 1 AS ok");

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        message: "Name, email, and a password of at least 6 characters are required.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .query(`
        INSERT INTO Users (name, email, password_hash)
        OUTPUT INSERTED.id, INSERTED.name, INSERTED.email
        VALUES (@name, @email, @passwordHash)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    if (error.message.includes("Violation of UNIQUE KEY")) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        SELECT id, name, email, password_hash
        FROM Users
        WHERE email = @email
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/api/users/search", async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    const currentUserId = Number(req.query.currentUserId);

    if (!query) {
      return res.json([]);
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("query", sql.NVarChar, `%${query}%`)
      .input("currentUserId", sql.Int, currentUserId || 0)
      .query(`
        SELECT TOP 10 id, name, email
        FROM Users
        WHERE 
          id <> @currentUserId
          AND (
            name LIKE @query
            OR email LIKE @query
          )
        ORDER BY name ASC
      `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/api/projects", async (req, res) => {
  try {
    const ownerId = Number(req.query.ownerId);

    if (!ownerId) {
      return res.status(400).json({
        message: "ownerId query parameter is required.",
      });
    }

    const pool = await getPool();

    const projectsResult = await pool
      .request()
      .input("ownerId", sql.Int, ownerId)
      .query(`
        SELECT DISTINCT
          p.id,
          p.owner_id AS ownerId,
          owner.name AS ownerName,
          owner.email AS ownerEmail,
          p.title,
          p.description,
          p.status,
          CASE 
            WHEN p.owner_id = @ownerId THEN 'Owner'
            ELSE 'Collaborator'
          END AS userRole
        FROM Projects p
        INNER JOIN Users owner
          ON p.owner_id = owner.id
        LEFT JOIN ProjectCollaborators pc
          ON p.id = pc.project_id
        WHERE p.owner_id = @ownerId OR pc.user_id = @ownerId
        ORDER BY p.id DESC
      `);

    const projects = [];

    for (const project of projectsResult.recordset) {
      const filesResult = await pool
      .request()
      .input("projectId", sql.Int, project.id)
      .query(`
        SELECT 
          id,
          name,
          label,
          size_text AS size,
          file_type AS type,
          blob_name AS blobName,
          blob_url AS blobUrl,
          CONCAT('/api/files/', id, '/stream') AS audioUrl,
          CONVERT(varchar, upload_date, 23) AS date
        FROM AudioFiles
        WHERE project_id = @projectId
        ORDER BY upload_date DESC
      `);

      const tasksResult = await pool
        .request()
        .input("projectId", sql.Int, project.id)
        .query(`
          SELECT id, title, assignee, status
          FROM Tasks
          WHERE project_id = @projectId
          ORDER BY created_at DESC
        `);

      projects.push({
        ...project,
        files: filesResult.recordset,
        tasks: tasksResult.recordset,
      });
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
    const { ownerId, title, description } = req.body;

    if (!ownerId || !title) {
      return res.status(400).json({
        message: "Owner and project title are required.",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("ownerId", sql.Int, ownerId)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || "")
      .query(`
        INSERT INTO Projects (owner_id, title, description)
        OUTPUT 
          INSERTED.id,
          INSERTED.owner_id AS ownerId,
          INSERTED.title,
          INSERTED.description,
          INSERTED.status
        VALUES (@ownerId, @title, @description)
      `);

    res.status(201).json({
      ...result.recordset[0],
      files: [],
      tasks: [],
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/api/projects/:projectId/collaborators", async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .query(`
        SELECT 
          pc.id,
          pc.project_id AS projectId,
          pc.user_id AS userId,
          pc.role,
          u.name,
          u.email
        FROM ProjectCollaborators pc
        INNER JOIN Users u
          ON pc.user_id = u.id
        WHERE pc.project_id = @projectId
        ORDER BY u.name ASC
      `);

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/projects/:projectId/collaborators", async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const pool = await getPool();

    const projectResult = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .query(`
        SELECT owner_id AS ownerId
        FROM Projects
        WHERE id = @projectId
      `);

    const project = projectResult.recordset[0];

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    if (project.ownerId === Number(userId)) {
      return res.status(400).json({
        message: "Project owner is already part of this project.",
      });
    }

    const result = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .input("userId", sql.Int, userId)
      .query(`
        INSERT INTO ProjectCollaborators (project_id, user_id)
        OUTPUT 
          INSERTED.id,
          INSERTED.project_id AS projectId,
          INSERTED.user_id AS userId,
          INSERTED.role
        VALUES (@projectId, @userId)
      `);

    const collaboratorResult = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT id AS userId, name, email
        FROM Users
        WHERE id = @userId
      `);

    res.status(201).json({
      ...result.recordset[0],
      ...collaboratorResult.recordset[0],
    });
  } catch (error) {
    if (
      error.message.includes("UQ_ProjectCollaborator") ||
      error.message.includes("Violation of UNIQUE KEY")
    ) {
      return res.status(409).json({
        message: "User is already a collaborator on this project.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/api/projects/:projectId/collaborators/:userId", async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const userId = Number(req.params.userId);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .input("userId", sql.Int, userId)
      .query(`
        DELETE FROM ProjectCollaborators
        OUTPUT DELETED.user_id AS userId
        WHERE project_id = @projectId AND user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Collaborator not found.",
      });
    }

    res.json({
      message: "Collaborator removed.",
      userId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Project title is required.",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || "")
      .query(`
        UPDATE Projects
        SET title = @title,
            description = @description
        OUTPUT 
          INSERTED.id,
          INSERTED.owner_id AS ownerId,
          INSERTED.title,
          INSERTED.description,
          INSERTED.status
        WHERE id = @projectId
      `);

    const updatedProject = result.recordset[0];

    if (!updatedProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const pool = await getPool();

    await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .query(`
        DELETE FROM Projects
        WHERE id = @projectId
      `);

    res.json({
      message: "Project deleted.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/projects/:id/files", upload.single("audio"), async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const file = req.file;
    const { label } = req.body;

    if (!file) {
      return res.status(400).json({
        message: "Audio file is required.",
      });
    }

    const allowedExtensions = [".mp3", ".wav", ".flac"];
    const isAllowed = allowedExtensions.some((extension) =>
      file.originalname.toLowerCase().endsWith(extension)
    );

    if (!isAllowed) {
      return res.status(400).json({
        message: "Only MP3, WAV, and FLAC files are allowed.",
      });
    }

    const { blobName, blobUrl } = await uploadAudioToBlob(file);

    const sizeText = `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .input("name", sql.NVarChar, file.originalname)
      .input("label", sql.NVarChar, label || "Audio Version")
      .input("size", sql.NVarChar, sizeText)
      .input("type", sql.NVarChar, file.mimetype)
      .input("blobName", sql.NVarChar, blobName)
      .input("blobUrl", sql.NVarChar, blobUrl)
      .query(`
        INSERT INTO AudioFiles (
          project_id,
          name,
          label,
          size_text,
          file_type,
          blob_name,
          blob_url
        )
        OUTPUT 
          INSERTED.id,
          INSERTED.name,
          INSERTED.label,
          INSERTED.size_text AS size,
          INSERTED.file_type AS type,
          INSERTED.blob_name AS blobName,
          INSERTED.blob_url AS blobUrl,
          CONVERT(varchar, INSERTED.upload_date, 23) AS date
        VALUES (
          @projectId,
          @name,
          @label,
          @size,
          @type,
          @blobName,
          @blobUrl
        )
      `);

    res.status(201).json({
      ...result.recordset[0],
      audioUrl: `/api/files/${result.recordset[0].id}/stream`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.get("/api/files/:id/stream", async (req, res) => {
  try {
    const fileId = Number(req.params.id);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("fileId", sql.Int, fileId)
      .query(`
        SELECT blob_name AS blobName, file_type AS fileType
        FROM AudioFiles
        WHERE id = @fileId
      `);

    const file = result.recordset[0];

    if (!file || !file.blobName) {
      return res.status(404).json({
        message: "Audio file not found.",
      });
    }

    res.setHeader("Content-Type", file.fileType || "audio/mpeg");

    await streamAudioFromBlob(file.blobName, res);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/api/projects/:projectId/files/:fileId", async (req, res) => {
  try {
    const fileId = Number(req.params.fileId);
    const pool = await getPool();

    const fileResult = await pool
      .request()
      .input("fileId", sql.Int, fileId)
      .query(`
        SELECT blob_name AS blobName
        FROM AudioFiles
        WHERE id = @fileId
      `);

    const file = fileResult.recordset[0];

    if (!file) {
      return res.status(404).json({
        message: "Audio file record not found.",
      });
    }

    await deleteAudioFromBlob(file.blobName);

    await pool
      .request()
      .input("fileId", sql.Int, fileId)
      .query(`
        DELETE FROM AudioFiles
        WHERE id = @fileId
      `);

    res.json({
      message: "Audio file deleted.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/api/projects/:id/tasks", async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { title, assignee } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("projectId", sql.Int, projectId)
      .input("title", sql.NVarChar, title)
      .input("assignee", sql.NVarChar, assignee || "Unassigned")
      .query(`
        INSERT INTO Tasks (project_id, title, assignee)
        OUTPUT INSERTED.id, INSERTED.title, INSERTED.assignee, INSERTED.status
        VALUES (@projectId, @title, @assignee)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.delete("/api/projects/:projectId/tasks/:taskId", async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("taskId", sql.Int, taskId)
      .query(`
        DELETE FROM Tasks
        OUTPUT DELETED.id
        WHERE id = @taskId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json({
      message: "Task deleted.",
      id: taskId,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.put("/api/projects/:projectId/tasks/:taskId", async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);
    const { title, assignee, status } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Task title is required.",
      });
    }

    const allowedStatuses = ["To Do", "In Progress", "Done"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status.",
      });
    }

    const pool = await getPool();

    const result = await pool
      .request()
      .input("taskId", sql.Int, taskId)
      .input("title", sql.NVarChar, title)
      .input("assignee", sql.NVarChar, assignee || "Unassigned")
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE Tasks
        SET title = @title,
            assignee = @assignee,
            status = @status
        OUTPUT INSERTED.id, INSERTED.title, INSERTED.assignee, INSERTED.status
        WHERE id = @taskId
      `);

    const updatedTask = result.recordset[0];

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.patch("/api/projects/:projectId/tasks/:taskId/toggle", async (req, res) => {
  try {
    const taskId = Number(req.params.taskId);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("taskId", sql.Int, taskId)
      .query(`
        UPDATE Tasks
        SET status = CASE 
          WHEN status = 'Done' THEN 'In Progress'
          ELSE 'Done'
        END
        OUTPUT INSERTED.id, INSERTED.title, INSERTED.assignee, INSERTED.status
        WHERE id = @taskId
      `);

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SoundSphere API running on http://localhost:${PORT}`);
});