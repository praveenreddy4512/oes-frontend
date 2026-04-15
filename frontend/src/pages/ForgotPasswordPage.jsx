import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../utils/api.js";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await apiPost("/api/forgot-password", { email });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      setSuccess("Check your email for password reset instructions.");
      setEmail("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <img src={logo} alt="OES Logo" className="login-logo" />
          </div>
          <h2>Reset Password</h2>
          <p className="subtitle">Enter your email address to receive reset instructions</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="back-to-login">
          <a href="/login" className="back-link">← Back to Login</a>
        </div>

        <div className="security-notice">
          <p>⚠️ <strong>Security Notice:</strong> Password reset links are valid for 1 hour only.</p>
        </div>
      </section>
    </main>
  );
}
