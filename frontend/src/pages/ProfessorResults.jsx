import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function ProfessorResults({ user }) {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all exams for this professor
      const examsRes = await apiGet("/api/exams");
      if (!examsRes.ok) {
        throw new Error("Failed to load exams");
      }
      const examsData = await examsRes.json();
      
      // Filter exams by professor
      const professorExams = examsData.filter((exam) => exam.professor_id === user.id);
      setExams(professorExams);

      // Fetch results for each exam
      const resultsMap = {};
      for (const exam of professorExams) {
        try {
          const resultsRes = await apiGet(`/api/results/exam/${exam.id}`);
          if (resultsRes.ok) {
            const resultsData = await resultsRes.json();
            resultsMap[exam.id] = resultsData;
          }
        } catch (err) {
          console.log(`Could not load results for exam ${exam.id}`);
        }
      }
      setResults(resultsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getExamStats = (examId) => {
    const examResults = results[examId] || [];
    if (examResults.length === 0) {
      return {
        total: 0,
        avgScore: 0,
      };
    }

    return {
      total: examResults.length,
      avgScore: (
        examResults.reduce((sum, r) => sum + Number(r.percentage || 0), 0) /
        examResults.length
      ).toFixed(2),
    };
  };

  const sortedExams = [...exams].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === "submissions") {
      const statsA = getExamStats(a.id);
      const statsB = getExamStats(b.id);
      return statsB.total - statsA.total;
    }
    return 0;
  });

  const exportAllResults = () => {
    if (exams.length === 0) {
      alert("No exams to export");
      return;
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add a sheet for each exam
    exams.forEach((exam) => {
      const examResults = results[exam.id] || [];
      const stats = getExamStats(exam.id);

      // Summary data
      const summaryData = [
        ["Exam Title", exam.title],
        ["Description", exam.description],
        ["Total Submissions", stats.total],
        ["Average Score", `${stats.avgScore}%`],
        [],
        [],
      ];

      // Results data
      const resultsData = [
        ["Student Name", "Obtained Marks", "Total Marks", "Percentage"],
        ...examResults.map((result) => [
          result.username,
          Number(result.obtained_marks) || 0,
          Number(result.total_marks) || 0,
          `${Number(result.percentage || 0).toFixed(2)}%`,
        ]),
      ];

      // Combine summary and results
      const allData = [...summaryData, ...resultsData];

      // Create worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(allData);
      worksheet["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];

      // Add sheet to workbook (use exam title or a safe name)
      const sheetName = exam.title.slice(0, 31).replace(/[^a-zA-Z0-9_-]/g, "_");
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `All_Exam_Results_${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };

  if (loading) return <div className="page-container"><p>Loading results...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📊 My Exam Results</h1>
        <p>View results and statistics for all your exams</p>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Export Button */}
      {exams.length > 0 && (
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn-primary"
            onClick={exportAllResults}
            style={{ padding: "10px 20px" }}
          >
            📊 Export All Results as Excel
          </button>
        </div>
      )}

      {/* Sort Controls */}
      {exams.length > 0 && (
        <div className="controls">
          <label>
            Sort by:
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Most Recent</option>
              <option value="submissions">Most Submissions</option>
            </select>
          </label>
        </div>
      )}

      {/* Results Summary Cards */}
      {sortedExams.length > 0 && (
        <div className="exams-grid">
          {sortedExams.map((exam) => {
            const stats = getExamStats(exam.id);
            return (
              <div key={exam.id} className="exam-card">
                <h3>{exam.title}</h3>
                <p className="subtitle">{exam.description}</p>

                <div className="stats-mini">
                  <div className="stat-item">
                    <span className="label">Submissions</span>
                    <span className="value">{stats.total}</span>
                  </div>
                  <div className="stat-item">
                    <span className="label">Avg Score</span>
                    <span className="value">{stats.avgScore}%</span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/professor/exam/${exam.id}/results`)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/professor/exam/${exam.id}/edit`)}
                  >
                    Edit Exam
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {exams.length === 0 && !loading && (
        <div className="empty-state">
          <p>No exams created yet.</p>
          <a href="/professor/create-exam" className="btn-primary">
            Create Your First Exam
          </a>
        </div>
      )}
    </div>
  );
}
