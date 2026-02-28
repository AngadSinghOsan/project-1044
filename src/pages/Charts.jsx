import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList
} from "recharts";

export default function Charts({ user }) {
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const weekly = await dbRequest({
        table: "weekly_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      const daily = await dbRequest({
        table: "daily_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      setWeeklyData(weekly);
      setDailyData(daily);
    } catch (err) {
      console.error(err.message);
    }
  }

  const weightData = weeklyData.map(w => ({
    week: w.week_start,
    weight: w.weight
  }));

  const savingsData = weeklyData.map(w => ({
    week: w.week_start,
    savings: w.savings
  }));

  const strengthData = weeklyData.map(w => ({
    week: w.week_start,
    bench: w.bench,
    squat: w.squat,
    deadlift: w.deadlift
  }));

  const moneyWastedByWeek = dailyData.reduce((acc, d) => {
    const week = d.entry_date;
    acc[week] = (acc[week] || 0) + (d.money_wasted || 0);
    return acc;
  }, {});

  const wastedData = Object.keys(moneyWastedByWeek).map(date => ({
    week: date,
    wasted: moneyWastedByWeek[date]
  }));

  const lineProps = {
    type: "linear",
    dot: { r: 4 },
    activeDot: false,
    isAnimationActive: false,
    strokeWidth: 3
  };

  return (
    <div className="card">
      <h2>Charts</h2>

      <h3>Weight Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={weightData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Line {...lineProps} dataKey="weight" stroke="#00ffcc">
            <LabelList dataKey="weight" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>

      <h3>Savings Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={savingsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Line {...lineProps} dataKey="savings" stroke="#8884d8">
            <LabelList dataKey="savings" position="top" />
          </Line>
        </LineChart>
      </ResponsiveContainer>

      <h3>Strength Progress</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={strengthData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Line {...lineProps} dataKey="bench" stroke="#ff7300" />
          <Line {...lineProps} dataKey="squat" stroke="#387908" />
          <Line {...lineProps} dataKey="deadlift" stroke="#d84f57" />
        </LineChart>
      </ResponsiveContainer>

      <h3>Money Wasted</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={wastedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Line {...lineProps} dataKey="wasted" stroke="#ff4d4f" />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}