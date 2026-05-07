import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  function submitForm(event) {
    event.preventDefault();

    onAddTask(title, assignee);

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

      <input
        type="text"
        placeholder="Assignee"
        value={assignee}
        onChange={(event) => setAssignee(event.target.value)}
      />

      <button type="submit" className="primary-button">
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;