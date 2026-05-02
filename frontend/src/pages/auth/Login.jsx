import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

// forgot password flow inside login page
function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1); // 1=email, 2=otp+new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setErr(""); setMsg("");
    try {
      await API.post("/auth/send-otp", { email, type: "forgot-password" });
      setMsg("OTP sent to your email");
      setStep(2);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await API.post("/auth/reset-password", { email, otp, newPassword });
      setMsg("Password reset! You can now login.");
      setTimeout(onBack, 2000);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Reset failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-form-box">
      <div className="auth-title">Reset Password</div>
      <div className="auth-sub">
        {step === 1 ? "Enter your email to receive an OTP" : `OTP sent to ${email}`}
      </div>

      {err && <div className="alert alert-error">{err}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {step === 1 ? (
        <form onSubmit={sendOtp}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword}>
          <div className="form-group">
            <label className="form-label">OTP Code</label>
            <input type="text" className="form-control" placeholder="6-digit code"
              value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters"
              value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginTop: 14, width: "100%" }}>
        ← Back to Login
      </button>
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setErr("Please fill all fields"); return; }
    setLoading(true); setErr("");
    try {
      const res = await API.post("/auth/login", form);
      login(res.data);
      navigate("/dashboard");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="logo">TaskFlow</div>
          <div className="tagline">The smart way to manage your team's work and projects.</div>
          <div className="auth-features">
            <div className="auth-feature-item"><span>✅</span> Track tasks across projects</div>
            <div className="auth-feature-item"><span>👥</span> Collaborate with your team</div>
            <div className="auth-feature-item"><span>📊</span> Real-time dashboard analytics</div>
            <div className="auth-feature-item"><span>🔐</span> Role-based access control</div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        {showForgot ? (
          <ForgotPassword onBack={() => setShowForgot(false)} />
        ) : (
          <div className="auth-form-box">
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">Sign in to your TaskFlow workspace</div>

            {err && <div className="alert alert-error">{err}</div>}

            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-control"
                  placeholder="you@example.com" value={form.email} onChange={handle} />
              </div>

              <div className="form-group">
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <button type="button" onClick={() => setShowForgot(true)}
                    className="btn btn-ghost btn-sm" style={{ padding: "0 4px", fontSize: 12 }}>
                    Forgot password?
                  </button>
                </div>
                <input type="password" name="password" className="form-control"
                  placeholder="Enter password" value={form.password} onChange={handle} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div> Signing in...</> : "Sign In"}
              </button>
            </form>

            <p className="text-muted text-sm" style={{ textAlign: "center", marginTop: 20 }}>
              Don't have an account? <Link to="/register" style={{ fontWeight: 700 }}>Create one</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
