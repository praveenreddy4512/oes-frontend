import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiPost, apiGet } from "../utils/api";

export default function CreateExam({ user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch available groups when component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const res = await apiGet('/api/groups/for-exams/list');
        if (res.ok) {
          const data = await res.json();
          setGroups(Array.isArray(data) ? data : data.groups || []);
        }
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration_minutes" ? Number(value) : value,
    }));
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { 
        ...formData, 
        professor_id: user.id,
        groupIds: selectedGroups
      };
      const res = await apiPost('/api/exams', payload);

      if (!res.ok) throw new Error("Failed to create exam");

      const data = await res.json();
      setSuccess("Exam created successfully!");
      setFormData({
        title: "",
        description: "",
        duration_minutes: 60,
      });
      setSelectedGroups([]);
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

        <div className="form-group">
          <label>Assign to Groups</label>
          {loadingGroups ? (
            <p className="info">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="info">No groups available. Create groups in Admin settings.</p>
          ) : (
            <div className="groups-checkbox-container">
              {groups.map((group) => (
                <label key={group.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleGroupToggle(group.id)}
                  />
                  <span>{group.name}</span>
                </label>
              ))}
            </div>
          )}
          <small>Students can only take exams assigned to their groups</small>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Exam"}
        </button>
      </form>
    </div>
  );
}
