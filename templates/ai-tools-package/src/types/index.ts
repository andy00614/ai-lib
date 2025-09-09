import { z } from "zod";

// Base request schema
export const baseRequestSchema = z.object({
  input: z.string().min(1, "Input is required"),
  options: z.object({
    format: z.enum(["json", "text"]).default("json"),
    stream: z.boolean().default(false),
  }).optional(),
});

export type BaseRequest = z.infer<typeof baseRequestSchema>;

// Base response schema  
export const baseResponseSchema = z.object({
  result: z.unknown(),
  metadata: z.object({
    model: z.string(),
    timestamp: z.date(),
    processingTime: z.number(),
  }).optional(),
});

export type BaseResponse = z.infer<typeof baseResponseSchema>;

// Export all schemas for validation
export {
  baseRequestSchema,
  baseResponseSchema,
};