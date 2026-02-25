import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const categories = [
  "gym",
  "steps",
  "calories",
  "bench",
  "squat",
  "deadlift"
];

export default function Summary() {
  const [user, setUser] = useState(null);
  const [medals, setMedals] = useState({});
  const [totals, setTotals] = useState({
    gold: 0,
    silver: 0,
    bronze: 0
  });

  useEffect(() => {
    const loadMedals = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setUser(userData.user);

      const { data } = await supabase
        .from("weekly_results")
        .select("*")
        .eq("user_id", userData.user.id);

      if (!data) return;

      const medalCount = {};
      let gold = 0;
      let silver = 0;
      let bronze = 0;

      categories.forEach(cat => {
        medalCount[cat] = { gold: 0, silver: 0, bronze: 0 };
      });

      data.forEach(row => {
        if (medalCount[row.category]) {
          medalCount[row.category][row.medal]++;
        }

        if (row.medal === "gold") gold++;
        if (row.medal === "silver") silver++;
        if (row.medal === "bronze") bronze++;
      });

      setMedals(medalCount);
      setTotals({ gold, silver, bronze });
    };

    loadMedals();
  }, []);

  return (
    <div className="card">
      <h2>🏅 Medal Summary</h2>

      <div style={{ marginBottom: "30px" }}>
        <h3>Overall Medals</h3>
        <p>🥇 Gold: {totals.gold}</p>
        <p>🥈 Silver: {totals.silver}</p>
        <p>🥉 Bronze: {totals.bronze}</p>
      </div>

      {categories.map(cat => (
        <div
          key={cat}
          style={{
            marginBottom: "25px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "10px"
          }}
        >
          <h3 style={{ textTransform: "capitalize" }}>
            {cat} Competition
          </h3>

          <p>🥇 Gold: {medals[cat]?.gold || 0}</p>
          <p>🥈 Silver: {medals[cat]?.silver || 0}</p>
          <p>🥉 Bronze: {medals[cat]?.bronze || 0}</p>

          <p>
            Total Wins:{" "}
            {(medals[cat]?.gold || 0) +
              (medals[cat]?.silver || 0) +
              (medals[cat]?.bronze || 0)}
          </p>
        </div>
      ))}
    </div>
  );
}