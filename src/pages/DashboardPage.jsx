import { useEffect, useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import logo from "../assets/logo.png";
import { api } from "../services/api";
import DashboardStats from "../components/DashboardStats";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

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

      const newProject = await api.createProject(
        currentUser.id,
        title,
        description
      );

      setProjects([newProject, ...projects]);
      setSelectedProjectId(newProject.id);
      showMessage("Project created.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteProject(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will also remove its files and tasks."
    );

    if (!confirmed) return;

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

      const fileRecord = {
        name: file.name,
        label: `Version ${selectedProject.files.length + 1}`,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type || "audio file",
      };

      const savedFile = await api.addFile(selectedProject.id, fileRecord);

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
          <button type="button" className="theme-toggle" onClick={onToggleTheme}>
            {theme === "light" ? "Dark" : "Light"}
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
                  <p>
                    {selectedProject.description || "No description provided."}
                  </p>
                </div>

                <button
                  className="danger-button"
                  onClick={() => deleteProject(selectedProject.id)}
                >
                  Delete Project
                </button>
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

                  <FileList files={selectedProject.files} />
                </div>

                <div className="card">
                  <h2>Tasks</h2>

                  <TaskForm onAddTask={addTask} />

                  <TaskList
                    tasks={selectedProject.tasks}
                    onToggleTask={toggleTaskStatus}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}

export default DashboardPage;