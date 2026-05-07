import { useEffect, useState } from "react";

function TaskEditDialog({ isOpen, task, assigneeOptions = [], onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    assignee: "",
    status: "To Do",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        assignee: task.assignee || "",
        status: task.status || "To Do",
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  function submitForm(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-backdrop">
      <div className="edit-dialog">
        <h2>Edit Task</h2>
        <p>Update the task details and current status.</p>

        <form onSubmit={submitForm} className="dialog-form">
          <label>Task Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
            placeholder="Task title"
          />

          <label>Assignee</label>
          <select
            value={form.assignee}
            onChange={(event) =>
              setForm({ ...form, assignee: event.target.value })
            }
          >
            <option value="">Unassigned</option>

            {assigneeOptions.map((user) => (
              <option key={`${user.role}-${user.id}`} value={user.name}>
                {user.name} — {user.role}
              </option>
            ))}
          </select>

          <label>Status</label>
          <select
            value={form.status}
            onChange={(event) =>
              setForm({ ...form, status: event.target.value })
            }
          >
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>

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

export default TaskEditDialog;