import { useState } from "react";
import "../styles/pages.css";

export default function StudentProfile({ user }) {
  const [profile] = useState({
    username: user.username,
    email: user.email || "",
  });

  return (
    <div className="page-container">
      <h1>My Profile</h1>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="profile-card">
        {!editMode ? (
          <>
            <div className="profile-field">
              <label>Username:</label>
              <p>{profile.username}</p>
            </div>
            <div className="profile-field">
              <label>Email:</label>
              <p>{profile.email}</p>
            </div>
            <div className="profile-field">
              <label>Role:</label>
              <p className="role-badge">{user.role}</p>
            </div>
            <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '12px', borderRadius: '4px', margin: '20px 0', color: '#856404' }}>
              <strong>⚠️ Notice:</strong> Profile editing is disabled. Please contact your administrator if you need to update your information.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
