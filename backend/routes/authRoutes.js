const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);

module.exports = router;
