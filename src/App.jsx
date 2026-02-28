import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Weekly from "./pages/Weekly";
import Competition from "./pages/Competition";
import Summary from "./pages/Summary";
import Analytics from "./pages/Analytics";
import Charts from "./pages/Charts";
import Journal from "./pages/Journal";
import Auth from "./pages/Auth";

import "./App.css";
import logo from "/vite.svg";  // SAFE PATH

export default function App() {
  const [activeUser, setActiveUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("activeUser");
    if (storedUser) {
      setActiveUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("activeUser");
    setActiveUser(null);
  };

  if (!activeUser) {
    return <Auth onLogin={setActiveUser} />;
  }

  return (
    <BrowserRouter>
      <div className="app-wrapper">

        <div className="top-bar">

          {/* LEFT */}
          <div className="top-left">
            <img src={logo} alt="logo" className="app-logo" />
            <span className="app-title">Project 1044</span>
          </div>

          {/* CENTER */}
          <div className="top-center">
            <button
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              ☰
            </button>
          </div>

          {/* RIGHT */}
          <div className="top-right">
            Logged in as: <b>{activeUser.username}</b>
          </div>
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/weekly" onClick={() => setMenuOpen(false)}>Weekly</Link>
            <Link to="/competition" onClick={() => setMenuOpen(false)}>Competition</Link>
            <Link to="/summary" onClick={() => setMenuOpen(false)}>Summary</Link>
            <Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link>
            <Link to="/charts" onClick={() => setMenuOpen(false)}>Charts</Link>
            <Link to="/journal" onClick={() => setMenuOpen(false)}>Journal</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}

        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard user={activeUser} />} />
            <Route path="/weekly" element={<Weekly user={activeUser} />} />
            <Route path="/competition" element={<Competition />} />
            <Route path="/summary" element={<Summary user={activeUser} />} />
            <Route path="/analytics" element={<Analytics user={activeUser} />} />
            <Route path="/charts" element={<Charts user={activeUser} />} />
            <Route path="/journal" element={<Journal user={activeUser} />} />
          </Routes>
        </div>

        <footer className="footer">
          Version 1.0.1
        </footer>

      </div>
    </BrowserRouter>
  );
}