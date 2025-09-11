# 🚨 前端修复指南 - CORS 问题解决

## 问题原因
你的前端 `https://wd-ai-lib.fly.dev` 仍在向 `http://localhost:8080` 发送请求，但应该向部署的 API 发送请求。

## ✅ 解决方案

### 1. 找到前端中的 API URL 配置

在你的前端项目中搜索 `localhost:8080`，通常在这些文件中：
- `config.js` / `config.ts`
- `constants.js` / `constants.ts` 
- `.env` / `.env.production`
- `api.js` / `api.ts`

### 2. 更新 API 基础 URL

**选项 A: 环境变量方式 (推荐)**
```javascript
// 在 .env.production 文件中
NEXT_PUBLIC_API_URL=https://wd-ai-tool-api.fly.dev
# 或者 REACT_APP_API_URL=https://wd-ai-tool-api.fly.dev (Create React App)
# 或者 VITE_API_URL=https://wd-ai-tool-api.fly.dev (Vite)

// 在代码中使用
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

**选项 B: 直接在代码中修改**
```javascript
// 替换这种代码：
const API_BASE_URL = 'http://localhost:8080';

// 改为：
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://wd-ai-tool-api.fly.dev'  // 生产环境
  : 'http://localhost:8080';          // 开发环境
```

### 3. 常见的文件位置和修改示例

**Next.js 项目:**
```javascript
// utils/api.js 或 lib/api.js
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://wd-ai-tool-api.fly.dev'
  : 'http://localhost:8080';

// 使用示例
export const textToImage = {
  principle: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/text-to-image/principle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};
```

**React 项目:**
```javascript
// src/config/api.js
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://wd-ai-tool-api.fly.dev'
    : 'http://localhost:8080'
};

export default config;
```

### 4. 验证修复

修改后，你的请求应该从：
```
❌ https://wd-ai-lib.fly.dev → http://localhost:8080/api/...
```

变为：
```
✅ https://wd-ai-lib.fly.dev → https://wd-ai-tool-api.fly.dev/api/...
```

### 5. 重新部署前端

修改完成后，重新部署你的前端应用：
```bash
# 根据你的部署方式
npm run build && [部署命令]
```

## 🔧 临时调试

我已经在 API 中添加了临时的 `.fly.dev` 域名支持，但这不是长期解决方案。最重要的是修复前端的 API URL。

## 📞 需要帮助？

如果找不到前端代码中的 API URL 配置，请分享：
1. 前端项目的框架 (Next.js, React, Vue, etc.)
2. API 调用的相关代码片段
3. 项目的目录结构

这样我可以提供更具体的修复指导。