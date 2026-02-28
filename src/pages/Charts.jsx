import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function Charts({ user }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start", { ascending: true });

    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("entry_date", { ascending: true });

    setWeeklyData(weekly || []);
    setDailyData(daily || []);
  };

  const wastedByWeek = {};

  dailyData.forEach((d) => {
    const date = new Date(d.entry_date);
    const weekStart = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    weekStart.setDate(diff);
    const key = weekStart.toISOString().split("T")[0];

    if (!wastedByWeek[key]) wastedByWeek[key] = 0;
    wastedByWeek[key] += d.money_wasted || 0;
  });

  const wastedArray = Object.keys(wastedByWeek).map((k) => ({
    week: k,
    wasted: wastedByWeek[k]
  }));

  return (
    <div className="card">
      <h2>Charts</h2>

      <h3>Weight Progress</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week_start" />
          <YAxis />
          <Line type="monotone" dataKey="weight" stroke="#38bdf8" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Savings Growth</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week_start" />
          <YAxis />
          <Line type="monotone" dataKey="savings" stroke="#22c55e" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Strength Progress</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={weeklyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week_start" />
          <YAxis />
          <Legend />
          <Line type="monotone" dataKey="bench" stroke="#f97316" />
          <Line type="monotone" dataKey="squat" stroke="#eab308" />
          <Line type="monotone" dataKey="deadlift" stroke="#ef4444" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Money Wasted</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={wastedArray}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Line type="monotone" dataKey="wasted" stroke="#ef4444" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}