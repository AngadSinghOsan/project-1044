import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const TOTAL_HABITS = 10;

export default function Dashboard() {
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
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

  const habitLabels = {
    wakeUp: "Wake Up On Time",
    noJunk: "No Junk Food",
    screenControl: "Screen Control",
    learning: "30 Min Learning",
    gym: "Gym",
    calorieTarget: "Calorie Target Hit",
    proteinTarget: "Protein Target Hit",
    businessWork: "Business Work Done",
    contentPosted: "Content Posted"
  };

  const handleCheckbox = (key) => {
    setHabits({ ...habits, [key]: !habits[key] });
  };

  const stepOptions = [];
  for (let i = 0; i <= 20000; i += 500) {
    stepOptions.push(i);
  }

  return (
    <div className="card">
      <h2>Daily Dashboard</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <div style={{ marginTop: "20px" }}>
        {Object.keys(habits).map((key) => (
          <div key={key} className="habit-row">
            <input
              type="checkbox"
              checked={habits[key]}
              onChange={() => handleCheckbox(key)}
            />
            <span>{habitLabels[key]}</span>
          </div>
        ))}
      </div>

      <label>Steps</label>
      <select value={steps} onChange={(e) => setSteps(Number(e.target.value))}>
        {stepOptions.map((step) => (
          <option key={step} value={step}>{step}</option>
        ))}
      </select>

      <label>Money Wasted (₹)</label>
      <input
        type="number"
        value={moneyWasted}
        onChange={(e) => setMoneyWasted(Number(e.target.value))}
      />

      <button className="primary">Save Day</button>
    </div>
  );
}