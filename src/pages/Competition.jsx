import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Competition() {
  const weekStart = getStartOfWeek(new Date())
    .toISOString()
    .split("T")[0];

  const [results, setResults] = useState([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: winners } = await supabase
      .from("competition_results")
      .select("*")
      .eq("week_start", weekStart);

    const { data: users } = await supabase
      .from("app_users")
      .select("id, username");

    const map = {};
    users?.forEach(u => (map[u.id] = u.username));

    setUsersMap(map);
    setResults(winners || []);
  };

  const categories = ["gym", "steps", "bench", "squat", "deadlift"];

  return (
    <div className="card">
      <h2>Competition Results</h2>

      {categories.map((cat) => {
        const catResults = results.filter((r) => r.category === cat);

        const getWinner = (position) => {
          const winner = catResults.find((r) => r.position === position);
          return winner ? usersMap[winner.user_id] : "None";
        };

        return (
          <div
            key={cat}
            style={{
              padding: "15px 0",
              borderBottom: "1px solid #334155"
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              {cat.toUpperCase()}
            </h3>

            <div>🥇 {getWinner("gold")}</div>
            <div>🥈 {getWinner("silver")}</div>
            <div>🥉 {getWinner("bronze")}</div>
          </div>
        );
      })}
    </div>
  );
}