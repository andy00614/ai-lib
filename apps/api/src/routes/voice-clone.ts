import { OpenAPIHono } from "@hono/zod-openapi";
import { createRoute, z } from "@hono/zod-openapi";
import { db, createAudioRecording, updateAudioRecordingMetadata } from "@ai-tools/db";
import type { Context } from "../types";
import { logger } from "../utils/logger";
import { nanoid } from "nanoid";
import * as path from "path";
import * as fs from "fs";

const voiceCloneRouter = new OpenAPIHono<Context>();

// 上传音频文件的路由
const uploadAudioRoute = createRoute({
  method: "post",
  path: "/upload",
  description: "Upload audio file for voice cloning",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            audio: z.string().describe("Audio file"),
            duration: z.string().describe("Audio duration in seconds"),
            userId: z.string().optional().describe("User ID (temporary field)"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              id: z.string(),
              fileName: z.string(),
              filePath: z.string(),
              fileSize: z.number(),
              duration: z.number(),
              status: z.string(),
              createdAt: z.string(),
            }),
          }),
        },
      },
      description: "Audio file uploaded successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            details: z.string().optional(),
          }),
        },
      },
      description: "Bad request",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            requestId: z.string().optional(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

voiceCloneRouter.openapi(uploadAudioRoute, async (c) => {
  const requestId = c.get("requestId");
  
  try {
    const body = await c.req.parseBody();
    const audioFile = body["audio"] as File;
    const duration = parseFloat(body["duration"] as string);
    const userId = body["userId"] as string || "temp-user-id"; // 临时处理，后续需要从认证中获取

    // 验证文件
    if (!audioFile || !audioFile.size) {
      return c.json({
        error: "No audio file provided",
        details: "Audio file is required"
      }, 400);
    }

    // 验证文件类型
    if (!audioFile.type.startsWith("audio/")) {
      return c.json({
        error: "Invalid file type",
        details: "Only audio files are allowed"
      }, 400);
    }

    // 验证文件大小 (50MB 限制)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (audioFile.size > maxSize) {
      return c.json({
        error: "File too large",
        details: "Maximum file size is 50MB"
      }, 400);
    }

    // 验证录音时长
    if (isNaN(duration) || duration < 10) {
      return c.json({
        error: "Invalid duration",
        details: "Audio duration must be at least 10 seconds"
      }, 400);
    }

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), "uploads", "audio");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 生成唯一文件名
    const fileExtension = path.extname(audioFile.name) || ".wav";
    const fileName = `${nanoid()}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // 保存文件
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // 记录到数据库
    const audioRecord = await createAudioRecording(db, {
      userId,
      fileName,
      originalName: audioFile.name,
      filePath,
      fileSize: audioFile.size,
      duration: duration.toString(),
      format: "wav",
      status: "completed",
    });

    logger.info({
      requestId,
      audioRecordId: audioRecord.id,
      fileName,
      fileSize: audioFile.size,
      duration
    }, "Audio file uploaded successfully");

    return c.json({
      success: true,
      data: {
        id: audioRecord.id,
        fileName: audioRecord.fileName,
        filePath: audioRecord.filePath,
        fileSize: audioRecord.fileSize,
        duration: parseFloat(audioRecord.duration || "0"),
        status: audioRecord.status,
        createdAt: audioRecord.createdAt.toISOString(),
      }
    });

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    }, "Failed to upload audio file");

    return c.json({
      error: "Failed to upload audio file",
      requestId
    }, 500);
  }
});

// 获取用户的录音列表
const getRecordingsRoute = createRoute({
  method: "get",
  path: "/recordings",
  description: "Get user's audio recordings",
  request: {
    query: z.object({
      userId: z.string().optional().describe("User ID (temporary parameter)"),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(z.object({
              id: z.string(),
              fileName: z.string(),
              originalName: z.string().nullable(),
              fileSize: z.number(),
              duration: z.number(),
              format: z.string(),
              status: z.string(),
              createdAt: z.string(),
            })),
          }),
        },
      },
      description: "Audio recordings retrieved successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
            requestId: z.string().optional(),
          }),
        },
      },
      description: "Internal server error",
    },
  },
});

voiceCloneRouter.openapi(getRecordingsRoute, async (c) => {
  const requestId = c.get("requestId");
  
  try {
    const { userId = "temp-user-id" } = c.req.query();

    // 这里需要添加从数据库获取用户录音的逻辑
    // 由于我们还没有实现 getUserAudioRecordings 查询，先返回空数组
    
    logger.info({
      requestId,
      userId
    }, "Retrieved user audio recordings");

    return c.json({
      success: true,
      data: [] // 临时返回空数组
    });

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    }, "Failed to retrieve audio recordings");

    return c.json({
      error: "Failed to retrieve audio recordings",
      requestId
    }, 500);
  }
});

// 下载音频文件
const downloadAudioRoute = createRoute({
  method: "get",
  path: "/download/{id}",
  description: "Download audio file",
  request: {
    params: z.object({
      id: z.string().describe("Audio recording ID"),
    }),
  },
  responses: {
    200: {
      content: {
        "audio/*": {
          schema: z.string().describe("Audio file binary data"),
        },
      },
      description: "Audio file",
    },
    404: {
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
      description: "Audio file not found",
    },
  },
});

voiceCloneRouter.openapi(downloadAudioRoute, async (c) => {
  const requestId = c.get("requestId");
  const { id } = c.req.param();
  
  try {
    // 这里需要添加从数据库获取音频记录并返回文件的逻辑
    // 暂时返回404
    return c.json({
      error: "Audio file not found"
    }, 404);

  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      audioId: id
    }, "Failed to download audio file");

    return c.json({
      error: "Failed to download audio file"
    }, 500);
  }
});

export { voiceCloneRouter };