// services/gemini.js
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
export const GEMINI_FAST_MODEL = process.env.GEMINI_FAST_MODEL || "gemini-3.5-flash-lite";  // descriptions

const FAST_MODEL = process.env.GEMINI_FAST_MODEL || GEMINI_MODEL;


// ---------- low-level call, with the thinking-config retry ----------
async function callGemini({ model, prompt, system, temperature, maxOutputTokens, json }) {
  const config = {
    systemInstruction: system,
    temperature,
    maxOutputTokens,
    ...(json && { responseMimeType: "application/json" }),
  };

  try {
    return await ai.models.generateContent({
      model,
      contents: prompt,
      config: { ...config, thinkingConfig: { thinkingLevel: "low" } },
    });
  } catch (err) {
    // some models reject thinkingConfig: retry without it
    if (err?.status === 400) {
      return ai.models.generateContent({ model, contents: prompt, config });
    }
    throw err;
  }
}

// ---------- plain text answer ----------
export async function generateText({
  prompt,
  system = "You are a helpful assistant for an online store.",
  temperature = 0.7,
  maxOutputTokens = 2048,
  fast = true,
}) {
  const response = await callGemini({
    model: fast ? FAST_MODEL : GEMINI_MODEL,
    prompt, system, temperature, maxOutputTokens,
  });

  if (response.candidates?.[0]?.finishReason === "MAX_TOKENS") {
    throw new Error("AI response was cut off");
  }

  const text = (response.text || "").replace(/[*#_`]/g, "").trim();
  if (!text) throw new Error("AI returned an empty response");
  return text;
}

// ---------- JSON answer (returns null if unparseable) ----------
export async function generateJSON({
  prompt,
  system = "You are a helpful assistant for an online store.",
  temperature = 0.3,
  maxOutputTokens = 4096,
  fast = false,
}) {
  const response = await callGemini({
    model: fast ? FAST_MODEL : GEMINI_MODEL,
    prompt, system, temperature, maxOutputTokens, json: true,
  });

  try {
    return JSON.parse(response.text);
  } catch {
    return null;
  }
}

// ---------- input cleaner ----------
export const clean = (value, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
