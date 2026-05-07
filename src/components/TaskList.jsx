import { CheckCircle2, Clock } from "lucide-react";

function TaskList({ tasks, onToggleTask }) {
  if (tasks.length === 0) {
    return <p className="empty-text">No tasks added yet.</p>;
  }

  return (
    <div className="list">
      {tasks.map((task) => (
        <button
          type="button"
          className="task-item"
          key={task.id}
          onClick={() => onToggleTask(task.id)}
        >
          <div>
            <h3>{task.title}</h3>
            <p>Assigned to {task.assignee}</p>
          </div>

          <div className="task-status">
            {task.status === "Done" ? (
              <CheckCircle2 size={18} />
            ) : (
              <Clock size={18} />
            )}

            <span>{task.status}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default TaskList;