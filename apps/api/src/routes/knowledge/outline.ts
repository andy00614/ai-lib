import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { stream } from "hono/streaming";
import { OutlineGenerator, type OutlineRequest as KnowledgeOutlineRequest } from "@wd-ai-tools/knowledge-generator";
import { ProviderFactory } from "@wd-ai-tools/ai";
import { logger } from "../../utils/logger.js";
import { 
  outlineRequestSchema, 
  outlineResponseSchema, 
  type OutlineRequest,
  type OutlineApiResponse 
} from "../../schemas/knowledge.js";
import { ErrorSchema } from "../../schemas/common.js";
import type { Context } from "../../types.js";

const router = new OpenAPIHono<Context>();

const generateOutlineRoute = createRoute({
  method: "post",
  path: "/outline/generate",
  tags: ["Knowledge"],
  summary: "Generate knowledge outline",
  description: "Generate a structured knowledge outline from content with optional streaming support",
  request: {
    body: {
      content: {
        "application/json": {
          schema: outlineRequestSchema,
          example: {
            "content": "Python Web开发基础",
            "stream": false,
            "targetAudience": "初学者",
            "difficultyLevel": "intermediate",
            "estimatedDuration": "2小时",
            "language": "zh",
            "providerConfig": {
              "provider": "openai",
              "model": "gpt-4o-mini",
              "apiKey": "YOUR_OPENAI_API_KEY_HERE",
              "temperature": 0.7,
              "maxTokens": 2000
            }
          }
        },
      },
    },
  },
  responses: {
    200: {
      description: "Outline generated successfully",
      content: {
        "application/json": {
          schema: outlineResponseSchema,
        },
        "text/plain": {
          schema: {
            type: "string",
            description: "Streaming response (when stream=true)",
          },
        },
      },
    },
    400: {
      description: "Invalid request",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

router.openapi(generateOutlineRoute, async (c): Promise<any> => {
  try {
    const requestId = c.get("requestId");
    const body = await c.req.json() as OutlineRequest;
    const isStreaming = c.req.query("stream") === "true" || body.stream;

    // Create outline generator with provider config
    const generator = new OutlineGenerator({
      provider: body.providerConfig.provider,
      model: body.providerConfig.model || "gemini-1.5-flash",
      apiKey: body.providerConfig.apiKey,
      temperature: body.providerConfig.temperature,
      maxTokens: body.providerConfig.maxTokens,
    });

    // Convert API request to knowledge generator request
    const knowledgeRequest: KnowledgeOutlineRequest = {
      topic: body.content, // 使用 topic 而不是 content
      level: body.difficultyLevel,
      depth: 8, // 默认深度
      language: "zh" as const, // 默认中文
      includeExamples: true,
      stream: isStreaming,
    };

    if (isStreaming) {
      // Handle streaming response
      return stream(c, async (stream) => {
        try {
          c.header("Content-Type", "text/plain; charset=utf-8");
          c.header("Cache-Control", "no-cache");
          c.header("Connection", "keep-alive");

          const result = await generator.generate(knowledgeRequest);
          
          if (Symbol.asyncIterator in result) {
            // Handle streaming result
            for await (const chunk of result as AsyncIterable<any>) {
              await stream.write(JSON.stringify(chunk) + "\n");
            }
          } else {
            // Fallback to single response
            await stream.write(JSON.stringify(result) + "\n");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          await stream.write(JSON.stringify({ error: errorMessage }) + "\n");
        }
      });
    } else {
      // Handle regular JSON response
      const result = await generator.generate(knowledgeRequest);
      
      // Ensure we have a non-streaming result
      const outlineData = Symbol.asyncIterator in result 
        ? await (async () => {
            // Collect all chunks if somehow we got a streaming result
            let finalResult: any = {};
            for await (const chunk of result as AsyncIterable<any>) {
              finalResult = { ...finalResult, ...chunk };
            }
            return finalResult;
          })()
        : result;

      const response: OutlineApiResponse = {
        data: outlineData,
        requestId,
        timestamp: new Date().toISOString(),
      };

      return c.json(response);
    }
  } catch (error) {
    const requestId = c.get("requestId");
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    logger.error({
      error: errorMessage,
      requestId,
      stack: error instanceof Error ? error.stack : undefined,
    }, "Outline generation failed");

    return c.json({
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export { router as outlineRouter };