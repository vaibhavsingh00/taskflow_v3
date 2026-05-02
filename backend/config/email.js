const nodemailer = require("nodemailer");

// create reusable transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // use Gmail App Password
    },
  });
};

// generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// send OTP email to user
const sendOTPEmail = async (email, otp, type = "register") => {
  const transporter = createTransporter();

  const subject =
    type === "forgot-password"
      ? "TaskFlow — Reset Your Password"
      : "TaskFlow — Verify Your Email";

  const message =
    type === "forgot-password"
      ? "You requested a password reset. Use the OTP below:"
      : "Welcome to TaskFlow! Please verify your email with the OTP below:";

  const mailOptions = {
    from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
          TaskFlow
        </h1>
        <p style="color: #64748b; font-size: 15px; margin-bottom: 32px;">${message}</p>
        
        <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 24px;">
          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Your OTP Code</p>
          <p style="font-size: 42px; font-weight: 800; color: #2563eb; letter-spacing: 8px; margin: 0;">${otp}</p>
        </div>
        
        <p style="color: #94a3b8; font-size: 13px;">
          This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { generateOTP, sendOTPEmail };
