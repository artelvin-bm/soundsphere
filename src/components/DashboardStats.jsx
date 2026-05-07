import { CheckCircle2, FolderKanban, ListTodo, Upload } from "lucide-react";

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>

      <div className="stat-icon">
        <Icon size={24} />
      </div>
    </div>
  );
}

function DashboardStats({ stats }) {
  return (
    <section className="stats-grid">
      <StatCard label="Active Projects" value={stats.projectCount} icon={FolderKanban} />
      <StatCard label="Uploaded Files" value={stats.fileCount} icon={Upload} />
      <StatCard label="Total Tasks" value={stats.taskCount} icon={ListTodo} />
      <StatCard label="Completed Tasks" value={stats.completedTaskCount} icon={CheckCircle2} />
    </section>
  );
}

export default DashboardStats;