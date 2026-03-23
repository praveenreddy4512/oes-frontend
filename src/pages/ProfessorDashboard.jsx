import "../styles/dashboard.css";

export default function ProfessorDashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, Prof. {user.username}! 👋</h1>
        <p>Exam Management Portal</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>✏️ Create Exam</h3>
          <p>Create a new exam with questions</p>
          <a href="/professor/create-exam" className="btn-primary">Create New</a>
        </div>

        <div className="dashboard-card">
          <h3>📋 My Exams</h3>
          <p>View and manage your exams</p>
          <a href="/professor/exams" className="btn-primary">View Exams</a>
        </div>

        <div className="dashboard-card">
          <h3>📈 Results Analysis</h3>
          <p>View class performance and analytics</p>
          <a href="/professor/exams" className="btn-primary">View Results</a>
        </div>
      </div>
    </div>
  );
}
