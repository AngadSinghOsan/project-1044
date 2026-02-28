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
      await dbRequest({
        table: "weekly_entries",
        method: "insert",
        payload: {
          user_id: user.id,
          week_start: weekStart,
          weight: Number(weight),
          savings: Number(savings),
          bench: Number(bench),
          squat: Number(squat),
          deadlift: Number(deadlift),
          run_time: runTime,
          new_skill: newSkill,
          locked: false
        }
      });

      alert("Week Saved");
    } catch (err) {
      alert("Error saving weekly data");
      console.error(err.message);
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
      alert("Week Locked");
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Weekly Entry</h2>

      <input
        placeholder="Weight"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />

      <input
        placeholder="Savings"
        value={savings}
        onChange={(e) => setSavings(e.target.value)}
      />

      <input
        placeholder="Bench"
        value={bench}
        onChange={(e) => setBench(e.target.value)}
      />

      <input
        placeholder="Squat"
        value={squat}
        onChange={(e) => setSquat(e.target.value)}
      />

      <input
        placeholder="Deadlift"
        value={deadlift}
        onChange={(e) => setDeadlift(e.target.value)}
      />

      <input
        placeholder="1KM Run Time"
        value={runTime}
        onChange={(e) => setRunTime(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={newSkill}
          onChange={() => setNewSkill(!newSkill)}
        />
        New Skill Learned
      </label>

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