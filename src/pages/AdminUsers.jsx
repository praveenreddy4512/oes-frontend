import { useState, useEffect } from "react";
import "../styles/pages.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "student",
    email: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!res.ok) throw new Error("Failed to create user");

      alert("User created successfully!");
      setNewUser({ username: "", password: "", role: "student", email: "" });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`${apiUrl}/api/users/${userId}`, { method: "DELETE" });
      alert("User deleted!");
      fetchUsers();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="page-container">
      <h1>Manage Users</h1>
      <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add User"}
      </button>

      {showForm && (
        <form className="exam-form" onSubmit={handleAddUser}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Create User
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {loading && <p>Loading users...</p>}

      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="btn-link btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && !loading && (
        <p className="no-data">No users found.</p>
      )}
    </div>
  );
}
