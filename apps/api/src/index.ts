import { OpenAPIHono } from "@hono/zod-openapi";
// Load env from both workspace root and local .env to ensure dev works in monorepo
import * as path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { routers } from "./routes";
import type { Context } from "./types";
import { nanoid } from "nanoid";
import { logger } from "./utils/logger";

const app = new OpenAPIHono<Context>();

app.use("*", secureHeaders());

// CORS configuration with environment-aware origins
const getAllowedOrigins = () => {
  const defaultOrigins = [
    "http://localhost:3000", 
    "http://localhost:3001",
    "http://localhost:8080"  // Add localhost:8080 for debugging
  ];
  
  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim());
    return [...envOrigins, ...defaultOrigins];
  }
  
  // Production defaults if no env var is set
  if (process.env.NODE_ENV === "production") {
    return [
      "https://wd-ai-lib.fly.dev",
      "https://wd-ai-tool-api.fly.dev", // API itself
      ...defaultOrigins
    ];
  }
  
  return defaultOrigins;
};

const allowedOrigins = getAllowedOrigins();

app.use("*", cors({
  origin: (origin, c) => {
    // For debugging - log all origin requests
    logger.info({ origin, allowedOrigins }, 'CORS origin check');
    
    // Allow requests with no origin (like Postman, curl)
    if (!origin) return origin;
    
    // Allow if in allowed origins
    if (allowedOrigins.includes(origin)) return origin;
    
    // Temporary: Allow fly.dev subdomains for debugging
    if (origin.endsWith('.fly.dev')) {
      logger.warn({ origin }, 'CORS: Allowing .fly.dev domain temporarily');
      return origin;
    }
    
    logger.error({ origin, allowedOrigins }, 'CORS: Origin blocked');
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowHeaders: [
    "Authorization",
    "Content-Type",
    "Accept",
    "X-Requested-With",
    "Origin",
    "X-Request-ID"
  ],
  exposeHeaders: ["Content-Length", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
}));

// CORS debugging middleware
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  if (origin) {
    const isAllowed = allowedOrigins.includes(origin);
    logger.info({ 
      origin, 
      isAllowed, 
      allowedOrigins,
      method: c.req.method,
      path: c.req.path
    }, 'CORS check');
  }
  
  await next();
});

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
    description: "API documentation for AI Tools services",
  },
  servers: [
    { 
      url: "https://wd-ai-tool-api.fly.dev", 
      description: "Production (Fly.io)" 
    },
    { 
      url: `http://localhost:${process.env.PORT || "8080"}`, 
      description: "Local Development" 
    }
  ]
});

app.get("/", Scalar({
  url: "/openapi.json",
  theme: "saturn"
}));

// Health check endpoint for Fly.io
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// CORS debug endpoint
app.get("/debug/cors", (c) => {
  const origin = c.req.header("Origin");
  return c.json({
    requestOrigin: origin,
    allowedOrigins,
    isOriginAllowed: origin ? allowedOrigins.includes(origin) : true,
    environment: process.env.NODE_ENV || "development",
    corsConfigSource: process.env.ALLOWED_ORIGINS ? "environment" : "default"
  });
});

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
