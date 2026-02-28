import { useState } from "react";
import { supabase } from "../supabase";

export default function Auth({ setUser }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !pin) return alert("Enter username and pin");

    setLoading(true);

    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      setLoading(false);
      return alert("User not found");
    }

    if (data.pin !== pin) {
      setLoading(false);
      return alert("Incorrect PIN");
    }

    localStorage.setItem("activeUser", JSON.stringify(data));
    setUser(data);
    setLoading(false);
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Project 1044 Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <button className="primary" onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}