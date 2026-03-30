import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, setToken } from "../utils/api.js";
import logo from "../assets/logo.png";
import "../styles/login.css";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiPost("/api/login", formData);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // 🔐 Store JWT token for future API calls
      if (data.token) {
        setToken(data.token);
      }

      onLogin(data.user);
      navigate("/dashboard");
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
          <p className="subtitle">Enter your credentials to access the portal</p>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={onInputChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={onInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-hint">
          <h4>Demo Credentials:</h4>
          <div className="credentials">
            <div className="cred-item">
              <span className="role">Student:</span>
              <code>student1 / student123</code>
            </div>
            <div className="cred-item">
              <span className="role">Professor:</span>
              <code>professor1 / prof123</code>
            </div>
            <div className="cred-item">
              <span className="role">Admin:</span>
              <code>admin1 / admin123</code>
            </div>
          </div>
        </div>

        <div className="security-notice">
          <p>⚠️ <strong>Security Notice:</strong> This is a demonstration of plaintext password storage vulnerabilities. Do not use this approach in production.</p>
        </div>
      </section>
    </main>
  );
}
