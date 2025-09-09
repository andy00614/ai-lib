import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { stream } from "hono/streaming";
import { QuestionGenerator, type QuestionRequest as KnowledgeQuestionRequest } from "@wd-ai-tools/knowledge-generator";
import { ProviderFactory } from "@wd-ai-tools/ai";
import { logger } from "../../utils/logger.js";
import { 
  questionRequestSchema, 
  questionsResponseSchema, 
  type QuestionRequest,
  type QuestionsResponse 
} from "../../schemas/knowledge.js";
import { ErrorSchema } from "../../schemas/common.js";
import type { Context } from "../../types.js";

const router = new OpenAPIHono<Context>();

const generateQuestionsRoute = createRoute({
  method: "post",
  path: "/questions/generate",
  tags: ["Knowledge"],
  summary: "Generate knowledge questions",
  description: "Generate questions from content with optional streaming support",
  request: {
    body: {
      content: {
        "application/json": {
          schema: questionRequestSchema,
          example: {
            "content": "JavaScript变量和数据类型的基础知识",
            "stream": false,
            "questionTypes": ["single_choice", "multiple_choice"],
            "count": 5,
            "difficulty": "mixed",
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
      description: "Questions generated successfully",
      content: {
        "application/json": {
          schema: questionsResponseSchema,
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

router.openapi(generateQuestionsRoute, async (c): Promise<any> => {
  try {
    const requestId = c.get("requestId");
    const body = await c.req.json() as QuestionRequest;
    const isStreaming = c.req.query("stream") === "true" || body.stream;

    // Create question generator with provider config
    const generator = new QuestionGenerator({
      provider: body.providerConfig.provider,
      model: body.providerConfig.model || "gemini-1.5-flash",
      apiKey: body.providerConfig.apiKey,
    });

    // Convert API request to knowledge generator request
    const knowledgeRequest: KnowledgeQuestionRequest = {
      content: body.content,
      questionType: "mixed" as const, // 使用单数形式，设置为mixed来支持多种类型
      count: body.count,
      difficulty: "mixed" as const,
      language: "zh" as const,
      outlineId: "",
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
      const questionsData = Symbol.asyncIterator in result 
        ? await (async () => {
            // Collect all chunks if somehow we got a streaming result
            let finalResult: any = {};
            for await (const chunk of result as AsyncIterable<any>) {
              finalResult = { ...finalResult, ...chunk };
            }
            return finalResult;
          })()
        : result;

      const response: QuestionsResponse = {
        data: questionsData,
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
    }, "Question generation failed");

    return c.json({
      error: errorMessage,
      requestId,
      timestamp: new Date().toISOString(),
    }, 500);
  }
});

export { router as questionRouter };