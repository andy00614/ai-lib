import { z } from "zod";

export const ErrorSchema = z.object({
  error: z.string(),
  requestId: z.string().optional(),
  timestamp: z.string().optional()
});

export const SuccessSchema = z.object({
  data: z.any(),
  requestId: z.string(),
  timestamp: z.string()
});

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export const HealthSchema = z.object({
  status: z.enum(["ok", "error"]),
  timestamp: z.string(),
  version: z.string().optional(),
  message: z.string().optional()
});