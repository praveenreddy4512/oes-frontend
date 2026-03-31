import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { apiGet, apiPut, apiPost, apiDelete } from "../utils/api";

export default function ExamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState({
    title: "",
    description: "",
    duration: 60,
    shuffle_questions: false,
    shuffle_options: false,
    is_ip_restricted: false,
    restricted_ip: "",
    start_time: "",
    end_time: "",
  });
  const [questions, setQuestions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignedGroups, setAssignedGroups] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    // Check if id is undefined
    if (!id) {
      setError("Exam ID is required. Please access this page from the exams list.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const examRes = await apiGet(`/api/exams/${id}`);
      if (!examRes.ok) throw new Error("Failed to load exam");
      const examData = await examRes.json();
      setExam(examData);

      const questionsRes = await apiGet(`/api/questions?exam_id=${id}`);
      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setQuestions(questionsData);
      }

      // Fetch available groups and assigned groups
      setLoadingGroups(true);
      const groupsRes = await apiGet('/api/groups/for-exams/list');
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(Array.isArray(groupsData) ? groupsData : groupsData.groups || []);
      }

      const assignedRes = await apiGet(`/api/exams/${id}/groups`);
      if (assignedRes.ok) {
        const assignedData = await assignedRes.json();
        setAssignedGroups(Array.isArray(assignedData) ? assignedData : assignedData.groups || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingGroups(false);
    }
  };

  const handleExamChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExam((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "duration" ? parseInt(value) : value),
    }));
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    
    // Validate exam_id
    if (!id) {
      setError("Exam ID is missing. Please reload the page.");
      return;
    }
    
    setError("");
    setSuccess("");
    try {
      // Convert local times to UTC for storage
      const convertLocalToUTC = (localTimeStr) => {
        if (!localTimeStr) return null;
        const d = new Date(localTimeStr);
        return d.toISOString().slice(0, 19).replace('T', ' ');
      };

      const res = await apiPut(`/api/exams/${id}`, {
        title: exam.title,
        description: exam.description,
        duration_minutes: exam.duration,
        shuffle_questions: exam.shuffle_questions,
        shuffle_options: exam.shuffle_options,
        is_ip_restricted: exam.is_ip_restricted,
        restricted_ip: exam.restricted_ip,
        start_time: convertLocalToUTC(exam.start_time),
        end_time: convertLocalToUTC(exam.end_time),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update exam");
      }
      setSuccess("✅ Exam updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    // Validate exam_id
    if (!id) {
      setError("Exam ID is missing. Please reload the page.");
      return;
    }
    
    if (!newQuestion.question_text.trim()) {
      setError("Question text is required");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await apiPost('/api/questions', {
        ...newQuestion,
        exam_id: id,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add question");
      }
      const addedQuestion = await res.json();
      setQuestions((prev) => [...prev, addedQuestion]);
      setNewQuestion({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "A",
      });
      setSuccess("✅ Question added!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setError("");
    try {
      const res = await apiDelete(`/api/questions/${questionId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete question");
      }
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setSuccess("✅ Question deleted!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddGroupToExam = async (groupId) => {
    setError("");
    try {
      const res = await apiPost(`/api/exams/${id}/groups`, { groupIds: [groupId] });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add group");
      }
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        setAssignedGroups((prev) => [...prev, group]);
      }
      setSuccess("✅ Group added to exam!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveGroupFromExam = async (groupId) => {
    if (!confirm("Remove this group from the exam?")) return;
    setError("");
    try {
      const res = await apiDelete(`/api/exams/${id}/groups/${groupId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to remove group");
      }
      setAssignedGroups((prev) => prev.filter((g) => g.id !== groupId));
      setSuccess("✅ Group removed!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="page-container"><p>Loading exam data...</p></div>;

  return (
    <div className="page-container">
      <h1>Edit Exam</h1>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <form onSubmit={handleUpdateExam} className="form">
        <h2>Exam Details</h2>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={exam.title}
            onChange={handleExamChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={exam.description}
            onChange={handleExamChange}
            rows="3"
            placeholder="Exam instructions..."
          />
        </div>

        <div className="form-row" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label>🔓 Exam Starts At (Date & Time)</label>
            <input
              type="datetime-local"
              name="start_time"
              value={exam.start_time ? (() => {
                try {
                  // Convert UTC string to local datetime-local format
                  const utcStr = exam.start_time.replace(' ', 'T');
                  const d = new Date(utcStr + 'Z'); // Add Z to indicate UTC
                  if (isNaN(d)) return "";
                  const offset = d.getTimezoneOffset() * 60000;
                  return new Date(d.getTime() + offset).toISOString().substring(0, 16);
                } catch (e) {
                  return "";
                }
              })() : ""}
              onChange={handleExamChange}
              required
            />
            <small className="help-text">Students cannot start before this time.</small>
          </div>

          <div className="form-group">
            <label>🔒 Exam Ends At (Date & Time)</label>
            <input
              type="datetime-local"
              name="end_time"
              value={exam.end_time ? (() => {
                try {
                  // Convert UTC string to local datetime-local format
                  const utcStr = exam.end_time.replace(' ', 'T');
                  const d = new Date(utcStr + 'Z'); // Add Z to indicate UTC
                  if (isNaN(d)) return "";
                  const offset = d.getTimezoneOffset() * 60000;
                  return new Date(d.getTime() + offset).toISOString().substring(0, 16);
                } catch (e) {
                  return "";
                }
              })() : ""}
              onChange={handleExamChange}
              required
            />
            <small className="help-text">Students cannot start after this time.</small>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={exam.duration}
              onChange={handleExamChange}
              min="1"
              required
            />
          </div>

          <div className="form-group" style={{ flex: 2 }}>
            <label className="checkbox-label" style={{ marginTop: '32px' }}>
              <input
                type="checkbox"
                name="is_ip_restricted"
                checked={exam.is_ip_restricted || false}
                onChange={handleExamChange}
              />
              <span>🔒 Restrict to Specific IP</span>
            </label>
          </div>
        </div>

        {exam.is_ip_restricted && (
          <div className="form-group animate-fade-in" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <label>Authorized IP Address(es)</label>
            <input
              type="text"
              name="restricted_ip"
              value={exam.restricted_ip || ""}
              onChange={handleExamChange}
              placeholder="e.g., 192.168.1.1 (separate multiple with commas)"
              required={exam.is_ip_restricted}
            />
            <small style={{ color: '#64748b', display: 'block', marginTop: '8px' }}>
              Students can only start this exam from these network addresses.
            </small>
          </div>
        )}

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="shuffle_questions"
              checked={exam.shuffle_questions || false}
              onChange={handleExamChange}
            />
            <div>
              <span>🔀 Shuffle Questions</span>
              <span className="help-text">Randomize question order for each student</span>
            </div>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="shuffle_options"
              checked={exam.shuffle_options || false}
              onChange={handleExamChange}
            />
            <div>
              <span>🔄 Shuffle Answer Options</span>
              <span className="help-text">Randomize answer options (A, B, C, D) for each question</span>
            </div>
          </label>
        </div>

        <div className="form-group">
          <label>Assigned Groups</label>
          {loadingGroups ? (
            <p className="info">Loading groups...</p>
          ) : assignedGroups.length === 0 ? (
            <p className="info">No groups assigned yet</p>
          ) : (
            <div className="assigned-groups-list">
              {assignedGroups.map((group) => (
                <div key={group.id} className="group-badge">
                  <span>{group.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGroupFromExam(group.id)}
                    className="btn-small-danger"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Add Groups to Exam</label>
          {loadingGroups ? (
            <p className="info">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="info">No groups available</p>
          ) : (
            <div className="groups-checkbox-container">
              {groups.map((group) => {
                const isAssigned = assignedGroups.some((ag) => ag.id === group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => !isAssigned && handleAddGroupToExam(group.id)}
                    disabled={isAssigned}
                    className={`group-add-btn ${isAssigned ? 'assigned' : ''}`}
                  >
                    {group.name}
                    {isAssigned && ' ✓'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary">
          Update Exam
        </button>
      </form>

      <hr />

      <form onSubmit={handleAddQuestion} className="form">
        <h2>Add New Question</h2>
        <div className="form-group">
          <label>Question</label>
          <textarea
            value={newQuestion.question_text}
            onChange={(e) =>
              setNewQuestion((prev) => ({
                ...prev,
                question_text: e.target.value,
              }))
            }
            rows="3"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Option A</label>
            <input
              type="text"
              value={newQuestion.option_a}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  option_a: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Option B</label>
            <input
              type="text"
              value={newQuestion.option_b}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  option_b: e.target.value,
                }))
              }
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Option C</label>
            <input
              type="text"
              value={newQuestion.option_c}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  option_c: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Option D</label>
            <input
              type="text"
              value={newQuestion.option_d}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  option_d: e.target.value,
                }))
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Correct Answer</label>
          <select
            value={newQuestion.correct_option}
            onChange={(e) =>
              setNewQuestion((prev) => ({
                ...prev,
                correct_option: e.target.value,
              }))
            }
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Add Question
        </button>
      </form>

      <hr />

      <h2>Questions ({questions.length})</h2>
      {questions.length === 0 ? (
        <p className="no-data">No questions yet. Add one above.</p>
      ) : (
        <div className="questions-list">
          {questions.map((q, idx) => (
            <div key={q.id} className="question-card">
              <h4>
                Q{idx + 1}. {q.question_text}
              </h4>
              <ul>
                <li className={q.correct_option === "A" ? "correct" : ""}>
                  A) {q.option_a}
                </li>
                <li className={q.correct_option === "B" ? "correct" : ""}>
                  B) {q.option_b}
                </li>
                <li className={q.correct_option === "C" ? "correct" : ""}>
                  C) {q.option_c}
                </li>
                <li className={q.correct_option === "D" ? "correct" : ""}>
                  D) {q.option_d}
                </li>
              </ul>
              <button
                type="button"
                onClick={() => handleDeleteQuestion(q.id)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate("/professor/exams")} className="btn-secondary">
        Back to Exams
      </button>
    </div>
  );
}
