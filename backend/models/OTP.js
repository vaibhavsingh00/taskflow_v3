const mongoose = require("mongoose");

// OTP expires after 10 minutes
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["register", "forgot-password"],
    default: "register",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // auto-delete after 10 mins (MongoDB TTL)
  },
});

module.exports = mongoose.model("OTP", otpSchema);
