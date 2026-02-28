import { useState } from "react";
import { supabase } from "../supabase";

export default function Weekly({ user }) {
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekKey = weekStart.toISOString().split("T")[0];

  const [bench, setBench] = useState("");
  const [squat, setSquat] = useState("");
  const [deadlift, setDeadlift] = useState("");
  const [weight, setWeight] = useState("");
  const [savings, setSavings] = useState("");
  const [newSkill, setNewSkill] = useState(false);

  async function saveWeek() {
    const { error } = await supabase
      .from("weekly_entries")
      .upsert({
        user_id: user.id,
        week_start: weekKey,
        bench: bench || 0,
        squat: squat || 0,
        deadlift: deadlift || 0,
        weight: weight || 0,
        savings: savings || 0,
        new_skill: newSkill
      }, { onConflict: "user_id,week_start" });

    if (error) alert("Error saving weekly data");
    else alert("Weekly Saved");
  }

  return (
    <div className="card">
      <h2>Weekly Entry</h2>

      <input placeholder="Bench PR" value={bench} onChange={(e)=>setBench(e.target.value)} />
      <input placeholder="Squat PR" value={squat} onChange={(e)=>setSquat(e.target.value)} />
      <input placeholder="Deadlift PR" value={deadlift} onChange={(e)=>setDeadlift(e.target.value)} />
      <input placeholder="Weight" value={weight} onChange={(e)=>setWeight(e.target.value)} />
      <input placeholder="Savings Added" value={savings} onChange={(e)=>setSavings(e.target.value)} />

      <div className="habit-row">
        <span>New Skill Learned</span>
        <input type="checkbox" checked={newSkill} onChange={()=>setNewSkill(!newSkill)} />
      </div>

      <button className="primary" onClick={saveWeek}>
        Save Week
      </button>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}