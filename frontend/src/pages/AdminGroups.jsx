import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages.css";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [groupMembers, setGroupMembers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/groups");
      if (!res.ok) throw new Error("Failed to load groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiGet("/api/users?role=student");
      if (res.ok) {
        const data = await res.json();
        setAllStudents(data);
      }
    } catch (err) {
      console.error("Failed to load students");
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const res = await apiGet(`/api/groups/${groupId}/members`);
      if (res.ok) {
        const data = await res.json();
        setGroupMembers(data);
      }
    } catch (err) {
      console.error("Failed to load group members");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    try {
      const endpoint = editingGroup ? `/api/groups/${editingGroup.id}` : "/api/groups";
      const method = editingGroup ? apiPut : apiPost;
      
      const res = await method(endpoint, formData);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save group");
      }

      setSuccess(editingGroup ? "✅ Group updated successfully!" : "✅ Group created successfully!");
      setFormData({ name: "", description: "" });
      setEditingGroup(null);
      setShowForm(false);
      fetchGroups();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData({ name: group.name, description: group.description });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingGroup(null);
    setFormData({ name: "", description: "" });
    setShowForm(false);
  };

  const handleDeleteGroup = async (groupId) => {
    if (!confirm("Are you sure you want to delete this group?")) return;

    try {
      const res = await apiDelete(`/api/groups/${groupId}`);
      if (!res.ok) throw new Error("Failed to delete group");

      setSuccess("✅ Group deleted successfully!");
      fetchGroups();
      setShowMembers(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddMember = async (groupId, studentId) => {
    try {
      const res = await apiPost(`/api/groups/${groupId}/members`, {
        studentIds: [studentId],
      });
      if (!res.ok) throw new Error("Failed to add member");

      setSuccess("✅ Member added successfully!");
      fetchGroupMembers(groupId);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (groupId, studentId) => {
    if (!confirm("Remove this student from the group?")) return;

    try {
      const res = await apiDelete(`/api/groups/${groupId}/members/${studentId}`);
      if (!res.ok) throw new Error("Failed to remove member");

      setSuccess("✅ Member removed successfully!");
      fetchGroupMembers(groupId);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="page-container">
        <p>Loading groups...</p>
      </div>
    );

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>👥 Manage Groups</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setFormData({ name: "", description: "" });
              setEditingGroup(null);
            }
          }}
        >
          {showForm ? "Cancel" : "+ Create Group"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {showForm && (
        <form
          onSubmit={handleCreateGroup}
          className="exam-form"
          style={{ marginBottom: "2rem" }}
        >
          <h2>{editingGroup ? `Edit Group: ${editingGroup.name}` : "Create New Group"}</h2>
          <div className="form-group">
            <label>Group Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., MTech CSE Section 1"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add a description for this group..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingGroup ? "Update Group" : "Create Group"}
            </button>
            {editingGroup && (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="groups-grid">
        {groups.length === 0 ? (
          <p className="no-data">No groups created yet</p>
        ) : (
          groups.map((group) => (
            <div key={group.id} className="group-card">
              <h3>{group.name}</h3>
              <p className="group-description">{group.description}</p>
              <p className="group-meta">
                👤 {group.member_count} member{group.member_count !== 1 ? "s" : ""}
              </p>
              <div className="group-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedGroup(group.id);
                    fetchGroupMembers(group.id);
                    setShowMembers(true);
                  }}
                >
                  Manage Members
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleEditGroup(group)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteGroup(group.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showMembers && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowMembers(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Group Members</h2>
              <button
                className="modal-close"
                onClick={() => setShowMembers(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Add Students to Group</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddMember(selectedGroup, parseInt(e.target.value));
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="">Select a student...</option>
                  {allStudents
                    .filter(
                      (student) =>
                        !groupMembers.find((m) => m.id === student.id)
                    )
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.username} ({student.email})
                      </option>
                    ))}
                </select>
              </div>

              <h3>Current Members</h3>
              {groupMembers.length === 0 ? (
                <p className="no-data">No members in this group</p>
              ) : (
                <div className="members-list">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="member-item">
                      <div>
                        <strong>{member.username}</strong>
                        <p>{member.email}</p>
                      </div>
                      <button
                        className="btn-danger btn-small"
                        onClick={() =>
                          handleRemoveMember(selectedGroup, member.id)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
