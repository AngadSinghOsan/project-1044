import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export default function Weekly({ user }) {
  const weekStart = getStartOfWeek(new Date());
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const [data, setData] = useState({
    weight: "",
    savings: "",
    bench: "",
    squat: "",
    deadlift: "",
    run_time: "",
    new_skill: false,
    locked: false
  });

  useEffect(() => {
    loadWeek();
  }, []);

  const loadWeek = async () => {
    const { data: row } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .maybeSingle();

    if (row) {
      setData({
        weight: row.weight ?? "",
        savings: row.savings ?? "",
        bench: row.bench ?? "",
        squat: row.squat ?? "",
        deadlift: row.deadlift ?? "",
        run_time: row.run_time ?? "",
        new_skill: row.new_skill ?? false,
        locked: row.locked ?? false
      });
    }
  };

  const toNumber = (v) => (v === "" ? 0 : Number(v));

  const saveWeek = async () => {
    if (data.locked) {
      alert("Week is locked.");
      return;
    }

    await supabase.from("weekly_entries").upsert(
      {
        user_id: user.id,
        week_start: weekStartStr,
        weight: toNumber(data.weight),
        savings: toNumber(data.savings),
        bench: toNumber(data.bench),
        squat: toNumber(data.squat),
        deadlift: toNumber(data.deadlift),
        run_time: data.run_time || null,
        new_skill: data.new_skill,
        locked: data.locked
      },
      { onConflict: "user_id,week_start" }
    );

    alert("Weekly Saved");
  };

  const calculateWinners = async () => {
    await supabase
      .from("competition_results")
      .delete()
      .eq("week_start", weekStartStr);

    const { data: weeklyUsers } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("week_start", weekStartStr);

    const { data: dailyEntries } = await supabase
      .from("daily_entries")
      .select("*")
      .gte("entry_date", weekStartStr)
      .lte("entry_date", weekEndStr);

    if (!weeklyUsers) return;

    const categories = [];

    // GYM SESSIONS
    const gymMap = {};
    weeklyUsers.forEach(u => gymMap[u.user_id] = 0);

    dailyEntries?.forEach(d => {
      if (d.habits?.gym_done) {
        gymMap[d.user_id] += 1;
      }
    });

    categories.push({ name: "gym", scores: gymMap });

    // STEPS
    const stepMap = {};
    weeklyUsers.forEach(u => stepMap[u.user_id] = 0);

    dailyEntries?.forEach(d => {
      stepMap[d.user_id] += d.steps || 0;
    });

    categories.push({ name: "steps", scores: stepMap });

    // STRENGTH
    ["bench", "squat", "deadlift"].forEach(cat => {
      const map = {};
      weeklyUsers.forEach(u => {
        const lift = u[cat] || 0;
        const weight = u.weight || 0;
        map[u.user_id] = (lift > 0 && weight > 0) ? lift / weight : 0;
      });
      categories.push({ name: cat, scores: map });
    });

    const medals = ["gold", "silver", "bronze"];

    for (let category of categories) {
      const sorted = Object.entries(category.scores)
        .sort((a, b) => b[1] - a[1]);

      if (sorted.length === 0 || sorted[0][1] === 0) {
        continue;
      }

      let medalIndex = 0;
      let lastScore = null;

      for (let i = 0; i < sorted.length && medalIndex < 3; i++) {
        const [user_id, score] = sorted[i];

        if (score === 0) break;

        if (lastScore !== null && score !== lastScore) {
          medalIndex++;
        }

        if (medalIndex >= 3) break;

        await supabase.from("competition_results").insert({
          user_id,
          week_start: weekStartStr,
          category: category.name,
          position: medals[medalIndex]
        });

        lastScore = score;
      }
    }
  };

  const toggleLock = async () => {
    if (user.role !== "admin") return;

    const newLock = !data.locked;

    await supabase
      .from("weekly_entries")
      .update({ locked: newLock })
      .eq("week_start", weekStartStr);

    setData({ ...data, locked: newLock });

    if (newLock) {
      await calculateWinners();
    }
  };

  return (
    <div className="card">
      <h2>Weekly Entry</h2>

      {data.locked && <p style={{ color: "#f87171" }}>🔒 Locked</p>}

      <label>Weight</label>
      <input type="number" disabled={data.locked}
        value={data.weight}
        onChange={(e) => setData({ ...data, weight: e.target.value })}
      />

      <label>Savings</label>
      <input type="number" disabled={data.locked}
        value={data.savings}
        onChange={(e) => setData({ ...data, savings: e.target.value })}
      />

      <label>Bench </label>
      <input type="number" disabled={data.locked}
        value={data.bench}
        onChange={(e) => setData({ ...data, bench: e.target.value })}
      />

      <label>Squat </label>
      <input type="number" disabled={data.locked}
        value={data.squat}
        onChange={(e) => setData({ ...data, squat: e.target.value })}
      />

      <label>Deadlift </label>
      <input type="number" disabled={data.locked}
        value={data.deadlift}
        onChange={(e) => setData({ ...data, deadlift: e.target.value })}
      />

      <label>1KM Run Time</label>
      <input disabled={data.locked}
        value={data.run_time}
        onChange={(e) => setData({ ...data, run_time: e.target.value })}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
        <span>New Skill Learned</span>
        <input type="checkbox"
          disabled={data.locked}
          checked={data.new_skill}
          onChange={() => setData({ ...data, new_skill: !data.new_skill })}
        />
      </div>

      <button className="primary" disabled={data.locked} onClick={saveWeek}>
        Save Weekly
      </button>

      {user.role === "admin" && (
        <button className="secondary" onClick={toggleLock}>
          {data.locked ? "Unlock Week" : "Lock Week"}
        </button>
      )}
    </div>
  );
}