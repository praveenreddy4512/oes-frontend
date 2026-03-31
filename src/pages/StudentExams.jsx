import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function StudentExams({ user }) {
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoadingGroups(true);
    setError("");
    try {
      // Fetch student's groups
      const groupsRes = await apiGet('/api/groups/student/my-groups');
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(Array.isArray(groupsData) ? groupsData : groupsData.groups || []);
      }

      // Fetch exams assigned to student's groups
      const examsRes = await apiGet('/api/exams/student/exams/by-group');
      const examsData = await examsRes.json();
      
      if (Array.isArray(examsData)) {
        setExams(examsData.filter((e) => e.status === "published"));
      } else {
        console.error("Failed to fetch group exams:", examsData);
        throw new Error(examsData.error || "Invalid exam data received");
      }
    } catch (err) {
      setError(err.message);
      // Fallback to fetching all published exams if group filtering fails
      try {
        const res = await apiGet('/api/exams');
        const data = await res.json();
        if (Array.isArray(data)) {
          setExams(data.filter((e) => e.status === "published"));
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
      setLoadingGroups(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Available Exams</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading exams...</p>}

      {!loadingGroups && groups.length > 0 && (
        <div className="student-groups-info">
          <h3>📚 Your Groups</h3>
          <div className="groups-list-inline">
            {groups.map((group) => (
              <span key={group.id} className="group-tag">{group.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="exams-grid">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <div className="exam-info">
              <span>📋 {exam.total_questions} questions</span>
              <span>⏱️ {exam.duration_minutes} mins</span>
              {exam.start_time && (
                <span style={{ fontWeight: '600', color: '#059669' }}>
                  📅 Starts: {(() => {
                    try {
                      const utcStr = exam.start_time.replace(' ', 'T');
                      const d = new Date(utcStr + 'Z');
                      // Convert UTC to IST (UTC+5:30)
                      const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
                      return isNaN(d) ? exam.start_time : istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                    } catch (e) {
                      return exam.start_time;
                    }
                  })()}
                </span>
              )}
              {exam.end_time && (
                <span style={{ fontWeight: '600', color: '#dc2626' }}>
                  🕒 Ends: {(() => {
                    try {
                      const utcStr = exam.end_time.replace(' ', 'T');
                      const d = new Date(utcStr + 'Z');
                      // Convert UTC to IST (UTC+5:30)
                      const istTime = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
                      return isNaN(d) ? exam.end_time : istTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
                    } catch (e) {
                      return exam.end_time;
                    }
                  })()}
                </span>
              )}
            </div>
            <div className="exam-card-footer" style={{ marginTop: 'auto', paddingTop: '15px' }}>
              {(() => {
                const now = new Date();
                const startTime = exam.start_time ? (() => {
                  try {
                    const utcStr = exam.start_time.replace(' ', 'T');
                    const utcDate = new Date(utcStr + 'Z');
                    // Convert UTC to IST (UTC+5:30)
                    return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                  } catch (e) {
                    return null;
                  }
                })() : null;
                const endTime = exam.end_time ? (() => {
                  try {
                    const utcStr = exam.end_time.replace(' ', 'T');
                    const utcDate = new Date(utcStr + 'Z');
                    // Convert UTC to IST (UTC+5:30)
                    return new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                  } catch (e) {
                    return null;
                  }
                })() : null;
                const isEarly = startTime && !isNaN(startTime) && now < startTime;
                const isPast = endTime && !isNaN(endTime) && now > endTime;

                if (isEarly) {
                  return (
                    <button className="btn-secondary" disabled style={{ width: '100%', opacity: 0.7 }}>
                      ⏳ Available at {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </button>
                  );
                }
                
                if (isPast) {
                  return (
                    <button className="btn-secondary" disabled style={{ width: '100%', background: '#f3f4f6', color: '#9ca3af' }}>
                      🛑 Exam Closed
                    </button>
                  );
                }

                return (
                  <a href={`/student/exam/${exam.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                    Start Exam
                  </a>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {exams.length === 0 && !loading && (
        <p className="no-data">No exams available for your groups at the moment.</p>
      )}
    </div>
  );
}
