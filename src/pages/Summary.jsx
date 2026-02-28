import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Summary({ user }) {
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [medals, setMedals] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id);

    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id);

    const { data: medalData } = await supabase
      .from("competition_results")
      .select("*")
      .eq("user_id", user.id);

    setDailyData(daily || []);
    setWeeklyData(weekly || []);
    setMedals(medalData || []);
  };

  const totalMoneyWasted = dailyData.reduce(
    (sum, d) => sum + (d.money_wasted || 0),
    0
  );

  const totalMoneySaved = weeklyData.reduce(
    (sum, w) => sum + (w.savings || 0),
    0
  );

  const totalGymSessions = dailyData.filter(
    d => d.habits?.gym_done
  ).length;

  const totalSteps = dailyData.reduce(
    (sum, d) => sum + (d.steps || 0),
    0
  );

  const avgSteps =
    dailyData.length > 0
      ? Math.round(totalSteps / dailyData.length)
      : 0;

  const medalCount = (type) =>
    medals.filter(m => m.position === type).length;

  return (
    <div className="card">
      <h2>Summary</h2>

      <p><strong>Total Money Saved:</strong> ₹{totalMoneySaved}</p>
      <p><strong>Total Money Wasted:</strong> ₹{totalMoneyWasted}</p>
      <p><strong>Total Gym Sessions:</strong> {totalGymSessions}</p>
      <p><strong>Average Steps:</strong> {avgSteps}</p>

      <hr />

      <h3>Medals</h3>
      <p>🥇 Gold: {medalCount("gold")}</p>
      <p>🥈 Silver: {medalCount("silver")}</p>
      <p>🥉 Bronze: {medalCount("bronze")}</p>
    </div>
  );
}