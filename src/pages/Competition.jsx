import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Competition({ user }) {
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
        filters: [{ column: "week_start", value: weekStart }]
      });

      setUsers(usersData);
      setResults(resultsData);

    } catch (err) {
      console.error(err.message);
    }
  }

  function getMedal(category, position) {
    const winner = results.find(
      r => r.category === category && r.position === position
    );

    if (!winner) return "No Winner";

    const user = users.find(u => u.id === winner.user_id);
    return user ? user.username : "No Winner";
  }

  function CategoryBlock({ title, category }) {
    return (
      <div style={{ marginBottom: 30 }}>
        <h3>{title}</h3>
        <div>🥇 Gold: {getMedal(category, "gold")}</div>
        <div>🥈 Silver: {getMedal(category, "silver")}</div>
        <div>🥉 Bronze: {getMedal(category, "bronze")}</div>
        <hr />
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Weekly Competition</h2>

      <CategoryBlock title="Gym Sessions" category="gym" />
      <CategoryBlock title="Total Steps" category="steps" />
      <CategoryBlock title="Bench Press" category="bench" />
      <CategoryBlock title="Squat" category="squat" />
      <CategoryBlock title="Deadlift" category="deadlift" />

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}