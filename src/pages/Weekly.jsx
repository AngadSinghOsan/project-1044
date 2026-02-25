import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Weekly() {
  const today = new Date();
  const initialWeekStart = getStartOfWeek(today)
    .toISOString()
    .split("T")[0];

  const [weekStart] = useState(initialWeekStart);
  const [isLocked, setIsLocked] = useState(false);

  const [weight, setWeight] = useState("");
  const [savings, setSavings] = useState("");
  const [bench, setBench] = useState("");
  const [squat, setSquat] = useState("");
  const [deadlift, setDeadlift] = useState("");

  useEffect(() => {
    loadWeeklyData();
    checkLock();
  }, [weekStart]);

  const checkLock = async () => {
    const { data } = await supabase
      .from("locked_weeks")
      .select("*")
      .eq("week_start", weekStart)
      .single();

    setIsLocked(!!data);
  };

  const loadWeeklyData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("week_start", weekStart)
      .single();

    if (data) {
      setWeight(data.weight || "");
      setSavings(data.savings || "");
      setBench(data.bench || "");
      setSquat(data.squat || "");
      setDeadlift(data.deadlift || "");
    }
  };

  const handleSaveWeekly = async () => {
    if (isLocked) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const benchRatio =
      weight && bench ? Number(bench) / Number(weight) : 0;
    const squatRatio =
      weight && squat ? Number(squat) / Number(weight) : 0;
    const deadliftRatio =
      weight && deadlift ? Number(deadlift) / Number(weight) : 0;

    const { error } = await supabase
      .from("weekly_entries")
      .upsert(
        {
          user_id: userData.user.id,
          week_start: weekStart,
          weight: Number(weight) || 0,
          savings: Number(savings) || 0,
          bench: Number(bench) || 0,
          squat: Number(squat) || 0,
          deadlift: Number(deadlift) || 0,
          bench_ratio: benchRatio,
          squat_ratio: squatRatio,
          deadlift_ratio: deadliftRatio
        },
        { onConflict: "user_id,week_start" }
      );

    if (error) {
      alert("Error saving weekly data");
      return;
    }

    alert("Weekly data saved");
  };

  return (
    <div className="card">
      <h2>📆 Weekly Stats</h2>
      <p>Week Starting: {weekStart}</p>

      {isLocked && (
        <p style={{ color: "#38bdf8" }}>
          🔒 This week is locked. Editing disabled.
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "20px",
          maxWidth: "400px"
        }}
      >
        <div>
          <label>Body Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            disabled={isLocked}
          />
        </div>

        <div>
          <label>Money Saved This Week (₹)</label>
          <input
            type="number"
            value={savings}
            onChange={e => setSavings(e.target.value)}
            disabled={isLocked}
          />
        </div>

        <div>
          <label>Bench PR (kg)</label>
          <input
            type="number"
            value={bench}
            onChange={e => setBench(e.target.value)}
            disabled={isLocked}
          />
        </div>

        <div>
          <label>Squat PR (kg)</label>
          <input
            type="number"
            value={squat}
            onChange={e => setSquat(e.target.value)}
            disabled={isLocked}
          />
        </div>

        <div>
          <label>Deadlift PR (kg)</label>
          <input
            type="number"
            value={deadlift}
            onChange={e => setDeadlift(e.target.value)}
            disabled={isLocked}
          />
        </div>

        <button
          onClick={handleSaveWeekly}
          disabled={isLocked}
          className="primary"
          style={{ marginTop: "10px" }}
        >
          Save Weekly Data
        </button>
      </div>
    </div>
  );
}