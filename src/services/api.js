const API_BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export const api = {
  login(email, password) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(name, email, password) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  getProjects(ownerId) {
    return request(`/projects?ownerId=${ownerId}`);
  },

  createProject(ownerId, title, description) {
    return request("/projects", {
      method: "POST",
      body: JSON.stringify({ ownerId, title, description }),
    });
  },

  deleteProject(projectId) {
    return request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  addFile(projectId, file) {
    return request(`/projects/${projectId}/files`, {
      method: "POST",
      body: JSON.stringify(file),
    });
  },

  addTask(projectId, title, assignee) {
    return request(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title, assignee }),
    });
  },

  toggleTask(projectId, taskId) {
    return request(`/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: "PATCH",
    });
  },
};