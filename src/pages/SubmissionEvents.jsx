import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function SubmissionEvents() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("timeline"); // timeline or summary

  useEffect(() => {
    if (!submissionId) {
      setError("Submission ID is missing");
      setLoading(false);
      return;
    }
    fetchEvents();
    fetchSummary();
  }, [submissionId]);

  const fetchEvents = async () => {
    try {
      const res = await apiGet(`/api/submissions/${submissionId}/events`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to load events");
      }
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await apiGet(`/api/submissions/${submissionId}/events/summary`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to load summary");
      }
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      exam_started: "🚀",
      exam_submitted: "✅",
      question_viewed: "👁️",
      answer_saved: "💾",
      tab_switched: "⚠️",
      page_refreshed: "🔄"
    };
    return icons[eventType] || "📌";
  };

  const getEventColor = (eventType) => {
    const colors = {
      exam_started: "#4CAF50",
      exam_submitted: "#2196F3",
      question_viewed: "#FF9800",
      answer_saved: "#4CAF50",
      tab_switched: "#f44336",
      page_refreshed: "#f44336"
    };
    return colors[eventType] || "#666";
  };

  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleString();
  };

  if (loading) return <div className="page-container"><p>Loading events...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;

  return (
    <div className="page-container">
      <div className="header-actions">
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <h1>Exam Event Details</h1>
      </div>

      {summary && (
        <div className="event-summary-card">
          <div className="summary-header">
            <h2>{summary.studentName}</h2>
            <p>Exam ID: {summary.examId}</p>
          </div>
          
          <div className="suspicious-indicator">
            <div className={`suspicion-badge ${summary.suspiciousActivity.suspicionLevel.toLowerCase()}`}>
              {summary.suspiciousActivity.suspicionLevel === 'HIGH' ? '🚨' : '✅'} 
              {summary.suspiciousActivity.suspicionLevel}
            </div>
          </div>

          <div className="summary-stats">
            <div className="stat-box">
              <h3>Total Events</h3>
              <p className="stat-value">{summary.totalEvents}</p>
            </div>
            <div className="stat-box warning">
              <h3>Tab Switches</h3>
              <p className="stat-value">{summary.suspiciousActivity.tabSwitches}</p>
            </div>
            <div className="stat-box warning">
              <h3>Page Refreshes</h3>
              <p className="stat-value">{summary.suspiciousActivity.pageRefreshes}</p>
            </div>
          </div>

          <div className="recommendation">
            <p><strong>Recommendation:</strong> {summary.suspiciousActivity.recommendation}</p>
          </div>
        </div>
      )}

      <div className="view-toggle">
        <button 
          className={`toggle-btn ${view === 'timeline' ? 'active' : ''}`}
          onClick={() => setView('timeline')}
        >
          📋 Timeline View
        </button>
        <button 
          className={`toggle-btn ${view === 'summary' ? 'active' : ''}`}
          onClick={() => setView('summary')}
        >
          📊 Summary View
        </button>
      </div>

      {view === 'timeline' && (
        <div className="events-timeline">
          <h3>Event Timeline</h3>
          {events.length === 0 ? (
            <p className="no-data">No events recorded</p>
          ) : (
            <div className="timeline">
              {events.map((event, idx) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-marker" style={{ backgroundColor: getEventColor(event.event_type) }}>
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="timeline-content">
                    <div className="event-header">
                      <h4>{event.event_type.replace(/_/g, ' ').toUpperCase()}</h4>
                      <span className="event-time">{formatDate(event.timestamp)}</span>
                    </div>
                    {event.time_spent_seconds && (
                      <p className="event-meta">⏱️ Time spent: <strong>{event.time_spent_seconds}s</strong></p>
                    )}
                    {event.question_id && (
                      <p className="event-meta">❓ Question ID: <strong>{event.question_id}</strong></p>
                    )}
                    {event.event_details && (
                      <details className="event-details">
                        <summary>View Details</summary>
                        <pre>{JSON.stringify(event.event_details, null, 2)}</pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'summary' && summary && (
        <div className="events-summary">
          <h3>Event Summary</h3>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Event Type</th>
                <th>Count</th>
                <th>Total Time (seconds)</th>
                <th>First Occurrence</th>
                <th>Last Occurrence</th>
              </tr>
            </thead>
            <tbody>
              {summary.summary && summary.summary.map((item) => (
                <tr key={item.event_type}>
                  <td>
                    <span className="event-badge" style={{ backgroundColor: getEventColor(item.event_type) }}>
                      {getEventIcon(item.event_type)} {item.event_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td><strong>{item.count}</strong></td>
                  <td>{item.total_time_seconds || '-'}</td>
                  <td>{item.first_occurrence ? formatDate(item.first_occurrence) : '-'}</td>
                  <td>{item.last_occurrence ? formatDate(item.last_occurrence) : '-'}</td>
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

        .event-summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .summary-header {
          margin-bottom: 20px;
        }

        .summary-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .summary-header p {
          margin: 5px 0 0 0;
          opacity: 0.9;
        }

        .suspicious-indicator {
          margin-bottom: 20px;
        }

        .suspicion-badge {
          display: inline-block;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
        }

        .suspicion-badge.high {
          background-color: #ff5252;
        }

        .suspicion-badge.low {
          background-color: #4CAF50;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-box {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-box h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .stat-value {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }

        .stat-box.warning {
          background: rgba(255,152,0,0.3);
        }

        .recommendation {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #FFD700;
        }

        .recommendation p {
          margin: 0;
        }

        .view-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
        }

        .toggle-btn {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .toggle-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .events-timeline {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .events-timeline h3 {
          margin-top: 0;
          color: #333;
        }

        .timeline {
          position: relative;
          padding-left: 30px;
        }

        .timeline-item {
          position: relative;
          margin-bottom: 25px;
          display: flex;
          gap: 15px;
        }

        .timeline-marker {
          position: absolute;
          left: -45px;
          top: 0;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: -28px;
          top: 30px;
          bottom: 0;
          width: 2px;
          background: #ddd;
        }

        .timeline-content {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 6px;
          border-left: 3px solid #667eea;
          flex: 1;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .event-header h4 {
          margin: 0;
          color: #333;
          font-size: 16px;
        }

        .event-time {
          font-size: 12px;
          color: #999;
        }

        .event-meta {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }

        .event-details {
          margin-top: 10px;
        }

        .event-details summary {
          cursor: pointer;
          color: #667eea;
          font-weight: 500;
        }

        .event-details pre {
          background: white;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
          margin-top: 10px;
        }

        .events-summary {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .events-summary h3 {
          margin-top: 0;
        }

        .summary-table {
          width: 100%;
          border-collapse: collapse;
        }

        .summary-table th {
          background: #f5f5f5;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }

        .summary-table td {
          padding: 12px;
          border-bottom: 1px solid #eee;
        }

        .event-badge {
          display: inline-block;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
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
