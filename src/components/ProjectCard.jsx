function ProjectCard({ project, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={isSelected ? "project-card selected" : "project-card"}
      onClick={onClick}
    >
      <div>
        <h3>{project.title}</h3>
        <p>{project.description || "No description provided."}</p>
      </div>

      <span>{project.status}</span>
    </button>
  );
}

export default ProjectCard;