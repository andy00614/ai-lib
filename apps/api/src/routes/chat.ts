import { Hono } from 'hono';

const app = new Hono();

// 获取可用模型列表 - 基础版本
app.get('/models', (c) => {
  return c.json({ 
    message: 'Models endpoint - 待实现',
    models: []
  });
});

// 创建新对话 - 基础版本
app.post('/conversations', async (c) => {
  return c.json({ 
    message: 'Create conversation endpoint - 待实现',
    conversationId: 'demo-conversation-id'
  });
});

// 多模型对话 - 基础版本
app.post('/chat', async (c) => {
  try {
    const body = await c.req.json();
    
    return c.json({
      message: 'Multi-model chat endpoint - 待实现',
      receivedPrompt: body.prompt,
      selectedModels: body.models || []
    });
  } catch (error) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
});

export { app as chatRoutes };