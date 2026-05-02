import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";
import TaskDetailPanel from "../../components/TaskDetailPanel";

const STATUSES = ["todo", "in-progress", "review", "completed"];
const STATUS_LABELS = { todo: "To Do", "in-progress": "In Progress", review: "Review", completed: "Completed" };
const STATUS_COLORS = { todo: "#64748b", "in-progress": "#2563eb", review: "#7c3aed", completed: "#059669" };

// ---- Task Form Modal (create / edit) ----
function TaskModal({ projectId, members, onClose, onSave, editData }) {
  const [form, setForm] = useState({
    title: editData?.title || "",
    description: editData?.description || "",
    status: editData?.status || "todo",
    priority: editData?.priority || "medium",
    deadline: editData?.deadline ? editData.deadline.slice(0, 10) : "",
    assignedTo: editData?.assignedTo?._id || "",
  });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setSaving(true);
    try {
      const res = editData
        ? await API.put(`/tasks/${editData._id}`, form)
        : await API.post("/tasks", { ...form, project: projectId });
      onSave(res.data, !!editData);
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{editData ? "Edit Task" : "New Task"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input className="form-control" placeholder="e.g. Design homepage mockup"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={2} placeholder="What needs to be done?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-control" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Assign To</label>
              <select className="form-control" value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-gap" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editData ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Main Component ----
function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // for detail panel
  const [view, setView] = useState("kanban");

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      const [p, t] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks?project=${id}`),
      ]);
      setProject(p.data);
      setTasks(t.data);
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 404) navigate("/projects");
    } finally { setLoading(false); }
  };

  const handleSave = (saved, isEdit) => {
    setTasks(prev => isEdit
      ? prev.map(t => t._id === saved._id ? saved : t)
      : [saved, ...prev]
    );
    setEditTask(null);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      if (selectedTask?._id === taskId) setSelectedTask(null);
    } catch { alert("Failed to delete task"); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
      // keep panel in sync
      if (selectedTask?._id === taskId) setSelectedTask(res.data);
    } catch { alert("Failed to update status"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
  const isOverdue = (t) => t.deadline && t.status !== "completed" && new Date(t.deadline) < new Date();

  if (loading) return <div className="loading"><div className="spinner"></div> Loading...</div>;
  if (!project) return null;

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const initials = (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate("/projects")} style={{ marginBottom: 16 }}>
        ← Back to Projects
      </button>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h2>{project.title}</h2>
          {project.description && <div className="subtitle">{project.description}</div>}
          <div className="flex-gap" style={{ marginTop: 6, flexWrap: "wrap" }}>
            {project.deadline && <span className="text-muted text-sm">📅 {fmtDate(project.deadline)}</span>}
            <span className="text-muted text-sm">👥 {project.members?.length || 0} members</span>
            <span className="text-muted text-sm">📋 {tasks.length} tasks</span>
          </div>
        </div>
        <div className="flex-gap">
          {/* View toggle */}
          <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            {["kanban", "table"].map(v => (
              <button key={v} onClick={() => setView(v)} className="btn btn-sm" style={{
                borderRadius: 0, border: "none",
                background: view === v ? "var(--primary)" : "white",
                color: view === v ? "white" : "var(--text-muted)",
                textTransform: "capitalize",
              }}>
                {v === "kanban" ? "🗂 Kanban" : "📋 Table"}
              </button>
            ))}
          </div>
          {isManager() && (
            <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}>
              + Add Task
            </button>
          )}
        </div>
      </div>

      {/* Team members */}
      {project.members?.length > 0 && (
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <div className="section-title">Team Members</div>
          <div className="flex-gap" style={{ flexWrap: "wrap" }}>
            {project.members.map(m => (
              <div key={m._id} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", padding: "6px 12px",
              }}>
                <div className="avatar sm">{initials(m.name)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>
                  <div className="text-muted text-sm">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {view === "kanban" && (
        <div className="kanban-board">
          {STATUSES.map(status => (
            <div className="kanban-col" key={status}>
              <div className="kanban-col-header">
                <div className="kanban-col-title">
                  <span className="col-dot" style={{ background: STATUS_COLORS[status] }} />
                  <span style={{ color: STATUS_COLORS[status] }}>{STATUS_LABELS[status]}</span>
                </div>
                <span className="kanban-col-count">{tasksByStatus[status].length}</span>
              </div>
              <div className="kanban-cards">
                {tasksByStatus[status].length === 0 && (
                  <div style={{ textAlign: "center", padding: "18px 10px", color: "var(--text-faint)", fontSize: 12 }}>
                    No tasks
                  </div>
                )}
                {tasksByStatus[status].map(task => {
                  const over = isOverdue(task);
                  return (
                    <div
                      className="task-card"
                      key={task._id}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="task-card-title">{task.title}</div>
                      {task.description && (
                        <div className="text-muted text-sm" style={{ marginBottom: 8, lineHeight: 1.4 }}>
                          {task.description.slice(0, 55)}{task.description.length > 55 ? "..." : ""}
                        </div>
                      )}
                      <div className="task-card-meta">
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                        {over && <span className="badge badge-overdue">Overdue</span>}
                      </div>
                      <div className="task-card-footer">
                        <div>
                          {task.assignedTo ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div className="avatar sm">{initials(task.assignedTo.name)}</div>
                              <span className="text-sm text-muted">{task.assignedTo.name.split(" ")[0]}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted">Unassigned</span>
                          )}
                        </div>
                        <div className="flex-gap" onClick={e => e.stopPropagation()}>
                          <span className={`due-text ${over ? "overdue" : ""}`}>{fmtDate(task.deadline)}</span>
                          {isManager() && (
                            <>
                              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px", fontSize: 11 }}
                                onClick={() => { setEditTask(task); setShowModal(true); }}>
                                Edit
                              </button>
                              <button className="btn btn-danger btn-sm" style={{ padding: "2px 6px", fontSize: 11 }}
                                onClick={() => handleDelete(task._id)}>
                                Del
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status changer for non-managers on their tasks */}
                      {(isManager() || task.assignedTo?._id === user?._id) && (
                        <div style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
                          <select className="filter-select" style={{ width: "100%", fontSize: 12 }}
                            value={task.status}
                            onChange={e => handleStatusChange(task._id, e.target.value)}>
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </div>
                      )}

                      {/* click hint */}
                      <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-faint)", textAlign: "right" }}>
                        Click for details & comments →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {view === "table" && (
        tasks.length === 0 ? (
          <div className="card card-body">
            <div className="empty-state">
              <div className="empty-emoji">📋</div>
              <h3>No tasks yet</h3>
              <p>{isManager() ? "Add the first task." : "No tasks assigned here."}</p>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => {
                  const over = isOverdue(task);
                  const canUpdate = isManager() || task.assignedTo?._id === user?._id;
                  return (
                    <tr key={task._id} className={over ? "overdue-row" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedTask(task)}>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ fontWeight: 700, cursor: "pointer" }}
                          onClick={() => setSelectedTask(task)}>
                          {task.title}
                        </div>
                        {task.description && <div className="text-muted text-sm">{task.description.slice(0, 55)}</div>}
                        {over && <span className="badge badge-overdue" style={{ marginTop: 3 }}>Overdue</span>}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {task.assignedTo ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="avatar sm">{initials(task.assignedTo.name)}</div>
                            <span style={{ fontSize: 13 }}>{task.assignedTo.name}</span>
                          </div>
                        ) : <span className="text-muted text-sm">Unassigned</span>}
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        {canUpdate ? (
                          <select className="filter-select" value={task.status}
                            onChange={e => handleStatusChange(task._id, e.target.value)}>
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
                        <div className="flex-gap">
                          <button className="btn btn-outline btn-sm"
                            onClick={() => setSelectedTask(task)}>
                            💬 View
                          </button>
                          {isManager() && (
                            <>
                              <button className="btn btn-ghost btn-sm"
                                onClick={() => { setEditTask(task); setShowModal(true); }}>Edit</button>
                              <button className="btn btn-danger btn-sm"
                                onClick={() => handleDelete(task._id)}>Del</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Task create/edit modal */}
      {showModal && (
        <TaskModal
          projectId={id}
          members={project.members || []}
          onClose={() => { setShowModal(false); setEditTask(null); }}
          onSave={handleSave}
          editData={editTask}
        />
      )}

      {/* Task detail side panel with comments */}
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

export default ProjectDetail;
