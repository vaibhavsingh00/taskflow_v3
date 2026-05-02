import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

function ProjectModal({ onClose, onSave, editData }) {
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({
    title: editData?.title || "",
    description: editData?.description || "",
    deadline: editData?.deadline ? editData.deadline.slice(0, 10) : "",
    members: editData?.members?.map(m => m._id) || [],
  });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/users").then(r => setAllUsers(r.data)).catch(console.error);
  }, []);

  const toggleMember = (id) =>
    setForm(f => ({
      ...f,
      members: f.members.includes(id) ? f.members.filter(x => x !== id) : [...f.members, id],
    }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setSaving(true);
    try {
      const res = editData
        ? await API.put(`/projects/${editData._id}`, form)
        : await API.post("/projects", form);
      onSave(res.data, !!editData);
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{editData ? "Edit Project" : "New Project"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Project Title *</label>
            <input className="form-control" placeholder="e.g. Website Redesign"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows={3} placeholder="What is this project about?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input type="date" className="form-control"
              value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Team Members</label>
            <div className="member-checkbox-list">
              {allUsers.filter(u => u.role !== "admin").length === 0 && (
                <p className="text-muted text-sm" style={{ padding: 8 }}>No members available</p>
              )}
              {allUsers.filter(u => u.role !== "admin").map(u => (
                <label key={u._id} className="member-checkbox-item">
                  <input type="checkbox" checked={form.members.includes(u._id)}
                    onChange={() => toggleMember(u._id)} />
                  <div className="avatar sm">{u.name[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                    <div className="text-muted text-sm">{u.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex-gap" style={{ justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editData ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Projects() {
  const { isAdmin, isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await API.get("/projects"); setProjects(r.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = (saved, isEdit) => {
    setProjects(prev => isEdit ? prev.map(p => p._id === saved._id ? saved : p) : [saved, ...prev]);
    setEditData(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try { await API.delete(`/projects/${id}`); setProjects(prev => prev.filter(p => p._id !== id)); }
    catch { alert("Failed to delete"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No deadline";

  const isDeadlineSoon = (d) => {
    if (!d) return false;
    const diff = new Date(d) - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  };

  if (loading) return <div className="loading"><div className="spinner"></div> Loading projects...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Projects</h2>
          <div className="subtitle">{projects.length} project{projects.length !== 1 ? "s" : ""}</div>
        </div>
        {isManager() && (
          <button className="btn btn-primary" onClick={() => { setEditData(null); setShowModal(true); }}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card card-body">
          <div className="empty-state">
            <div className="empty-emoji">📁</div>
            <h3>No projects yet</h3>
            <p>{isManager() ? "Create your first project to get started." : "No projects assigned to you."}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
          {projects.map(proj => (
            <div className="card" key={proj._id} style={{ padding: 20, position: "relative" }}>
              {isDeadlineSoon(proj.deadline) && (
                <div style={{
                  position: "absolute", top: 14, right: 14,
                  background: "var(--warning-light)", color: "var(--warning)",
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                }}>
                  Due Soon
                </div>
              )}

              <div style={{ marginBottom: 10 }}>
                <Link to={`/projects/${proj._id}`} style={{ fontWeight: 800, fontSize: 15, color: "var(--text)", textDecoration: "none" }}>
                  {proj.title}
                </Link>
              </div>

              {proj.description && (
                <p className="text-muted text-sm" style={{ marginBottom: 12, lineHeight: 1.5 }}>
                  {proj.description.slice(0, 90)}{proj.description.length > 90 ? "..." : ""}
                </p>
              )}

              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                <div className="text-sm text-muted">📅 {fmtDate(proj.deadline)}</div>
                <div className="text-sm text-muted">👥 {proj.members?.length || 0} members</div>
              </div>

              {/* member avatars */}
              {proj.members?.length > 0 && (
                <div style={{ display: "flex", gap: -4, marginBottom: 14 }}>
                  {proj.members.slice(0, 5).map(m => (
                    <div key={m._id} className="avatar sm" title={m.name}
                      style={{ marginRight: -6, border: "2px solid white" }}>
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {proj.members.length > 5 && (
                    <div className="avatar sm" style={{ marginRight: -6, border: "2px solid white", background: "var(--surface3)", color: "var(--text-muted)" }}>
                      +{proj.members.length - 5}
                    </div>
                  )}
                </div>
              )}

              <div className="flex-gap">
                <Link to={`/projects/${proj._id}`} className="btn btn-outline btn-sm">View Tasks</Link>
                {isManager() && (
                  <>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => { setEditData(proj); setShowModal(true); }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(proj._id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSave={handleSave}
          editData={editData}
        />
      )}
    </div>
  );
}

export default Projects;
