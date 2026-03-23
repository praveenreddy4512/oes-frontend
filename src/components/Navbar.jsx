import { useNavigate } from "react-router-dom";
import { clearToken } from "../utils/api.js";
import "../styles/navbar.css";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔐 Clear JWT token on logout
    clearToken();
    localStorage.removeItem("user");
    onLogout();
    navigate("/");
  };

  if (!user) return null;

  const getMenuItems = () => {
    const baseItems = [
      { label: "Dashboard", path: "/dashboard" },
    ];

    if (user.role === "student") {
      return [
        ...baseItems,
        { label: "Start Exam", path: "/student/exams" },
        { label: "My Results", path: "/student/results" },
        { label: "Profile", path: "/student/profile" },
      ];
    } else if (user.role === "professor") {
      return [
        ...baseItems,
        { label: "Create Exam", path: "/professor/create-exam" },
        { label: "My Exams", path: "/professor/exams" },
        { label: "Profile", path: "/professor/profile" },
      ];
    } else if (user.role === "admin") {
      return [
        ...baseItems,
        { label: "Manage Users", path: "/admin/users" },
        { label: "Manage Exams", path: "/admin/exams" },
        { label: "Statistics", path: "/admin/statistics" },
        { label: "Settings", path: "/admin/settings" },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="navbar-title">📚 OES</h2>
      </div>

      <div className="navbar-center">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="navbar-link"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="navbar-right">
        <span className="user-info">
          {user.username} <span className="role-badge">{user.role}</span>
        </span>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </nav>
  );
}
