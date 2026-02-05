
export const polishNote = async (content: string): Promise<string> => {
  try {
    // Vite exposes env vars via import.meta.env.* (only variables prefixed with VITE_ are available).
    // Keep this optional: if no key is configured, we simply return the original content.
    const apiKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY || "";
    if (!apiKey) return content;

    const prompt = `You are a clinical documentation specialist. Polish and optimize the following nursing note for professional clarity, proper medical terminology, and concise grammar while ensuring all clinical facts remain accurate. Output only the polished text.\n\nNote: ${content}`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("AI Polish Error:", await response.text());
      return content;
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || content;
  } catch (error) {
    console.error("AI Polish Error:", error);
    return content;
  }
};
