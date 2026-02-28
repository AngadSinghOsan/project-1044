import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Weekly({ user }) {
  const weekStart = getStartOfWeek(new Date())
    .toISOString()
    .split("T")[0];

  const [weight, setWeight] = useState("");
  const [savings, setSavings] = useState("");
  const [bench, setBench] = useState("");
  const [squat, setSquat] = useState("");
  const [deadlift, setDeadlift] = useState("");
  const [runTime, setRunTime] = useState("");
  const [newSkill, setNewSkill] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    loadWeek();
  }, []);

  async function loadWeek() {
    try {
      const data = await dbRequest({
        table: "weekly_entries",
        method: "select",
        filters: [
          { column: "user_id", value: user.id },
          { column: "week_start", value: weekStart }
        ]
      });

      if (data.length > 0) {
        const w = data[0];
        setWeight(w.weight || "");
        setSavings(w.savings || "");
        setBench(w.bench || "");
        setSquat(w.squat || "");
        setDeadlift(w.deadlift || "");
        setRunTime(w.run_time || "");
        setNewSkill(w.new_skill || false);
        setLocked(w.locked || false);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  async function saveWeek() {
    if (locked) {
      alert("This week is locked.");
      return;
    }

    try {
      await supabase
  .from("weekly_entries")
  .upsert({
    user_id: user.id,
    week_start: weekString,
    weight,
    savings,
    bench,
    squat,
    deadlift,
    run_time,
    new_skill
  }, { onConflict: "user_id,week_start" });

      alert("Weekly data saved");
    } catch (err) {
      console.error(err.message);
      alert("Error saving weekly data");
    }
  }

  async function lockWeek() {
    if (user.role !== "admin") return;

    try {
      await dbRequest({
        table: "weekly_entries",
        method: "update",
        payload: {
          data: { locked: true },
          match: {
            user_id: user.id,
            week_start: weekStart
          }
        }
      });

      setLocked(true);
      alert("Week locked");
    } catch (err) {
      console.error(err.message);
    }
  }

  function CheckboxRow({ label, checked, onChange }) {
    return (
      <div className="habit-row">
        <span>{label}</span>
        <input type="checkbox" checked={checked} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Weekly Progress</h2>

      <hr />

      <h3>Body & Finance</h3>

      <label>Weight (kg)</label>
      <input value={weight} onChange={(e) => setWeight(e.target.value)} />

      <label>Money Saved This Week</label>
      <input value={savings} onChange={(e) => setSavings(e.target.value)} />

      <hr />

      <h3>Strength PR</h3>

      <label>Bench Press (kg)</label>
      <input value={bench} onChange={(e) => setBench(e.target.value)} />

      <label>Squat (kg)</label>
      <input value={squat} onChange={(e) => setSquat(e.target.value)} />

      <label>Deadlift (kg)</label>
      <input value={deadlift} onChange={(e) => setDeadlift(e.target.value)} />

      <label>1KM Run Time (minutes)</label>
      <input value={runTime} onChange={(e) => setRunTime(e.target.value)} />

      <hr />

      <h3>Growth</h3>

      <CheckboxRow
        label="New Skill Learned"
        checked={newSkill}
        onChange={() => setNewSkill(!newSkill)}
      />

      <button className="primary" onClick={saveWeek}>
        Save Week
      </button>

      {user.role === "admin" && (
        <button className="secondary" onClick={lockWeek}>
          Lock Week
        </button>
      )}

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}