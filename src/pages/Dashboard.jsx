import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

export default function Dashboard({ user }) {
  const today = new Date().toISOString().split("T")[0];

  const [habits, setHabits] = useState({
    wake_up: false,
    no_junk: false,
    screen_control: false,
    learning_30: false,
    gym: false,
    calorie_target: false,
    protein_target: false,
    business_work: false,
    content_posted: false
  });

  const [steps, setSteps] = useState(0);
  const [moneyWasted, setMoneyWasted] = useState(0);

  useEffect(() => {
    loadToday();
  }, []);

  async function loadToday() {
    try {
      const data = await dbRequest({
        table: "daily_entries",
        method: "select",
        filters: [
          { column: "user_id", value: user.id },
          { column: "entry_date", value: today }
        ]
      });

      if (data.length > 0) {
        setHabits(data[0].habits || habits);
        setSteps(data[0].steps || 0);
        setMoneyWasted(data[0].money_wasted || 0);
      }
    } catch (err) {
      console.error("Load error:", err.message);
    }
  }

  async function saveDay() {
    try {
      await dbRequest({
        table: "daily_entries",
        method: "insert",
        payload: {
          user_id: user.id,
          entry_date: today,
          habits,
          steps: Number(steps),
          money_wasted: Number(moneyWasted)
        }
      });

      alert("Day Saved");
    } catch (err) {
      console.error(err.message);
      alert("Error saving day");
    }
  }

  function toggleHabit(key) {
    setHabits(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  return (
    <div className="card">
      <h2>Daily Dashboard</h2>

      <div className="habit-list">
        {Object.keys(habits).map(key => (
          <div className="habit-row" key={key}>
            <label>{key.replace("_", " ").toUpperCase()}</label>
            <input
              type="checkbox"
              checked={habits[key]}
              onChange={() => toggleHabit(key)}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Steps</label>
        <input
          type="number"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Money Wasted</label>
        <input
          type="number"
          value={moneyWasted}
          onChange={(e) => setMoneyWasted(e.target.value)}
        />
      </div>

      <button
        className="primary"
        style={{ marginTop: 20 }}
        onClick={saveDay}
      >
        Save Day
      </button>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}