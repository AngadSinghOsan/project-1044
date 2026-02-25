import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>

        <nav style={{ display: "flex", gap: "25px", marginBottom: "30px" }}>
          <a href="/">Dashboard</a>
          <a href="/weekly">Weekly</a>
          <a href="/competition">Competition</a>
          <a href="/summary">Summary</a>
          <a href="/analytics">Analytics</a>
          <a href="/charts">Charts</a>

          <button
            onClick={() => supabase.auth.signOut()}
            style={{ marginLeft: "auto" }}
          >
            Logout
          </button>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/weekly" element={<Weekly />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/competition" element={<Competition />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}