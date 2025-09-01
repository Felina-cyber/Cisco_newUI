import OpenAI from "openai";

// Groq exposes an OpenAI-compatible API.
// We point the OpenAI SDK at Groq's base URL.
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const DEFAULT_GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.1-8b-instant";
