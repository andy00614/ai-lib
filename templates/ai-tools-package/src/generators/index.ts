import { z } from "zod";
import { baseRequestSchema, baseResponseSchema } from "../types";

// Generator-specific request schema
export const generateRequestSchema = baseRequestSchema.extend({
  prompt: z.string().min(1, "Prompt is required"),
  temperature: z.number().min(0).max(2).default(0.7),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

// Generator-specific response schema
export const generateResponseSchema = baseResponseSchema.extend({
  result: z.object({
    content: z.string(),
    tokens: z.number().optional(),
  }),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

/**
 * Base generator class
 * Extend this class to create specific generators
 */
export abstract class BaseGenerator {
  protected abstract modelName: string;

  /**
   * Generate content based on input
   * Override this method in subclasses
   */
  abstract generate(request: GenerateRequest): Promise<GenerateResponse>;

  /**
   * Validate request data
   */
  protected validateRequest(data: unknown): GenerateRequest {
    return generateRequestSchema.parse(data);
  }

  /**
   * Create response object
   */
  protected createResponse(content: string, tokens?: number): GenerateResponse {
    return {
      result: {
        content,
        tokens,
      },
      metadata: {
        model: this.modelName,
        timestamp: new Date(),
        processingTime: Date.now(),
      },
    };
  }
}