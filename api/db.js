import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { table, method, filters, payload } = req.body;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

  const headers = {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    "Content-Type": "application/json",
  };

  try {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;

    if (method === "select" && filters) {
      const query = filters
        .map(f => `${f.column}=eq.${f.value}`)
        .join("&");

      url += `?${query}`;
    }

    let response;

    if (method === "select") {
      response = await fetch(url, {
        method: "GET",
        headers
      });
    }

    if (method === "insert") {
      response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
    }

    if (method === "update") {
      const match = payload.match;
      const updateUrl = `${url}?${Object.entries(match)
        .map(([k, v]) => `${k}=eq.${v}`)
        .join("&")}`;

      response = await fetch(updateUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload.data)
      });
    }

    if (method === "delete") {
      const deleteUrl = `${url}?id=eq.${payload.id}`;

      response = await fetch(deleteUrl, {
        method: "DELETE",
        headers
      });
    }

    const data = await response.json();

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}