import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Weekly from "./pages/Weekly";
import Summary from "./pages/Summary";
import Charts from "./pages/Charts";
import Journal from "./pages/Journal";
import Competition from "./pages/Competition";
import Analytics from "./pages/Analytics";
import Auth from "./pages/Auth";

import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("activeUser");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  if (!user) return <Auth />;

  const logout = () => {
    localStorage.removeItem("activeUser");
    window.location.reload();
  };

  return (
    <BrowserRouter>
      <div className="app-container">

        <div className="header">
          <h3>Project 1044</h3>
          <small style={{ color: "#38bdf8" }}>
    Logged in as: {user.username}
  </small>
          <button onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>

        {menuOpen && (
          <div className="dropdown">
            <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/weekly" onClick={() => setMenuOpen(false)}>Weekly</Link>
            <Link to="/competition" onClick={() => setMenuOpen(false)}>Competition</Link>
            <Link to="/summary" onClick={() => setMenuOpen(false)}>Summary</Link>
            <Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link>
            <Link to="/charts" onClick={() => setMenuOpen(false)}>Charts</Link>
            <Link to="/journal" onClick={() => setMenuOpen(false)}>Journal</Link>

            <button className="secondary" onClick={logout}>
              Logout
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/weekly" element={<Weekly user={user} />} />
          <Route path="/competition" element={<Competition user={user} />} />
          <Route path="/summary" element={<Summary user={user} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />
          <Route path="/charts" element={<Charts user={user} />} />
          <Route path="/journal" element={<Journal user={user} />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}