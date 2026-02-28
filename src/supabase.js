export async function dbRequest({ table, action, payload = null, filters = null }) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ table, action, payload, filters })
  });

  const text = await res.text();

  console.log("API RAW RESPONSE:", text);

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text);
  }
}