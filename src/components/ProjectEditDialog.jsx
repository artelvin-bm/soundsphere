import { useEffect, useState } from "react";

function ProjectEditDialog({ isOpen, project, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
      });
    }
  }, [project]);

  if (!isOpen || !project) return null;

  function submitForm(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-backdrop">
      <div className="edit-dialog">
        <h2>Edit Project</h2>
        <p>Update the project name and description.</p>

        <form onSubmit={submitForm} className="dialog-form">
          <label>Project Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder="Project title"
          />

          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder="Project description"
          />

          <div className="confirm-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>

            <button type="submit" className="primary-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectEditDialog;