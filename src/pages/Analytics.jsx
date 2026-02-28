import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

export default function Analytics({ user }) {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const daily = await dbRequest({
        table: "daily_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      const weekly = await dbRequest({
        table: "weekly_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      setDailyData(daily);
      setWeeklyData(weekly);

    } catch (err) {
      console.error(err.message);
    }
  }

  // ---- 10 Lakh Progress ----
  const totalSavings = weeklyData.reduce((sum, w) => sum + (w.savings || 0), 0);
  const progressPercent = ((totalSavings / 1000000) * 100).toFixed(2);

  // ---- Discipline Metrics ----
  const totalDays = dailyData.length;
  const totalGym = dailyData.filter(d => d.habits?.gym).length;

  const weeklyCompletion = totalDays
    ? ((totalGym / totalDays) * 100).toFixed(1)
    : 0;

  // ---- PR Records ----
  const bestBench = Math.max(...weeklyData.map(w => w.bench || 0), 0);
  const bestSquat = Math.max(...weeklyData.map(w => w.squat || 0), 0);
  const bestDeadlift = Math.max(...weeklyData.map(w => w.deadlift || 0), 0);

  return (
    <div className="card">
      <h2>Analytics</h2>

      {/* 10 Lakh Section */}
      <h3>10 Lakh Goal Progress</h3>
      <div>Total Saved: ₹{totalSavings}</div>
      <div>Progress: {progressPercent}%</div>

      <hr />

      {/* Discipline Section */}
      <h3>Discipline Metrics</h3>
      <div>Weekly Habit Completion: {weeklyCompletion}%</div>
      <div>Total Gym Sessions: {totalGym}</div>

      <hr />

      {/* Personal Records */}
      <h3>Personal Records</h3>
      <div>Best Bench: {bestBench} kg</div>
      <div>Best Squat: {bestSquat} kg</div>
      <div>Best Deadlift: {bestDeadlift} kg</div>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}