
import { GoogleGenAI, Type } from "@google/genai";

export const generateVideoMetadata = async (prompt: string, isUrl: boolean = false) => {
  // Use the provided API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  
  try {
    const systemInstruction = isUrl 
      ? "You are a YouTube metadata extractor. Use Google Search to find the EXACT title and description of the YouTube video from the provided URL. Return the data in valid JSON format. If you cannot find it, generate a plausible title and description based on the URL."
      : "Generate a compelling YouTube-style title and a detailed description for a video based on this prompt or filename. Return as JSON.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: isUrl 
        ? `Find the official title and description for this YouTube video: ${prompt}`
        : `Generate metadata for: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: isUrl ? [{ googleSearch: {} }] : [],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: isUrl ? "Auto-detected Video" : prompt,
      description: isUrl ? "Metadata could not be fetched automatically." : "Auto-generated content for " + prompt
    };
  }
};
