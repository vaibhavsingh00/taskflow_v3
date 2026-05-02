import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { user, logout, isAdmin, isManager } = useAuth();
  const [open, setOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const link = (to, icon, label) => (
    <NavLink
      to={to}
      onClick={() => setOpen(false)}
      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
    >
      <span className="nav-icon">{icon}</span>
      {label}
    </NavLink>
  );

  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setOpen(!open)}>
        {open ? "✕" : "☰"}
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <span className="logo-text">TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main</span>
          {link("/dashboard", "📊", "Dashboard")}
          {link("/projects", "📁", "Projects")}
          {link("/tasks", "✅", "Tasks")}

          {isManager() && (
            <>
              <span className="nav-section-label" style={{ marginTop: 8 }}>Management</span>
              {link("/team", "👥", "Team")}
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="u-name">{user?.name}</div>
              <div className="u-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
