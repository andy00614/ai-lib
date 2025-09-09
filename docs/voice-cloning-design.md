# 语音克隆功能技术设计文档

## 0. 官方文档链接

### fal.ai 相关文档
- **MiniMax Voice Clone API**: https://fal.ai/models/fal-ai/minimax/voice-clone/api
- **JavaScript/TypeScript SDK**: https://docs.fal.ai/clients/javascript/
- **fal.ai 主文档**: https://docs.fal.ai/
- **GitHub 仓库**: https://github.com/fal-ai/fal-js
- **npm 包**: https://www.npmjs.com/package/@fal-ai/client

### MiniMax 相关资源  
- **MiniMax Speech-02 HD**: https://fal.ai/models/fal-ai/minimax/speech-02-hd/api
- **MiniMax 官方 GitHub**: https://github.com/MiniMax-AI/MiniMax-MCP
- **API 使用教程**: https://apidog.com/blog/how-to-clone-a-voice-using-minimaxs-t2a-01-hd-api/

## 1. 项目概述

### 1.1 功能描述
基于 fal.ai 的 MiniMax Voice Clone 模型，实现用户语音克隆和文本转语音功能。用户上传语音样本后，系统训练专属语音模型，可将任意文本转换为用户的声音。

### 1.2 核心特性
- **快速克隆**：10秒音频即可开始训练
- **多语言支持**：支持中文、英文等30+语言
- **实时生成**：支持流式和批量文本转语音
- **高质量输出**：工业级语音合成质量

## 2. 技术架构

### 2.1 整体架构
```
前端界面 → API层 → fal.ai服务 → 数据存储
    ↓         ↓         ↓          ↓
  上传UI   路由处理   语音处理   模型存储
```

### 2.2 技术栈选择
- **前端**：基于现有 Next.js 框架
- **后端 API**：Hono 框架（与现有架构一致）
- **AI 服务**：fal.ai MiniMax Voice Clone
- **数据库**：PostgreSQL（存储模型元数据）
- **文件存储**：云存储（音频文件）

### 2.3 核心依赖
```json
{
  "@fal-ai/client": "^1.0.0",
  "multer": "^1.4.5",
  "ffmpeg": "^0.0.4"
}
```

## 3. API 设计

### 3.1 语音克隆 API

#### 创建语音克隆模型
```typescript
POST /api/voice-clone/create

Request:
{
  "audio_url": "string",           // 语音文件URL（10秒以上）
  "voice_name": "string",          // 自定义声音名称
  "description": "string"          // 描述（可选）
}

Response:
{
  "voice_id": "string",           // 克隆的语音ID
  "status": "training|ready",     // 训练状态
  "created_at": "timestamp"
}
```

#### 文本转语音
```typescript
POST /api/voice-clone/synthesize

Request:
{
  "voice_id": "string",           // 语音模型ID
  "text": "string",               // 要合成的文本（最大5000字符）
  "stream": "boolean"             // 是否流式返回
}

Response:
{
  "audio_url": "string",          // 生成的音频文件URL
  "duration": "number",           // 音频时长（秒）
  "status": "success|failed"
}
```

#### 获取语音模型列表
```typescript
GET /api/voice-clone/models

Response:
{
  "models": [
    {
      "voice_id": "string",
      "voice_name": "string", 
      "status": "string",
      "created_at": "timestamp"
    }
  ]
}
```

### 3.2 fal.ai 集成

#### 语音克隆调用
```typescript
import { fal } from "@fal-ai/client";

// 配置认证
fal.config({
  credentials: process.env.FAL_KEY
});

// 调用语音克隆
const result = await fal.subscribe("fal-ai/minimax/voice-clone", {
  input: {
    audio_url: audioUrl,
    text: textToSynthesize,
    // 其他参数
  },
  logs: true,
  onQueueUpdate: (update) => {
    // 处理队列状态更新
  }
});
```

## 4. 数据模型设计

### 4.1 数据库表结构

#### voice_models 表
```sql
CREATE TABLE voice_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  team_id UUID NOT NULL,
  voice_name VARCHAR(255) NOT NULL,
  voice_id VARCHAR(255) UNIQUE NOT NULL,
  fal_voice_id VARCHAR(255), -- fal.ai 返回的语音ID
  status VARCHAR(50) DEFAULT 'training',
  audio_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_models_user_team ON voice_models(user_id, team_id);
CREATE INDEX idx_voice_models_status ON voice_models(status);
```

#### voice_generations 表
```sql
CREATE TABLE voice_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_model_id UUID NOT NULL REFERENCES voice_models(id),
  text TEXT NOT NULL,
  audio_url TEXT,
  duration DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'processing',
  fal_request_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_voice_generations_model ON voice_generations(voice_model_id);
CREATE INDEX idx_voice_generations_status ON voice_generations(status);
```

## 5. 前端设计

### 5.1 页面结构
```
/voice-clone
├── /create          # 创建语音模型页面
├── /models          # 语音模型管理页面
└── /synthesize      # 文本转语音页面
```

### 5.2 核心组件

