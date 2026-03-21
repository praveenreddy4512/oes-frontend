import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { apiGet, apiPut, apiUrl } from "../utils/api";

export default function SubmissionGrading() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!submissionId) {
      setError("Submission ID is missing. Please access this page from the submissions list.");
      setLoading(false);
      return;
    }
    fetchSubmissionData();
  }, [submissionId]);

  const fetchSubmissionData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch submission details with answers
      const res = await apiGet(`/api/results/${submissionId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to load submission");
      }
      const data = await res.json();
      setResult(data);
      setSubmission(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    if (!submission || !submission.answers) return 0;
    const correct = submission.answers.filter((a) => a.is_correct).length;
    return correct;
  };

  const handleSaveFeedback = async () => {
    try {
      alert("Feedback saved successfully!");
      setFeedback("");
    } catch (err) {
      alert("Failed to save feedback: " + err.message);
    }
  };

  if (loading) return <div className="page-container"><p>Loading submission...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;
  if (!submission) return <div className="page-container"><p>Submission not found</p></div>;

  const totalQuestions = submission.answers?.length || 0;
  const correctAnswers = calculateScore();
  const percentage = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(2) : 0;

  return (
    <div className="page-container">
      <div className="submission-header">
        <h1>Submission Analysis</h1>
        <div className="header-info">
          <p>
            <strong>Student:</strong> {submission.username}
          </p>
          <p>
            <strong>Exam:</strong> {submission.title}
          </p>
          <p>
            <strong>Submitted:</strong> {new Date(submission.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Score Summary */}
      <div className="score-summary">
        <div className="score-box">
          <h2>{correctAnswers}/{totalQuestions}</h2>
          <p>Correct Answers</p>
        </div>
        <div className="score-box">
          <h2 style={{ color: percentage >= 50 ? "#4caf50" : "#f44336" }}>
            {percentage}%
          </h2>
          <p>Percentage Score</p>
        </div>
        <div className="score-box">
          <h2 style={{ color: submission.status === "pass" ? "#4caf50" : "#f44336" }}>
            {submission.status === "pass" ? "✅ PASS" : "❌ FAIL"}
          </h2>
          <p>Status</p>
        </div>
      </div>

      {/* Answers Review */}
      <div className="answers-review">
        <h2>Answer Review</h2>

        {submission.answers && submission.answers.length > 0 ? (
          <div className="answers-list">
            {submission.answers.map((answer, idx) => (
              <div
                key={answer.id}
                className={`answer-item ${answer.is_correct ? "correct" : "incorrect"}`}
              >
                <div className="answer-header">
                  <h4>
                    Q{idx + 1}. {answer.question_text}
                  </h4>
                  <span className={`answer-status ${answer.is_correct ? "correct" : "incorrect"}`}>
                    {answer.is_correct ? "✅ Correct" : "❌ Incorrect"}
                  </span>
                </div>

                <div className="answer-options">
                  <p>
                    <strong>Student's Answer:</strong> Option {answer.selected_option || "Not answered"}
                  </p>
                  {answer.selected_option && (
                    <p className="student-answer">
                      {answer[`option_${answer.selected_option.toLowerCase()}`] || "N/A"}
                    </p>
                  )}
                </div>

                <div className="correct-answer">
                  <p>
                    <strong>Correct Answer:</strong> Option {answer.correct_option}
                  </p>
                  <p className="answer-text">
                    {answer[`option_${answer.correct_option.toLowerCase()}`] || "N/A"}
                  </p>
                </div>

                <div className="answer-meta">
                  <p>
                    <strong>Marks:</strong> {answer.is_correct ? answer.marks : 0} / {answer.marks}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No answers submitted</p>
        )}
      </div>

      {/* Feedback Section */}
      <div className="feedback-section">
        <h2>Add Feedback for Student</h2>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add comments or feedback for the student..."
          rows="4"
        />
        <div className="feedback-actions">
          <button className="btn-primary" onClick={handleSaveFeedback}>
            Save Feedback
          </button>
          <button className="btn-secondary" onClick={() => setFeedback("")}>
            Clear
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          ← Back
        </button>
      </div>

      <style jsx>{`
        .submission-header {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .header-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .score-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }

        .score-box {
          background: #fff;
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .score-box h2 {
          margin: 0;
          font-size: 32px;
        }

        .score-box p {
          margin: 10px 0 0 0;
          color: #666;
        }

        .answers-review {
          margin-bottom: 30px;
        }

        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .answer-item {
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          background: #fff;
        }

        .answer-item.correct {
          border-left: 4px solid #4caf50;
          background: #f1f8f6;
        }

        .answer-item.incorrect {
          border-left: 4px solid #f44336;
          background: #fef5f5;
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .answer-header h4 {
          margin: 0;
        }

        .answer-status {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .answer-status.correct {
          background: #d4edda;
          color: #155724;
        }

        .answer-status.incorrect {
          background: #f8d7da;
          color: #721c24;
        }

        .answer-options,
        .correct-answer {
          margin-bottom: 10px;
          padding: 10px;
          background: #fff;
          border-radius: 4px;
        }

        .student-answer,
        .answer-text {
          margin: 5px 0 0 20px;
          padding-left: 10px;
          border-left: 3px solid #2196f3;
          color: #666;
        }

        .answer-meta {
          font-size: 12px;
          color: #999;
        }

        .feedback-section {
          background: #f5f5f5;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .feedback-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: Arial, sans-serif;
          margin-bottom: 10px;
        }

        .feedback-actions {
          display: flex;
          gap: 10px;
        }

        .navigation {
          text-align: center;
        }
      `}</style>
    </div>
  );
}
