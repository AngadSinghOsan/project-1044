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

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">

        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/weekly">Weekly</Link>
          <Link to="/competition">Competition</Link>
          <Link to="/summary">Summary</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/charts">Charts</Link>
          <Link to="/journal">Journal</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/competition" element={<Competition />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>

        <button
          className="secondary"
          onClick={() => supabase.auth.signOut()}
        >
          Logout
        </button>

      </div>
    </BrowserRouter>
  );
}