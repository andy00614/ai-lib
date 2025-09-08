# AI Tools API 项目详细介绍

## 📋 项目概述

这是一个基于 **Bun** 运行时构建的现代化 RESTful API 服务，集成了 AI SDK 支持，采用 TypeScript 开发，具备完整的认证、日志、文档和错误处理功能。

## 🏗️ 技术栈

- **运行时**: Bun (替代 Node.js)
- **Web 框架**: Hono (高性能 web 框架)  
- **API 文档**: OpenAPI 3.1 + Scalar UI
- **认证**: JWT + API Key 双重支持
- **日志**: Pino (高性能日志库)
- **AI 集成**: Vercel AI SDK (支持 OpenAI, Anthropic, Google)
- **类型安全**: TypeScript + Zod 验证
- **开发工具**: Turbo (Monorepo), Biome (代码格式化)

## 📁 项目结构详解

```
src/
├── index.ts              # 🚀 应用主入口 - 服务器配置和启动
├── types.ts              # 📝 全局类型定义 - Context 和 Response 类型
├── middleware/           # 🔒 中间件层
│   ├── index.ts          #   └── 中间件导出汇总
│   ├── auth.ts           #   └── JWT/API Key 认证逻辑
│   └── rate-limit.ts     #   └── 请求速率限制
├── routes/               # 🛣️ 路由层
│   ├── index.ts          #   └── 路由汇总
│   ├── health.ts         #   └── 健康检查端点
│   └── api/              #   └── API 路由模块
│       ├── index.ts      #       └── API 路由汇总
│       └── users.ts      #       └── 用户相关 API (示例)
├── utils/                # 🔧 工具函数
│   ├── health.ts         #   └── 健康检查逻辑
│   └── logger.ts         #   └── 日志配置 (Pino)
└── schemas/              # ✅ 数据验证
    └── common.ts         #   └── 通用 Zod Schema 定义
```

## 🔍 核心文件详解

### 1. `src/index.ts` - 应用主入口 ⭐

这是整个应用的核心，负责：

```typescript
// 🏗️ 应用初始化
const app = new OpenAPIHono<Context>();

// 🛡️ 安全配置
app.use("*", secureHeaders());     // 安全头
app.use("*", cors({...}));         // CORS 跨域
app.use("*", async (c, next) => {  // 请求日志 + ID 追踪
  const requestId = nanoid();      // 为每个请求生成唯一ID
  // ... 日志记录逻辑
});

// 📚 API 文档
app.doc("/openapi.json", {...});   // OpenAPI 规范
app.get("/", Scalar({...}));       // 可视化文档界面

// 🛣️ 路由挂载
app.route("/api", routers);        // 挂载所有 API 路由

// ❌ 错误处理
app.onError((error, c) => {...});  // 全局错误处理
app.notFound((c) => {...});        // 404 处理
```

### 2. `src/types.ts` - 类型定义 📝

定义了整个应用的类型约束：

```typescript
// 🎯 Hono Context 类型扩展
export type Context = {
  Variables: {
    requestId: string;        // 请求唯一标识
    userId?: string;          // 认证用户ID  
    session?: {               // 用户会话信息
      user: { id: string; email: string };
    };
  };
};

// 📤 API 响应标准格式
export type ApiResponse<T = any> = {
  data?: T;                   // 响应数据
  error?: string;             // 错误信息
  requestId: string;          // 请求追踪ID
  timestamp: string;          // 时间戳
};
```

### 3. `src/middleware/auth.ts` - 认证中间件 🔐

支持两种认证方式：

```typescript
export async function authMiddleware(c: Context, next: Next) {
  const token = authorization.replace("Bearer ", "");
  
  if (token.startsWith("sk-")) {
    // 🔑 API Key 认证 (适合服务间调用)
    const isValid = await validateApiKey(token);
    c.set("userId", "api-user");
  } else {
    // 🎫 JWT 认证 (适合用户登录)
    const { payload } = await jwtVerify(token, secret);
    c.set("userId", payload.sub as string);
    c.set("session", { user: { ... } });
  }
  
  await next();
}
```

### 4. `src/middleware/rate-limit.ts` - 速率限制 ⚡

防止 API 被滥用：

```typescript
export const createRateLimiter = (options) => {
  return rateLimiter({
    windowMs: 15 * 60 * 1000,    // 15分钟窗口
    limit: 100,                   // 最多100次请求
    keyGenerator: (c) => {        // 根据用户ID或IP限制
      return c.get("userId") || c.req.header("x-forwarded-for") || "anonymous";
    }
  });
};
```

### 5. `src/routes/` - 路由系统 🛣️

采用模块化路由设计：

```typescript
// routes/index.ts - 路由汇总
const router = new OpenAPIHono<Context>();
router.route("/", healthRouter);    // 挂载健康检查
router.route("/", apiRouter);       // 挂载API路由

// routes/api/users.ts - 用户API示例
router.openapi(
  getUserRoute,                     // OpenAPI 路由定义
  ...protectedMiddleware,           // 应用认证+限流中间件
  async (c) => {                    // 路由处理函数
    const { id } = c.req.valid("param");
    return c.json({ id, email: "...", name: "..." });
  }
);
```

