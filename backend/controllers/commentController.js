const Comment = require("../models/Comment");
const Task = require("../models/Task");

// GET /api/comments?task=taskId
const getComments = async (req, res) => {
  const { task } = req.query;
  if (!task) return res.status(400).json({ message: "Task ID required" });

  try {
    const comments = await Comment.find({ task })
      .populate("author", "name email role")
      .sort({ createdAt: 1 }); // oldest first so conversation flows naturally
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching comments" });
  }
};

// POST /api/comments
const addComment = async (req, res) => {
  const { text, task } = req.body;

  if (!text || !text.trim()) return res.status(400).json({ message: "Comment text is required" });
  if (!task) return res.status(400).json({ message: "Task ID is required" });

  try {
    // make sure the task exists
    const taskExists = await Task.findById(task);
    if (!taskExists) return res.status(404).json({ message: "Task not found" });

    const comment = await Comment.create({
      text: text.trim(),
      task,
      author: req.user._id,
    });

    const populated = await Comment.findById(comment._id).populate("author", "name email role");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Error adding comment" });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // only the author or an admin can delete a comment
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting comment" });
  }
};

module.exports = { getComments, addComment, deleteComment };
