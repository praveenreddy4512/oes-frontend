import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ExamResults() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch exam details
      const examRes = await fetch(`${apiUrl}/api/exams/${examId}`);
      if (!examRes.ok) throw new Error("Failed to load exam");
      const examData = await examRes.json();
      setExam(examData);

      // Fetch exam results
      const resultsRes = await fetch(`${apiUrl}/api/results/exam/${examId}`);
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(resultsData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container"><p>Loading exam results...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;
  if (!exam) return <div className="page-container"><p>Exam not found</p></div>;

  const filteredResults = results.filter((result) => {
    if (filter === "pass") return result.status === "pass";
    if (filter === "fail") return result.status === "fail";
    return true;
  });

  const stats = {
    total: results.length,
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    avgScore:
      results.length > 0
        ? (results.reduce((sum, r) => sum + Number(r.percentage || 0), 0) / results.length).toFixed(2)
        : 0,
  };

  return (
    <div className="page-container">
      <h1>Exam Results: {exam.title}</h1>
      <p className="subtitle">{exam.description}</p>

      {error && <p className="error">{error}</p>}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <p>Total Submissions</p>
        </div>
        <div className="stat-card">
          <h3>{stats.passed}</h3>
          <p>Passed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.failed}</h3>
          <p>Failed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.avgScore}%</h3>
          <p>Average Score</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-controls">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({results.length})
        </button>
        <button
          className={`filter-btn ${filter === "pass" ? "active" : ""}`}
          onClick={() => setFilter("pass")}
        >
          Passed ({stats.passed})
        </button>
        <button
          className={`filter-btn ${filter === "fail" ? "active" : ""}`}
          onClick={() => setFilter("fail")}
        >
          Failed ({stats.failed})
        </button>
      </div>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <p className="no-data">No submissions found</p>
      ) : (
        <table className="results-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Attempted On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result) => (
              <tr key={result.id}>
                <td>{result.username}</td>
                <td>
                  {Number(result.obtained_marks) || 0} / {Number(result.total_marks) || 0}
                </td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Number(result.percentage) || 0}%`,
                        backgroundColor:
                          Number(result.percentage) >= 50 ? "#4caf50" : "#f44336",
                      }}
                    ></div>
                    <span className="progress-text">{Number(result.percentage || 0).toFixed(2)}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-${result.status}`}>
                    {result.status === "pass" ? "✅ Pass" : "❌ Fail"}
                  </span>
                </td>
                <td>{new Date(result.created_at).toLocaleString()}</td>
                <td>
                  <a
                    href={`/professor/submission/${result.submission_id}`}
                    className="btn-link"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate("/professor/exams")} className="btn-secondary">
        Back to Exams
      </button>
    </div>
  );
}
