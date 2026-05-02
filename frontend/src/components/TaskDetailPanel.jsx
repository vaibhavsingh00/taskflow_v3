import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Comments from "./Comments";
import API from "../api/axios";

const STATUSES = ["todo", "in-progress", "review", "completed"];
const STATUS_LABELS = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  completed: "Completed",
};
const STATUS_COLORS = {
  todo: "#64748b",
  "in-progress": "#2563eb",
  review: "#7c3aed",
  completed: "#059669",
};

function TaskDetailPanel({ task, onClose, onUpdate }) {
  const { user, isManager } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!task) return null;

  const isOverdue =
    task.deadline &&
    task.status !== "completed" &&
    new Date(task.deadline) < new Date();

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "No deadline";

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await API.put(`/tasks/${task._id}`, { status: newStatus });
      onUpdate(res.data);
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const canChangeStatus =
    isManager() || task.assignedTo?._id === user?._id;

  const initials = (name) =>
    name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  return (
    <>
      {/* dark overlay */}
      <div className="task-detail-overlay" onClick={onClose} />

      {/* slide-in panel */}
      <div className="task-detail-panel">
        {/* header */}
        <div className="task-detail-header">
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-faint)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 4,
              }}
            >
              Task Detail
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                lineHeight: 1.3,
                color: "var(--text)",
              }}
            >
              {task.title}
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* scrollable body */}
        <div className="task-detail-body">
          {/* overdue banner */}
          {isOverdue && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              ⚠️ This task is overdue! Deadline was {fmtDate(task.deadline)}
            </div>
          )}

          {/* description */}
          {task.description && (
            <div style={{ marginBottom: 18 }}>
              <div
                className="section-title"
                style={{ marginBottom: 6, fontSize: 12 }}
              >
                Description
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--text-2)",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                }}
              >
                {task.description}
              </p>
            </div>
          )}

          {/* meta info grid */}
          <div className="task-meta-grid">
            <div className="task-meta-item">
              <div className="meta-label">Status</div>
              {canChangeStatus ? (
                <select
                  className="filter-select"
                  style={{ width: "100%", fontSize: 12 }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              ) : (
                <div
                  className="meta-value"
                  style={{ color: STATUS_COLORS[task.status] }}
                >
                  {STATUS_LABELS[task.status]}
                </div>
              )}
            </div>

            <div className="task-meta-item">
              <div className="meta-label">Priority</div>
              <span className={`badge badge-${task.priority}`}>
                {task.priority}
              </span>
            </div>

            <div className="task-meta-item">
              <div className="meta-label">Due Date</div>
              <div
                className="meta-value"
                style={isOverdue ? { color: "var(--danger)" } : {}}
              >
                {fmtDate(task.deadline)}
              </div>
            </div>

            <div className="task-meta-item">
              <div className="meta-label">Project</div>
              <div className="meta-value">{task.project?.title || "—"}</div>
            </div>

            <div className="task-meta-item">
              <div className="meta-label">Assigned To</div>
              {task.assignedTo ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="avatar sm">
                    {initials(task.assignedTo.name)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {task.assignedTo.name}
                  </span>
                </div>
              ) : (
                <div className="meta-value" style={{ color: "var(--text-faint)" }}>
                  Unassigned
                </div>
              )}
            </div>

            <div className="task-meta-item">
              <div className="meta-label">Created By</div>
              <div className="meta-value">
                {task.createdBy?.name || "—"}
              </div>
            </div>
          </div>

          {/* divider */}
          <hr
            style={{
              border: "none",
              borderTop: "1px solid var(--border)",
              margin: "4px 0 16px",
            }}
          />

          {/* comments section */}
          <Comments taskId={task._id} />
        </div>
      </div>
    </>
  );
}

export default TaskDetailPanel;
