export async function dbRequest({ table, action, payload = null, filters = null }) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ table, action, payload, filters })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  return res.json();
}