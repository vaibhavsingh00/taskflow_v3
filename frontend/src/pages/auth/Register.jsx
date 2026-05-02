import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // step 1 = fill form + send OTP, step 2 = verify OTP
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "member" });
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const otpRefs = useRef([]);

  const handle = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErr(""); };

  // step 1: validate form and send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setErr("Please fill all fields"); return;
    }
    if (form.password !== form.confirmPassword) { setErr("Passwords do not match"); return; }
    if (form.password.length < 6) { setErr("Password must be at least 6 characters"); return; }

    setLoading(true); setErr("");
    try {
      await API.post("/auth/send-otp", { email: form.email, type: "register" });
      setMsg("OTP sent! Check your Gmail inbox.");
      setStep(2);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  // handle OTP digit input — auto focus next box
  const handleOtpChange = (index, val) => {
    const clean = val.replace(/\D/, "");
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (clean && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKey = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // step 2: verify OTP and create account
  const verifyAndRegister = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");
    if (otp.length !== 6) { setErr("Please enter the complete 6-digit OTP"); return; }

    setLoading(true); setErr("");
    try {
      const res = await API.post("/auth/register", { ...form, otp });
      login(res.data);
      navigate("/dashboard");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    setResending(true); setErr(""); setMsg("");
    try {
      await API.post("/auth/send-otp", { email: form.email, type: "register" });
      setMsg("OTP resent to your email");
    } catch (ex) {
      setErr("Failed to resend OTP");
    } finally { setResending(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="logo">TaskFlow</div>
          <div className="tagline">Join thousands of teams managing work smarter.</div>
          <div className="auth-features">
            <div className="auth-feature-item"><span>🚀</span> Get started in minutes</div>
            <div className="auth-feature-item"><span>📱</span> Works on all devices</div>
            <div className="auth-feature-item"><span>🔒</span> Secure Gmail OTP verification</div>
            <div className="auth-feature-item"><span>💼</span> Admin & team management</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box">
          {step === 1 ? (
            <>
              <div className="auth-title">Create account</div>
              <div className="auth-sub">Fill in your details to get started</div>

              {err && <div className="alert alert-error">{err}</div>}

              <form onSubmit={sendOtp}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" className="form-control"
                    placeholder="John Doe" value={form.name} onChange={handle} />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" name="email" className="form-control"
                    placeholder="you@gmail.com" value={form.email} onChange={handle} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" className="form-control"
                      placeholder="Min 6 characters" value={form.password} onChange={handle} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirmPassword" className="form-control"
                      placeholder="Repeat password" value={form.confirmPassword} onChange={handle} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select name="role" className="form-control" value={form.role} onChange={handle}>
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                  {loading ? "Sending OTP..." : "Continue →"}
                </button>
              </form>

              <p className="text-muted text-sm" style={{ textAlign: "center", marginTop: 20 }}>
                Already have an account? <Link to="/login" style={{ fontWeight: 700 }}>Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <div className="auth-title">Verify your email</div>
              <div className="auth-sub">
                We sent a 6-digit code to <strong>{form.email}</strong>
              </div>

              {err && <div className="alert alert-error">{err}</div>}
              {msg && <div className="alert alert-success">{msg}</div>}

              <form onSubmit={verifyAndRegister}>
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <div className="otp-inputs">
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        ref={el => otpRefs.current[i] = el}
                        type="text"
                        className="otp-input"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                        inputMode="numeric"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
                  {loading ? "Creating account..." : "Verify & Create Account"}
                </button>
              </form>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, alignItems: "center" }}>
                <button onClick={() => { setStep(1); setErr(""); setMsg(""); }}
                  className="btn btn-ghost btn-sm">← Change email</button>
                <button onClick={resendOtp} className="btn btn-ghost btn-sm" disabled={resending}>
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
