import { useState } from "react";
import { Plus } from "lucide-react";

function ProjectForm({ onCreateProject }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submitForm(event) {
    event.preventDefault();

    onCreateProject(title, description);

    setTitle("");
    setDescription("");
  }

  return (
    <div className="card">
      <h2>Create Project</h2>

      <form onSubmit={submitForm} className="form">
        <label>Project Title</label>
        <input
          type="text"
          placeholder="Example: Acoustic Demo Track"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label>Description</label>
        <textarea
          placeholder="Describe the music project"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        <button type="submit" className="primary-button">
          <Plus size={18} />
          Create Project
        </button>
      </form>
    </div>
  );
}

export default ProjectForm;