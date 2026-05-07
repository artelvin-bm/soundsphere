import { useState } from "react";

function TaskForm({ onAddTask, assigneeOptions = [] }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  function submitForm(event) {
    event.preventDefault();

    const selectedAssignee =
      assignee || assigneeOptions[0]?.name || "Unassigned";

    onAddTask(title, selectedAssignee);

    setTitle("");
    setAssignee("");
  }

  return (
    <form onSubmit={submitForm} className="task-form">
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <select
        value={assignee}
        onChange={(event) => setAssignee(event.target.value)}
      >
        <option value="">Assign to...</option>

        {assigneeOptions.map((user) => (
          <option key={`${user.role}-${user.id}`} value={user.name}>
            {user.name} — {user.role}
          </option>
        ))}
      </select>

      <button type="submit" className="primary-button">
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;