import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return res.status(500).json({
        error: "Missing Supabase environment variables",
        urlExists: !!SUPABASE_URL,
        keyExists: !!SUPABASE_SERVICE_ROLE
      });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE
    );

    const { table, action, payload, filters } = req.body;

    let query = supabase.from(table);

    if (action === "select") {
      query = query.select("*");
      if (filters) {
        filters.forEach(f => {
          query = query.eq(f.column, f.value);
        });
      }
      const { data, error } = await query;
      if (error) {
        return res.status(400).json({ supabaseError: error.message });
      }
      return res.status(200).json(data);
    }

    if (action === "insert") {
      const { data, error } = await query.insert(payload).select();
      if (error) {
        return res.status(400).json({ supabaseError: error.message });
      }
      return res.status(200).json(data);
    }

    if (action === "update") {
      const { data, error } = await query
        .update(payload.data)
        .match(payload.match)
        .select();
      if (error) {
        return res.status(400).json({ supabaseError: error.message });
      }
      return res.status(200).json(data);
    }

    if (action === "delete") {
      const { error } = await query.match(payload).delete();
      if (error) {
        return res.status(400).json({ supabaseError: error.message });
      }
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: "Invalid action type" });

  } catch (err) {
    return res.status(500).json({
      error: "Server crash",
      message: err.message
    });
  }
}