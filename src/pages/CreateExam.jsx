import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiPost, apiGet } from "../utils/api";

export default function CreateExam({ user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 60,
    is_ip_restricted: false,
    restricted_ip: "",
    start_time: "",
    end_time: "",
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
            rows="3"
          />
        </div>

        <div className="form-row" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>🔓 Exam Starts At (Date & Time)</label>
            <input
              type="datetime-local"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
            <small className="help-text">Students cannot start before this time.</small>
          </div>

          <div className="form-group">
            <label>🔒 Exam Ends At (Date & Time)</label>
            <input
              type="datetime-local"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
            <small className="help-text">Students cannot start after this time.</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
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

          <div className="form-group" style={{ flex: 2 }}>
            <label className="checkbox-label" style={{ marginTop: '32px' }}>
              <input
                type="checkbox"
                name="is_ip_restricted"
                checked={formData.is_ip_restricted}
                onChange={(e) => setFormData(prev => ({ ...prev, is_ip_restricted: e.target.checked }))}
              />
              <span>🔒 Restrict to Specific IP</span>
            </label>
          </div>
        </div>

        {formData.is_ip_restricted && (
          <div className="form-group animate-fade-in" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label>Authorized IP Address(es)</label>
            <input
              type="text"
              name="restricted_ip"
              value={formData.restricted_ip}
              onChange={handleChange}
              placeholder="e.g., 192.168.1.1 or 203.0.113.5 (separate multi-IP with commas)"
              required={formData.is_ip_restricted}
            />
            <small style={{ color: '#64748b', display: 'block', marginTop: '8px' }}>
              Students can only start this exam if their network IP matches one of these addresses.
            </small>
          </div>
        )}

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
