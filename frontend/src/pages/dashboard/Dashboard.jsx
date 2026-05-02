import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

const statusConfig = {
  todo:        { label: "To Do",       color: "#64748b", dot: "#94a3b8" },
  "in-progress":{ label: "In Progress", color: "#2563eb", dot: "#3b82f6" },
  review:      { label: "Review",      color: "#7c3aed", dot: "#8b5cf6" },
  completed:   { label: "Completed",   color: "#059669", dot: "#10b981" },
};

function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [s, t, p] = await Promise.all([
        API.get("/tasks/stats"),
        API.get("/tasks"),
        API.get("/projects"),
      ]);
      setStats(s.data);
      setTasks(t.data.slice(0, 8));
      setProjects(p.data.slice(0, 6));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const isOverdue = (t) => t.deadline && t.status !== "completed" && new Date(t.deadline) < new Date();
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";

  const completionPct = stats && stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  if (loading) return <div className="loading"><div className="spinner"></div> Loading dashboard...</div>;

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {firstName} 👋</h2>
          <div className="subtitle">Here's what's happening with your work today.</div>
        </div>
        {isAdmin() && (
          <Link to="/projects" className="btn btn-primary">+ New Project</Link>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card" style={{ "--stat-color": "#2563eb" }}>
            <div className="stat-icon">📁</div>
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat-card" style={{ "--stat-color": "#64748b" }}>
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card" style={{ "--stat-color": "#3b82f6" }}>
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card" style={{ "--stat-color": "#7c3aed" }}>
            <div className="stat-icon">👀</div>
            <div className="stat-value">{stats.review}</div>
            <div className="stat-label">In Review</div>
          </div>
          <div className="stat-card" style={{ "--stat-color": "#059669" }}>
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card" style={{ "--stat-color": "#dc2626" }}>
            <div className="stat-icon">⚠️</div>
            <div className="stat-value">{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 18, alignItems: "start" }}>
        {/* Recent tasks */}
        <div>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>
              {isAdmin() ? "Recent Tasks" : "My Tasks"}
            </div>
            <Link to="/tasks" className="btn btn-outline btn-sm">View All</Link>
          </div>

          {tasks.length === 0 ? (
            <div className="card card-body">
              <div className="empty-state">
                <div className="empty-emoji">📭</div>
                <h3>No tasks yet</h3>
                <p>{isAdmin() ? "Create a project and add tasks." : "No tasks assigned to you."}</p>
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => {
                    const over = isOverdue(task);
                    const sc = statusConfig[task.status] || statusConfig.todo;
                    return (
                      <tr key={task._id} className={over ? "overdue-row" : ""}>
                        <td>
                          <div className="fw-700" style={{ fontSize: 13 }}>{task.title}</div>
                          {over && <span className="badge badge-overdue" style={{ marginTop: 3 }}>Overdue</span>}
                        </td>
                        <td className="text-muted text-sm">{task.project?.title || "—"}</td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 12, fontWeight: 700, color: sc.color,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.dot, display: "inline-block" }}></span>
                            {sc.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        </td>
                        <td className={`text-sm ${over ? "text-danger" : "text-muted"}`}>{fmtDate(task.deadline)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Completion progress */}
          {stats && (
            <div className="card card-body">
              <div className="section-title">Overall Progress</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>{completionPct}%</span>
                <span className="text-muted text-sm">tasks done</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionPct}%` }}></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: val.dot, flexShrink: 0 }}></span>
                    <span className="text-muted">{val.label}</span>
                    <span style={{ marginLeft: "auto", fontWeight: 700 }}>
                      {stats[key === "in-progress" ? "inProgress" : key === "todo" ? "todo" : key === "review" ? "review" : "completed"] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects list */}
          {projects.length > 0 && (
            <div className="card card-body">
              <div className="flex-between" style={{ marginBottom: 12 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>Projects</div>
                <Link to="/projects" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>All</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.map(p => (
                  <Link key={p._id} to={`/projects/${p._id}`}
                    style={{ textDecoration: "none" }}>
                    <div style={{
                      padding: "9px 12px",
                      background: "var(--surface2)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary-mid)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{p.title}</div>
                      <div className="text-muted text-sm" style={{ marginTop: 2 }}>
                        👥 {p.members?.length || 0} members
                        {p.deadline && ` · Due ${fmtDate(p.deadline)}`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
