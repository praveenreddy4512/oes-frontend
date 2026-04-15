import "../styles/dashboard.css";

export default function ProfessorDashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
          <div className="user-avatar-placeholder">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h1>Prof. <span>{user.username}</span> 👋</h1>
        </div>
        <p>Faculty & Assessment Portal</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card animate-scale-up stagger-1">
          <div className="card-icon">✏️</div>
          <div>
            <h3>Create Exam</h3>
            <p>Design multi-choice assessments.</p>
          </div>
          <a href="/professor/create-exam" className="btn-primary shimmer">New Assessment</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-2">
          <div className="card-icon">📋</div>
          <div>
            <h3>My Exams</h3>
            <p>Edit, monitor and manage active tests.</p>
          </div>
          <a href="/professor/exams" className="btn-primary shimmer">Manage Exams</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-3">
          <div className="card-icon">📈</div>
          <div>
            <h3>Analyze Results</h3>
            <p>Review comprehensive grading and integrity reports.</p>
          </div>
          <a href="/professor/results" className="btn-primary shimmer">Grading Reports</a>
        </div>
      </div>
    </div>
  );
}
