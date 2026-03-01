import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Summary({ user }) {

  const [stats, setStats] = useState({
    saved: 0,
    wasted: 0,
    gym: 0,
    avgSteps: 0,
    gold: 0,
    silver: 0,
    bronze: 0
  });

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {

    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id);

    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id);

    const { data: medals } = await supabase
      .from("competition_results")
      .select("*");

    let saved = 0;
    let wasted = 0;

daily?.forEach(d => {
  wasted += d.money_wasted || 0;
});
    let gym = 0;
    let totalSteps = 0;

    daily?.forEach(d => {
      if (d.habits?.gym) gym++;
      totalSteps += d.steps || 0;
    });

    weekly?.forEach(w => {
      saved += w.savings || 0;
    });

    const days = daily?.length || 1;

    let gold = 0;
    let silver = 0;
    let bronze = 0;

    medals?.forEach(m => {
      if (m.gold?.includes(user.username)) gold++;
      if (m.silver?.includes(user.username)) silver++;
      if (m.bronze?.includes(user.username)) bronze++;
    });

    setStats({
      saved,
      wasted,
      gym,
      avgSteps: Math.round(totalSteps / days),
      gold,
      silver,
      bronze
    });
  }

  return (
    <div className="card">

      <h2>Summary</h2>

      <hr />

      <h3>Finance</h3>
      <p>Total Saved: ₹ {stats.saved}</p>
      <p>Total Wasted: ₹ {stats.wasted}</p>

      <hr />

      <h3>Discipline</h3>
      <p>Total Gym Sessions: {stats.gym}</p>
      <p>Average Daily Steps: {stats.avgSteps}</p>

      <hr />

      <h3>Medal Tally</h3>
      <p>🥇 Gold: {stats.gold}</p>
      <p>🥈 Silver: {stats.silver}</p>
      <p>🥉 Bronze: {stats.bronze}</p>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>

    </div>
  );
}