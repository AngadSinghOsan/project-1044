import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Competition() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    const { data } = await supabase
      .from("competition_results")
      .select("*")
      .order("week_start", { ascending: false });

    setResults(data || []);
  }

  return (
    <div className="card">
      <h2>Competition Results</h2>

      {results.map((r, i) => (
        <div key={i}>
          <p>Week: {r.week_start}</p>
          <p>Category: {r.category}</p>
          <p>Gold: {r.gold || "None"}</p>
          <p>Silver: {r.silver || "None"}</p>
          <p>Bronze: {r.bronze || "None"}</p>
          <hr />
        </div>
      ))}

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}