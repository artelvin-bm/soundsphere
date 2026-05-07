import { useMemo, useState } from "react";
import { LogOut, Music } from "lucide-react";
import DashboardStats from "../components/DashboardStats";
import ProjectForm from "../components/ProjectForm";
import ProjectCard from "../components/ProjectCard";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

function DashboardPage({
  data,
  currentUser,
  updateData,
  onLogout,
  message,
  showMessage,
}) {
  const userProjects = data.projects.filter(
    (project) => project.ownerId === currentUser.id
  );

  const [selectedProjectId, setSelectedProjectId] = useState(
    userProjects[0]?.id || null
  );

  const selectedProject =
    userProjects.find((project) => project.id === selectedProjectId) ||
    userProjects[0];

  const stats = useMemo(() => {
    const fileCount = userProjects.reduce(
      (total, project) => total + project.files.length,
      0
    );

    const taskCount = userProjects.reduce(
      (total, project) => total + project.tasks.length,
      0
    );

    const completedTaskCount = userProjects.reduce(
      (total, project) =>
        total + project.tasks.filter((task) => task.status === "Done").length,
      0
    );

    return {
      projectCount: userProjects.length,
      fileCount,
      taskCount,
      completedTaskCount,
    };
  }, [userProjects]);

  function createProject(title, description) {
    if (!title.trim()) {
      showMessage("Project title is required.");
      return;
    }

    const newProject = {
      id: Date.now(),
      ownerId: currentUser.id,
      title,
      description,
      status: "In Progress",
      files: [],
      tasks: [],
    };

    updateData({
      ...data,
      projects: [...data.projects, newProject],
    });

    setSelectedProjectId(newProject.id);
    showMessage("Project created.");
  }

  function deleteProject(projectId) {
    const remainingProjects = data.projects.filter(
      (project) => project.id !== projectId
    );

    updateData({
      ...data,
      projects: remainingProjects,
    });

    setSelectedProjectId(remainingProjects[0]?.id || null);
    showMessage("Project deleted.");
  }

  function uploadAudioFile(file) {
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
      id: Date.now(),
      name: file.name,
      label: `Version ${selectedProject.files.length + 1}`,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type || "audio file",
      date: new Date().toISOString().slice(0, 10),
    };

    const updatedProjects = data.projects.map((project) => {
      if (project.id !== selectedProject.id) return project;

      return {
        ...project,
        files: [fileRecord, ...project.files],
      };
    });

    updateData({
      ...data,
      projects: updatedProjects,
    });

    showMessage("Audio file added.");
  }

  function addTask(title, assignee) {
    if (!selectedProject || !title.trim()) {
      showMessage("Task title is required.");
      return;
    }

    const newTask = {
      id: Date.now(),
      title,
      assignee: assignee || "Unassigned",
      status: "To Do",
    };

    const updatedProjects = data.projects.map((project) => {
      if (project.id !== selectedProject.id) return project;

      return {
        ...project,
        tasks: [...project.tasks, newTask],
      };
    });

    updateData({
      ...data,
      projects: updatedProjects,
    });

    showMessage("Task added.");
  }

  function toggleTaskStatus(taskId) {
    const updatedProjects = data.projects.map((project) => {
      if (project.id !== selectedProject.id) return project;

      return {
        ...project,
        tasks: project.tasks.map((task) => {
          if (task.id !== taskId) return task;

          return {
            ...task,
            status: task.status === "Done" ? "In Progress" : "Done",
          };
        }),
      };
    });

    updateData({
      ...data,
      projects: updatedProjects,
    });
  }

  const totalTasks = selectedProject?.tasks.length || 0;
  const doneTasks =
    selectedProject?.tasks.filter((task) => task.status === "Done").length || 0;

  const completion = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <Music size={28} />
          </div>

          <div>
            <h1>SoundSphere</h1>
            <p>Music Collaboration & Production Management System</p>
          </div>
        </div>

        <div className="user-box">
          <span>{currentUser.name}</span>
          <button onClick={onLogout} className="icon-button">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {message && <p className="message">{message}</p>}

      <DashboardStats stats={stats} />

      <section className="main-grid">
        <aside className="sidebar">
          <ProjectForm onCreateProject={createProject} />

          <div className="card">
            <h2>Projects</h2>

            <div className="project-list">
              {userProjects.length === 0 && (
                <p className="empty-text">No projects yet.</p>
              )}

              {userProjects.map((project) => (
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
            <div className="empty-workspace">
              Create a project to begin.
            </div>
          ) : (
            <>
              <div className="workspace-header">
                <div>
                  <h2>{selectedProject.title}</h2>
                  <p>{selectedProject.description || "No description provided."}</p>
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