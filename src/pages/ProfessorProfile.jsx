export default function ProfessorProfile({ user }) {
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
      </div>
    </div>
  );
}
