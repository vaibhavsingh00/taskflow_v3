const express = require("express");
const router = express.Router();
const { getComments, addComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// all comment routes need login
router.get("/", protect, getComments);
router.post("/", protect, addComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
