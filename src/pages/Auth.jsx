import { useState } from "react";
import { supabase } from "../supabase";

export default function Auth() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = async () => {
    if (!username || !pin) {
      alert("Enter username and PIN");
      return;
    }

    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("username", username.toLowerCase())
      .eq("pin", pin)
      .single();

    if (error || !data) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("activeUser", JSON.stringify(data));
    window.location.reload();
  };

  return (
    <div className="card">
      <h2>Login</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="4 Digit PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
      />

      <button className="primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}