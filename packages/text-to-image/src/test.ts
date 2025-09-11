import { generatePicture } from "./generate-picture.js";
import { buildPrompt } from "./prompt.js";

const prompt = buildPrompt('dinosaurs die out');
const result = await generatePicture(prompt);

console.log(result)