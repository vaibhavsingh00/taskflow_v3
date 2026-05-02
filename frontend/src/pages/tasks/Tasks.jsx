import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import TaskDetailPanel from "../../components/TaskDetailPanel";

const STATUSES = ["todo", "in-progress", "review", "completed"];
const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "Review", completed: "Completed" };
const STATUS_COLORS = { todo: "#64748b", "in-progress": "#2563eb", review: "#7c3aed", completed: "#059669" };

function Tasks() {
  const { isManager, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [t, p] = await Promise.all([API.get("/tasks"), API.get("/projects")]);
      setTasks(t.data);
      setProjects(p.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
      if (selectedTask?._id === taskId) setSelectedTask(res.data);
    } catch { alert("Failed to update status"); }
  };

  const isOverdue = (t) => t.deadline && t.status !== "completed" && new Date(t.deadline) < new Date();
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const filtered = tasks.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.title.toLowerCase().includes(q) || t.project?.title?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchProject = filterProject === "all" || t.project?._id === filterProject;
    return matchSearch && matchStatus && matchPriority && matchProject;
  });

  const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  if (loading) return <div className="loading"><div className="spinner"></div> Loading tasks...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{isManager() ? "All Tasks" : "My Tasks"}</h2>
          <div className="subtitle">{filtered.length} task{filtered.length !== 1 ? "s" : ""} · Click any row to view details & comments</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Search tasks or projects..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <select className="filter-select" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
        {(search || filterStatus !== "all" || filterPriority !== "all" || filterProject !== "all") && (
          <button className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); setFilterProject("all"); }}>
            Clear ✕
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="card card-body">
          <div className="empty-state">
            <div className="empty-emoji">🔍</div>
            <h3>No tasks found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                {isManager() && <th>Assigned To</th>}
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const over = isOverdue(task);
                const canUpdate = isManager() || task.assignedTo?._id === user?._id;
                return (
                  <tr key={task._id} className={over ? "overdue-row" : ""}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedTask(task)}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{task.title}</div>
                      {task.description && (
                        <div className="text-muted text-sm" style={{ marginTop: 2 }}>
                          {task.description.slice(0, 55)}{task.description.length > 55 ? "..." : ""}
                        </div>
                      )}
                      {over && <span className="badge badge-overdue" style={{ marginTop: 3 }}>Overdue</span>}
                    </td>
                    <td className="text-muted text-sm" onClick={e => e.stopPropagation()}>
                      {task.project?.title || "—"}
                    </td>
                    {isManager() && (
                      <td onClick={e => e.stopPropagation()}>
                        {task.assignedTo ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="avatar sm">{initials(task.assignedTo.name)}</div>
                            <span style={{ fontSize: 13 }}>{task.assignedTo.name}</span>
                          </div>
                        ) : <span className="text-muted text-sm">Unassigned</span>}
                      </td>
                    )}
                    <td onClick={e => e.stopPropagation()}>
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      {canUpdate ? (
                        <select className="filter-select" value={task.status}
                          onChange={e => updateStatus(task._id, e.target.value)}>
                          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[task.status] }}>
                          {STATUS_LABELS[task.status]}
                        </span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}
                      className="text-sm"
                      style={over ? { color: "var(--danger)", fontWeight: 700 } : { color: "var(--text-muted)" }}>
                      {fmtDate(task.deadline)}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => setSelectedTask(task)}>
                        💬 View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slide-in detail panel with comments */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updated) => {
            setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
            setSelectedTask(updated);
          }}
        />
      )}
    </div>
  );
}

export default Tasks;
