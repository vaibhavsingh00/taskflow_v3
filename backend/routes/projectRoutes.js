const express = require("express");
const router = express.Router();
const {
  getProjects, createProject, getProjectById,
  updateProject, deleteProject,
} = require("../controllers/projectController");
const { protect, managerOnly } = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getProjects)
  .post(protect, managerOnly, createProject);

router.route("/:id")
  .get(protect, getProjectById)
  .put(protect, managerOnly, updateProject)
  .delete(protect, managerOnly, deleteProject);

module.exports = router;
