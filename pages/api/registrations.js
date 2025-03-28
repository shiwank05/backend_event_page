import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { event_id } = req.query;
    const { data, error } = await supabase.from("registrations").select("*").eq("event_id", event_id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { event_id, full_name, email } = req.body;
    const { data, error } = await supabase.from("registrations").insert([{ event_id, full_name, email }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
