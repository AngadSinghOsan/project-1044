import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { table, action, payload, filters } = req.body;

  try {
    let query = supabase.from(table);

    if (action === "select") {
      query = query.select("*");
      if (filters) {
        filters.forEach(f => {
          query = query.eq(f.column, f.value);
        });
      }
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (action === "insert") {
      const { data, error } = await query.insert(payload).select();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (action === "update") {
      const { data, error } = await query
        .update(payload.data)
        .match(payload.match)
        .select();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (action === "delete") {
      const { error } = await query.match(payload).delete();
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Invalid action" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}