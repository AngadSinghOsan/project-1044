import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const TOTAL_HABITS = 10;
const SUCCESS_THRESHOLD = 70;

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Dashboard() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isLocked, setIsLocked] = useState(false);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);

  useEffect(() => {
    checkLock();
    calculateStreak();
  }, [selectedDate]);

  const checkLock = async () => {
    const weekStart = getStartOfWeek(new Date(selectedDate))
      .toISOString()
      .split("T")[0];

    const { data } = await supabase
      .from("locked_weeks")
      .select("*")
      .eq("week_start", weekStart)
      .single();

    setIsLocked(!!data);
  };

  const calculateStreak = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("entry_date", { ascending: true });

    if (!data) return;

    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = data.length - 1; i >= 0; i--) {
      const entry = data[i];
      const habits = entry.habits || {};

      const completed = Object.values(habits)
        .filter(v => v === true).length;

      const score = (completed / TOTAL_HABITS) * 100;

      if (score >= SUCCESS_THRESHOLD) {
        currentStreak++;
      } else {
        break;
      }
    }

    let tempStreak = 0;
    data.forEach(entry => {
      const habits = entry.habits || {};
      const completed = Object.values(habits)
        .filter(v => v === true).length;
      const score = (completed / TOTAL_HABITS) * 100;

      if (score >= SUCCESS_THRESHOLD) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    setStreak(currentStreak);
    setLongestStreak(maxStreak);
  };

  return (
    <div className="card">
      <h2>📅 Daily Dashboard</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={e => setSelectedDate(e.target.value)}
        disabled={isLocked}
      />

      {isLocked && (
        <p style={{ color: "#38bdf8" }}>
          🔒 This week is locked.
        </p>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>🔥 Streak</h3>
        <p>Current Streak: {streak} days</p>
        <p>Longest Streak: {longestStreak} days</p>
      </div>
    </div>
  );
}