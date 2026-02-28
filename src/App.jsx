import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Weekly from "./pages/Weekly";
import Competition from "./pages/Competition";
import Summary from "./pages/Summary";
import Analytics from "./pages/Analytics";
import Charts from "./pages/Charts";
import Journal from "./pages/Journal";
import Auth from "./pages/Auth";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("activeUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function logout() {
    localStorage.removeItem("activeUser");
    setUser(null);
  }

  if (!user) return <Auth setUser={setUser} />;

  return (
    <div className="app-container">

      {/* TOP BAR */}
      <div className="topbar">

        {/* LEFT */}
        <div className="top-left">
          <img src="/vite.svg" alt="logo" className="logo" />
          <span className="app-title">Project 1044</span>
        </div>

        {/* CENTER */}
        <div className="top-center">
          <button
            className="burger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>

          {menuOpen && (
            <div className="dropdown">
              <div onClick={() => { setPage("dashboard"); setMenuOpen(false); }}>Dashboard</div>
              <div onClick={() => { setPage("weekly"); setMenuOpen(false); }}>Weekly</div>
              <div onClick={() => { setPage("competition"); setMenuOpen(false); }}>Competition</div>
              <div onClick={() => { setPage("summary"); setMenuOpen(false); }}>Summary</div>
              <div onClick={() => { setPage("analytics"); setMenuOpen(false); }}>Analytics</div>
              <div onClick={() => { setPage("charts"); setMenuOpen(false); }}>Charts</div>
              <div onClick={() => { setPage("journal"); setMenuOpen(false); }}>Journal</div>
              <hr />
              <div onClick={logout}>Logout</div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="top-right">
          Logged in as: <strong>{user.username}</strong>
        </div>

      </div>

      {/* PAGE CONTENT */}
      <div className="page-content">
        {page === "dashboard" && <Dashboard user={user} />}
        {page === "weekly" && <Weekly user={user} />}
        {page === "competition" && <Competition user={user} />}
        {page === "summary" && <Summary user={user} />}
        {page === "analytics" && <Analytics user={user} />}
        {page === "charts" && <Charts user={user} />}
        {page === "journal" && <Journal user={user} />}
      </div>

    </div>
  );
}