# API测试示例

## 🧪 测试用的默认JSON配置

### 1. Google Gemini (推荐)
```json
{
  "content": "Python Web开发",
  "stream": false,
  "targetAudience": "初学者",
  "difficultyLevel": "beginner",
  "estimatedDuration": "2小时",
  "language": "zh",
  "providerConfig": {
    "provider": "google",
    "model": "gemini-1.5-flash",
    "apiKey": "YOUR_GOOGLE_AI_API_KEY_HERE"
  }
}
```

### 2. OpenAI GPT (修正版)
```json
{
  "content": "React Hooks开发实战",
  "stream": false,
  "targetAudience": "中级开发者", 
  "difficultyLevel": "intermediate",
  "estimatedDuration": "3小时",
  "language": "zh",
  "providerConfig": {
    "provider": "openai",
    "model": "gpt-4o-mini",
    "apiKey": "YOUR_OPENAI_API_KEY_HERE"
  }
}
```

### 3. Claude (Anthropic)
```json
{
  "content": "Docker容器化部署",
  "stream": false,
  "targetAudience": "运维工程师",
  "difficultyLevel": "advanced", 
  "estimatedDuration": "4小时",
  "language": "zh",
  "providerConfig": {
    "provider": "anthropic",
    "model": "claude-3-5-haiku-20241022",
    "apiKey": "YOUR_CLAUDE_API_KEY_HERE"
  }
}
```

## 🔧 修复建议

### 问题1: OpenAI模型名称错误
你使用的 `gpt-5-mini` 不存在，正确的模型名称：
- `gpt-4o-mini` (推荐，便宜快速)
- `gpt-4o` (更强大但更贵)
- `gpt-3.5-turbo` (便宜的选择)

### 问题2: API Key格式检查
确保你的OpenAI API Key格式正确：
- 应该以 `sk-` 开头
- 长度通常为51个字符
- 示例格式: `sk-proj-ABC123...`

### 问题3: 账户余额
请检查你的OpenAI账户是否有足够余额：
- 访问: https://platform.openai.com/account/usage
- 确认你的账户状态是活跃的

## 🚀 快速测试步骤

1. **复制上面的JSON**到Scalar界面的Body部分
2. **替换API Key**为你真实的key
3. **选择正确的模型名称**
4. **点击发送测试**

## 📝 Question Generation测试
```json
{
  "content": "JavaScript变量和数据类型的基础知识",
  "stream": false,
  "questionTypes": ["single_choice", "multiple_choice"],
  "count": 5,
  "difficulty": "mixed",
  "language": "zh",
  "providerConfig": {
    "provider": "google",
    "model": "gemini-1.5-flash", 
    "apiKey": "YOUR_GOOGLE_AI_API_KEY_HERE"
  }
}
```