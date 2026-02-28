import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

export default function Summary({ user }) {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [competitionData, setCompetitionData] = useState([]);

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

      const comp = await dbRequest({
        table: "competition_results",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      setDailyData(daily);
      setWeeklyData(weekly);
      setCompetitionData(comp);

    } catch (err) {
      console.error(err.message);
    }
  }

  // ---- Calculations ----
  const totalDays = dailyData.length;

  const totalGym = dailyData.filter(d => d.habits?.gym).length;

  const totalMoneySaved = weeklyData.reduce(
    (sum, w) => sum + (w.savings || 0),
    0
  );

  const totalMoneyWasted = dailyData.reduce(
    (sum, d) => sum + (d.money_wasted || 0),
    0
  );

  const totalSteps = dailyData.reduce(
    (sum, d) => sum + (d.steps || 0),
    0
  );

  const averageSteps = totalDays
    ? Math.round(totalSteps / totalDays)
    : 0;

  const gold = competitionData.filter(c => c.position === "gold").length;
  const silver = competitionData.filter(c => c.position === "silver").length;
  const bronze = competitionData.filter(c => c.position === "bronze").length;

  return (
    <div className="card">
      <h2>Summary</h2>

      <hr />

      <h3>Performance Overview</h3>
      <div>Total Days Logged: {totalDays}</div>
      <div>Total Gym Sessions: {totalGym}</div>
      <div>Average Steps: {averageSteps}</div>

      <hr />

      <h3>Finance Overview</h3>
      <div>Total Money Saved: ₹{totalMoneySaved}</div>
      <div>Total Money Wasted: ₹{totalMoneyWasted}</div>

      <hr />

      <h3>Competition Medals</h3>
      <div>🥇 Gold: {gold}</div>
      <div>🥈 Silver: {silver}</div>
      <div>🥉 Bronze: {bronze}</div>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}