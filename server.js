import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.GEMINI_API_KEY;

// ✅ جرّب بصيغة models/ لتجنب NOT_FOUND
const MODEL =
  process.env.GEMINI_MODEL?.trim() || "models/gemini-1.5-pro";

app.get("/health", (req, res) => {
  res.json({ status: "OK", model: MODEL });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body?.message;

    if (!API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required (string)" });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return res.json({ reply: text || "(no text returned)" });
  } catch (err) {
    console.error("FULL AI ERROR:", err);
    return res.status(500).json({
      error: "AI request failed",
      details: err?.message || String(err),
    });
  }
});

// مهم لـ Render/Cloud
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using model: ${MODEL}`);
});