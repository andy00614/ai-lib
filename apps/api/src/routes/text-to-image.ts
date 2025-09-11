import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import type { Context } from "../types.js";
import { ErrorSchema } from "../schemas/common.js";
import {
  principleRequestSchema,
  principleResponseSchema,
  generateImageRequestSchema,
  generateImageResponseSchema,
  type PrincipleRequest,
  type GenerateImageRequest,
} from "../schemas/text-to-image.js";
import { logger } from "../utils/logger.js";
import { generatePrincipleSchema, generatePicture, buildPrompt } from "@wd-ai-tools/text-to-image";

const router = new OpenAPIHono<Context>();

const principleRoute = createRoute({
  method: "post",
  path: "/principle",
  tags: ["TextToImage"],
  summary: "Generate principle breakdown for a topic",
  request: {
    body: {
      content: {
        "application/json": { schema: principleRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Principle generated",
      content: {
        "application/json": { schema: principleResponseSchema },
      },
    },
    500: { description: "Internal error", content: { "application/json": { schema: ErrorSchema } } },
  },
});

router.openapi(principleRoute, async (c): Promise<any> => {
  const requestId = c.get("requestId");
  try {
    const body = await c.req.json() as PrincipleRequest;
    const result = await generatePrincipleSchema(body.topic);
    const data = (result as any)?.object ?? result;

    return c.json({ data, requestId, timestamp: new Date().toISOString() });
  } catch (err) {
    logger.error({ err, requestId }, "principle generation failed");
    return c.json({ error: "Failed to generate principle", requestId }, 500);
  }
});

const generateImageRoute = createRoute({
  method: "post",
  path: "/generate",
  tags: ["TextToImage"],
  summary: "Generate an illustration image for a topic",
  request: {
    body: {
      content: {
        "application/json": { schema: generateImageRequestSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Image generated as PNG",
      content: {
        "image/png": {
          schema: {
            type: "string",
            format: "binary",
          },
        },
      },
      headers: {
        "X-Request-ID": {
          description: "Request ID for tracking",
          schema: { type: "string" },
        },
      },
    },
    500: { description: "Internal error", content: { "application/json": { schema: ErrorSchema } } },
  },
});

router.openapi(generateImageRoute, async (c): Promise<any> => {
  const requestId = c.get("requestId");
  try {
    const body = await c.req.json() as GenerateImageRequest;
    const prompt = buildPrompt(body.topic) + (body.style ? `\n\nStyle note: ${body.style}` : "");
    console.log("Using prompt:", prompt, process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const buffer = await generatePicture(prompt, process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    
    if (!buffer) {
      return c.json({ error: "Failed to generate image", requestId }, 500);
    }

    // 直接返回图片数据
    c.header('Content-Type', 'image/png');
    c.header('X-Request-ID', requestId);
    return c.body(buffer);
  } catch (err) {
    logger.error({ err, requestId }, "image generation failed");
    return c.json({ error: "Failed to generate image", requestId }, 500);
  }
});

export { router as textToImageRouter };
