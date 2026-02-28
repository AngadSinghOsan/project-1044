import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

export default function Dashboard({ user }) {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  const emptyHabits = {
    wake_up: false,
    no_junk: false,
    screen_control: false,
    learning_30: false,
    gym: false,
    steps_10k: false,
    calorie_target: false,
    protein_target: false,
    business_work: false,
    content_posted: false,
  };

  const [habits, setHabits] = useState(emptyHabits);

  useEffect(() => {
    loadDay();
  }, [selectedDate]);

  async function loadDay() {
    try {
      const data = await dbRequest({
        table: "daily_entries",
        action: "select",   // ✅ FIXED
        filters: [
          { column: "user_id", value: user.id },
          { column: "entry_date", value: selectedDate }
        ]
      });

      if (data && data.length > 0) {
        setHabits(data[0].habits || emptyHabits);
      } else {
        setHabits(emptyHabits);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

 async function saveDay() {
  const { error } = await supabase
    .from("daily_entries")
    .upsert({
      user_id: user.id,
      entry_date: selectedDate,
      habits,
      money_wasted: 0,
      steps: 0,
      completed: true
    }, { onConflict: "user_id,entry_date" });

  if (error) {
    alert("Error saving day");
  } else {
    alert("Saved");
  }
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

      <h3>Discipline Habits</h3>
      <HabitRow label="Wake Up On Time" keyName="wake_up" />
      <HabitRow label="No Junk Food" keyName="no_junk" />
      <HabitRow label="Screen Control" keyName="screen_control" />
      <HabitRow label="30 Minutes Learning" keyName="learning_30" />

      <hr />

      <h3>Fitness</h3>
      <HabitRow label="Gym Session Completed" keyName="gym" />
      <HabitRow label="10,000 Steps Completed" keyName="steps_10k" />
      <HabitRow label="Calorie Target Achieved" keyName="calorie_target" />
      <HabitRow label="Protein Target Achieved" keyName="protein_target" />

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