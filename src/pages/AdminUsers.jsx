import { useState, useEffect } from "react";
import "../styles/pages.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const url = editingUser
        ? `${apiUrl}/api/users/${editingUser.id}`
        : `${apiUrl}/api/users`;
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser
        ? { username: newUser.username, email: newUser.email, role: newUser.role }
        : newUser;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save user");

      setSuccess(
        editingUser ? "✅ User updated successfully!" : "✅ User created successfully!"
      );
      setNewUser({ username: "", password: "", role: "student", email: "" });
      setEditingUser(null);
      setShowForm(false);
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    });
    setShowForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError("");
    try {
      const res = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      setSuccess("✅ User deleted!");
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setNewUser({ username: "", password: "", role: "student", email: "" });
    setShowForm(false);
  };

  return (
    <div className="page-container">
      <h1>Manage Users</h1>
      <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add User"}
      </button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {showForm && (
        <form className="exam-form" onSubmit={handleAddUser}>
          <h2>{editingUser ? "Edit User" : "Create New User"}</h2>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              required
              disabled={editingUser ? true : false}
            />
          </div>
          {!editingUser && (
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
          )}
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
          <div className="button-group">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={cancelEdit}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && !showForm && <p>Loading users...</p>}

      <table className="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
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
                  onClick={() => handleEditUser(user)}
                  className="btn-link"
                >
                  Edit
                </button>
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
