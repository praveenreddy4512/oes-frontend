import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentExams from "./pages/StudentExams";
import StudentResults from "./pages/StudentResults";
import StudentResult from "./pages/StudentResult";
import StudentProfile from "./pages/StudentProfile";
import ProfessorExams from "./pages/ProfessorExams";
import ProfessorSubmissions from "./pages/ProfessorSubmissions";
import ProfessorProfile from "./pages/ProfessorProfile";
import CreateExam from "./pages/CreateExam";
import ExamEditor from "./pages/ExamEditor";
import TakeExam from "./pages/TakeExam";
import AdminUsers from "./pages/AdminUsers";
import AdminExams from "./pages/AdminExams";
import AdminSettings from "./pages/AdminSettings";
import AdminStatistics from "./pages/AdminStatistics";
import ExamResults from "./pages/ExamResults";
import SubmissionGrading from "./pages/SubmissionGrading";
import "./styles/app.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <main>
        <Routes>
          {/* Public */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <LoginPage onLogin={handleLogin} />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              user ? (
                user.role === "student" ? (
                  <StudentDashboard user={user} />
                ) : user.role === "professor" ? (
                  <ProfessorDashboard user={user} />
                ) : (
                  <AdminDashboard user={user} />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/exams"
            element={user && user.role === "student" ? <StudentExams user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/student/exam/:examId"
            element={user && user.role === "student" ? <TakeExam user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/student/results"
            element={user && user.role === "student" ? <StudentResults user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/student/result/:resultId"
            element={user && user.role === "student" ? <StudentResult user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/student/profile"
            element={user && user.role === "student" ? <StudentProfile user={user} /> : <Navigate to="/" />}
          />

          {/* Professor Routes */}
          <Route
            path="/professor/exams"
            element={user && user.role === "professor" ? <ProfessorExams user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/professor/submissions"
            element={user && user.role === "professor" ? <ProfessorSubmissions user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/professor/create-exam"
            element={user && user.role === "professor" ? <CreateExam user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/professor/exam/:id/edit"
            element={user && user.role === "professor" ? <ExamEditor user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/professor/exam/:id/results"
            element={user && user.role === "professor" ? <ExamResults user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/professor/submission/:submissionId"
            element={user && user.role === "professor" ? <SubmissionGrading user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/professor/profile"
            element={user && user.role === "professor" ? <ProfessorProfile user={user} /> : <Navigate to="/" />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={user && user.role === "admin" ? <AdminUsers /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/exams"
            element={user && user.role === "admin" ? <AdminExams /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/statistics"
            element={user && user.role === "admin" ? <AdminStatistics /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/settings"
            element={user && user.role === "admin" ? <AdminSettings /> : <Navigate to="/" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
}
