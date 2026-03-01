import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Dashboard({ user }) {

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [steps, setSteps] = useState(0);
  const [moneyWasted, setMoneyWasted] = useState(0);

  const [habits, setHabits] = useState({
    wake_up: false,
    no_junk: false,
    screen_control: false,
    learning_30: false,
    gym: false,
    calorie_target: false,
    protein_target: false,
    business_work: false,
    content_posted: false,
  });

  useEffect(() => { loadDay(); }, [selectedDate]);

  async function loadDay() {
    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .maybeSingle();

    if (data) {
      setHabits(data.habits || habits);
      setSteps(data.steps || 0);
      setMoneyWasted(data.money_wasted || 0);
    } else {
      setSteps(0);
      setMoneyWasted(0);
    }
  }

  async function saveDay() {
    const { error } = await supabase
      .from("daily_entries")
      .upsert({
        user_id: user.id,
        entry_date: selectedDate,
        habits,
        steps: Number(steps),
        money_wasted: Number(moneyWasted)
      }, { onConflict: "user_id,entry_date" });

    if (error) alert("Error saving day");
    else alert("Day Saved");
  }

  function toggleHabit(key) {
    setHabits({ ...habits, [key]: !habits[key] });
  }

  function HabitRow({ label, keyName }) {
    return (
      <div className="habit-row">
        <span>{label}</span>
        <input
          type="checkbox"
          checked={habits[keyName]}
          onChange={() => toggleHabit(keyName)}
        />
      </div>
    );
  }

  const stepOptions = [];
  for (let i = 0; i <= 20000; i += 500) {
    stepOptions.push(i);
  }

  return (
    <div className="card">
      <h2>Daily Dashboard</h2>

      <label>Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <hr />

      <h3>Discipline</h3>
      <HabitRow label="Wake Up On Time" keyName="wake_up" />
      <HabitRow label="No Junk Food" keyName="no_junk" />
      <HabitRow label="Screen Control" keyName="screen_control" />
      <HabitRow label="30 Minutes Learning" keyName="learning_30" />

      <hr />

      <h3>Fitness</h3>
      <HabitRow label="Gym Session Completed" keyName="gym" />

      <div className="habit-row">
        <span>Steps</span>
        <select value={steps} onChange={(e)=>setSteps(e.target.value)}>
          {stepOptions.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>

      <HabitRow label="Calorie Target Achieved" keyName="calorie_target" />
      <HabitRow label="Protein Target Achieved" keyName="protein_target" />

      <hr />

      <h3>Finance</h3>
      <div className="habit-row">
        <span>Money Wasted (₹)</span>
        <input
          type="number"
          min="0"
          value={moneyWasted}
          onChange={(e)=>setMoneyWasted(e.target.value)}
        />
      </div>

      <hr />

      <h3>Growth</h3>
      <HabitRow label="Business Work Done" keyName="business_work" />
      <HabitRow label="Content Posted" keyName="content_posted" />

      <button className="primary" onClick={saveDay}>
        Save Day
      </button>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}