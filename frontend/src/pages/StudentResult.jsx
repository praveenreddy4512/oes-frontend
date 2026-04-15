import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { apiGet, apiUrl } from "../utils/api";

export default function StudentResult({ user }) {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!resultId) {
      setError("Result ID is missing.");
      setLoading(false);
      return;
    }
    fetchResultData();
  }, [resultId]);

  const fetchResultData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch result details
      const resultRes = await apiGet(`/api/results/${resultId}`);
      if (!resultRes.ok) {
        const errorData = await resultRes.json();
        throw new Error(errorData.error || "Failed to load result");
      }
      const resultData = await resultRes.json();
      setResult(resultData);

      // Fetch submission with answers
      const submissionRes = await apiGet(`/api/submissions/${resultData.submission_id}`);
      if (submissionRes.ok) {
        const submissionData = await submissionRes.json();
        setSubmission(submissionData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container"><p>Loading result details...</p></div>;
  }

  if (error) {
    return (
      <div className="page-container">
        <p className="error">{error}</p>
        <button onClick={() => navigate("/student/results")} className="btn-primary">
          Back to Results
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="page-container">
        <p>Result not found</p>
        <button onClick={() => navigate("/student/results")} className="btn-primary">
          Back to Results
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Exam Result Details</h1>

      {/* Result Summary */}
      <div className="result-summary" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <div className="summary-card" style={{
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
          textAlign: "center"
        }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>Exam Title</p>
          <h3 style={{ margin: "0", color: "#333" }}>{result.exam_title}</h3>
        </div>

        <div className="summary-card" style={{
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
          textAlign: "center"
        }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>Your Score</p>
          <h3 style={{ margin: "0", color: "#333" }}>
            {result.obtained_marks}/{result.total_marks}
          </h3>
        </div>

        <div className="summary-card" style={{
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
          textAlign: "center"
        }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>Percentage</p>
          <h3 style={{
            margin: "0",
            color: result.status === "pass" ? "#28a745" : "#dc3545"
          }}>
            {(Number(result.percentage) || 0).toFixed(2)}%
          </h3>
        </div>

        <div className="summary-card" style={{
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: result.status === "pass" ? "#d4edda" : "#f8d7da",
          textAlign: "center"
        }}>
          <p style={{ color: "#666", marginBottom: "5px" }}>Status</p>
          <h3 style={{
            margin: "0",
            color: result.status === "pass" ? "#28a745" : "#dc3545",
            textTransform: "uppercase"
          }}>
            {result.status}
          </h3>
        </div>
      </div>

      {/* Submission Date */}
      <div style={{ marginBottom: "30px" }}>
        <p><strong>Submitted:</strong> {new Date(result.created_at).toLocaleString()}</p>
      </div>

      {/* Answer Review */}
      {submission && submission.answers && submission.answers.length > 0 && (
        <div>
          <h2>Answer Review</h2>
          <div style={{ marginTop: "20px" }}>
            {submission.answers.map((answer, index) => (
              <div key={answer.id} style={{
                padding: "15px",
                marginBottom: "15px",
                border: answer.is_correct ? "2px solid #28a745" : "2px solid #dc3545",
                borderRadius: "8px",
                backgroundColor: answer.is_correct ? "#f0fdf4" : "#fef2f2"
              }}>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Question {index + 1}:</strong>
                </div>
                <p>{answer.question_text}</p>

                <div style={{ marginTop: "10px" }}>
                  <div style={{
                    padding: "10px",
                    marginBottom: "10px",
                    borderRadius: "4px",
                    backgroundColor: "#f0f0f0"
                  }}>
                    <strong>Your Answer:</strong> {answer.selected_option || "Not answered"}
                  </div>
                  <div style={{
                    padding: "10px",
                    borderRadius: "4px",
                    backgroundColor: answer.is_correct ? "#e8f5e9" : "#ffebee"
                  }}>
                    <strong>Correct Answer:</strong> {answer.correct_option}
                    {answer.is_correct && <span style={{ color: "#28a745", marginLeft: "10px" }}>✓ Correct</span>}
                    {!answer.is_correct && <span style={{ color: "#dc3545", marginLeft: "10px" }}>✗ Incorrect</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => navigate("/student/results")}
        className="btn-primary"
        style={{ marginTop: "20px" }}
      >
        Back to Results
      </button>
    </div>
  );
}
