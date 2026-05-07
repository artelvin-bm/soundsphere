import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import { api } from "../services/api";
import DashboardStats from "../components/DashboardStats";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import ConfirmDialog from "../components/ConfirmDialog";
import { LogOut, Moon, Sun } from "lucide-react";
import ProjectEditDialog from "../components/ProjectEditDialog";
import TaskEditDialog from "../components/TaskEditDialog";
import CollaboratorPanel from "../components/CollaboratorPanel";

function DashboardPage({
    currentUser,
    onLogout,
    message,
    showMessage,
    theme,
    onToggleTheme,
  }) {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
          isOpen: false,
          title: "",
          message: "",
          confirmText: "Delete",
          onConfirm: null,
        });

  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [projectCollaborators, setProjectCollaborators] = useState([]);

  async function loadProjects() {
    try {
      setIsLoading(true);
      const projectData = await api.getProjects(currentUser.id);
      setProjects(projectData);

      if (projectData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectData[0].id);
      }
    } catch (error) {
      showMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [currentUser.id]);

  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) || projects[0];

  const filteredProjects = projects.filter((project) =>
    `${project.title} ${project.description || ""}`
      .toLowerCase()
      .includes(projectSearch.toLowerCase())
  );

  const assigneeOptions = selectedProject
    ? [
        {
          id: selectedProject.ownerId,
          name: selectedProject.ownerName || currentUser.name,
          email: selectedProject.ownerEmail || currentUser.email,
          role: "Owner",
        },
        ...projectCollaborators.map((collaborator) => ({
          id: collaborator.userId,
          name: collaborator.name,
          email: collaborator.email,
          role: collaborator.role,
        })),
      ]
    : [];

  const stats = useMemo(() => {
    const fileCount = projects.reduce(
      (total, project) => total + project.files.length,
      0
    );

    const taskCount = projects.reduce(
      (total, project) => total + project.tasks.length,
      0
    );

    const completedTaskCount = projects.reduce(
      (total, project) =>
        total + project.tasks.filter((task) => task.status === "Done").length,
      0
    );

    return {
      projectCount: projects.length,
      fileCount,
      taskCount,
      completedTaskCount,
    };
  }, [projects]);

  async function createProject(title, description) {
    try {
      if (!title.trim()) {
        showMessage("Project title is required.");
        return;
      }

      const createdProject = await api.createProject(
        currentUser.id,
        title,
        description
      );

      const newProject = {
        ...createdProject,
        ownerName: currentUser.name,
        ownerEmail: currentUser.email,
        userRole: "Owner",
      };

      setProjects([newProject, ...projects]);
      setSelectedProjectId(newProject.id);
      showMessage("Project created.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteProject(projectId) {
    try {
      await api.deleteProject(projectId);

      const remainingProjects = projects.filter(
        (project) => project.id !== projectId
      );

      setProjects(remainingProjects);
      setSelectedProjectId(remainingProjects[0]?.id || null);
      showMessage("Project deleted.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteAudioFile(fileId) {
    if (!selectedProject) return;
    try {
      await api.deleteFile(selectedProject.id, fileId);

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          files: project.files.filter((file) => file.id !== fileId),
        };
      });

      setProjects(updatedProjects);
      showMessage("Audio file deleted.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function uploadAudioFile(file) {
    try {
      if (!selectedProject || !file) return;

      const allowedExtensions = [".mp3", ".wav", ".flac"];
      const hasAllowedExtension = allowedExtensions.some((extension) =>
        file.name.toLowerCase().endsWith(extension)
      );

      if (!hasAllowedExtension) {
        showMessage("Only MP3, WAV, and FLAC files are allowed.");
        return;
      }

      const label = `Version ${selectedProject.files.length + 1}`;
      const savedFile = await api.addFile(selectedProject.id, file, label);

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          files: [savedFile, ...project.files],
        };
      });

      setProjects(updatedProjects);
      showMessage("Audio file record saved to Azure SQL.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function addTask(title, assignee) {
    try {
      if (!selectedProject || !title.trim()) {
        showMessage("Task title is required.");
        return;
      }

      const savedTask = await api.addTask(selectedProject.id, title, assignee);

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          tasks: [...project.tasks, savedTask],
        };
      });

      setProjects(updatedProjects);
      showMessage("Task saved to Azure SQL.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteTask(taskId) {
    if (!selectedProject) return;

    try {
      await api.deleteTask(selectedProject.id, taskId);

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          tasks: project.tasks.filter((task) => task.id !== taskId),
        };
      });

      setProjects(updatedProjects);
      showMessage("Task deleted.");
    } catch (error) {
      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          tasks: project.tasks.filter((task) => task.id !== taskId),
        };
      });

      setProjects(updatedProjects);
      showMessage(
        error.message === "Task not found."
          ? "Task was already removed. The list has been refreshed."
          : error.message
      );
    }
  }

  async function toggleTaskStatus(taskId) {
    try {
      if (!selectedProject) return;

      const updatedTask = await api.toggleTask(selectedProject.id, taskId);

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId ? updatedTask : task
          ),
        };
      });

      setProjects(updatedProjects);
    } catch (error) {
      showMessage(error.message);
    }
  }

  const totalTasks = selectedProject?.tasks.length || 0;
  const doneTasks =
    selectedProject?.tasks.filter((task) => task.status === "Done").length || 0;

  const completion =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  function openConfirmDialog({ title, message, confirmText, onConfirm }) {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  }

  function closeConfirmDialog() {
    setConfirmDialog({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "Delete",
      onConfirm: null,
    });
  }

  function startEditingProject() {
    if (!selectedProject) return;
    setEditingProject(selectedProject);
  }

  function closeProjectEditDialog() {
    setEditingProject(null);
  }

  async function saveProjectEdits(updatedValues) {
    if (!selectedProject) return;

    try {
      const updatedProject = await api.updateProject(
        selectedProject.id,
        updatedValues.title,
        updatedValues.description
      );

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          ...updatedProject,
          files: project.files,
          tasks: project.tasks,
        };
      });

      setProjects(updatedProjects);
      setEditingProject(null);
      showMessage("Project updated.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function updateTask(taskId, updatedValues) {
    if (!selectedProject) return;

    try {
      const updatedTask = await api.updateTask(
        selectedProject.id,
        taskId,
        updatedValues.title,
        updatedValues.assignee,
        updatedValues.status
      );

      const updatedProjects = projects.map((project) => {
        if (project.id !== selectedProject.id) return project;

        return {
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId ? updatedTask : task
          ),
        };
      });

      setProjects(updatedProjects);
      setEditingTask(null);
      showMessage("Task updated.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function loadProjectCollaborators(projectId) {
    if (!projectId) return;

    try {
      const collaborators = await api.getCollaborators(projectId);
      setProjectCollaborators(collaborators);
    } catch (error) {
      showMessage(error.message);
    }
  }

  useEffect(() => {
    if (selectedProject?.id) {
      loadProjectCollaborators(selectedProject.id);
    } else {
      setProjectCollaborators([]);
    }
  }, [selectedProject?.id]);
  
  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo-box">
            <img src={logo} alt="SoundSphere logo" className="brand-logo" />
          </div>

          <div>
            <h1>SoundSphere</h1>
            <p>Azure SQL-powered music collaboration prototype</p>
            <div className="connection-badge">Azure SQL Connected</div>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
          >
            {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "light" ? "Light" : "Dark"}</span>
          </button>

          <div className="user-box">
            <span>{currentUser.name}</span>
            <button onClick={onLogout} className="icon-button">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {message && <p className="message">{message}</p>}

      <DashboardStats stats={stats} />

      <section className="main-grid">
        <aside className="sidebar">
          <ProjectForm onCreateProject={createProject} />

          <div className="card">
            <h2>Projects</h2>

            <input
              className="search-input"
              type="text"
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(event) => setProjectSearch(event.target.value)}
            />

            <div className="project-list">
              {isLoading && <p className="empty-text">Loading projects...</p>}

              {!isLoading && projects.length === 0 && (
                <p className="empty-text">No projects yet.</p>
              )}

              {!isLoading && projects.length > 0 && filteredProjects.length === 0 && (
                <p className="empty-text">No projects match your search.</p>
              )}

              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={selectedProject?.id === project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                />
              ))}
            </div>
          </div>
        </aside>

        <section className="workspace">
          {!selectedProject ? (
            <div className="empty-workspace">Create a project to begin.</div>
          ) : (
            <>
              <div className="workspace-header">
              <div>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.description || "No description provided."}</p>
              </div>

              <div className="inline-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={startEditingProject}
                >
                  Edit Project
                </button>

                <button
                  className="danger-button"
                  onClick={() =>
                    openConfirmDialog({
                      title: "Delete project?",
                      message:
                        "This will permanently delete the project, its tasks, audio file records, and related data.",
                      confirmText: "Delete Project",
                      onConfirm: () => deleteProject(selectedProject.id),
                    })
                  }
                >
                  Delete Project
                </button>
              </div>
            </div>

              <div className="progress-card">
                <div className="progress-header">
                  <strong>Project Progress</strong>
                  <span>{completion}%</span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>

              <div className="feature-grid">
                <div className="card">
                  <div className="section-header">
                    <h2>Audio Files</h2>
                    <FileUpload onUpload={uploadAudioFile} />
                  </div>

                  <FileList
                    files={selectedProject.files}
                    onDeleteFile={(fileId) =>
                      openConfirmDialog({
                        title: "Delete audio file?",
                        message:
                          "This will remove the audio file from Azure Blob Storage and delete its record from Azure SQL.",
                        confirmText: "Delete Audio",
                        onConfirm: () => deleteAudioFile(fileId),
                      })
                    }
                  />
                </div>

                <div className="card">
                  <h2>Tasks</h2>

                  <TaskForm
                    onAddTask={addTask}
                    assigneeOptions={assigneeOptions}
                  />

                  <TaskList
                    tasks={selectedProject.tasks}
                    onToggleTask={toggleTaskStatus}
                    onEditTask={(task) => setEditingTask(task)}
                    onDeleteTask={(taskId) =>
                      openConfirmDialog({
                        title: "Delete task?",
                        message:
                          "This will permanently delete this task from the project and remove its record from Azure SQL.",
                        confirmText: "Delete Task",
                        onConfirm: () => deleteTask(taskId),
                      })
                    }
                  />
                </div>
              </div>
              <div className="collaboration-section">
                <CollaboratorPanel
                  project={selectedProject}
                  currentUser={currentUser}
                  showMessage={showMessage}
                  openConfirmDialog={openConfirmDialog}
                  onCollaboratorsChange={() => loadProjectCollaborators(selectedProject.id)}
                />
              </div>
            </>
          )}
        </section>
      </section>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onCancel={closeConfirmDialog}
        onConfirm={async () => {
          if (confirmDialog.onConfirm) {
            await confirmDialog.onConfirm();
          }

          closeConfirmDialog();
        }}
      />

      <ProjectEditDialog
        isOpen={Boolean(editingProject)}
        project={editingProject}
        onCancel={closeProjectEditDialog}
        onSave={saveProjectEdits}
      />

      <TaskEditDialog
        isOpen={Boolean(editingTask)}
        task={editingTask}
        assigneeOptions={assigneeOptions}
        onCancel={() => setEditingTask(null)}
        onSave={(updatedValues) => updateTask(editingTask.id, updatedValues)}
      />
    </main>
  );
}

export default DashboardPage;