import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiPost } from "../utils/api.js";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiPost("/api/reset-password", {
        token,
        newPassword: formData.password
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setFormData({ password: "", confirmPassword: "" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="OES Logo" className="login-logo" />
            </div>
            <h2>Reset Password</h2>
          </div>

          <div className="error-box">
            <p>{error}</p>
          </div>

          <div className="back-to-login">
            <a href="/login" className="back-link">← Back to Login</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src={logo} alt="OES Logo" className="login-logo" />
          </div>
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your new password below</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onInputChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={onInputChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="back-to-login">
          <a href="/login" className="back-link">← Back to Login</a>
        </div>

        <div className="security-notice">
          <p>🔒 <strong>Security:</strong> Your password will be securely hashed before storage.</p>
        </div>
      </section>
    </main>
  );
}
