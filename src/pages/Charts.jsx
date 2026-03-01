import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Charts({ user }) {

  const [weekly, setWeekly] = useState([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("week_start");

    setWeekly(data || []);
  }

  const labels = weekly.map(w => w.week_start);

  const moneyData = {
    labels,
    datasets: [
      {
        label: "Money Saved",
        data: weekly.map(w => w.savings),
        borderColor: "green",
        backgroundColor: "green"
      }
    ]
  };

  const weightData = {
    labels,
    datasets: [
      {
        label: "Weight",
        data: weekly.map(w => w.weight),
        borderColor: "blue",
        backgroundColor: "blue"
      }
    ]
  };

  const strengthData = {
    labels,
    datasets: [
      {
        label: "Bench",
        data: weekly.map(w => w.bench),
        borderColor: "red"
      },
      {
        label: "Squat",
        data: weekly.map(w => w.squat),
        borderColor: "purple"
      },
      {
        label: "Deadlift",
        data: weekly.map(w => w.deadlift),
        borderColor: "orange"
      }
    ]
  };

  return (
    <div className="card">
      <h2>Charts</h2>

      <h3>Money Growth</h3>
      <Line data={moneyData} />

      <hr />

      <h3>Weight Progress</h3>
      <Line data={weightData} />

      <hr />

      <h3>Strength Progress</h3>
      <Line data={strengthData} />

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}