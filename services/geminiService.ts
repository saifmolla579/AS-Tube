
import { GoogleGenAI, Type } from "@google/genai";

export const generateVideoMetadata = async (prompt: string, isUrl: boolean = false) => {
  // Use the provided API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  
  try {
    const systemInstruction = isUrl 
      ? "You are a video metadata extractor. Use Google Search to find the title and description of the video from the provided YouTube or Google Drive URL. Return the data in valid JSON format. If you cannot find it, generate a plausible title and description based on the URL context."
      : "Generate a compelling video title and a detailed description for a video based on this prompt or filename. Return as JSON.";

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: isUrl 
        ? `Find the title and description for this video link: ${prompt}`
        : `Generate metadata for: ${prompt}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        tools: isUrl ? [{ googleSearch: {} }] : [],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { 
              type: Type.STRING, 
              description: "The duration of the video in format M:SS or H:MM:SS. If unknown, estimate based on title or context." 
            }
          },
          required: ["title", "description", "duration"]
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      title: isUrl ? "Auto-detected Video" : prompt,
      description: isUrl ? "Metadata could not be fetched automatically." : "Auto-generated content for " + prompt,
      duration: "5:00"
    };
  }
};
