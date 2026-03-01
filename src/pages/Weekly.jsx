import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Weekly({ user }) {

  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekKey = monday.toISOString().split("T")[0];

  const weekEnd = new Date(monday);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const [weight, setWeight] = useState("");
  const [savings, setSavings] = useState("");
  const [bench, setBench] = useState("");
  const [squat, setSquat] = useState("");
  const [deadlift, setDeadlift] = useState("");
  const [newSkill, setNewSkill] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    checkLock();
    loadWeek();
  }, []);

  async function checkLock() {
    const { data } = await supabase
      .from("locked_weeks")
      .select("*")
      .eq("week_start", weekKey)
      .maybeSingle();

    setLocked(!!data);
  }

  async function loadWeek() {
    const { data } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekKey)
      .maybeSingle();

    if (data) {
      setWeight(data.weight || "");
      setSavings(data.savings || "");
      setBench(data.bench || "");
      setSquat(data.squat || "");
      setDeadlift(data.deadlift || "");
      setNewSkill(data.new_skill || false);
    }
  }

  async function saveWeek() {
    if (locked) return alert("Week is locked");

    await supabase
      .from("weekly_entries")
      .upsert({
        user_id: user.id,
        week_start: weekKey,
        weight: weight ? Number(weight) : null,
        savings: savings ? Number(savings) : 0,
        bench: bench ? Number(bench) : 0,
        squat: squat ? Number(squat) : 0,
        deadlift: deadlift ? Number(deadlift) : 0,
        new_skill: newSkill
      }, { onConflict: "user_id,week_start" });

    alert("Weekly Saved");
  }

  async function calculateWinners() {

    await supabase
      .from("competition_results")
      .delete()
      .eq("week_start", weekKey);

    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("week_start", weekKey);

    const { data: users } = await supabase
      .from("app_users")
      .select("id, username");

    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .gte("entry_date", weekKey)
      .lte("entry_date", weekEndStr);

    if (!weekly) return;

    const userMap = {};
    users.forEach(u => userMap[u.id] = u.username);

    function medalLogic(players) {

      if (!players.length) {
        return { gold:"No Winner", silver:"No Winner", bronze:"No Winner" };
      }

      players.sort((a,b)=> b.value - a.value);

      const goldVal = players[0].value;
      const gold = players.filter(p=>p.value===goldVal);

      const remaining = players.filter(p=>p.value<goldVal);

      let silver = [];
      let bronze = [];

      if (remaining.length) {
        const silverVal = remaining[0].value;
        silver = remaining.filter(p=>p.value===silverVal);

        const rest = remaining.filter(p=>p.value<silverVal);
        if (rest.length) {
          const bronzeVal = rest[0].value;
          bronze = rest.filter(p=>p.value===bronzeVal);
        }
      }

      return {
        gold: gold.map(p=>p.username).join(", "),
        silver: silver.length ? silver.map(p=>p.username).join(", ") : "No Winner",
        bronze: bronze.length ? bronze.map(p=>p.username).join(", ") : "No Winner"
      };
    }

    async function insertCategory(name, players) {
      const medals = medalLogic(players);

      await supabase.from("competition_results").insert({
        week_start: weekKey,
        category: name,
        gold: medals.gold,
        silver: medals.silver,
        bronze: medals.bronze
      });
    }

    // STEPS (Monday → Sunday)
    const stepMap = {};
    daily?.forEach(d=>{
      if(!stepMap[d.user_id]) stepMap[d.user_id]=0;
      stepMap[d.user_id]+=d.steps||0;
    });

    await insertCategory("Steps",
      weekly.map(w=>({
        username:userMap[w.user_id],
        value:stepMap[w.user_id]||0
      }))
    );

    // STRENGTH RATIO
    function ratio(lift, bodyweight){
      if(!bodyweight || bodyweight===0) return null;
      return lift/bodyweight;
    }

    await insertCategory("Bench Press",
      weekly
        .filter(w=>w.weight)
        .map(w=>({
          username:userMap[w.user_id],
          value:ratio(w.bench,w.weight)||0
        }))
    );

    await insertCategory("Squat",
      weekly
        .filter(w=>w.weight)
        .map(w=>({
          username:userMap[w.user_id],
          value:ratio(w.squat,w.weight)||0
        }))
    );

    await insertCategory("Deadlift",
      weekly
        .filter(w=>w.weight)
        .map(w=>({
          username:userMap[w.user_id],
          value:ratio(w.deadlift,w.weight)||0
        }))
    );
  }

  async function lockWeek(){
    if(user.role!=="admin") return;

    await calculateWinners();

    await supabase
      .from("locked_weeks")
      .upsert({week_start:weekKey},{onConflict:"week_start"});

    setLocked(true);
    alert("Week Locked");
  }

  async function unlockWeek(){
    if(user.role!=="admin") return;

    await supabase.from("locked_weeks").delete().eq("week_start",weekKey);
    await supabase.from("competition_results").delete().eq("week_start",weekKey);

    setLocked(false);
  }

  return (
    <div className="card">
      <h2>Weekly Entry</h2>

      <input placeholder="Weight" value={weight} onChange={e=>setWeight(e.target.value)} />
      <input placeholder="Money Saved" value={savings} onChange={e=>setSavings(e.target.value)} />
      <input placeholder="Bench" value={bench} onChange={e=>setBench(e.target.value)} />
      <input placeholder="Squat" value={squat} onChange={e=>setSquat(e.target.value)} />
      <input placeholder="Deadlift" value={deadlift} onChange={e=>setDeadlift(e.target.value)} />

      <div className="habit-row">
        <span>New Skill Learned</span>
        <input type="checkbox" checked={newSkill} onChange={()=>setNewSkill(!newSkill)} />
      </div>

      <button onClick={saveWeek}>Save Week</button>

      {user.role==="admin"&&!locked&&<button onClick={lockWeek}>Lock Week</button>}
      {user.role==="admin"&&locked&&<button onClick={unlockWeek}>Unlock Week</button>}

      {locked&&<p style={{color:"red"}}>Week Locked</p>}

      <div style={{marginTop:40,fontSize:12,opacity:0.6}}>
        Version 1.0.1
      </div>
    </div>
  );
}