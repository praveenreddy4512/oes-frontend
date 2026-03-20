import { useState, useEffect } from "react";
import "../styles/pages.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ProfessorSubmissions({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/submissions`);
      const data = await res.json();
      setSubmissions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "submitted") return sub.is_submitted === true;
    if (filter === "pending") return sub.is_submitted === false;
    return true;
  });

  return (
    <div className="page-container">
      <h1>Student Exam Submissions</h1>
      
      <div className="filter-controls">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({submissions.length})
        </button>
        <button
          className={`filter-btn ${filter === "submitted" ? "active" : ""}`}
          onClick={() => setFilter("submitted")}
        >
          Submitted ({submissions.filter((s) => s.is_submitted).length})
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({submissions.filter((s) => !s.is_submitted).length})
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading submissions...</p>}

      {filteredSubmissions.length === 0 ? (
        <p className="no-data">No submissions found</p>
      ) : (
        <table className="submissions-table">
          <thead>
            <tr>
              <th>Exam ID</th>
              <th>Student ID</th>
              <th>Status</th>
              <th>Started</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.exam_id}</td>
                <td>{sub.student_id}</td>
                <td>
                  <span className={`status-${sub.is_submitted ? "submitted" : "pending"}`}>
                    {sub.is_submitted ? "✅ Submitted" : "⏳ In Progress"}
                  </span>
                </td>
                <td>{new Date(sub.started_at).toLocaleString()}</td>
                <td>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "-"}</td>
                <td>
                  <a href={`/professor/submission/${sub.id}`} className="btn-link">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
