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
  const [saving, setSaving] = useState(false);

  const [habits, setHabits] = useState({
    wakeUp: false,
    noJunk: false,
    screenControl: false,
    learning: false,
    gym: false,
    calorieTarget: false,
    proteinTarget: false,
    businessWork: false,
    contentPosted: false
  });

  const [steps, setSteps] = useState(0);
  const [moneyWasted, setMoneyWasted] = useState(0);

  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dailyScore, setDailyScore] = useState(0);

  useEffect(() => {
    checkLock();
    loadDay();
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

  const loadDay = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userData.user.id)
      .eq("entry_date", selectedDate)
      .single();

    if (data) {
      setHabits(data.habits || habits);
      setSteps(data.steps || 0);
      setMoneyWasted(data.money_wasted || 0);
    }
  };

  const calculateDailyScore = (updatedHabits) => {
    const completed = Object.values(updatedHabits).filter(Boolean).length;
    const score = ((completed / TOTAL_HABITS) * 100).toFixed(1);
    setDailyScore(score);
    return score;
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

    let current = 0;
    let max = 0;
    let temp = 0;

    data.forEach(entry => {
      const completed = Object.values(entry.habits || {}).filter(Boolean).length;
      const score = (completed / TOTAL_HABITS) * 100;

      if (score >= SUCCESS_THRESHOLD) {
        temp++;
        if (temp > max) max = temp;
      } else {
        temp = 0;
      }
    });

    for (let i = data.length - 1; i >= 0; i--) {
      const completed = Object.values(data[i].habits || {}).filter(Boolean).length;
      const score = (completed / TOTAL_HABITS) * 100;

      if (score >= SUCCESS_THRESHOLD) {
        current++;
      } else {
        break;
      }
    }

    setStreak(current);
    setLongestStreak(max);
  };

  const handleCheckbox = (key) => {
    const updated = { ...habits, [key]: !habits[key] };
    setHabits(updated);
    calculateDailyScore(updated);
  };

  const handleSave = async () => {
    if (isLocked) return;

    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    await supabase.from("daily_entries").upsert(
      {
        user_id: userData.user.id,
        entry_date: selectedDate,
        habits,
        steps,
        money_wasted: moneyWasted
      },
      { onConflict: "user_id,entry_date" }
    );

    calculateStreak();
    setSaving(false);
    alert("Day saved");
  };

  const stepOptions = [];
  for (let i = 0; i <= 20000; i += 500) {
    stepOptions.push(i);
  }

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>📅 Daily Dashboard</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        disabled={isLocked}
      />

      {isLocked && (
        <p style={{ color: "#38bdf8" }}>🔒 This week is locked</p>
      )}

      <div style={{ marginTop: "20px" }}>
        {Object.keys(habits).map((key) => (
          <div key={key}>
            <label>
              <input
                type="checkbox"
                checked={habits[key]}
                disabled={isLocked}
                onChange={() => handleCheckbox(key)}
              />
              {" "}
              {key}
            </label>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Steps:</label>
        <select
          value={steps}
          disabled={isLocked}
          onChange={(e) => setSteps(Number(e.target.value))}
        >
          {stepOptions.map((step) => (
            <option key={step} value={step}>
              {step}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Money Wasted (₹)</label>
        <input
          type="number"
          value={moneyWasted}
          disabled={isLocked}
          onChange={(e) => setMoneyWasted(Number(e.target.value))}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>Daily Score: {dailyScore}%</p>
        <p>🔥 Current Streak: {streak} days</p>
        <p>🏆 Longest Streak: {longestStreak} days</p>
      </div>

      <button
        className="primary"
        onClick={handleSave}
        disabled={isLocked || saving}
        style={{ marginTop: "20px" }}
      >
        Save Day
      </button>
    </div>
  );
}