import z from "zod";
import { generateObject, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';


export const PrincipleSchema = z.object({
    topic: z.string(),
    summary: z.string().min(10),            // 1-2 句话总述
    mechanism: z.array(z.string()).min(1),  // 关键机理点（链式因果）
    cause: z.array(z.string()).min(1),
    effects: z.array(z.string()).min(1),
    consequence: z.array(z.string()).min(1),
    analogies: z.array(z.string()).optional(), // 可选：类比/比喻
    classroomSafe: z.boolean().default(true),
});

export type Principle = z.infer<typeof PrincipleSchema>;

export const generatePrincipleSchema = async (topic: string) => {
    const system = [
        'You are a precise science explainer.',
        'Return ONLY a compact JSON object that strictly matches the provided schema.',
        'Be concise, classroom-safe, and avoid controversial or unsafe content.',
    ].join(' ');

    const user = [
        `Topic: ${topic}`,
        'Return fields: topic, summary, mechanism[], cause[], effects[], consequence[], analogies[]?, classroomSafe',
        'Keep text simple and suitable for a 5-panel classroom infographic.',
    ].join('\n');

    const obj = generateObject({
        model: openai('gpt-4o-mini'),
        schema: PrincipleSchema,
        system,
        prompt: user,
        temperature: 0.7,
    });
    return obj;
}

export const generatePrincipleSchemaStream = async (topic: string) => {
    const system = [
        'You are a precise science explainer.',
        'Return ONLY a compact JSON object that strictly matches the provided schema.',
        'Be concise, classroom-safe, and avoid controversial or unsafe content.',
    ].join(' ');

    const user = [
        `Topic: ${topic}`,
        'Return fields: topic, summary, mechanism[], cause[], effects[], consequence[], analogies[]?, classroomSafe',
        'Keep text simple and suitable for a 5-panel classroom infographic.',
    ].join('\n');

    const stream = streamObject({
        model: openai('gpt-4o-mini'),
        schema: PrincipleSchema,
        system,
        prompt: user,
        temperature: 0.7,
        maxRetries: 2,
    });
    return stream;
}
