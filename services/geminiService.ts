import { GoogleGenAI } from "@google/genai";

export const generateHomeImage = async (
  prompt: string,
  aspectRatio: string,
  imageSize: string
): Promise<string | null> => {
  try {
    // Access aistudio via explicit casting to avoid TS conflicts with existing global types
    const aistudio = (window as any).aistudio;
    
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Assume success after dialog interaction, or throw/return null to prompt again
      const checkAgain = await aistudio.hasSelectedApiKey();
      if (!checkAgain) return null;
    }

    // Always create a new instance to pick up the injected key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};