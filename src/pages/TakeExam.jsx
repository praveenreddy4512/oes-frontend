import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/pages.css";
import { apiCall, apiGet, apiPost } from "../utils/api";

export default function TakeExam({ user }) {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExam = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/exams/${examId}`);
      const data = await res.json();
      setExam(data);
      setTimeLeft(data.duration_minutes * 60);
      startSubmission();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startSubmission = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_id: examId, student_id: user.id }),
      });
      const data = await res.json();
      setSubmission(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!confirm("Are you sure you want to submit?")) return;

    try {
      // Submit all answers
      for (const [questionId, selectedOption] of Object.entries(answers)) {
        await fetch(
          `${apiUrl}/api/submissions/${submission.submission_id}/answer`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_id: questionId,
              selected_option: selectedOption,
            }),
          }
        );
      }

      // Finalize submission
      const res = await fetch(
        `${apiUrl}/api/submissions/${submission.submission_id}/submit`,
        { method: "POST" }
      );
      const result = await res.json();
      setSubmitted(true);
      alert(
        `Exam submitted! Score: ${result.correct_answers}/${result.total_questions} (${result.percentage}%)`
      );
    } catch (err) {
      alert("Error submitting exam: " + err.message);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="page-container"><p>Loading exam...</p></div>;
  if (error) return <div className="page-container"><p className="error">{error}</p></div>;
  if (submitted)
    return (
      <div className="page-container">
        <h1>Exam Submitted!</h1>
        <p>Your exam has been successfully submitted.</p>
        <a href="/student/results" className="btn-primary">
          View Results
        </a>
      </div>
    );

  return (
    <div className="page-container">
      <div className="exam-header">
        <h1>{exam?.title}</h1>
        <div className="exam-timer">
          <span className={timeLeft < 300 ? "timer-warning" : ""}>
            ⏱️ Time Left: {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <div className="questions-container">
        {exam?.questions?.map((question, idx) => (
          <div key={question.id} className="question-card">
            <h3>
              Q{idx + 1}: {question.question_text}
            </h3>
            <div className="options">
              {["a", "b", "c", "d"].map((option) => (
                <label key={option} className="option-label">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                  />
                  <span className="option-text">
                    {option.toUpperCase()}: {question[`option_${option}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="exam-footer">
        <button onClick={handleSubmit} className="btn-primary btn-large">
          Submit Exam
        </button>
      </div>
    </div>
  );
}
