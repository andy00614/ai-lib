import type { MiddlewareHandler } from "hono";
import { authMiddleware } from "./auth";
import { createRateLimiter } from "./rate-limit";

export const publicMiddleware: MiddlewareHandler[] = [];

export const protectedMiddleware: MiddlewareHandler[] = [
  authMiddleware,
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100
  })
];