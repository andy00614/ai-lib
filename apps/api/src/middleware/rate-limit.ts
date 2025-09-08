import { rateLimiter } from "hono-rate-limiter";

export const createRateLimiter = (options: {
  windowMs: number;
  limit: number;
}) => {
  return rateLimiter({
    windowMs: options.windowMs,
    limit: options.limit,
    keyGenerator: (c) => {
      return c.get("userId") || c.req.header("x-forwarded-for") || "anonymous";
    },
    handler: (c) => {
      return c.json({
        error: "Rate limit exceeded",
        retryAfter: Math.ceil(options.windowMs / 1000)
      }, 429);
    }
  });
};