import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

function Comments({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (taskId) fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments?task=${taskId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setPosting(true);
    try {
      const res = await API.post("/comments", { text, task: taskId });
      setComments((prev) => [...prev, res.data]);
      setText("");
      // scroll to bottom after posting
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert("Failed to delete comment");
    }
  };

  // handle Ctrl+Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handlePost(e);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const canDelete = (comment) => {
    return (
      comment.author?._id === user?._id ||
      user?.role === "admin"
    );
  };

  const initials = (name) =>
    name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  const roleColor = (role) => {
    if (role === "admin") return "#9333ea";
    if (role === "manager") return "#0891b2";
    return "#64748b";
  };

  return (
    <div className="comments-section">
      <div className="section-title" style={{ marginBottom: 14 }}>
        💬 Comments ({comments.length})
      </div>

      {loading ? (
        <div style={{ color: "var(--text-faint)", fontSize: 13, padding: "12px 0" }}>
          Loading comments...
        </div>
      ) : (
        <>
          {/* comment list */}
          {comments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px",
                background: "var(--surface2)",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-faint)",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="comment-list">
              {comments.map((c) => (
                <div className="comment-item" key={c._id}>
                  {/* author avatar */}
                  <div
                    className="avatar sm"
                    style={{ flexShrink: 0, marginTop: 2 }}
                    title={c.author?.name}
                  >
                    {initials(c.author?.name || "?")}
                  </div>

                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{c.author?.name || "Unknown"}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: roleColor(c.author?.role),
                          textTransform: "capitalize",
                          background: "var(--surface3)",
                          padding: "1px 6px",
                          borderRadius: 10,
                        }}
                      >
                        {c.author?.role}
                      </span>
                      <span className="comment-time">{formatTime(c.createdAt)}</span>
                    </div>
                    <div className="comment-text">{c.text}</div>
                  </div>

                  {/* delete button - only visible on hover */}
                  {canDelete(c) && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(c._id)}
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}

          {/* new comment input */}
          <form onSubmit={handlePost}>
            <div className="comment-input-area">
              <div className="avatar sm" style={{ flexShrink: 0, marginBottom: 2 }}>
                {initials(user?.name || "?")}
              </div>
              <textarea
                className="comment-textarea"
                placeholder="Write a comment... (Ctrl+Enter to post)"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                onInput={(e) => {
                  // auto-resize textarea
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={posting || !text.trim()}
                style={{ flexShrink: 0, alignSelf: "flex-end" }}
              >
                {posting ? "..." : "Post"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default Comments;
