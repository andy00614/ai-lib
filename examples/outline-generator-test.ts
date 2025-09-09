/**
 * OutlineGenerator 测试示例
 * 展示如何使用知识大纲生成器
 */
import { OutlineGenerator, KnowledgeGeneratorService } from '@wd-ai-tools/knowledge-generator';
import type { OutlineRequest } from '@wd-ai-tools/knowledge-generator';
import { generateText } from 'ai';

// 测试数据
const testRequests: OutlineRequest[] = [
  {
    topic: "React Hooks",
    level: "intermediate",
    depth: 5,
    language: "zh",
    includeExamples: true,
    stream: false
  },
  {
    topic: "TypeScript Advanced Types",
    level: "advanced",
    depth: 4,
    language: "en",
    includeExamples: true,
    stream: false
  }
];


const _testData: OutlineRequest = {
  topic: '学习 Bun',
  level: "intermediate",
  depth: 8, // 大纲深度
  language: "zh",
  includeExamples: true,
  stream: false,
}

/**
 * 测试默认配置的OutlineGenerator
 */
async function testDefaultGenerator() {
  const generator = new OutlineGenerator({ provider: 'openai', model: 'gpt-5-mini' });

  try {
    const result = await generator.generate(_testData);

    console.log(JSON.stringify(result, null, 2));

    if ('topic' in result && 'structure' in result) {
      // 非流式响应
      console.log('✅ 生成成功!');
      console.log('📋 主题:', result.topic);
      console.log('📊 级别:', result.level);
      console.log('🔢 大纲项数量:', result.structure.length);
      console.log('⏰ 生成时间:', result.metadata?.generatedAt);
      console.log('🤖 使用模型:', result.metadata?.model);

      // 打印前3个大纲项
      result.structure.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        if (item.description) {
          console.log(`   描述: ${item.description}`);
        }
        if (item.keyPoints && item.keyPoints.length > 0) {
          console.log('   要点:', item.keyPoints.slice(0, 2).join(', '));
        }
      });
    }

  } catch (error) {
    console.error('❌ 生成失败:', error instanceof Error ? error.message : error);
  }
}

/**
 * 测试自定义Provider配置
 */
async function testCustomProvider() {
  console.log('\n🧪 测试自定义配置 (OpenAI GPT-4o-mini)...\n');

  // 注意：需要设置 OPENAI_API_KEY 环境变量
  const generator = new OutlineGenerator({
    provider: 'openai',
    model: 'gpt-4o-mini'
  });

  try {
    const result = await generator.generate(testRequests[1]!);

    if ('topic' in result && 'structure' in result) {
      console.log('✅ 生成成功!');
      console.log('📋 主题:', result.topic);
      console.log('📊 级别:', result.level);
      console.log('🔢 大纲项数量:', result.structure.length);
      console.log('🤖 使用模型:', result.metadata?.model);
    }

  } catch (error) {
    console.error('❌ 生成失败:', error instanceof Error ? error.message : error);
    console.log('💡 提示: 请确保设置了 OPENAI_API_KEY 环境变量');
  }
}

/**
 * 测试流式生成
 */
async function testStreamGeneration() {
  console.log('\n🧪 测试流式生成...\n');

  const generator = new OutlineGenerator();
  const streamRequest: OutlineRequest = {
    ..._testData,
    stream: true
  };

  try {
    const result = await generator.generate(streamRequest);

    if (Symbol.asyncIterator in result) {
      // 流式响应
      console.log('📡 开始流式接收数据...');
      let chunkCount = 0;

      for await (const chunk of result) {
        chunkCount++;
        console.log(`\n📦 Chunk ${chunkCount}:`);

        if (chunk.topic) {
          console.log('  主题:', chunk.topic);
        }

        if (chunk.structure && chunk.structure.length > 0) {
          console.log('  当前大纲项数量:', chunk.structure.length);

          // 显示最新的大纲项
          const latestItem = chunk.structure[chunk.structure.length - 1];
          if (latestItem && latestItem.title) {
            console.log('  最新项目:', latestItem.title);
          }
        }

        if (chunk.metadata) {
          console.log('  生成时间:', chunk.metadata.generatedAt);
        }
      }

      console.log(`\n✅ 流式生成完成! 总共收到 ${chunkCount} 个数据块`);
    }

  } catch (error) {
    console.error('❌ 流式生成失败:', error instanceof Error ? error.message : error);
  }
}

/**
 * 测试KnowledgeGeneratorService
 */
async function testService() {
  console.log('\n🧪 测试 KnowledgeGeneratorService...\n');

  const service = new KnowledgeGeneratorService();

  console.log('🔍 服务状态:', service.isReady() ? '准备就绪' : '未就绪');

  try {
    const result = await service.generateOutline({
      topic: "Node.js 微服务架构",
      level: "advanced",
      depth: 6,
      language: "zh",
      includeExamples: true,
      stream: false
    });

    if ('topic' in result && 'structure' in result) {
      console.log('✅ 服务生成成功!');
      console.log('📋 主题:', result.topic);
      console.log('🔢 大纲项数量:', result.structure.length);
    }

  } catch (error) {
    console.error('❌ 服务生成失败:', error instanceof Error ? error.message : error);
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log('🚀 开始测试 OutlineGenerator 功能...');

  // 检查环境变量
  console.log('\n🔍 环境检查:');
  console.log('GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ 已设置' : '❌ 未设置');
  console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ 已设置' : '❌ 未设置');

  // 运行测试
  await testDefaultGenerator();

  // 只有设置了 OpenAI API key 才运行
  if (process.env.OPENAI_API_KEY) {
    await testCustomProvider();
  } else {
    console.log('\n⏭️  跳过 OpenAI 测试 (未设置 API Key)');
  }

  await testStreamGeneration();
  await testService();

  console.log('\n🎉 所有测试完成!');
}

// 运行测试
if (require.main === module) {
  runAllTests().catch(console.error);
  // testDefaultGenerator()
  // testStreamGeneration()
}

export {
  testDefaultGenerator,
  testCustomProvider,
  testStreamGeneration,
  testService,
  runAllTests
};