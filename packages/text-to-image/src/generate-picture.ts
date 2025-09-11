import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";

export async function generatePicture(imagePrompt: string, _apiKey?: string) {

    const apiKey = _apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = imagePrompt;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: prompt,
    });
    for (const part of (response?.candidates?.[0]?.content?.parts ?? [])) {
        if (part.text) {
            console.log(part.text);
        } else if (part.inlineData) {
            const imageData = part.inlineData.data;
            if (imageData) {
                const buffer = Buffer.from(imageData, "base64");
                fs.writeFileSync(`gemini-native-image-${Date.now()}.png`, buffer);
                console.log("Image saved as gemini-native-image.png");
                return buffer;
            }
        }
    }
}
