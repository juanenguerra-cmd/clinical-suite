
import { GoogleGenAI } from "@google/genai";

export const polishNote = async (content: string): Promise<string> => {
  try {
    // Vite exposes env vars via import.meta.env.* (only variables prefixed with VITE_ are available).
    // Keep this optional: if no key is configured, we simply return the original content.
    const apiKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || "";
    if (!apiKey) return content;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a clinical documentation specialist. Polish and optimize the following nursing note for professional clarity, proper medical terminology, and concise grammar while ensuring all clinical facts remain accurate. Output only the polished text.\n\nNote: ${content}`,
      config: {
        temperature: 0.2,
        topP: 0.95,
        topK: 40,
      }
    });

    return response.text?.trim() || content;
  } catch (error) {
    console.error("AI Polish Error:", error);
    return content;
  }
};
