import { useState, useEffect } from "react";
import "../styles/pages.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentResults({ user }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/results/student/${user.id}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>My Exam Results</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading results...</p>}

      <table className="results-table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <td>{result.exam_title}</td>
              <td>{result.obtained_marks}/{result.total_marks}</td>
              <td>{result.percentage.toFixed(2)}%</td>
              <td>
                <span className={`status-${result.status}`}>{result.status}</span>
              </td>
              <td>{new Date(result.created_at).toLocaleDateString()}</td>
              <td>
                <a href={`/student/result/${result.id}`} className="btn-link">
                  View
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {results.length === 0 && !loading && (
        <p className="no-data">No results yet.</p>
      )}
    </div>
  );
}
