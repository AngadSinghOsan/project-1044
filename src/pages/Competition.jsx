import { useEffect, useState } from "react";
import { supabase } from "../supabase";
export default function Competition() {
  const [results, setResults] = useState([]);

 async function loadCompetition(weekStart) {
  const { data, error } = await supabase
    .from("competition_results")
    .select("*")
    .eq("week_start", weekStart);

  if (error) {
    console.error(error);
    return;
  }

  setResults(data);
}
  useEffect(() => {
    loadResults();
  }, []);

  const categories = [
    "gym_sessions",
    "steps",
    "bench",
    "squat",
    "deadlift"
  ];

  return (
    <div className="card">
      <h2>Weekly Competition</h2>

      {categories.map((category) => {
        const categoryResults = results.filter(
          (r) => r.category === category
        );

        return (
          <div
            key={category}
            style={{
              borderTop: "1px solid #2a2d36",
              paddingTop: "15px",
              marginTop: "15px"
            }}
          >
            <h3 style={{ textTransform: "capitalize" }}>
              {category.replace("_", " ")}
            </h3>

            {categoryResults.length === 0 ? (
              <p>No winners yet.</p>
            ) : (
              categoryResults.map((r, i) => (
                <div key={i}>
                  🥇 Gold: {r.gold || "None"} <br />
                  🥈 Silver: {r.silver || "None"} <br />
                  🥉 Bronze: {r.bronze || "None"}
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}