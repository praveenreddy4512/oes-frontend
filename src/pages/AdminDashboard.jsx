import "../styles/dashboard.css";

export default function AdminDashboard({ user }) {
  // Admin Dashboard - displays management options
  return (
    <div className="dashboard-container">
      <div className="dashboard-header animate-fade-in">
        <h1>Admin Panel - {user.username} 👨‍💼</h1>
        <p>System Administration & Oversight</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card animate-scale-up stagger-1">
          <div className="card-icon">👥</div>
          <div>
            <h3>Manage Users</h3>
            <p>Full control over student and professor accounts.</p>
          </div>
          <a href="/admin/users" className="btn-primary shimmer">User Management</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-2">
          <div className="card-icon">📂</div>
          <div>
            <h3>Manage Groups</h3>
            <p>Organize students into batches and manage access.</p>
          </div>
          <a href="/admin/groups" className="btn-primary shimmer">Group Management</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-3">
          <div className="card-icon">📚</div>
          <div>
            <h3>Manage Exams</h3>
            <p>Review questions, schedules, and integrity settings.</p>
          </div>
          <a href="/admin/exams" className="btn-primary shimmer">Exam Management</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-4">
          <div className="card-icon">📊</div>
          <div>
            <h3>Statistics</h3>
            <p>Deep dive into student performance and analytics.</p>
          </div>
          <a href="/admin/statistics" className="btn-primary shimmer">View Stats</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-5">
          <div className="card-icon">⚙️</div>
          <div>
            <h3>Settings</h3>
            <p>Configure global system and security parameters.</p>
          </div>
          <a href="/admin/settings" className="btn-primary shimmer">System Settings</a>
        </div>
      </div>
    </div>
  );
}
