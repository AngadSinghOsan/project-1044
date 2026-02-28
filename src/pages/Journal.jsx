import { useEffect, useState } from "react";
import { dbRequest } from "../supabase";

export default function Journal({ user }) {
  const today = new Date().toISOString().split("T")[0];

  const [goals, setGoals] = useState("");
  const [entry, setEntry] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadGoals();
    loadEntries();
  }, []);

  async function loadGoals() {
    try {
      const data = await dbRequest({
        table: "user_goals",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      if (data.length > 0) {
        setGoals(data[0].goals || "");
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  async function saveGoals() {
    try {
      await dbRequest({
        table: "user_goals",
        method: "insert",
        payload: {
          user_id: user.id,
          goals,
          updated_at: new Date()
        }
      });

      alert("Goals Saved");
    } catch (err) {
      console.error(err.message);
      alert("Error saving goals");
    }
  }

  async function loadEntries() {
    try {
      const data = await dbRequest({
        table: "journal_entries",
        method: "select",
        filters: [{ column: "user_id", value: user.id }]
      });

      setEntries(data);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function postEntry() {
    if (!entry.trim()) return;

    try {
      await dbRequest({
        table: "journal_entries",
        method: "insert",
        payload: {
          user_id: user.id,
          entry_date: today,
          content: entry
        }
      });

      setEntry("");
      loadEntries();
    } catch (err) {
      console.error(err.message);
      alert("Error posting journal");
    }
  }

  async function deleteEntry(id) {
    try {
      await dbRequest({
        table: "journal_entries",
        method: "delete",
        payload: { id }
      });

      loadEntries();
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Journal</h2>

      {/* GOALS SECTION */}
      <h3>My Goals</h3>
      <textarea
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        placeholder="Write your main goals..."
      />
      <button className="primary" onClick={saveGoals}>
        Save Goals
      </button>

      <hr />

      {/* NEW ENTRY */}
      <h3>New Journal Entry</h3>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write today's journal..."
      />
      <button className="primary" onClick={postEntry}>
        Post Entry
      </button>

      <hr />

      {/* PAST ENTRIES */}
      <h3>Past Entries</h3>

      {entries.length === 0 && <div>No entries yet.</div>}

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
            onClick={() => deleteEntry(e.id)}
          >
            Delete
          </button>
        </div>
      ))}

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}