#### VoiceUploader 组件
```typescript
interface VoiceUploaderProps {
  onUpload: (file: File) => void;
  maxDuration?: number;
  minDuration?: number;
}

// 功能:
// - 音频文件拖拽上传
// - 录音功能
// - 音频预览播放
// - 时长验证（至少10秒）
```

#### VoiceModelCard 组件
```typescript
interface VoiceModelCardProps {
  model: VoiceModel;
  onDelete: (id: string) => void;
  onTest: (id: string, text: string) => void;
}

// 功能:
// - 显示模型基本信息
// - 训练状态指示器
// - 测试语音合成
// - 删除模型
```

#### TextToSpeech 组件
```typescript
interface TextToSpeechProps {
  voiceId: string;
  onGenerate: (text: string) => void;
}

// 功能:
// - 文本输入框（支持多行）
// - 字符计数器
// - 实时预览
// - 批量处理
```

### 5.3 用户体验设计

#### 创建流程
1. **上传音频**：拖拽或录音，实时显示时长
2. **设置信息**：输入语音名称和描述
3. **开始训练**：显示进度条和预计完成时间
4. **训练完成**：自动跳转到测试页面

#### 合成流程
1. **选择声音**：语音模型卡片选择
2. **输入文本**：支持实时字符统计
3. **生成语音**：显示处理进度
4. **播放下载**：音频播放器和下载按钮

## 6. 实现步骤

### Phase 1: 基础功能（1-2周）
- [ ] 设置 fal.ai 客户端和认证
- [ ] 实现音频上传和基本验证
- [ ] 创建数据库表和基础 API
- [ ] 简单的语音克隆调用

### Phase 2: 核心功能（2-3周）
- [ ] 完整的语音克隆流程
- [ ] 文本转语音功能
- [ ] 语音模型管理界面
- [ ] 错误处理和状态管理

### Phase 3: 优化体验（1-2周）
- [ ] 美观的前端界面设计
- [ ] 实时状态更新
- [ ] 音频播放器组件
- [ ] 批量处理功能

### Phase 4: 高级功能（1-2周）
- [ ] 流式语音生成
- [ ] 音频格式转换
- [ ] 使用统计和配额管理
- [ ] 性能优化

## 7. 技术考虑

### 7.1 性能优化
- **音频压缩**：上传前自动压缩音频文件
- **缓存策略**：常用语音合成结果缓存
- **异步处理**：长时间任务使用队列处理
- **CDN 加速**：音频文件 CDN 分发

### 7.2 安全考虑
- **文件验证**：严格的音频文件格式和大小限制
- **权限控制**：用户只能访问自己的语音模型
- **敏感内容**：文本内容过滤和审核
- **API 限流**：防止滥用和恶意请求

### 7.3 错误处理
```typescript
// 常见错误类型
enum VoiceCloneError {
  AUDIO_TOO_SHORT = 'AUDIO_TOO_SHORT',
  AUDIO_FORMAT_INVALID = 'AUDIO_FORMAT_INVALID', 
  FAL_API_ERROR = 'FAL_API_ERROR',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  MODEL_NOT_READY = 'MODEL_NOT_READY'
}

// 错误处理策略
const errorHandlers = {
  [VoiceCloneError.AUDIO_TOO_SHORT]: '音频时长至少需要10秒',
  [VoiceCloneError.FAL_API_ERROR]: 'AI服务暂时不可用，请稍后重试',
  // ...
};
```

## 8. 成本估算

### 8.1 fal.ai 定价
- **语音克隆**：按模型训练次数计费
- **语音合成**：按字符数计费
- **预估成本**：每1000字符约 $0.02-0.05

### 8.2 资源需求
- **存储空间**：音频文件存储（用户上传 + 生成结果）
- **带宽消耗**：音频文件传输
- **数据库**：元数据存储（较小）

## 9. 监控和分析

### 9.1 关键指标
- 语音模型创建成功率
- 文本转语音响应时间
- 用户活跃度和使用频率
- API 调用成功率和错误分布

### 9.2 日志记录
```typescript
// 关键操作日志
logger.info('Voice clone started', {
  userId,
  audioUrl,
  duration,
  timestamp: new Date().toISOString()
});

logger.info('TTS generation completed', {
  voiceId,
  textLength,
  audioDuration,
  responseTime
});
```

## 10. 部署和维护

### 10.1 环境变量
```bash
# fal.ai 配置
FAL_KEY=your_fal_api_key
FAL_ENDPOINT=https://fal.run/

# 文件存储
STORAGE_PROVIDER=aws_s3
STORAGE_BUCKET=voice-cloning-bucket

# 数据库
DATABASE_URL=postgresql://...
```

### 10.2 部署清单
- [ ] fal.ai API 密钥配置
- [ ] 数据库迁移执行
- [ ] 文件存储配置
- [ ] 监控和日志系统
- [ ] 备份策略设置

这个设计文档涵盖了语音克隆功能的完整技术实现，你可以基于这个设计开始开发。有任何需要调整或详细说明的部分吗？