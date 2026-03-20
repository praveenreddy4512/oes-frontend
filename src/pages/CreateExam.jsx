import { useState } from "react";
import "../styles/pages.css";
import { apiPost } from "../utils/api";

export default function CreateExam({ user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration_minutes" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiPost('/api/exams', { ...formData, professor_id: user.id });

      if (!res.ok) throw new Error("Failed to create exam");

      const data = await res.json();
      setSuccess("Exam created successfully!");
      setFormData({
        title: "",
        description: "",
        duration_minutes: 60,
      });
      setTimeout(
        () => (window.location.href = `/professor/exam/${data.id}/edit`),
        1500
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Create New Exam</h1>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form className="exam-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Exam Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Mathematics Midterm"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Exam details and instructions"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Duration (minutes) *</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Exam"}
        </button>
      </form>
    </div>
  );
}
