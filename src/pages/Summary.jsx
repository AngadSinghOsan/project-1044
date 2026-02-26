import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Summary({ user }) {
  const [dailyCount, setDailyCount] = useState(0);
  const [totalWasted, setTotalWasted] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id);

    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id);

    if (daily) {
      setDailyCount(daily.length);
      const wasted = daily.reduce(
        (sum, d) => sum + Number(d.money_wasted || 0),
        0
      );
      setTotalWasted(wasted);
    }

    if (weekly) {
      const saved = weekly.reduce(
        (sum, w) => sum + Number(w.savings || 0),
        0
      );
      setTotalSaved(saved);
    }
  };

  return (
    <div className="card">
      <h2>Summary</h2>

      <p>Total Days Logged: {dailyCount}</p>
      <p>Total Money Wasted: ₹{totalWasted}</p>
      <p>Total Money Saved: ₹{totalSaved}</p>
    </div>
  );
}