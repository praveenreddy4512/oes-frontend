import "../styles/dashboard.css";

export default function StudentDashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
          <div className="user-avatar-placeholder">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h1>Welcome, <span>{user.username}</span>! 👋</h1>
        </div>
        <p>Your personalized Student Examination Portal</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card animate-scale-up stagger-1">
          <div className="card-icon">📝</div>
          <div>
            <h3>Available Exams</h3>
            <p>Start your assessments and practice tests.</p>
          </div>
          <a href="/student/exams" className="btn-primary shimmer">Browse Exams</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-2">
          <div className="card-icon">📊</div>
          <div>
            <h3>My Results</h3>
            <p>Review your grades and performance history.</p>
          </div>
          <a href="/student/results" className="btn-primary shimmer">View History</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-3">
          <div className="card-icon">👤</div>
          <div>
            <h3>My Profile</h3>
            <p>Maintain your personal information and settings.</p>
          </div>
          <a href="/student/profile" className="btn-primary shimmer" style={{ opacity: '0.8' }}>View Profile</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-4">
          <div className="card-icon">🤔</div>
          <div>
            <h3>Get Help</h3>
            <p>Visit the FAQ or contact the administrator.</p>
          </div>
          <a href="#" className="btn-primary shimmer">Help Center</a>
        </div>
      </div>
    </div>
  );
}
