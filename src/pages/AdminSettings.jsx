export default function AdminSettings() {
  return (
    <div className="page-container">
      <h1>System Settings</h1>
      <div className="profile-card">
        <div className="profile-field">
          <label>System Name:</label>
          <p>Online Examination System</p>
        </div>
        <div className="profile-field">
          <label>Default Exam Duration (minutes):</label>
          <input type="number" defaultValue={60} />
        </div>
        <div className="profile-field">
          <label>Default Passing Score (%):</label>
          <input type="number" defaultValue={50} min={0} max={100} />
        </div>
        <button className="btn-primary">Save Settings</button>
      </div>
    </div>
  );
}
