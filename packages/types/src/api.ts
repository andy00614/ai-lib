import { z } from "zod";
import { 
  outlineApiRequestSchema, 
  questionApiRequestSchema,
  outlineSchema,
  questionsCollectionSchema,
  questionTypeSchema,
  difficultySchema,
  outlineLevelSchema
} from "./knowledge.js";

// ========================================
// Provider配置类型
// ========================================

export const providerTypeSchema = z.enum([
  "google",
  "openai", 
  "anthropic",
  "grok",
  "deepseek"
]);

export const providerConfigSchema = z.object({
  provider: providerTypeSchema.default("openai"),
  model: z.string().default("gpt-4o-mini"),
  apiKey: z.string().default(""),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(2000),
});

// ========================================
// API请求Schema（包含provider配置）
// ========================================

export const apiOutlineRequestSchema = outlineApiRequestSchema.extend({
  providerConfig: providerConfigSchema,
});

export const apiQuestionRequestSchema = questionApiRequestSchema.extend({
  providerConfig: providerConfigSchema,
});

// ========================================
// API响应Schema
// ========================================

export const baseApiResponseSchema = z.object({
  requestId: z.string(),
  timestamp: z.string(),
});

export const outlineApiResponseSchema = baseApiResponseSchema.extend({
  data: outlineSchema,
});

export const questionApiResponseSchema = baseApiResponseSchema.extend({
  data: questionsCollectionSchema,
});

export const errorApiResponseSchema = baseApiResponseSchema.extend({
  error: z.string(),
});

// ========================================
// 分页和通用响应Schema
// ========================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

export const listApiResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  baseApiResponseSchema.extend({
    data: z.object({
      items: z.array(itemSchema),
      pagination: paginationSchema,
    }),
  });

// ========================================
// Health Check Schema
// ========================================

export const healthSchema = z.object({
  status: z.enum(["ok", "error"]),
  timestamp: z.string(),
  version: z.string().optional(),
  message: z.string().optional(),
});

// ========================================
// TypeScript 类型导出
// ========================================

export type ProviderType = z.infer<typeof providerTypeSchema>;
export type ProviderConfig = z.infer<typeof providerConfigSchema>;

// API请求类型
export type ApiOutlineRequest = z.infer<typeof apiOutlineRequestSchema>;
export type ApiQuestionRequest = z.infer<typeof apiQuestionRequestSchema>;

// API响应类型
export type BaseApiResponse = z.infer<typeof baseApiResponseSchema>;
export type OutlineApiResponse = z.infer<typeof outlineApiResponseSchema>;
export type QuestionApiResponse = z.infer<typeof questionApiResponseSchema>;
export type ErrorApiResponse = z.infer<typeof errorApiResponseSchema>;

// 分页类型
export type Pagination = z.infer<typeof paginationSchema>;
export type ListApiResponse<T> = BaseApiResponse & {
  data: {
    items: T[];
    pagination: Pagination;
  };
};

// Health类型
export type Health = z.infer<typeof healthSchema>;