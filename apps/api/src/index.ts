import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { routers } from "./routes";
import type { Context } from "./types";
import { nanoid } from "nanoid";
import { logger } from "./utils/logger";

const app = new OpenAPIHono<Context>();

app.use("*", secureHeaders());

app.use("*", cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: [
    "Authorization",
    "Content-Type",
    "Accept",
    "X-Requested-With"
  ],
  exposeHeaders: ["Content-Length", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
}));

app.use("*", async (c, next) => {
  const requestId = nanoid();
  c.set("requestId", requestId);
  
  const start = Date.now();
  
  logger.info({
    method: c.req.method,
    url: c.req.url,
    requestId,
    userAgent: c.req.header("User-Agent"),
    ip: c.req.header("x-forwarded-for") || "unknown"
  }, 'Request started');
  
  await next();
  
  const duration = Date.now() - start;
  
  logger.info({
    method: c.req.method,
    url: c.req.url,
    status: c.res.status,
    duration: `${duration}ms`,
    requestId
  }, 'Request completed');
});

app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    version: "1.0.0",
    title: "AI Tools API",
    description: "API documentation",
  },
  servers: [
    { url: "http://localhost:3003", description: "Development" },
  ]
});

app.get("/", Scalar({
  url: "/openapi.json",
  theme: "saturn"
}));

app.route("/api", routers);

app.onError((error, c) => {
  const requestId = c.get("requestId");
  logger.error({
    error: error.message,
    stack: error.stack,
    requestId,
    url: c.req.url,
    method: c.req.method
  }, 'Unhandled error');
  
  return c.json({
    error: "Internal server error",
    requestId
  }, 500);
});

app.notFound((c) => {
  return c.json({
    error: "Not found",
    path: c.req.path
  }, 404);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;

logger.info({
  port,
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
}, 'API server starting...');

export default {
  port,
  fetch: app.fetch,
  host: "::"
};