import { OutlineGenerator, QuestionGenerator } from '../packages/knowledge-generator/src/index.js';

async function testCompleteWorkflow() {
  console.log('=== 知识生成器综合测试 ===\n');

  // Step 1: 生成大纲
  console.log('1. 生成学习大纲...');
  const outlineGenerator = new OutlineGenerator({ provider: 'openai', model: 'gpt-4o-mini' });
  
  const outlineResult = await outlineGenerator.generate({
    topic: 'Node.js 基础',
    level: 'beginner',
    depth: 2,
    language: 'zh',
    includeExamples: true,
    stream: false
  });

  const outline = outlineResult as any;
  console.log('✅ 大纲生成成功！');
  console.log(`主题: ${outline.topic}`);
  console.log(`知识点数量: ${outline.structure?.length}`);
  
  if (outline.structure?.[0]) {
    const firstTopic = outline.structure[0];
    console.log(`第一个知识点: ${firstTopic.title}`);
    console.log(`描述: ${firstTopic.description}`);
    
    // Step 2: 基于第一个知识点生成题目
    console.log('\n2. 基于第一个知识点生成练习题...');
    const questionGenerator = new QuestionGenerator({ provider: 'openai', model: 'gpt-4o-mini' });
    
    const content = `
    知识点: ${firstTopic.title}
    
    描述: ${firstTopic.description}
    
    关键要点:
    ${firstTopic.keyPoints?.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n')}
    `;
    
    const questionResult = await questionGenerator.generate({
      content: content,
      questionType: 'mixed',
      count: 2,
      difficulty: 'easy',
      language: 'zh',
      outlineId: firstTopic.id || '',
      stream: false
    });

    const questions = questionResult as any;
    console.log('✅ 题目生成成功！');
    console.log(`题目数量: ${questions.questions?.length}`);
    console.log(`题目类型: ${questions.metadata?.questionTypes?.join(', ')}`);
    
    if (questions.questions?.[0]) {
      const firstQuestion = questions.questions[0];
      console.log(`\n第一道题目:`);
      console.log(`- 类型: ${firstQuestion.type}`);
      console.log(`- 标题: ${firstQuestion.title}`);
      if (firstQuestion.options?.length > 0) {
        console.log(`- 选项: ${firstQuestion.options.join(', ')}`);
      }
      console.log(`- 答案: ${firstQuestion.answer}`);
    }
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testCompleteWorkflow().catch(error => {
  console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error));
});