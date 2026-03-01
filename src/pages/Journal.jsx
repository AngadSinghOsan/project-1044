import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Journal({ user }) {

  const [goal, setGoal] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(()=>{ load(); },[]);

  async function load(){
    const { data: goals } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (goals) setGoal(goals.goal);

    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at",{ascending:false});

    setEntries(data||[]);
  }

  async function saveGoal(){
    await supabase
      .from("user_goals")
      .upsert({ user_id:user.id, goal }, { onConflict:"user_id" });
    alert("Goal Saved");
  }

  async function postEntry(){
    await supabase
      .from("journal_entries")
      .insert({ user_id:user.id, content:entry });
    setEntry("");
    load();
  }

  async function deleteEntry(id){
    await supabase
      .from("journal_entries")
      .delete()
      .eq("id",id);
    load();
  }

  return (
    <div className="card">
      <h2>Journal</h2>

      <h3>Your Goal</h3>
      <textarea value={goal} onChange={e=>setGoal(e.target.value)} />
      <button onClick={saveGoal}>Save Goal</button>

      <hr />

      <h3>New Entry</h3>
      <textarea value={entry} onChange={e=>setEntry(e.target.value)} />
      <button onClick={postEntry}>Post</button>

      <hr />

      <h3>Past Entries</h3>
      {entries.map(e=>(
        <div key={e.id}>
          <p>{e.content}</p>
          <button onClick={()=>deleteEntry(e.id)}>Delete</button>
          <hr/>
        </div>
      ))}

      <div style={{ marginTop:40, fontSize:12, opacity:0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}