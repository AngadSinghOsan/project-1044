import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

export default function Analytics({ user }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [competitionData, setCompetitionData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const weekly = await dbRequest({
        table: "weekly_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      const daily = await dbRequest({
        table: "daily_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      const comp = await dbRequest({
        table: "competition_results",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      setWeeklyData(weekly);
      setDailyData(daily);
      setCompetitionData(comp);

    } catch (err) {
      console.error(err.message);
    }
  }

  // ===== Discipline Metrics =====
  const totalGymSessions = dailyData.filter(d => d.habits?.gym).length;
  const totalMoneyWasted = dailyData.reduce((sum, d) => sum + (d.money_wasted || 0), 0);
  const totalSavings = weeklyData.reduce((sum, w) => sum + (w.savings || 0), 0);
  const avgSteps = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, d) => sum + (d.steps || 0), 0) / dailyData.length)
    : 0;

  // ===== PR Records =====
  const bestBench = Math.max(...weeklyData.map(w => w.bench || 0), 0);
  const bestSquat = Math.max(...weeklyData.map(w => w.squat || 0), 0);
  const bestDeadlift = Math.max(...weeklyData.map(w => w.deadlift || 0), 0);

  // ===== Medals =====
  const golds = competitionData.filter(c => c.position === "gold").length;
  const silvers = competitionData.filter(c => c.position === "silver").length;
  const bronzes = competitionData.filter(c => c.position === "bronze").length;

  return (
    <div className="card">
      <h2>Analytics</h2>

      {/* Personal Growth */}
      <h3>Personal Growth</h3>
      <div>Total Savings: ₹{totalSavings}</div>
      <div>Total Money Wasted: ₹{totalMoneyWasted}</div>
      <div>Average Steps: {avgSteps}</div>
      <div>Total Gym Sessions: {totalGymSessions}</div>

      <hr style={{ margin: "20px 0", borderColor: "#334155" }} />

      {/* Personal Records */}
      <h3>Personal Records</h3>
      <div>Bench PR: {bestBench} kg</div>
      <div>Squat PR: {bestSquat} kg</div>
      <div>Deadlift PR: {bestDeadlift} kg</div>

      <hr style={{ margin: "20px 0", borderColor: "#334155" }} />

      {/* Medals */}
      <h3>Competition Medals</h3>
      <div>🥇 Gold: {golds}</div>
      <div>🥈 Silver: {silvers}</div>
      <div>🥉 Bronze: {bronzes}</div>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}