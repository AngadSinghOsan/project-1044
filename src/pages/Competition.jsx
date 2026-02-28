import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

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
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const usersData = await dbRequest({
        table: "app_users",
        method: "select"
      });

      const resultsData = await dbRequest({
        table: "competition_results",
        method: "select",
        filters: [
          { column: "week_start", value: weekStart }
        ]
      });

      setUsers(usersData);
      setResults(resultsData);
    } catch (err) {
      console.error(err.message);
    }
  }

  const categories = ["gym", "steps", "bench", "squat", "deadlift"];

  function getMedal(category, position) {
    const winner = results.find(
      r => r.category === category && r.position === position
    );

    if (!winner) return "None";

    const user = users.find(u => u.id === winner.user_id);
    return user ? user.username : "None";
  }

  return (
    <div className="card">
      <h2>Competition Results</h2>

      {categories.map((cat) => (
        <div
          key={cat}
          style={{
            padding: "15px 0",
            borderBottom: "1px solid #334155"
          }}
        >
          <h3>{cat.toUpperCase()}</h3>
          <div>🥇 {getMedal(cat, "gold")}</div>
          <div>🥈 {getMedal(cat, "silver")}</div>
          <div>🥉 {getMedal(cat, "bronze")}</div>
        </div>
      ))}

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}