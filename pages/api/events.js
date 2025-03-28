import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, description, date, time, location, additionalDetails, image } = req.body;

    // Upload image to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("event-posters")
      .upload(`events/${Date.now()}-${image.name}`, image, { contentType: image.type });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    // Get public URL of uploaded image
    const { publicURL } = supabase.storage.from("event-posters").getPublicUrl(uploadData.path);

    // Store event details including image URL
    const { data, error } = await supabase.from("events").insert([{ 
      name, description, date, time, location, additionalDetails, image_url: publicURL 
    }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
