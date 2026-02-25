import { useState, useEffect } from "react";

export default function Journal() {
  const todayString = new Date().toISOString().split("T")[0];

  const [entry, setEntry] = useState("");
  const [allEntries, setAllEntries] = useState({});
  const [todayEntries, setTodayEntries] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("project1044_journal");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAllEntries(parsed);

      if (parsed[todayString]) {
        setTodayEntries(parsed[todayString]);
      }
    }
  }, []);

  const handleSave = () => {
    if (!entry.trim()) return;

    const newEntry = {
      text: entry,
      timestamp: new Date().toISOString(),
    };

    const updated = {
      ...allEntries,
      [todayString]: [
        ...(allEntries[todayString] || []),
        newEntry,
      ],
    };

    setAllEntries(updated);
    setTodayEntries(updated[todayString]);

    localStorage.setItem(
      "project1044_journal",
      JSON.stringify(updated)
    );

    setEntry("");
  };

  return (
    <div className="card">
      <h2>📓 Daily Journal</h2>

      <p><strong>Date:</strong> {todayString}</p>

      <textarea
        placeholder="Write your thoughts, reflection, lessons, ideas..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          marginTop: "15px",
          padding: "10px",
        }}
      />

      <button onClick={handleSave} style={{ marginTop: "15px" }}>
        ➕ Save Entry
      </button>

      <hr style={{ margin: "25px 0" }} />

      <h3>Today's Entries</h3>

      {todayEntries.length === 0 && (
        <p>No entries yet today.</p>
      )}

      {todayEntries.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: "15px",
            padding: "10px",
            background: "#111",
            borderRadius: "6px",
          }}
        >
          <p style={{ fontSize: "12px", opacity: 0.6 }}>
            {new Date(item.timestamp).toLocaleTimeString()}
          </p>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}