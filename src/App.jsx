import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Weekly from "./pages/Weekly";
import Competition from "./pages/Competition";
import Journal from "./pages/Journal";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const saved = localStorage.getItem("activeUser");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  function logout() {
    localStorage.removeItem("activeUser");
    setUser(null);
  }

  if (!user) {
    return <Auth setUser={setUser} />;
  }

  return (
    <div className="app-container">
      
      {/* Top Bar */}
      <div className="topbar">
        <div className="top-left">
          <span className="logo-text">Project 1044</span>
        </div>

        <div className="top-center">
          <select
            value={page}
            onChange={(e) => setPage(e.target.value)}
          >
            <option value="dashboard">Dashboard</option>
            <option value="weekly">Weekly</option>
            <option value="competition">Competition</option>
            <option value="journal">Journal</option>
            <option value="analytics">Analytics</option>
          </select>
        </div>

        <div className="top-right">
          Logged in as: {user.username}
          <button className="secondary small" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Page Render */}
      <div className="page-content">
        {page === "dashboard" && <Dashboard user={user} />}
        {page === "weekly" && <Weekly user={user} />}
        {page === "competition" && <Competition user={user} />}
        {page === "journal" && <Journal user={user} />}
        {page === "analytics" && <Analytics user={user} />}
      </div>
    </div>
  );
}