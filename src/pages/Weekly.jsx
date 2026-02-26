import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Weekly({ user }) {
  const today = new Date();
  const weekStart = getStartOfWeek(today)
    .toISOString()
    .split("T")[0];

  const [weight, setWeight] = useState("");
  const [savings, setSavings] = useState("");
  const [bench, setBench] = useState("");
  const [squat, setSquat] = useState("");
  const [deadlift, setDeadlift] = useState("");
  const [runTime, setRunTime] = useState("");
  const [savingState, setSavingState] = useState(false);

  useEffect(() => {
    loadWeek();
  }, []);

  const loadWeek = async () => {
    const { data } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .single();

    if (data) {
      setWeight(data.weight || "");
      setSavings(data.savings || "");
      setBench(data.bench || "");
      setSquat(data.squat || "");
      setDeadlift(data.deadlift || "");
      setRunTime(data.run_time || "");
    }
  };

  const handleSave = async () => {
    setSavingState(true);

    const { error } = await supabase
      .from("weekly_entries")
      .upsert(
        {
          user_id: user.id,
          week_start: weekStart,
          weight,
          savings,
          bench,
          squat,
          deadlift,
          run_time: runTime
        },
        { onConflict: "user_id,week_start" }
      );

    setSavingState(false);

    if (error) {
      alert("Error saving weekly data");
    } else {
      alert("Weekly saved");
    }
  };

  return (
    <div className="card">
      <h2>Weekly Entry</h2>

      <label>Weight (kg)</label>
      <input value={weight} onChange={(e) => setWeight(e.target.value)} />

      <label>Money Saved This Week (₹)</label>
      <input value={savings} onChange={(e) => setSavings(e.target.value)} />

      <label>Bench PR (kg)</label>
      <input value={bench} onChange={(e) => setBench(e.target.value)} />

      <label>Squat PR (kg)</label>
      <input value={squat} onChange={(e) => setSquat(e.target.value)} />

      <label>Deadlift PR (kg)</label>
      <input value={deadlift} onChange={(e) => setDeadlift(e.target.value)} />

      <label>1KM Run Time (minutes)</label>
      <input value={runTime} onChange={(e) => setRunTime(e.target.value)} />

      <button className="primary" onClick={handleSave} disabled={savingState}>
        {savingState ? "Saving..." : "Save Weekly"}
      </button>
    </div>
  );
}