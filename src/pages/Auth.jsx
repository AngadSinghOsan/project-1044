import { useState } from "react";
import { supabase } from "../supabase";

export default function Auth({ setUser }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  async function handleLogin() {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      alert("User not found");
      return;
    }

    if (data.pin !== pin) {
      alert("Incorrect PIN");
      return;
    }

    localStorage.setItem("activeUser", JSON.stringify(data));
    setUser(data);
  }

  return (
    <div className="card">
      <h2>Project 1044 Login</h2>

      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="PIN" onChange={e => setPin(e.target.value)} />

      <button className="primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}