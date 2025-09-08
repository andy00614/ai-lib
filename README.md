# AI Tools - 智能化AI工具集

基于Midday架构模式的现代化AI工具集monorepo项目。

## 🚀 快速开始

### 环境要求

- Bun 1.2+
- PostgreSQL 15+ (需要安装pgvector扩展)
- Node.js 18+ (作为备选)

### 安装依赖

```bash
bun install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env
```

2. 配置API密钥：
```env
# 至少配置一个AI提供商的API Key
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key  
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key

# 数据库连接
DATABASE_URL=postgresql://localhost:5432/ai_tools
```

### 数据库设置

1. 创建数据库：
```bash
createdb ai_tools
```

2. 安装pgvector扩展（如果需要向量功能）：
```sql
CREATE EXTENSION vector;
```

3. 生成并运行迁移：
```bash
cd packages/db
bun run db:generate
bun run db:migrate
```

### 启动开发服务器

```bash
# 启动API服务器
bun run dev:api

# 或启动所有服务
bun run dev
```

API服务器将在 http://localhost:3003 启动，API文档可在根路径查看。

## 📁 项目结构

```
ai-tools/
├── apps/
│   ├── api/              # API服务器 (Hono)
│   └── dashboard/        # 前端界面 (Next.js)
├── packages/
│   ├── db/               # 数据库层 (Drizzle ORM)
│   ├── ai/               # AI核心模块
│   └── [其他共享包...]
└── docs/                 # 项目文档
```

## 🔌 API接口

### 多模型问答API

#### 获取可用模型列表
```bash
GET /api/chat/models
```

#### 创建对话
```bash
POST /api/chat/conversations
```

#### 多模型对话 (非流式)
```bash
POST /api/chat/chat
Content-Type: application/json

{
  "prompt": "解释一下什么是人工智能",
  "models": ["gpt-4o", "claude-3-5-sonnet", "gemini-1.5-pro"],
  "temperature": 0.7,
  "maxTokens": 1000
}
```

#### 多模型对话 (流式)
```bash
POST /api/chat/chat/stream
Content-Type: application/json

{
  "prompt": "写一个Python的快速排序算法",
  "models": ["gpt-4o-mini", "claude-3-haiku"]
}
```

## 🎯 已实现功能

- ✅ **基础项目结构**: Monorepo + 包管理 + TypeScript
- ✅ **数据库架构**: PostgreSQL + Drizzle ORM + 完整Schema
- ✅ **API基础框架**: Hono + 路由结构 + 基础端点
- 🔄 **多模型问答API**: 框架已就绪，待逐步实现具体功能

## 🛠️ 开发命令

```bash
# 安装依赖
bun install

# 开发模式
bun run dev              # 启动所有服务
bun run dev:api          # 只启动API服务

# 构建
bun run build            # 构建所有包

# 代码质量
bun run lint             # 代码检查
bun run format           # 代码格式化
bun run typecheck        # 类型检查

# 数据库
cd packages/db
bun run db:generate      # 生成迁移文件
bun run db:migrate       # 执行迁移
bun run db:studio        # 打开数据库可视化界面
```

## 📦 技术栈

- **运行时**: Bun
- **Web框架**: Hono
- **数据库**: PostgreSQL + Drizzle ORM
- **AI集成**: Vercel AI SDK
- **类型安全**: TypeScript
- **Monorepo**: Turborepo

## 🔮 计划功能

- 🔄 知识点大纲与题目生成
- 🔄 RAG知识检索系统
- 🔄 语音克隆系统
- 🔄 语音转文本/文本转语音
- 🔄 用户认证和权限管理
- 🔄 Web界面开发

## 📝 API使用示例

### 测试基础API端点

```bash
# 测试健康检查
curl http://localhost:3003/

# 测试模型列表 (待实现)
curl http://localhost:3003/api/chat/models

# 测试对话创建 (待实现)
curl -X POST http://localhost:3003/api/chat/conversations \
  -H "Content-Type: application/json"

# 测试聊天端点 (待实现)  
curl -X POST http://localhost:3003/api/chat/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello",
    "models": ["gpt-4"]
  }'
```

## 🤝 贡献

欢迎提交PR和Issue！请确保：

1. 代码通过所有检查 (`bun run lint && bun run typecheck`)
2. 添加适当的测试
3. 更新相关文档

## 📄 许可证

MIT License
