import React, { useState, useEffect } from "react";
import API from "../../api/axios";

function Team() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/users")
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const roleColors = { admin: "badge-admin", manager: "badge-manager", member: "badge-member" };

  if (loading) return <div className="loading"><div className="spinner"></div> Loading team...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Team Members</h2>
          <div className="subtitle">{users.length} member{users.length !== 1 ? "s" : ""} in your workspace</div>
        </div>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="🔍 Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card card-body">
          <div className="empty-state">
            <div className="empty-emoji">👥</div>
            <h3>No members found</h3>
            <p>Register new accounts to add team members.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {filtered.map(u => (
            <div className="card card-body" key={u._id}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div className="avatar lg">{u.name[0].toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{u.name}</div>
                  <div className="text-muted text-sm">{u.email}</div>
                </div>
              </div>
              <div className="flex-between">
                <span className={`badge ${roleColors[u.role] || "badge-member"}`}>{u.role}</span>
                <span className="text-muted text-sm">Joined {fmtDate(u.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Team;
