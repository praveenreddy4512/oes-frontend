import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiGet, apiDelete } from "../utils/api";

export default function ProfessorExams({ user }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet('/api/exams');
      const data = await res.json();
      setExams(data.filter((e) => e.professor_id === user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;
    try {
      const res = await apiDelete(`/api/exams/${examId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete exam");
      }
      setExams(exams.filter((e) => e.id !== examId));
      alert("Exam deleted successfully!");
    } catch (err) {
      alert("Failed to delete exam: " + err.message);
    }
  };

  return (
    <div className="page-container">
      <h1>My Exams</h1>
      <a href="/professor/create-exam" className="btn-primary">
        + Create New Exam
      </a>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading exams...</p>}

      <table className="exams-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Questions</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.title}</td>
              <td>{exam.total_questions}</td>
              <td>{exam.duration_minutes} min</td>
              <td>
                <span className={`status-${exam.status}`}>{exam.status}</span>
              </td>
              <td>{new Date(exam.created_at).toLocaleDateString()}</td>
              <td>
                <a href={`/professor/exam/${exam.id}/edit`} className="btn-link" title="Edit exam details and questions">
                  Edit
                </a>
                <a href={`/professor/exam/${exam.id}/results`} className="btn-link" title="View exam results and submissions">
                  Results
                </a>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="btn-link btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {exams.length === 0 && !loading && (
        <p className="no-data">No exams created yet.</p>
      )}
    </div>
  );
}
