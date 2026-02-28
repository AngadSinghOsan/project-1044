import { useState } from "react";
import { supabase } from "../supabase";

export default function Auth({ onLogin }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !pin) {
      alert("Enter username and PIN");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("username", username.toLowerCase())
      .eq("pin", pin)
      .maybeSingle();

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    if (!data) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("activeUser", JSON.stringify(data));
    onLogin(data);
  };

  return (
    <div className="card">
      <h2>Project 1044 Login</h2>

      <input
        type="text"
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
    </div>
  );
}