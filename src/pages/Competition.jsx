import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function getCurrentWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  return monday.toISOString().split("T")[0];
}

function rankDescending(data, key) {
  return [...data].sort((a, b) => (b[key] || 0) - (a[key] || 0));
}

function MedalStyle(position) {
  if (position === 1) return { background: "#FFD700", color: "black" };
  if (position === 2) return { background: "#C0C0C0", color: "black" };
  if (position === 3) return { background: "#CD7F32", color: "white" };
  return { background: "#1e293b", color: "white" };
}

export default function Competition() {
  const [data, setData] = useState([]);
  const [champion, setChampion] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const weekStart = getCurrentWeekStart();

  useEffect(() => {
    fetchAll();
  }, [weekStart]);

  const fetchAll = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    setCurrentUser(userData.user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profile?.role === "admin") setIsAdmin(true);

    const { data: lock } = await supabase
      .from("locked_weeks")
      .select("*")
      .eq("week_start", weekStart)
      .single();

    setIsLocked(!!lock);

    const { data: leaderboard } = await supabase
      .from("weekly_leaderboard")
      .select("*")
      .eq("week_start", weekStart);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username");

    if (!leaderboard || !profiles) return;

    const merged = leaderboard.map(entry => {
      const profile = profiles.find(p => p.id === entry.user_id);
      return {
        user_id: entry.user_id,
        username: profile?.username || "Unknown",
        gym: entry.gym_count || 0,
        calories: entry.calorie_count || 0,
        steps: entry.total_steps || 0,
        benchRatio: entry.bench_ratio || 0,
        squatRatio: entry.squat_ratio || 0,
        deadliftRatio: entry.deadlift_ratio || 0,
        bench: entry.bench || 0,
        squat: entry.squat || 0,
        deadlift: entry.deadlift || 0
      };
    });

    setData(merged);

    const { data: medalData } = await supabase
      .from("weekly_results")
      .select("user_id, medal")
      .eq("week_start", weekStart);

    if (medalData && medalData.length > 0) {
      const goldCounts = {};

      medalData.forEach(row => {
        if (row.medal === "gold") {
          goldCounts[row.user_id] =
            (goldCounts[row.user_id] || 0) + 1;
        }
      });

      let maxGold = 0;
      let winnerId = null;

      for (let userId in goldCounts) {
        if (goldCounts[userId] > maxGold) {
          maxGold = goldCounts[userId];
          winnerId = userId;
        }
      }

      if (winnerId) {
        const winnerProfile = profiles.find(p => p.id === winnerId);
        setChampion({
          name: winnerProfile?.username || "Unknown",
          golds: maxGold
        });
      }
    }
  };

  const finalizeWeek = async () => {
    if (!isAdmin || isLocked) return;

    await supabase.from("locked_weeks").insert({
      week_start: weekStart
    });

    setIsLocked(true);
  };

  const unlockWeek = async () => {
    if (!isAdmin) return;

    await supabase
      .from("locked_weeks")
      .delete()
      .eq("week_start", weekStart);

    setIsLocked(false);
  };

  const categories = [
    { key: "gym", label: "🏋️ Gym Sessions" },
    { key: "steps", label: "👣 Total Steps" },
    { key: "calories", label: "🔥 Calorie Target" },
    { key: "benchRatio", label: "🟧 Bench" },
    { key: "squatRatio", label: "🟩 Squat" },
    { key: "deadliftRatio", label: "🟥 Deadlift" }
  ];

  return (
    <div className="card">
      <h2>🏆 Weekly Competition</h2>
      <p>Week Starting: {weekStart}</p>

      {champion && (
        <div
          style={{
            background: "black",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px"
          }}
        >
          🏆 Champion: {champion.name} ({champion.golds} Golds)
        </div>
      )}

      {isLocked && (
        <p style={{ color: "#38bdf8" }}>🔒 Week Locked</p>
      )}

      {isAdmin && !isLocked && (
        <button onClick={finalizeWeek} className="primary">
          Finalize & Lock Week
        </button>
      )}

      {isAdmin && isLocked && (
        <button
          onClick={unlockWeek}
          className="secondary"
          style={{ marginTop: "10px" }}
        >
          Unlock Week
        </button>
      )}

      {categories.map(category => {
        const ranked = rankDescending(data, category.key);

        return (
          <div key={category.key} style={{ marginTop: "30px" }}>
            <h3>{category.label}</h3>
            {ranked.map((user, index) => {
              const position = index + 1;
              const style = MedalStyle(position);
              const isMe = user.user_id === currentUser;

              let valueDisplay = user[category.key];

              if (category.key.includes("Ratio")) {
                const base = category.key.replace("Ratio", "");
                valueDisplay = `${user[category.key].toFixed(2)}x (${user[base]}kg)`;
              }

              return (
                <div
                  key={user.username}
                  style={{
                    ...style,
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "8px",
                    border: isMe ? "2px solid #38bdf8" : "none"
                  }}
                >
                  {position}. {user.username} — {valueDisplay}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}