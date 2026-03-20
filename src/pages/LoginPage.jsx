import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      const response = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: 'include',  // ✅ Allow cookies to be sent/received
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
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
          <h1>📚 OES</h1>
          <p className="title">Online Examination System</p>
          <p className="subtitle">Login Portal</p>
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
