import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { event_id } = req.query;

      if (!event_id) return res.status(400).json({ error: "Event ID is required" });

      const { data, error } = await supabase.from("registrations").select("*").eq("event_id", event_id);
      if (error) throw error;

      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const { event_id, full_name, email } = req.body;

      if (!event_id || !full_name || !email) {
        return res.status(400).json({ error: "All fields (event_id, full_name, email) are required" });
      }

      const { data, error } = await supabase.from("registrations").insert([{ event_id, full_name, email }]);
      if (error) throw error;

      return res.status(201).json(data);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
