import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList
} from "recharts";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Charts() {
  const [weeklyData, setWeeklyData] = useState([]);
  const [wastedData, setWastedData] = useState([]);
  const [stepsData, setStepsData] = useState([]);

  useEffect(() => {
    const loadCharts = async () => {
      const { data: userData } = await user.id;
      if (!userData.user) return;

      const userId = userData.user.id;

      // -------- WEEKLY ENTRIES --------
      const { data: weekly } = await supabase
        .from("weekly_entries")
        .select("*")
        .eq("user_id", userId)
        .order("week_start", { ascending: true });

      if (weekly) {
        const formatted = weekly.map(w => ({
          week: w.week_start,
          weight: w.weight || 0,
          savings: w.savings || 0,
          bench: w.bench || 0,
          squat: w.squat || 0,
          deadlift: w.deadlift || 0
        }));

        setWeeklyData(formatted);
      }

      // -------- DAILY ENTRIES --------
      const { data: daily } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", userId)
        .order("entry_date", { ascending: true });

      if (!daily) return;

      const wasteMap = {};
      const stepsMap = {};

      daily.forEach(entry => {
        const weekStart = getStartOfWeek(
          new Date(entry.entry_date)
        )
          .toISOString()
          .split("T")[0];

        if (!wasteMap[weekStart]) wasteMap[weekStart] = 0;
        if (!stepsMap[weekStart]) stepsMap[weekStart] = 0;

        wasteMap[weekStart] += entry.money_wasted || 0;
        stepsMap[weekStart] += entry.habits?.Steps || 0;
      });

      const wasteArray = Object.entries(wasteMap)
        .map(([week, amount]) => ({
          week,
          wasted: amount
        }))
        .sort((a, b) => new Date(a.week) - new Date(b.week));

      const stepsArray = Object.entries(stepsMap)
        .map(([week, total]) => ({
          week,
          steps: total
        }))
        .sort((a, b) => new Date(a.week) - new Date(b.week));

      setWastedData(wasteArray);
      setStepsData(stepsArray);
    };

    loadCharts();
  }, []);

  const commonLineProps = {
    type: "linear",
    dot: { r: 4 },
    activeDot: false,
    isAnimationActive: false,
    strokeWidth: 3
  };

  return (
    <div>

      {/* Weight */}
      <div className="card">
        <h2>⚖️ Weight Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData} cursor={false}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Line {...commonLineProps} dataKey="weight">
              <LabelList dataKey="weight" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Savings */}
      <div className="card">
        <h2>💰 Savings Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData} cursor={false}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Line {...commonLineProps} dataKey="savings">
              <LabelList dataKey="savings" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Strength */}
      <div className="card">
        <h2>🏋️ Strength Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData} cursor={false}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Legend />
            <Line {...commonLineProps} dataKey="deadlift" />
            <Line {...commonLineProps} dataKey="squat" />
            <Line {...commonLineProps} dataKey="bench" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Steps */}
      <div className="card">
        <h2>👣 Weekly Steps</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stepsData} cursor={false}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Line {...commonLineProps} dataKey="steps">
              <LabelList dataKey="steps" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Money Wasted */}
      <div className="card">
        <h2>💸 Money Wasted Per Week</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={wastedData} cursor={false}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Line {...commonLineProps} dataKey="wasted">
              <LabelList dataKey="wasted" position="top" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}