import { useState } from "react";
import "../styles/pages.css";

export default function StudentProfile({ user }) {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    username: user.username,
    email: user.email || "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert("Profile updated successfully!");
    setEditMode(false);
  };

  return (
    <div className="page-container">
      <h1>My Profile</h1>

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
            <button className="btn-primary" onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <div className="profile-field">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
              />
            </div>
            <div className="profile-field">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>
            <div className="button-group">
              <button className="btn-primary" onClick={handleSave}>
                Save
              </button>
              <button className="btn-secondary" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
