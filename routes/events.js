import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
      const { name, description, date, time, location, additionalDetails, image } = req.body;

      if (!name || !description || !date || !time || !location || !image) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Upload image to Supabase Storage
      const filePath = `events/${Date.now()}-${image.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-posters")
        .upload(filePath, image, { contentType: image.type });

      if (uploadError) {
        console.error("Image Upload Error:", uploadError.message);
        return res.status(500).json({ error: "Failed to upload image" });
      }

      // Get public URL of uploaded image
      const { data: publicUrlData } = supabase.storage.from("event-posters").getPublicUrl(filePath);
      const imageUrl = publicUrlData?.publicURL;

      // Store event details including image URL
      const { data, error } = await supabase.from("events").insert([
        { name, description, date, time, location, additionalDetails, image_url: imageUrl }
      ]);

      if (error) {
        console.error("Database Insert Error:", error.message);
        return res.status(500).json({ error: "Failed to store event data" });
      }

      return res.status(201).json({ message: "Event added successfully", data });
    }

    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method Not Allowed" });

  } catch (error) {
    console.error("Unexpected Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
