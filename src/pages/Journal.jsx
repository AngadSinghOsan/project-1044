import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Journal({ user }) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    loadEntry();
  }, [selectedDate]);

  const loadEntry = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .single();

    if (data) {
      setEntry(data.content || "");
    }
  };

  const saveEntry = async () => {
    await supabase.from("journal_entries").upsert(
      {
        user_id: user.id,
        entry_date: selectedDate,
        content: entry
      },
      { onConflict: "user_id,entry_date" }
    );

    alert("Journal saved");
  };

  return (
    <div className="card">
      <h2>Journal</h2>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      <textarea
        style={{ width: "100%", minHeight: "120px" }}
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />

      <button className="primary" onClick={saveEntry}>
        Save Journal
      </button>
    </div>
  );
}