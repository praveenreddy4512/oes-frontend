import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

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
      if (!res.ok) throw new Error("Failed to load submissions");
      const data = await res.json();
      // Filter to only show submissions for this professor's exams
      const professorSubmissions = data.filter((sub) => sub.professor_id === user.id);
      setSubmissions(professorSubmissions);
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

  const submittedCount = submissions.filter((s) => s.is_submitted).length;
  const pendingCount = submissions.filter((s) => !s.is_submitted).length;

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
          Submitted ({submittedCount})
        </button>
        <button
          className={`filter-btn ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending ({pendingCount})
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
              <th>Exam</th>
              <th>Student</th>
              <th>Score</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.exam_title}</td>
                <td>{sub.student_name}</td>
                <td>
                  {sub.is_submitted && sub.correct_answers !== null
                    ? `${sub.correct_answers}/${sub.total_answers}`
                    : "-"}
                </td>
                <td>
                  <span className={`status-${sub.is_submitted ? "submitted" : "pending"}`}>
                    {sub.is_submitted ? "✅ Submitted" : "⏳ In Progress"}
                  </span>
                </td>
                <td>
                  {sub.completed_at ? new Date(sub.completed_at).toLocaleString() : "-"}
                </td>
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
