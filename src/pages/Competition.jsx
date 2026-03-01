import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Competition() {

  const [results, setResults] = useState([]);
  const [week, setWeek] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {

    // Get latest locked week
    const { data: locked } = await supabase
      .from("locked_weeks")
      .select("*")
      .order("week_start", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!locked) {
      setResults([]);
      return;
    }

    setWeek(locked.week_start);

    const { data } = await supabase
      .from("competition_results")
      .select("*")
      .eq("week_start", locked.week_start)
      .order("category");

    setResults(data || []);
  }

  if (!week) {
    return (
      <div className="card">
        <h2>Competition</h2>
        <p>No locked week yet.</p>
        <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
          Version 1.0.1
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Competition Results</h2>
      <p>Week Starting: {week}</p>

      {results.map(r => (
        <div key={r.id}>
          <hr />
          <h3>{r.category}</h3>
          <p>🥇 Gold: {r.gold}</p>
          <p>🥈 Silver: {r.silver}</p>
          <p>🥉 Bronze: {r.bronze}</p>
        </div>
      ))}

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}