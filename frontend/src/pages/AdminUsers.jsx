import { useState, useEffect } from "react";
import "../styles/pages.css";
import { apiCall, apiGet, apiPost, apiPut, apiDelete } from "../utils/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
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
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await apiGet('/api/groups/for-exams/list');
      if (res.ok) {
        const data = await res.json();
        setGroups(Array.isArray(data) ? data : data.groups || []);
      }
    } catch (err) {
      console.error("Failed to load groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGet('/api/users');
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
      const body = editingUser
        ? { username: newUser.username, email: newUser.email, role: newUser.role }
        : newUser;

      const res = editingUser
        ? await apiPut(`/api/users/${editingUser.id}`, body)
        : await apiPost('/api/users', body);

      if (!res.ok) throw new Error("Failed to save user");

      const userData = await res.json();
      const createdUserId = editingUser ? editingUser.id : userData.id;

      // If creating a student and groups are selected, add them to groups
      let groupsAddedCount = 0;
      let groupsRemovedCount = 0;
      let groupErrors = [];
      
      console.log(`[DEBUG] Saving user: userId=${createdUserId}, selectedGroups=${JSON.stringify(selectedGroups)}`);
      
      if (newUser.role === "student" && selectedGroups.length >= 0) {
        if (!editingUser) {
          // CREATE MODE: Add student to selected groups
          console.log(`[DEBUG] CREATE mode - Starting group assignment for ${selectedGroups.length} groups...`);
          
          for (const groupId of selectedGroups) {
            try {
              const payload = { studentIds: [createdUserId] };
              console.log(`[DEBUG] POST /api/groups/${groupId}/members with payload:`, payload);
              
              const groupRes = await apiPost(`/api/groups/${groupId}/members`, payload);
              const responseData = await groupRes.json();
              
              if (!groupRes.ok) {
                const errMsg = `Group ${groupId}: ${responseData.error || 'Failed to add'}`;
                groupErrors.push(errMsg);
                console.error(`[ERROR] ${errMsg}`);
              } else {
                groupsAddedCount++;
                console.log(`[✅] Group ${groupId} response:`, responseData);
              }
            } catch (err) {
              const errMsg = `Group ${groupId}: ${err.message}`;
              groupErrors.push(errMsg);
              console.error(`[ERROR] ${errMsg}`, err);
            }
          }
        } else {
          // EDIT MODE: Update group assignments (add/remove as needed)
          console.log(`[DEBUG] EDIT mode - Updating groups for student ${createdUserId}...`);
          
          try {
            const payload = { groupIds: selectedGroups };
            console.log(`[DEBUG] PUT /api/groups/student/${createdUserId}/groups with payload:`, payload);
            
            const groupRes = await apiPut(`/api/groups/student/${createdUserId}/groups`, payload);
            const responseData = await groupRes.json();
            
            if (!groupRes.ok) {
              const errMsg = responseData.error || 'Failed to update groups';
              groupErrors.push(errMsg);
              console.error(`[ERROR] ${errMsg}`);
            } else {
              groupsAddedCount = responseData.added || 0;
              groupsRemovedCount = responseData.removed || 0;
              console.log(`[✅] Groups updated:`, responseData);
            }
          } catch (err) {
            const errMsg = `Failed to update groups: ${err.message}`;
            groupErrors.push(errMsg);
            console.error(`[ERROR] ${errMsg}`, err);
          }
        }
      }

      // Show success message with details
      let successMsg = editingUser ? "✅ User updated successfully!" : "✅ User created successfully";
      if (newUser.role === "student") {
        if (!editingUser && selectedGroups.length > 0) {
          // CREATE mode
          successMsg += ` and added to ${groupsAddedCount}/${selectedGroups.length} groups`;
        } else if (editingUser && selectedGroups.length > 0) {
          // EDIT mode
          if (groupsAddedCount > 0 || groupsRemovedCount > 0) {
            successMsg += ` (${groupsAddedCount} added, ${groupsRemovedCount} removed)`;
          }
        }
      }
      
      // Show error if group operations failed
      if (groupErrors.length > 0) {
        console.warn("⚠️ Group operation errors:", groupErrors);
      }
      
      setSuccess(successMsg);
      setNewUser({ username: "", password: "", role: "student", email: "" });
      setSelectedGroups([]);
      setEditingUser(null);
      setShowForm(false);
      fetchUsers();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleEditUser = async (user) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      role: user.role,
      password: "",
    });
    
    // If editing a student, fetch their current groups
    if (user.role === "student") {
      try {
        console.log(`[DEBUG] Fetching groups for student ${user.id}...`);
        const res = await apiGet(`/api/groups/student/${user.id}/groups`);
        if (res.ok) {
          const data = await res.json();
          console.log(`[DEBUG] Student ${user.id} is in groups:`, data);
          setSelectedGroups(Array.isArray(data) ? data : []);
        } else {
          console.warn(`[WARNING] Failed to fetch student groups:`, await res.json());
          setSelectedGroups([]);
        }
      } catch (err) {
        console.error(`[ERROR] Failed to load student groups:`, err);
        setSelectedGroups([]);
      }
    } else {
      setSelectedGroups([]);
    }
    
    setShowForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError("");
    try {
      const res = await apiDelete(`/api/users/${userId}`);
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
    setSelectedGroups([]);
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
              onChange={(e) => {
                setNewUser({ ...newUser, role: e.target.value });
                if (e.target.value !== "student") {
                  setSelectedGroups([]);
                }
              }}
            >
              <option value="student">Student</option>
              <option value="professor">Professor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {newUser.role === "student" && (
            <div className="form-group">
              <label>Assign to Groups</label>
              {loadingGroups ? (
                <p className="info">Loading groups...</p>
              ) : groups.length === 0 ? (
                <p className="info">No groups available. Create groups first.</p>
              ) : (
                <div className="groups-checkbox-container">
                  {groups.map((group) => (
                    <label key={group.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                      />
                      <span>{group.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <small>Student will be added to selected groups upon creation</small>
            </div>
          )}

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