### 6. `src/utils/logger.ts` - 日志系统 📊

高性能日志配置：

```typescript
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "development" ? {
    targets: [
      {
        target: "pino-pretty",          // 🎨 开发环境：彩色控制台输出
        options: { colorize: true }
      },
      {
        target: "pino/file",           // 📁 同时写入文件
        options: { destination: "logs/app.log" }
      }
    ]
  } : {
    target: "pino/file",              // 🏭 生产环境：仅文件输出
    options: { destination: "logs/app.log" }
  }
});
```

## 🚀 启动和使用

### 开发环境启动
```bash
# 在项目根目录
bun run dev:api

# 或者直接运行
cd apps/api
bun run dev
```

### 环境配置
复制 `.env.example` 到 `.env` 并配置：
```bash
# 服务器配置
PORT=3003
NODE_ENV=development

# AI SDK 配置
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# 认证配置  
JWT_SECRET=your-jwt-secret
API_KEY=your-api-key
```

## 📖 API 使用示例

### 1. 访问 API 文档
打开浏览器访问: `http://localhost:3003`
- 自动生成的交互式 API 文档
- 支持在线测试 API 端点

### 2. 健康检查
```bash
curl http://localhost:3003/api/health
# 响应: {"status":"ok","timestamp":"2025-09-08T09:02:20.156Z","version":"1.0.0"}
```

### 3. 受保护的 API (需要认证)
```bash
# 使用 JWT Token
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3003/api/users/123

# 使用 API Key  
curl -H "Authorization: Bearer sk-your-api-key" \
     http://localhost:3003/api/users/123
```

## 🔍 日志查看

### 开发环境
- **控制台**: 彩色格式化输出，便于调试
- **文件**: `logs/app.log` JSON 格式，便于分析

### 日志查看命令
```bash
# 实时查看日志
tail -f logs/app.log

# 查看特定请求的完整链路 (通过 requestId)
grep "l_uZ27XAFiB4Bi-Fonx9t" logs/app.log

# 查看错误日志
grep '"level":50' logs/app.log  # 50 = error level
```

### 日志内容说明
每个请求都会记录：
- **开始**: 方法、URL、请求ID、User-Agent、IP
- **结束**: 响应状态、处理时间、请求ID  
- **错误**: 错误信息、堆栈、请求上下文

## 🛠️ 开发扩展指南

### 添加新的 API 端点

1. **在 `src/routes/api/` 创建新模块**
```typescript
// src/routes/api/posts.ts
const router = new OpenAPIHono<Context>();

const createPostRoute = createRoute({
  method: "post",
  path: "/posts", 
  tags: ["Posts"],
  request: { body: { content: { "application/json": { schema: PostSchema }}}},
  responses: { 200: { ... } }
});

router.openapi(createPostRoute, ...protectedMiddleware, async (c) => {
  // 处理逻辑
});

export { router as postsRouter };
```

2. **在 `src/routes/api/index.ts` 中导入**
```typescript
import { postsRouter } from "./posts";
router.route("/", postsRouter);
```

### 集成 AI SDK

```typescript
// 在路由中使用 AI SDK
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

router.openapi(aiChatRoute, async (c) => {
  const { prompt } = c.req.valid("json");
  
  const { text } = await generateText({
    model: openai('gpt-4'),
    prompt: prompt
  });
  
  return c.json({ response: text });
});
```

## 🔧 配置说明

### package.json 脚本
- `dev`: 开发模式启动 (热重载)
- `build`: 构建生产版本  
- `start`: 生产模式启动
- `typecheck`: TypeScript 类型检查
- `lint`: 代码格式检查

### 依赖说明
- **核心**: `hono`, `@hono/zod-openapi`
- **AI**: `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`  
- **认证**: `jose` (JWT), `nanoid` (ID生成)
- **日志**: `pino`, `pino-pretty`
- **验证**: `zod`
- **文档**: `@scalar/hono-api-reference`

## ❓ 常见问题

### Q: 为什么选择 Bun 而不是 Node.js？
A: Bun 提供更快的启动速度、内置 TypeScript 支持、更好的性能，且 API 兼容 Node.js。

### Q: 如何添加数据库？
A: 推荐使用 `bun:sqlite` (SQLite) 或 `Bun.sql` (PostgreSQL)，在 `middleware/` 添加数据库连接中间件。

### Q: 如何部署到生产环境？
A: 
1. 设置 `NODE_ENV=production`
2. 配置生产环境变量
3. 使用 `bun run build && bun run start`
4. 建议使用 Docker 或云服务平台

### Q: 日志文件过大怎么办？
A: 可以配置日志轮转，或使用 `pino-roll` 进行自动归档。

这个项目架构清晰、功能完整、易于扩展。每个模块都有明确的职责，便于维护和开发新功能。