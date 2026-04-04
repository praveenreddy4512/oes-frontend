import "../styles/dashboard.css";

export default function StudentDashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <h1>Welcome, {user.username}! 👋</h1>
        <p>Student Exam Portal</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card animate-scale-up stagger-1">
          <h3>📖 Available Exams</h3>
          <p>View and take available exams</p>
          <a href="/student/exams" className="btn-primary">Browse Exams</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-2">
          <h3>📊 My Results</h3>
          <p>View your exam results and scores</p>
          <a href="/student/results" className="btn-primary">View Results</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-3">
          <h3>👤 Profile</h3>
          <p>View your profile information</p>
          <a href="/student/profile" className="btn-primary" style={{ opacity: '0.6', cursor: 'not-allowed', pointerEvents: 'none' }}>Profile (Read-Only)</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-4">
          <h3>❓ Help</h3>
          <p>Instructions and FAQ</p>
          <a href="#" className="btn-primary">Get Help</a>
        </div>
      </div>
    </div>
  );
}
