const API_BASE_URL = "http://localhost:5000/api";

async function parseResponse(response, endpoint) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  }

  const text = await response.text();

  throw new Error(
    `Server returned a non-JSON response. Status: ${response.status}. Endpoint: ${endpoint}`
  );
}

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  return parseResponse(response, endpoint);
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

  updateProject(projectId, title, description) {
    return request(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({ title, description }),
    });
  },

  deleteProject(projectId) {
    return request(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },

  addFile(projectId, file, label) {
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("label", label);

    return fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
      method: "POST",
      body: formData,
    }).then((response) =>
      parseResponse(response, `/projects/${projectId}/files`)
    );
  },

  deleteFile(projectId, fileId) {
    return request(`/projects/${projectId}/files/${fileId}`, {
      method: "DELETE",
    });
  },

  addTask(projectId, title, assignee) {
    return request(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify({ title, assignee }),
    });
  },

  deleteTask(projectId, taskId) {
    return request(`/projects/${projectId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  updateTask(projectId, taskId, title, assignee, status) {
    return request(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ title, assignee, status }),
    });
  },

  toggleTask(projectId, taskId) {
    return request(`/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: "PATCH",
    });
  },

  searchUsers(query, currentUserId) {
    return request(
      `/users/search?query=${encodeURIComponent(query)}&currentUserId=${currentUserId}`
    );
  },

  getCollaborators(projectId) {
    return request(`/projects/${projectId}/collaborators`);
  },

  addCollaborator(projectId, userId) {
    return request(`/projects/${projectId}/collaborators`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  },

  removeCollaborator(projectId, userId) {
    return request(`/projects/${projectId}/collaborators/${userId}`, {
      method: "DELETE",
    });
  },
};