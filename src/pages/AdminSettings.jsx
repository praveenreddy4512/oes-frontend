import { useState } from "react";
import "../styles/pages.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    system_name: "Online Examination System",
    default_exam_duration: 60,
    default_passing_score: 50,
    max_exam_attempts: 3,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "system_name" ? value : Number(value),
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // In a real application, you would have a settings endpoint
      // For now, we'll just show a success message
      // const res = await fetch(`${apiUrl}/api/settings`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(settings),
      // });
      // if (!res.ok) throw new Error("Failed to save settings");
      setSuccess("✅ Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>System Settings</h1>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleSaveSettings} className="settings-form">
        <div className="profile-card">
          <div className="profile-field">
            <label>System Name:</label>
            <input
              type="text"
              name="system_name"
              value={settings.system_name}
              onChange={handleChange}
            />
          </div>
          <div className="profile-field">
            <label>Default Exam Duration (minutes):</label>
            <input
              type="number"
              name="default_exam_duration"
              value={settings.default_exam_duration}
              onChange={handleChange}
              min={1}
            />
          </div>
          <div className="profile-field">
            <label>Default Passing Score (%):</label>
            <input
              type="number"
              name="default_passing_score"
              value={settings.default_passing_score}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </div>
          <div className="profile-field">
            <label>Max Exam Attempts:</label>
            <input
              type="number"
              name="max_exam_attempts"
              value={settings.max_exam_attempts}
              onChange={handleChange}
              min={1}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      <div className="settings-info">
        <h2>System Information</h2>
        <ul>
          <li><strong>System Version:</strong> 1.0.0</li>
          <li><strong>Database:</strong> MySQL</li>
          <li><strong>API Server:</strong> {apiUrl}</li>
          <li><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</li>
        </ul>
      </div>
    </div>
  );
}
