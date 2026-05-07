import { CheckCircle2, Clock, Edit3, Trash2 } from "lucide-react";

function TaskList({ tasks, onToggleTask, onEditTask, onDeleteTask }) {
  if (tasks.length === 0) {
    return <p className="empty-text">No tasks added yet.</p>;
  }

  return (
    <div className="list">
      {tasks.map((task) => (
        <div className="task-item" key={task.id}>
          <button
            type="button"
            className="task-main"
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

          <div className="task-row-actions">
            <button
              type="button"
              className="small-edit-button"
              onClick={() => onEditTask(task)}
              title="Edit task"
            >
              <Edit3 size={16} />
            </button>

            <button
              type="button"
              className="small-danger-button"
              onClick={() => onDeleteTask(task.id)}
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;