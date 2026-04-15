import "../styles/pages.css";

export default function StudentProfile({ user }) {
  return (
    <div className="page-container">
      <h1>My Profile</h1>

      <div className="profile-card">
        <div className="profile-field">
          <label>Username:</label>
          <p>{user.username}</p>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <p>{user.email || "Not set"}</p>
        </div>
        <div className="profile-field">
          <label>Role:</label>
          <p className="role-badge">{user.role}</p>
        </div>
        <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '12px', borderRadius: '4px', margin: '20px 0', color: '#856404' }}>
          <strong>⚠️ Notice:</strong> Profile editing is disabled. All profile details are read-only. Please contact your administrator if you need to update your information.
        </div>
      </div>
    </div>
  );
}
