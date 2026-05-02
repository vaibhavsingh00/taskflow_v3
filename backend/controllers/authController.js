const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const { generateOTP, sendOTPEmail } = require("../config/email");

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// STEP 1: user fills form → we send OTP to their email
// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  const { email, type = "register" } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    if (type === "register") {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: "Email already registered" });
    } else {
      // forgot password - email must exist
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "No account found with this email" });
    }

    // delete any old OTP for this email
    await OTP.deleteMany({ email, type });

    const otp = generateOTP();
    await OTP.create({ email, otp, type });
    await sendOTPEmail(email, otp, type);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP. Check email config in .env" });
  }
};

// STEP 2: verify OTP code
// POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  const { email, otp, type = "register" } = req.body;

  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  try {
    const record = await OTP.findOne({ email, otp, type });
    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    res.json({ message: "OTP verified", verified: true });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// STEP 3: create account after OTP verified
// POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password, otp, role } = req.body;

  if (!name || !email || !password || !otp) {
    return res.status(400).json({ message: "All fields and OTP are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    // verify OTP first
    const otpRecord = await OTP.findOne({ email, otp, type: "register" });
    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "member",
      isVerified: true,
    });

    // clean up OTP
    await OTP.deleteMany({ email, type: "register" });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: makeToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: makeToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "All fields required" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });

  try {
    const otpRecord = await OTP.findOne({ email, otp, type: "forgot-password" });
    if (!otpRecord) return res.status(400).json({ message: "Invalid or expired OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    await OTP.deleteMany({ email, type: "forgot-password" });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Reset failed" });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => res.json(req.user);

module.exports = { sendOtp, verifyOtp, registerUser, loginUser, resetPassword, getMe };
