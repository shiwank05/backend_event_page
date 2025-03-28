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
const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase credentials! Check your .env file.");
    process.exit(1);
}

// ✅ Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Fetch All Events
app.get("/api/events", async (req, res) => {
    try {
        const { data, error } = await supabase.from("events").select("*");
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// ✅ Add New Event
app.post("/api/events", async (req, res) => {
    try {
        const { name, image, description, date, time, location, additionalDetails } = req.body;

        if (!name || !description || !date || !time || !location) {
            return res.status(400).json({ error: "All fields are required except additionalDetails" });
        }

        const { data, error } = await supabase.from("events").insert([
            { name, image, description, date, time, location, additionalDetails }
        ]);

        if (error) throw error;
        res.status(201).json({ message: "Event added successfully", data });
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ error: "Failed to add event" });
    }
});

// ✅ Update Event
app.put("/api/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image, description, date, time, location, additionalDetails } = req.body;

        const { data, error } = await supabase.from("events").update({
            name, image, description, date, time, location, additionalDetails
        }).eq("id", id);

        if (error) throw error;
        res.json({ message: "Event updated successfully", data });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ error: "Failed to update event" });
    }
});

// ✅ Delete Event
app.delete("/api/events/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) throw error;

        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ error: "Failed to delete event" });
    }
});

// ✅ Get Registrations for an Event
app.get("/api/registrations/:event_id", async (req, res) => {
    try {
        const { event_id } = req.params;

        const { data, error } = await supabase.from("registrations").select("*").eq("event_id", event_id);
        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching registrations:", error);
        res.status(500).json({ error: "Failed to fetch registrations" });
    }
});

// ✅ Root Route for Testing
app.get("/", (req, res) => {
    res.send("🚀 Event Management API is Running!");
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
