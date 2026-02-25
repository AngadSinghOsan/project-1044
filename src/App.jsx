import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Weekly from "./pages/Weekly";
import Summary from "./pages/Summary";
import Charts from "./pages/Charts";
import Journal from "./pages/Journal";
import Auth from "./pages/Auth";
import Competition from "./pages/Competition";
import Analytics from "./pages/Analytics";

import "./App.css";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!session) return <Auth />;

  return (
    <BrowserRouter>
      <div className="app-container">

        {/* Header */}
        <div className="header">
          <h3>Project 1044</h3>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="dropdown">
            <Link to="/" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/weekly" onClick={() => setMenuOpen(false)}>Weekly</Link>
            <Link to="/competition" onClick={() => setMenuOpen(false)}>Competition</Link>
            <Link to="/summary" onClick={() => setMenuOpen(false)}>Summary</Link>
            <Link to="/analytics" onClick={() => setMenuOpen(false)}>Analytics</Link>
            <Link to="/charts" onClick={() => setMenuOpen(false)}>Charts</Link>
            <Link to="/journal" onClick={() => setMenuOpen(false)}>Journal</Link>

            <button
              className="secondary"
              onClick={() => supabase.auth.signOut()}
            >
              Logout
            </button>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/competition" element={<Competition />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}