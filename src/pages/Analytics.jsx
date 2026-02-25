import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const GOAL = 1000000;
const TOTAL_HABITS = 10;

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Analytics() {
  const [weeklyCompletion, setWeeklyCompletion] = useState([]);
  const [monthlyScore, setMonthlyScore] = useState(0);
  const [yearlyScore, setYearlyScore] = useState(0);

  const [totalSaved, setTotalSaved] = useState(0);
  const [financeData, setFinanceData] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const userId = userData.user.id;

    // -------- DAILY ENTRIES --------
    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", userId)
      .order("entry_date", { ascending: true });

    if (!daily) return;

    const weeklyMap = {};
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    let monthlyCompleted = 0;
    let monthlyDays = 0;
    let yearlyCompleted = 0;
    let yearlyDays = 0;

    daily.forEach(entry => {
      const entryDate = new Date(entry.entry_date);

      const weekStart = getStartOfWeek(entryDate)
        .toISOString()
        .split("T")[0];

      if (!weeklyMap[weekStart]) {
        weeklyMap[weekStart] = {
          week: weekStart,
          completed: 0,
          total: 0
        };
      }

      const completed = Object.values(entry.habits || {})
        .filter(v => v === true).length;

      weeklyMap[weekStart].completed += completed;
      weeklyMap[weekStart].total += TOTAL_HABITS;

      if (entryDate >= monthStart) {
        monthlyCompleted += completed;
        monthlyDays++;
      }

      if (entryDate >= yearStart) {
        yearlyCompleted += completed;
        yearlyDays++;
      }
    });

    const formattedCompletion = Object.values(weeklyMap).map(w => ({
      week: w.week,
      completion: w.total
        ? ((w.completed / w.total) * 100).toFixed(1)
        : 0
    }));

    setWeeklyCompletion(formattedCompletion);

    setMonthlyScore(
      monthlyDays
        ? ((monthlyCompleted / (TOTAL_HABITS * monthlyDays)) * 100).toFixed(1)
        : 0
    );

    setYearlyScore(
      yearlyDays
        ? ((yearlyCompleted / (TOTAL_HABITS * yearlyDays)) * 100).toFixed(1)
        : 0
    );

    // -------- WEEKLY FINANCE --------
    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", userId)
      .order("week_start", { ascending: true });

    if (!weekly) return;

    let total = 0;

    const financeFormatted = weekly.map(w => {
      total += w.savings || 0;
      return {
        week: w.week_start,
        savings: total
      };
    });

    setTotalSaved(total);
    setFinanceData(financeFormatted);
  };

  const progressPercent = ((totalSaved / GOAL) * 100).toFixed(1);
  const remaining = GOAL - totalSaved;

  return (
    <div className="card">
      <h2>📊 Performance Analytics</h2>

      <h3>Consistency Scores</h3>
      <p>Monthly Consistency: {monthlyScore}%</p>
      <p>Yearly Discipline Score: {yearlyScore}%</p>

      <h3 style={{ marginTop: "30px" }}>
        💰 10 Lakh Goal Progress
      </h3>

      <p>Total Saved: ₹{totalSaved}</p>
      <p>Progress: {progressPercent}%</p>
      <p>Remaining: ₹{remaining}</p>

      <div
        style={{
          background: "#1e293b",
          height: "20px",
          borderRadius: "10px",
          marginBottom: "20px"
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            background: "#38bdf8",
            height: "100%",
            borderRadius: "10px"
          }}
        />
      </div>

      <h3>Weekly Habit Completion (%)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={weeklyCompletion}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="linear" dataKey="completion" stroke="#38bdf8" />
        </LineChart>
      </ResponsiveContainer>

      <h3 style={{ marginTop: "40px" }}>
        Weekly Savings Growth
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={financeData}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Line type="linear" dataKey="savings" stroke="#22c55e" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}