import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import { buildPrompt } from "./prompt.js";
import { generatePrincipleSchema } from "./generate-knowledge.js";

console.log(process.env.GOOGLE_API_KEY)

async function main(imagePrompt: string) {

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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
      }
    }
  }
}

const prompt = buildPrompt("dinosaurs die out");

const principleObj = await generatePrincipleSchema('dinosaurs die out')

console.log(principleObj)

// main(prompt);