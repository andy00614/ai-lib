import { z } from "zod";

export const principleRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required")
});

export const principleResponseSchema = z.object({
  data: z.any(),
  requestId: z.string(),
  timestamp: z.string(),
});

export const generateImageRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required").describe("Topic to illustrate"),
  style: z.string().optional().describe("Optional style hint appended to prompt"),
});

export const generateImageResponseSchema = z.object({
  data: z.object({
    imageBase64: z.string().describe("Base64 PNG without data URL prefix"),
  }),
  requestId: z.string(),
  timestamp: z.string(),
});

export type PrincipleRequest = z.infer<typeof principleRequestSchema>
export type PrincipleResponse = z.infer<typeof principleResponseSchema>
export type GenerateImageRequest = z.infer<typeof generateImageRequestSchema>
export type GenerateImageResponse = z.infer<typeof generateImageResponseSchema>

