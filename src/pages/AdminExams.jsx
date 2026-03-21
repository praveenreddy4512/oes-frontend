import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiGet, apiPut, apiDelete, apiUrl } from "../utils/api";

export default function AdminExams() {
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
      setExams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      const exam = exams.find((e) => e.id === examId);
      const res = await apiPut(`/api/exams/${examId}`, { ...exam, status: newStatus });
      if (!res.ok) throw new Error("Failed to update exam status");
      alert("Exam status updated!");
      fetchExams();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (examId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiDelete(`/api/exams/${examId}`);
      alert("Exam deleted!");
      fetchExams();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="page-container">
      <h1>Manage All Exams</h1>

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading exams...</p>}

      <table className="exams-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Professor</th>
            <th>Questions</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id}>
              <td>{exam.title}</td>
              <td>{exam.professor_name}</td>
              <td>{exam.total_questions}</td>
              <td>
                <select
                  value={exam.status}
                  onChange={(e) => handleStatusChange(exam.id, e.target.value)}
                  className="status-select"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
              <td>{new Date(exam.created_at).toLocaleDateString()}</td>
              <td>
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

      {exams.length === 0 && !loading && <p className="no-data">No exams found.</p>}
    </div>
  );
}

//push test