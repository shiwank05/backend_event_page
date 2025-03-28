import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Ensure environment variables are loaded
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase credentials are missing! Check your .env file.");
    process.exit(1);
}

// ✅ Initialize Supabase Client
const supabase = createClient(supabaseUrl, supabaseKey);

// 🟢 Fetch All Events
app.get("/events", async (req, res) => {
    try {
        const { data, error } = await supabase.from("events").select("*");
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 Add New Event
app.post("/events", async (req, res) => {
    try {
        const { name, image, description, date, time, location, additionalDetails } = req.body;

        if (!name || !description || !date || !time || !location) {
            return res.status(400).json({ error: "All fields are required except additionalDetails" });
        }

        const { data, error } = await supabase.from("events").insert([
            { name, image, description, date, time, location, additionalDetails }
        ]);

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 Update Event
app.put("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, description, date, time, location, additionalDetails } = req.body;

        const { data, error } = await supabase.from("events").update({
            name, image, description, date, time, location, additionalDetails
        }).eq("id", id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 Delete Event
app.delete("/events/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 Get Registrations for an Event
app.get("/registrations/:event_id", async (req, res) => {
    try {
        const { event_id } = req.params;

        const { data, error } = await supabase.from("registrations").select("*").eq("event_id", event_id);
        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🟢 Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
