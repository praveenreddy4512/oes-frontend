import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../styles/pages.css";
import { apiGet } from "../utils/api";

export default function ExamResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!id) {
      setError("Exam ID is missing. Please access this page from the exams list.");
      setLoading(false);
      return;
    }
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch exam details
      const examRes = await apiGet(`/api/exams/${id}`);
      if (!examRes.ok) throw new Error("Failed to load exam");
      const examData = await examRes.json();
      setExam(examData);

      // Fetch exam results
      const resultsRes = await apiGet(`/api/results/exam/${id}`);
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

  const exportToExcel = () => {
    if (results.length === 0) {
      alert("No results to export");
      return;
    }

    // Prepare summary data as array of arrays (not objects)
    const summaryData = [
      ["Exam Title", exam.title],
      ["Exam Description", exam.description],
      ["Total Submissions", stats.total],
      ["Average Score", `${stats.avgScore}%`],
      [],
      [],
    ];

    // Prepare results data as array of arrays
    const resultsData = [
      ["Student Name", "Obtained Marks", "Total Marks", "Percentage", "Attempted On"],
      ...filteredResults.map((result) => [
        result.username,
        Number(result.obtained_marks) || 0,
        Number(result.total_marks) || 0,
        `${Number(result.percentage || 0).toFixed(2)}%`,
        new Date(result.attempted_at || result.submitted_at).toLocaleString(),
      ]),
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Create summary sheet
    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWorksheet["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

    // Create results sheet
    const resultsWorksheet = XLSX.utils.aoa_to_sheet(resultsData);
    resultsWorksheet["!cols"] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, resultsWorksheet, "Results");

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${exam.title.replace(/\s+/g, "_")}_Results_${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  };
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;
  if (!exam) return <div className="page-container"><p>Exam not found</p></div>;

  const filteredResults = results;

  const stats = {
    total: results.length,
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
          <h3>{stats.avgScore}%</h3>
          <p>Average Score</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-controls">
        <button
          className="btn-primary"
          onClick={exportToExcel}
          style={{ marginLeft: "auto" }}
        >
          📊 Export as Excel
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
                        backgroundColor: "#4caf50",
                      }}
                    ></div>
                    <span className="progress-text">{Number(result.percentage || 0).toFixed(2)}%</span>
                  </div>
                </td>
                <td>{new Date(result.attempted_at || result.submitted_at).toLocaleString()}</td>
                <td>
                  <a
                    href={`/professor/result/${result.id}`}
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
