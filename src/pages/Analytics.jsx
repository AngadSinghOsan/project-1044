import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Analytics({ user }) {
  const [lifetimeSavings, setLifetimeSavings] = useState(0);
  const [weeklyCompletion, setWeeklyCompletion] = useState(0);
  const [monthlyCompletion, setMonthlyCompletion] = useState(0);
  const [totalGymSessions, setTotalGymSessions] = useState(0);
  const [pr, setPr] = useState({
    bench: 0,
    squat: 0,
    deadlift: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: weeklyData } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id);

    let totalSaved = 0;
    let maxBench = 0;
    let maxSquat = 0;
    let maxDeadlift = 0;

    weeklyData?.forEach(w => {
      totalSaved += w.savings || 0;
      maxBench = Math.max(maxBench, w.bench || 0);
      maxSquat = Math.max(maxSquat, w.squat || 0);
      maxDeadlift = Math.max(maxDeadlift, w.deadlift || 0);
    });

    setLifetimeSavings(totalSaved);
    setPr({
      bench: maxBench,
      squat: maxSquat,
      deadlift: maxDeadlift
    });

    const { data: dailyData } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id);

    if (!dailyData) return;

    const weekStart = getStartOfWeek(new Date())
      .toISOString()
      .split("T")[0];

    const weeklyDays = dailyData.filter(
      d => d.entry_date >= weekStart
    );

    const weeklyTotalHabits = weeklyDays.length * 10;
    let weeklyCompleted = 0;

    weeklyDays.forEach(d => {
      Object.values(d.habits || {}).forEach(v => {
        if (v === true) weeklyCompleted++;
      });
    });

    setWeeklyCompletion(
      weeklyTotalHabits > 0
        ? Math.round((weeklyCompleted / weeklyTotalHabits) * 100)
        : 0
    );

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthlyDays = dailyData.filter(d => {
      const date = new Date(d.entry_date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const monthlyTotalHabits = monthlyDays.length * 10;
    let monthlyCompleted = 0;

    monthlyDays.forEach(d => {
      Object.values(d.habits || {}).forEach(v => {
        if (v === true) monthlyCompleted++;
      });
    });

    setMonthlyCompletion(
      monthlyTotalHabits > 0
        ? Math.round((monthlyCompleted / monthlyTotalHabits) * 100)
        : 0
    );

    let gymCount = 0;
    dailyData.forEach(d => {
      if (d.habits?.gym_done) gymCount++;
    });

    setTotalGymSessions(gymCount);
  };

  const savingsPercent = Math.min(
    Math.round((lifetimeSavings / 1000000) * 100),
    100
  );

  const projectDays = 1044;
  const startDate = new Date("2026-03-05");
  const today = new Date();

  let daysPassed = Math.floor(
    (today - startDate) / (1000 * 60 * 60 * 24)
  );

  if (daysPassed < 0) daysPassed = 0;

  const timePercent = Math.min(
    Math.round((daysPassed / projectDays) * 100),
    100
  );

  return (
    <div className="card">
      <h2>Analytics</h2>

      {/* ---------- PERSONAL GROWTH ---------- */}
      <h3>Personal Growth</h3>

      <p>₹ {lifetimeSavings} / ₹ 10,00,000</p>
      <div style={{ background: "#334155", height: "10px", borderRadius: "5px" }}>
        <div
          style={{
            width: `${savingsPercent}%`,
            background: "#38bdf8",
            height: "10px",
            borderRadius: "5px"
          }}
        />
      </div>

      <p style={{ marginTop: "10px" }}>
        Project Progress: {timePercent}%
      </p>
      <div style={{ background: "#334155", height: "10px", borderRadius: "5px" }}>
        <div
          style={{
            width: `${timePercent}%`,
            background: "#22c55e",
            height: "10px",
            borderRadius: "5px"
          }}
        />
      </div>

      <hr style={{ margin: "25px 0", borderColor: "#334155" }} />

      {/* ---------- DISCIPLINE ---------- */}
      <h3>Discipline</h3>
      <p>Weekly Habit Completion: {weeklyCompletion}%</p>
      <p>Monthly Habit Completion: {monthlyCompletion}%</p>
      <p>Total Gym Sessions: {totalGymSessions}</p>

      <hr style={{ margin: "25px 0", borderColor: "#334155" }} />

      {/* ---------- PERSONAL RECORDS ---------- */}
      <h3>Personal Records</h3>
      <p>Bench PR: {pr.bench} kg</p>
      <p>Squat PR: {pr.squat} kg</p>
      <p>Deadlift PR: {pr.deadlift} kg</p>
    </div>
  );
}