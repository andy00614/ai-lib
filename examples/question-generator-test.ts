import { QuestionGenerator } from '../packages/knowledge-generator/src/generators/question-generator.js';

const generator = new QuestionGenerator({ provider: 'openai', model: 'gpt-4o-mini' });

const testContent = `
JavaScript 变量声明

JavaScript中有三种声明变量的方式：var、let、const。

1. var：
   - 函数作用域
   - 可以重新声明
   - 可以更新值
   - 存在变量提升

2. let：
   - 块级作用域
   - 不可重新声明
   - 可以更新值
   - 不存在变量提升

3. const：
   - 块级作用域
   - 不可重新声明
   - 不可更新值（对于对象和数组，内容可以修改）
   - 不存在变量提升
`;

try {
  console.log('开始生成题目...');
  const result = await generator.generate({
    content: testContent,
    questionType: 'mixed',
    count: 3,
    difficulty: 'medium',
    language: 'zh',
    outlineId: '',
    stream: false
  });

  console.log('✅ 生成成功！');
  const response = result as any;
  console.log('题目数量:', response.questions?.length);
  console.log('元数据:', response.metadata);
  
  if (response.questions?.[0]) {
    console.log('\n第一道题目:');
    console.log('- 类型:', response.questions[0].type);
    console.log('- 标题:', response.questions[0].title);
    console.log('- 选项数量:', response.questions[0].options?.length);
  }
} catch (error) {
  console.error('❌ 生成失败:', error instanceof Error ? error.message : String(error));
}