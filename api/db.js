import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

export default async function handler(req, res) {
  try {
    const { table, method, payload, filters } = req.body;

    let query = supabase.from(table);

    if (method === "select") {
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

    if (method === "insert") {
      const { data, error } = await query.insert(payload).select();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === "update") {
      const { data, error } = await query
        .update(payload.data)
        .match(payload.match)
        .select();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (method === "delete") {
      const { error } = await query.match(payload).delete();
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}