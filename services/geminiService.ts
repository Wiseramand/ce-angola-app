import { GoogleGenAI, Type } from "@google/genai";
import { Devotional } from '../types';

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyDevotional = async (): Promise<Devotional> => {
  try {
    const model = 'gemini-3-flash-preview'; // Using a stable fast model for basic text tasks
    const prompt = "Generate a short, uplifting Christian daily devotional for members of Christ Embassy. Include a title, a bible scripture reference, and a 100-word inspiring message.";

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            scripture: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ["title", "scripture", "content"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Devotional;
  } catch (error) {
    console.error("Error generating devotional:", error);
    return {
      title: "Faith Moves Mountains",
      scripture: "Mark 11:23",
      content: "Today, remember that your faith is a tool. Speak to your mountains and they shall move. The word of God in your mouth is as powerful as the word of God in His mouth."
    };
  }
};