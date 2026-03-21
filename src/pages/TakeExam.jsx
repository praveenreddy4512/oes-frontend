import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "../styles/pages.css";
import { apiCall, apiGet, apiPost, apiUrl } from "../utils/api";

export default function TakeExam({ user }) {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // ✅ NEW: Event tracking states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const questionStartTimeRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const pageRefreshCountRef = useRef(0);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ✅ NEW: Track tab switching and page refresh events
  // IMPORTANT: Only track DURING exam (after submission starts, before submit button clicked)
  useEffect(() => {
    // Stop tracking after exam is submitted
    if (!submission || submitted) return;

    // Log exam started event
    logEvent({
      event_type: 'exam_started',
      event_details: { message: 'Student started the exam' }
    });

    // Track tab visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.warn('⚠️ Student switched away from exam tab!');
        tabSwitchCountRef.current++;
        logEvent({
          event_type: 'tab_switched',
          event_details: { 
            action: 'switched_away',
            tabSwitchCount: tabSwitchCountRef.current 
          }
        });
      } else {
        console.log('✅ Student returned to exam tab');
        logEvent({
          event_type: 'tab_switched',
          event_details: { 
            action: 'returned',
            tabSwitchCount: tabSwitchCountRef.current 
          }
        });
      }
    };

    // Track page refresh/unload
    const handleBeforeUnload = (e) => {
      pageRefreshCountRef.current++;
      logEvent({
        event_type: 'page_refreshed',
        event_details: { 
          pageRefreshCount: pageRefreshCountRef.current,
          warning: 'Page was refreshed or will be refreshed'
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [submission]);

  // ✅ NEW: Log question viewing and track time per question
  useEffect(() => {
    if (currentQuestion && submission) {
      questionStartTimeRef.current = Date.now();
      
      logEvent({
        event_type: 'question_viewed',
        question_id: currentQuestion,
        event_details: { questionId: currentQuestion }
      });
    }
  }, [currentQuestion, submission]);

  // ✅ NEW: Log event to backend (only during exam, not before or after)
  const logEvent = async (eventData) => {
    // Don't log events before submission or after submission is complete
    if (!submission || (submitted && eventData.event_type !== 'exam_submitted')) return;

    try {
      const payload = {
        ...eventData,
        student_id: user.id,
        exam_id: examId
      };

      const res = await apiPost(
        `/api/submissions/${submission.submission_id}/events`,
        payload
      );

      if (!res.ok) {
        console.error('[❌ EVENT LOGGING FAILED]', await res.json());
      } else {
        console.log('[✅ EVENT LOGGED]', eventData.event_type);
      }
    } catch (error) {
      console.error('[❌ EVENT LOGGING ERROR]', error.message);
    }
  };

  const fetchExam = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet(`/api/exams/${examId}`);
      if (!res.ok) {
        throw new Error("Failed to load exam");
      }
      const data = await res.json();
      setExam(data);
      setTimeLeft(data.duration_minutes * 60);
      await startSubmission();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startSubmission = async () => {
    try {
      const res = await apiPost('/api/submissions', { exam_id: examId, student_id: user.id });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `Failed to start submission: ${res.status}`);
      }
      const data = await res.json();
      setSubmission(data);
    } catch (err) {
      console.error("Submission creation error:", err);
      setError(err.message);
    }
  };

  const handleAnswer = (questionId, option) => {
    // Don't record answers after submission
    if (submitted) return;
    
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setCurrentQuestion(questionId);
    
    // ✅ NEW: Calculate time spent on this question
    const timeSpent = questionStartTimeRef.current 
      ? Math.floor((Date.now() - questionStartTimeRef.current) / 1000)
      : 0;

    // ✅ NEW: Log answer saved event
    logEvent({
      event_type: 'answer_saved',
      question_id: questionId,
      time_spent_seconds: timeSpent,
      event_details: {
        selectedOption: option,
        timeSpentSeconds: timeSpent
      }
    });
  };

  const handleSubmit = async () => {
    if (!submission || !submission.submission_id) {
      alert("Error: Submission was not properly initialized. Please reload the page.");
      return;
    }
    
    if (!confirm("Are you sure you want to submit?")) return;

    try {
      // Submit all answers
      for (const [questionId, selectedOption] of Object.entries(answers)) {
        const ansRes = await apiPost(
          `/api/submissions/${submission.submission_id}/answer`,
          {
            question_id: questionId,
            selected_option: selectedOption,
          }
        );
        if (!ansRes.ok) {
          const error = await ansRes.json();
          throw new Error(`Failed to submit answer: ${error.error || ansRes.statusText}`);
        }
      }

      // Finalize submission
      const res = await apiPost(
        `/api/submissions/${submission.submission_id}/submit`,
        {}
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to finalize submission");
      }
      const result = await res.json();
      
      // ✅ NEW: Log exam submitted event BEFORE setting submitted flag
      await logEvent({
        event_type: 'exam_submitted',
        event_details: {
          score: result.correct_answers,
          totalQuestions: result.total_questions,
          percentage: result.percentage,
          tabSwitches: tabSwitchCountRef.current,
          pageRefreshes: pageRefreshCountRef.current
        }
      });
      
      // NOW set submitted flag to stop all further event capture
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
