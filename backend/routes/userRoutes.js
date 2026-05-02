const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// both admin and member can fetch users (needed for displaying names)
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
