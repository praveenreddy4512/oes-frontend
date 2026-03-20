import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function StudentExams({ user }) {
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
      setExams(data.filter((e) => e.status === "published"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Available Exams</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading exams...</p>}

      <div className="exams-grid">
        {exams.map((exam) => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <div className="exam-info">
              <span>📋 {exam.total_questions} questions</span>
              <span>⏱️ {exam.duration_minutes} mins</span>
              <span>✅ Pass: {exam.passing_score}%</span>
            </div>
            <a href={`/student/exam/${exam.id}`} className="btn-primary">
              Start Exam
            </a>
          </div>
        ))}
      </div>

      {exams.length === 0 && !loading && (
        <p className="no-data">No exams available at the moment.</p>
      )}
    </div>
  );
}
