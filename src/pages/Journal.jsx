import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Journal({ user }) {
  const [goal, setGoal] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setEntries(data || []);
  }

  async function saveGoal() {
    await supabase
      .from("user_goals")
      .upsert({ user_id: user.id, goal }, { onConflict: "user_id" });

    alert("Goal Saved");
  }

  async function postEntry() {
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: entry
    });

    setEntry("");
    loadEntries();
  }

  return (
    <div className="card">
      <h2>Journal</h2>

      <textarea
        placeholder="Your Goal"
        value={goal}
        onChange={(e)=>setGoal(e.target.value)}
      />
      <button onClick={saveGoal}>Save Goal</button>

      <hr />

      <textarea
        placeholder="Write today's journal..."
        value={entry}
        onChange={(e)=>setEntry(e.target.value)}
      />
      <button onClick={postEntry}>Post</button>

      <hr />

      {entries.map((e,i)=>(
        <div key={i}>
          <p>{e.content}</p>
          <hr />
        </div>
      ))}

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}