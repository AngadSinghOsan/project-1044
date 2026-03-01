import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Analytics({ user }) {

  const [progress, setProgress] = useState(0);
  const [gymPercent, setGymPercent] = useState(0);
  const [monthlyGym, setMonthlyGym] = useState(0);
  const [pr, setPr] = useState({ bench:0, squat:0, deadlift:0 });

  useEffect(()=>{ load(); },[]);

  async function load() {

    const { data: weekly } = await supabase
      .from("weekly_entries")
      .select("*")
      .eq("user_id", user.id);

    const { data: daily } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("user_id", user.id);

    const totalSavings = weekly?.reduce((a,b)=>a+(b.savings||0),0) || 0;
    setProgress((totalSavings / 1000000) * 100);

    const gymCount = daily?.filter(d=>d.habits?.gym).length || 0;
    setGymPercent(Math.round((gymCount / (daily?.length||1))*100));

    setMonthlyGym(gymCount);

    setPr({
      bench: Math.max(...(weekly?.map(w=>w.bench)||[0])),
      squat: Math.max(...(weekly?.map(w=>w.squat)||[0])),
      deadlift: Math.max(...(weekly?.map(w=>w.deadlift)||[0]))
    });
  }

  return (
    <div className="card">
      <h2>Analytics</h2>

      <hr />
      <h3>Project 1044 Progress</h3>
      <p>{progress.toFixed(2)}% towards 10 Lakh Goal</p>

      <hr />
      <h3>Discipline</h3>
      <p>Weekly Habit Completion: {gymPercent}%</p>
      <p>Total Gym Sessions: {monthlyGym}</p>

      <hr />
      <h3>Personal Records</h3>
      <p>Bench PR: {pr.bench}</p>
      <p>Squat PR: {pr.squat}</p>
      <p>Deadlift PR: {pr.deadlift}</p>

      <div style={{ marginTop:40, fontSize:12, opacity:0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}