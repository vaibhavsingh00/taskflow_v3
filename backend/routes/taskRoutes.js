const express = require("express");
const router = express.Router();
const {
  getTasks, createTask, getTaskById,
  updateTask, deleteTask, getTaskStats,
} = require("../controllers/taskController");
const { protect, managerOnly } = require("../middleware/authMiddleware");

// stats must come before /:id
router.get("/stats", protect, getTaskStats);

router.route("/")
  .get(protect, getTasks)
  .post(protect, managerOnly, createTask);  // admin + manager can create

router.route("/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, managerOnly, deleteTask); // admin + manager can delete

module.exports = router;
