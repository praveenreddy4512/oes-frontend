import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function AdminStatistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet('/api/results');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-container"><p>Loading...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;

  return (
    <div className="page-container">
      <h1>System Statistics</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.total_exams || 0}</h3>
            <p>Total Exams</p>
          </div>
          <div className="stat-card">
            <h3>{stats.total_students || 0}</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-card">
            <h3>{stats.total_results || 0}</h3>
            <p>Submissions</p>
          </div>
          <div className="stat-card">
            <h3>{isNaN(stats.avg_percentage) ? 0 : Number(stats.avg_percentage || 0).toFixed(2)}%</h3>
            <p>Avg Percentage</p>
          </div>
        </div>
      )}
    </div>
  );
}
