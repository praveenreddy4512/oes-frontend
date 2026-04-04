import { useState, useEffect } from "react";
import "../styles/dashboard.css";
import { apiGet } from "../utils/api";

export default function AdminDashboard({ user }) {
  // Admin Dashboard - displays management options
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Panel - {user.username} 👨‍💼</h1>
        <p>System Administration</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card animate-scale-up stagger-1">
          <h3>👥 Manage Users</h3>
          <p>Create, edit, and delete users</p>
          <a href="/admin/users" className="btn-primary">User Management</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-2">
          <h3>📂 Manage Groups</h3>
          <p>Create, edit groups, and manage members</p>
          <a href="/admin/groups" className="btn-primary">Group Management</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-3">
          <h3>📚 Manage Exams</h3>
          <p>View and manage all exams</p>
          <a href="/admin/exams" className="btn-primary">Exam Management</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-4">
          <h3>📊 System Statistics</h3>
          <p>View system-wide analytics</p>
          <a href="/admin/statistics" className="btn-primary">View Stats</a>
        </div>

        <div className="dashboard-card animate-scale-up stagger-5">
          <h3>⚙️ Settings</h3>
          <p>Configure system settings</p>
          <a href="/admin/settings" className="btn-primary">Settings</a>
        </div>
      </div>
    </div>
  );
}
