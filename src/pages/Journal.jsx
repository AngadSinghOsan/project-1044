import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Journal({ user }) {
  const today = new Date().toISOString().split("T")[0];

  const [goals, setGoals] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadGoals();
    loadEntries();
  }, []);

  // ---------- LOAD GOALS ----------
  const loadGoals = async () => {
    const { data } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.goals) {
      setGoals(data.goals);
    }
  };

  // ---------- SAVE GOALS ----------
  const saveGoals = async () => {
    await supabase.from("user_goals").upsert({
      user_id: user.id,
      goals,
      updated_at: new Date()
    });

    alert("Goals Saved");
  };

  const loadEntries = async () => {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.log("Load error:", error);
  } else {
    setEntries(data || []);
  }
};

const postEntry = async () => {
  if (!entry.trim()) return;

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      user_id: user.id,
      entry_date: today,
      content: entry
    })
    .select();

  if (error) {
    console.log("FULL INSERT ERROR:", error);
    alert(error.message);
    return;
  }

  console.log("Inserted:", data);

  setEntry("");
  await loadEntries();
};

  // ---------- DELETE ENTRY ----------
  const deleteEntry = async (id) => {
    await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id);

    loadEntries();
  };

  return (
    <div className="card">
      <h2>Journal</h2>

      {/* GOALS SECTION */}
      <h3>My Goals</h3>
      <textarea
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        placeholder="Write your main goals here..."
      />
      <button className="primary" onClick={saveGoals}>
        Save Goals
      </button>

      <hr style={{ margin: "25px 0", borderColor: "#334155" }} />

      {/* NEW ENTRY */}
      <h3>New Journal Entry</h3>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write today's reflection..."
      />
      <button className="primary" onClick={postEntry}>
        Post Entry
      </button>

      <hr style={{ margin: "25px 0", borderColor: "#334155" }} />

      {/* PAST ENTRIES */}
      <h3>Past Entries</h3>

      {entries.length === 0 && <p>No entries yet.</p>}

      {entries.map((e) => (
        <div
          key={e.id}
          style={{
            marginBottom: "20px",
            paddingBottom: "15px",
            borderBottom: "1px solid #334155"
          }}
        >
          <strong>{e.entry_date}</strong>
          <p>{e.content}</p>

          <button
            className="secondary"
            style={{ marginTop: "10px" }}
            onClick={() => deleteEntry(e.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}