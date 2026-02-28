import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Dashboard({ user }) {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [saving, setSaving] = useState(false);

  const habitLabels = {
    wake_up_on_time: "Wake Up On Time",
    no_junk_food: "No Junk Food",
    screen_control: "Screen Control",
    learning_30_min: "30 Min Learning",
    gym_done: "Gym Completed",
    calorie_target_hit: "Calorie Target Hit",
    protein_target_hit: "Protein Target Hit",
    business_work_done: "Business Work Done",
    content_posted: "Content Posted",
    new_skill_learning: "New Skill Practice"
  };

  const [habits, setHabits] = useState(
    Object.keys(habitLabels).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  );

  const [steps, setSteps] = useState(0);
  const [moneyWasted, setMoneyWasted] = useState(0);

  useEffect(() => {
    loadDay();
  }, [selectedDate]);

  const loadDay = async () => {
    const { data } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .maybeSingle();

    if (data) {
      setHabits({ ...habits, ...(data.habits || {}) });
      setSteps(data.steps || 0);
      setMoneyWasted(data.money_wasted || 0);
    }
  };

  const toggleHabit = (key) => {
    setHabits((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveDay = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("daily_entries")
      .upsert(
        {
          user_id: user.id,
          entry_date: selectedDate,
          habits,
          steps,
          money_wasted: moneyWasted
        },
        { onConflict: "user_id,entry_date" }
      );

    setSaving(false);

    if (error) alert(error.message);
    else alert("Day Saved");
  };

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

      <div style={{ marginTop: "20px" }}>
        {Object.keys(habitLabels).map((key) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid #2a3445"
            }}
          >
            <span>{habitLabels[key]}</span>
            <input
              type="checkbox"
              checked={habits[key]}
              onChange={() => toggleHabit(key)}
              style={{ width: "18px", height: "18px" }}
            />
          </div>
        ))}
      </div>

      <label style={{ marginTop: "20px" }}>Steps</label>
      <select value={steps} onChange={(e) => setSteps(Number(e.target.value))}>
        {stepOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <label>Money Wasted (₹)</label>
      <input
        type="number"
        value={moneyWasted}
        onChange={(e) => setMoneyWasted(Number(e.target.value))}
      />

      <button className="primary" onClick={saveDay} disabled={saving}>
        {saving ? "Saving..." : "Save Day"}
      </button>
    </div>
  );
}