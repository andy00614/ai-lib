# 测试示例

这个目录包含了如何使用 AI Tools 功能的测试示例。

## 🚀 快速开始

### 1. 配置环境变量

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件，至少配置一个 AI Provider 的 API Key：

```bash
# 推荐使用 Google Gemini (免费额度较高)
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# 可选：OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# 可选：Anthropic Claude  
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. 安装依赖

```bash
# 在项目根目录
bun install
```

### 3. 运行测试

```bash
# 进入示例目录
cd examples

# 运行大纲生成器测试
bun run test:outline

# 或者直接运行
bun run outline-generator-test.ts
```

## 🧪 测试内容

### OutlineGenerator 功能测试

测试文件：`outline-generator-test.ts`

包含以下测试：

1. **默认配置测试**
   - 使用 Google Gemini 模型
   - 非流式生成
   - 中文大纲生成

2. **自定义Provider测试** 
   - 使用 OpenAI GPT-4o-mini 模型
   - 英文大纲生成

3. **流式生成测试**
   - 实时接收生成过程
   - 显示每个数据块的内容

4. **服务类测试**
   - 使用 KnowledgeGeneratorService
   - 高级主题大纲生成

## 📋 测试场景

### 测试数据示例

```typescript
// 中级难度 React Hooks 大纲
{
  topic: "React Hooks",
  level: "intermediate", 
  depth: 5,
  language: "zh",
  includeExamples: true,
  stream: false
}

// 高级难度 TypeScript 类型大纲  
{
  topic: "TypeScript Advanced Types",
  level: "advanced",
  depth: 4, 
  language: "en",
  includeExamples: true,
  stream: false
}
```

## 🔍 预期输出

### 非流式响应示例
```bash
✅ 生成成功!
📋 主题: React Hooks
📊 级别: intermediate
🔢 大纲项数量: 5
⏰ 生成时间: 2024-01-15T10:30:00.000Z
🤖 使用模型: google:gemini-1.5-flash

1. useState Hook 基础
   描述: 学习如何使用 useState 管理组件状态
   要点: 状态声明, 状态更新

2. useEffect Hook 详解
   描述: 理解副作用处理和生命周期
   要点: 依赖数组, 清理函数
```

### 流式响应示例
```bash
📡 开始流式接收数据...

📦 Chunk 1:
  主题: React Hooks
  
📦 Chunk 2:  
  当前大纲项数量: 2
  最新项目: useState Hook 基础
  
📦 Chunk 3:
  当前大纲项数量: 5
  最新项目: 自定义 Hook 开发
  
✅ 流式生成完成! 总共收到 3 个数据块
```

## 🛠️ API 使用示例

### 基本用法

```typescript
import { OutlineGenerator } from '@wd-ai-tools/knowledge-generator';

// 默认配置 (Google Gemini)
const generator = new OutlineGenerator();

const result = await generator.generate({
  topic: "Vue.js 3 组合式API",
  level: "intermediate",
  depth: 4,
  language: "zh", 
  includeExamples: true,
  stream: false
});
```

### 自定义Provider

```typescript
// 使用 OpenAI
const generator = new OutlineGenerator({
  provider: 'openai',
  model: 'gpt-4o-mini'
});

// 使用 Anthropic Claude
const generator = new OutlineGenerator({
  provider: 'anthropic', 
  model: 'claude-3-5-haiku-20241022'
});
```

### 流式生成

```typescript
const result = await generator.generate({
  topic: "Python 异步编程",
  level: "advanced",
  stream: true  // 启用流式
});

// 处理流式响应
for await (const chunk of result) {
  console.log('收到新数据:', chunk);
}
```

## 🐛 常见问题

### API Key 错误
```
❌ 生成失败: API key not found for google
```
**解决方案：** 检查 `.env` 文件中是否正确设置了 API Key

### 网络请求失败
```
❌ 生成失败: fetch failed
```
**解决方案：** 检查网络连接，确认 API Key 有效

### 模型不存在
```  
❌ 生成失败: model not found
```
**解决方案：** 检查模型名称是否正确，确认有访问权限

## 🔗 相关链接

- [Google AI Studio](https://aistudio.google.com/) - 获取 Gemini API Key
- [OpenAI Platform](https://platform.openai.com/) - 获取 OpenAI API Key  
- [Anthropic Console](https://console.anthropic.com/) - 获取 Claude API Key