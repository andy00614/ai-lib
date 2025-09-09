import { OutlineGenerator } from '../packages/knowledge-generator/src/generators/outline-generator.js';

const generator = new OutlineGenerator({ provider: 'openai', model: 'gpt-4o-mini' });

try {
  console.log('开始生成大纲...');
  const result = await generator.generate({
    topic: 'JavaScript 基础',
    level: 'beginner',
    depth: 3,
    language: 'zh',
    includeExamples: true,
    stream: false
  });

  console.log('✅ 生成成功！');
  console.log('主题:', (result as any).topic);
  console.log('结构长度:', (result as any).structure?.length);
  if ((result as any).structure?.[0]) {
    console.log('第一个主题:', (result as any).structure[0].title);
  }
} catch (error) {
  console.error('❌ 生成失败:', error instanceof Error ? error.message : String(error));
}