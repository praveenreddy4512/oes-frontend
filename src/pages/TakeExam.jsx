import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "../styles/pages.css";
import { apiCall, apiGet, apiPost, apiUrl } from "../utils/api";
import AIExtensionDetector from "../utils/AIExtensionDetector";

// Utility function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function TakeExam({ user }) {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [optionMapping, setOptionMapping] = useState({}); // Maps display option to actual option
  
  // ✅ NEW: Event tracking states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const questionStartTimeRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const pageRefreshCountRef = useRef(0);
  const aiDetectorRef = useRef(null);

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

    // Initialize AI Extension Detector
    if (!aiDetectorRef.current && user?.id && examId) {
      aiDetectorRef.current = new AIExtensionDetector(user.id, examId, {
        maxStrikes: 3,
        onLimitReached: () => {
          console.error('⛔ MAX STRIKES REACHED - AUTO SUBMITTING EXAM');
          handleAutoSubmit();
        }
      });
      aiDetectorRef.current.init();
      console.log('✅ AI Extension Detector initialized with 3 strikes');
    }

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
        if (aiDetectorRef.current) {
          aiDetectorRef.current.logAIEvent('TAB_SWITCHED_AWAY', { 
            tabSwitchCount: tabSwitchCountRef.current 
          });
        }
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
  }, [submission, submitted]);

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
      
      // Initialize shuffled questions
      const questions = data.questions || [];
      let finalQuestions = questions;
      
      if (data.shuffle_questions) {
        finalQuestions = shuffleArray(questions);
      }
      
      setShuffledQuestions(finalQuestions);
      
      // Create option mapping if shuffle_options is enabled
      if (data.shuffle_options) {
        const mapping = {};
        finalQuestions.forEach((q) => {
          const originalOptions = ['a', 'b', 'c', 'd'];
          const shuffledOptions = shuffleArray(originalOptions);
          mapping[q.id] = {
            shuffled: shuffledOptions,
            displayToActual: Object.fromEntries(
              shuffledOptions.map((option, idx) => [
                String.fromCharCode(97 + idx), // a, b, c, d
                option
              ])
            ),
            actualToDisplay: Object.fromEntries(
              shuffledOptions.map((option, idx) => [
                option,
                String.fromCharCode(97 + idx) // a, b, c, d
              ])
            ),
          };
        });
        setOptionMapping(mapping);
      }
      
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

  const handleAnswer = (questionId, displayOption) => {
    // Don't record answers after submission
    if (submitted) return;
    
    // Convert display option to actual option if shuffled
    const actualOption = optionMapping[questionId]?.displayToActual[displayOption] || displayOption;
    
    setAnswers((prev) => ({ ...prev, [questionId]: actualOption }));
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
        selectedOption: actualOption,
        timeSpentSeconds: timeSpent
      }
    });
  };

  const handleAutoSubmit = async () => {
    if (submitted) return;
    
    // Create a special auto-submit event first
    await logEvent({
      event_type: 'suspicious_activity_auto_submit',
      event_details: { 
        reason: 'Max strikes reached in AI Extension Detector',
        tabSwitches: tabSwitchCountRef.current,
        totalStrikes: aiDetectorRef.current?.strikeCount || 3
      }
    });

    // Directly call the final submission logic WITHOUT confirmation
    await executeFinalSubmission();
  };

  const handleSubmit = async () => {
    if (!submission || !submission.submission_id) {
      alert("Error: Submission was not properly initialized. Please reload the page.");
      return;
    }
    
    if (!confirm("Are you sure you want to submit?")) return;
    
    await executeFinalSubmission();
  };

  const executeFinalSubmission = async () => {
    try {
      // Submit all answers first to ensure they are saved
      for (const [questionId, selectedOption] of Object.entries(answers)) {
        await apiPost(
          `/api/submissions/${submission.submission_id}/answer`,
          {
            question_id: questionId,
            selected_option: selectedOption,
          }
        ).catch(err => console.warn(`Failed to save answer for ${questionId}:`, err));
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
      const aiSummary = aiDetectorRef.current?.getSummary();
      
      // Log completion event
      await logEvent({
        event_type: 'exam_submitted',
        event_details: {
          score: result.correct_answers,
          totalQuestions: result.total_questions,
          percentage: result.percentage,
          tabSwitches: tabSwitchCountRef.current,
          aiDetection: aiSummary
        }
      });
      
      setSubmitted(true);
      if (!aiDetectorRef.current?.strikeCount >= 3) {
        alert(`Exam submitted! Score: ${result.correct_answers}/${result.total_questions}`);
      }
    } catch (err) {
      alert("Error during submission: " + err.message);
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

  // Get current question data
  const currentQuestionData = shuffledQuestions[currentQuestionIndex];
  const totalQuestions = shuffledQuestions.length;
  const questionProgress = `${currentQuestionIndex + 1} / ${totalQuestions}`;

  // Handle navigation
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

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

      <div className="exam-progress">
        <span className="progress-text">Question {questionProgress}</span>
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="questions-container">
        {currentQuestionData && (
          <div className="question-card question-card-full">
            <h3>{currentQuestionData.question_text}</h3>
            <div className="options">
              {(() => {
                const optionList = ['a', 'b', 'c', 'd'];
                const displayOptions = optionMapping[currentQuestionData.id]?.shuffled || optionList;
                
                return displayOptions.map((actualOption, idx) => {
                  const displayLabel = String.fromCharCode(97 + idx); // a, b, c, d
                  const optionText = currentQuestionData[`option_${actualOption}`];
                  const isAnswered = answers[currentQuestionData.id] === actualOption;
                  
                  return (
                    <label key={actualOption} className="option-label">
                      <input
                        type="radio"
                        name={`question_${currentQuestionData.id}`}
                        value={displayLabel}
                        checked={isAnswered}
                        onChange={(e) => handleAnswer(currentQuestionData.id, e.target.value)}
                      />
                      <span className="option-text">
                        {displayLabel.toUpperCase()}: {optionText}
                      </span>
                    </label>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="exam-navigation">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="btn-secondary"
        >
          ← Previous
        </button>

        <div className="question-counter">
          {currentQuestionIndex + 1} of {totalQuestions}
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <button onClick={handleSubmit} className="btn-primary btn-submit">
            Submit Exam
          </button>
        ) : (
          <button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className="btn-secondary"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
