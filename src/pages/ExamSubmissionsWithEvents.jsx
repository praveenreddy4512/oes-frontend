import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function ExamSubmissionsWithEvents() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, high, low

  useEffect(() => {
    if (!examId) {
      setError("Exam ID is missing");
      setLoading(false);
      return;
    }
    fetchSubmissionsWithEvents();
  }, [examId]);

  const fetchSubmissionsWithEvents = async () => {
    try {
      const res = await apiGet(`/api/exams/${examId}/submissions/events`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to load submissions");
      }
      const data = await res.json();
      setExam({ id: data.examId, title: data.examTitle });
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === "high") return sub.suspicious_level === 'HIGH';
    if (filter === "low") return sub.suspicious_level === 'LOW';
    return true;
  });

  const highSuspicionCount = submissions.filter(s => s.suspicious_level === 'HIGH').length;
  const lowSuspicionCount = submissions.filter(s => s.suspicious_level === 'LOW').length;

  const getStatusColor = (level) => {
    return level === 'HIGH' ? '#f44336' : '#4CAF50';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  if (loading) return <div className="page-container"><p>Loading submissions...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;

  return (
    <div className="page-container">
      <div className="header-actions">
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        {exam && <h1>📊 {exam.title} - Student Activity Analysis</h1>}
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{submissions.length}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{highSuspicionCount}</div>
          <div className="stat-label">High Suspicious Activity</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{lowSuspicionCount}</div>
          <div className="stat-label">Normal Activity</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-controls">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({submissions.length})
        </button>
        <button
          className={`filter-btn warning ${filter === "high" ? "active" : ""}`}
          onClick={() => setFilter("high")}
        >
          🚨 High Suspicion ({highSuspicionCount})
        </button>
        <button
          className={`filter-btn success ${filter === "low" ? "active" : ""}`}
          onClick={() => setFilter("low")}
        >
          ✅ Normal ({lowSuspicionCount})
        </button>
      </div>

      {/* SUBMISSIONS TABLE */}
      {filteredSubmissions.length === 0 ? (
        <p className="no-data">No submissions found</p>
      ) : (
        <div className="table-responsive">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Tab Switches</th>
                <th>Page Refreshes</th>
                <th>Answers Saved</th>
                <th>Total Events</th>
                <th>Suspicious Level</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((sub) => (
                <tr key={sub.submission_id} className={`row-${sub.suspicious_level.toLowerCase()}`}>
                  <td>
                    <strong>{sub.student_name}</strong>
                  </td>
                  <td>{sub.student_email}</td>
                  <td>
                    <span className={sub.tab_switches > 3 ? 'warning' : ''}>
                      {sub.tab_switches || 0}
                    </span>
                  </td>
                  <td>
                    <span className={sub.page_refreshes > 2 ? 'warning' : ''}>
                      {sub.page_refreshes || 0}
                    </span>
                  </td>
                  <td>{sub.answers_saved || 0}</td>
                  <td>
                    <span className="badge">{sub.total_events || 0}</span>
                  </td>
                  <td>
                    <span 
                      className="suspicious-badge"
                      style={{ backgroundColor: getStatusColor(sub.suspicious_level) }}
                    >
                      {sub.suspicious_level === 'HIGH' ? '🚨 HIGH' : '✅ LOW'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-${sub.is_submitted ? 'submitted' : 'pending'}`}>
                      {sub.is_submitted ? '✅ Submitted' : '⏳ In Progress'}
                    </span>
                  </td>
                  <td>{formatDate(sub.submitted_at)}</td>
                  <td>
                    <button
                      className="btn-small"
                      onClick={() => navigate(`/professor/submissions/${sub.submission_id}/events`)}
                      title="View detailed event timeline"
                    >
                      👁️ View Events
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .header-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .stat-card.warning {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-card.success {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-number {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.9;
        }

        .filter-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .filter-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .filter-btn.warning {
          border-color: #f5576c;
        }

        .filter-btn.warning.active {
          background: #f5576c;
          border-color: #f5576c;
        }

        .filter-btn.success {
          border-color: #4facfe;
        }

        .filter-btn.success.active {
          background: #4facfe;
          border-color: #4facfe;
        }

        .table-responsive {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .submissions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .submissions-table th {
          background: #f5f5f5;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }

        .submissions-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        .submissions-table tr:hover {
          background: #f9f9f9;
        }

        .submissions-table tr.row-high {
          border-left: 4px solid #f44336;
        }

        .submissions-table tr.row-low {
          border-left: 4px solid #4CAF50;
        }

        .suspicious-badge {
          display: inline-block;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 600;
          font-size: 12px;
        }

        .badge {
          background: #667eea;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-submitted {
          color: #4CAF50;
          font-weight: 600;
        }

        .status-pending {
          color: #FF9800;
          font-weight: 600;
        }

        .warning {
          background: #fff3cd;
          color: #856404;
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .btn-small {
          padding: 6px 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.3s;
        }

        .btn-small:hover {
          background: #5568d3;
        }

        .no-data {
          text-align: center;
          color: #999;
          padding: 40px 20px;
        }
      `}</style>
    </div>
  );
}
