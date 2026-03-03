import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ مهم جدًا لـ Render
const PORT = process.env.PORT || 8080;

// API KEY
const API_KEY = process.env.GEMINI_API_KEY;

// MODEL (مع fallback آمن)
const MODEL =
  process.env.GEMINI_MODEL?.trim() || "models/gemini-1.5-pro";

// ---------- Health Check ----------
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    model: MODEL,
  });
});

// ---------- Root Test ----------
app.get("/", (req, res) => {
  res.send("RIGTECH BACKEND WORKING");
});

// ---------- Chat Endpoint ----------
app.post("/api/chat", async (req, res) => {
  try {
    if (!API_KEY) {
      return res
        .status(500)
        .json({ error: "Missing GEMINI_API_KEY in environment variables" });
    }

    const message = req.body.message;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "message is required (string)" });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

// ✅ أهم سطر لـ Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});