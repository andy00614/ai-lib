import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { HealthSchema } from "../schemas/common";
import { checkHealth } from "../utils/health";
import type { Context } from "../types";

const router = new OpenAPIHono<Context>();

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    200: {
      description: "Health check passed",
      content: {
        "application/json": {
          schema: HealthSchema
        }
      }
    },
    500: {
      description: "Health check failed",
      content: {
        "application/json": {
          schema: HealthSchema
        }
      }
    }
  }
});

router.openapi(healthRoute, async (c) => {
  try {
    await checkHealth();
    return c.json({
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0"
    });
  } catch (error) {
    return c.json({
      status: "error" as const,
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Unknown error",
    }, 500);
  }
});

export { router as healthRouter };