import { useState } from "react";
import { dbRequest } from "../supabase";

export default function Auth({ setUser }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !pin) {
      alert("Enter username and pin");
      return;
    }

    setLoading(true);

    try {
      const users = await dbRequest({
        table: "app_users",
        method: "select",
        filters: [
          { column: "username", value: username }
        ]
      });

      if (!users || users.length === 0) {
        alert("User not found");
        setLoading(false);
        return;
      }

      const user = users[0];

      if (user.pin !== pin) {
        alert("Incorrect PIN");
        setLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem("activeUser", JSON.stringify(user));

      setUser(user);

    } catch (err) {
      console.error(err.message);
      alert("Login failed");
    }

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

      <button
        className="primary"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div style={{ marginTop: 40, fontSize: 12, opacity: 0.6 }}>
        Version 1.0.1
      </div>
    </div>
  );
}