import { generateObject, streamObject } from 'ai';
import { createGoogleModel, type ModelInstance, type ProviderConfig } from '@wd-ai-tools/ai';
import {
  questionRequestSchema,
  questionResponseSchema,
  type QuestionRequest,
  type QuestionResponse
} from '../types/index.js';
import { createProvider } from '@wd-ai-tools/ai';

/**
 * Question Generator Class
 * 负责基于内容生成练习题目，支持流式和非流式两种模式
 */
export class QuestionGenerator {
  readonly model: ModelInstance;
  private readonly modelName: string;

  constructor(config?: ProviderConfig) {
    if (config) {
      // 使用自定义配置
      this.model = createProvider(config);
      this.modelName = `${config.provider}:${config.model}`;
    } else {
      // 使用默认Google模型
      this.model = createGoogleModel();
      this.modelName = 'google:gemini-1.5-flash';
    }
  }

  /**
   * 生成题目 - 支持流式和非流式
   */
  async generate(request: QuestionRequest): Promise<QuestionResponse | AsyncIterable<Partial<QuestionResponse>>> {
    // 验证请求参数
    const validatedRequest = questionRequestSchema.parse(request);

    // 生成提示词
    const prompt = this.buildPrompt(validatedRequest);

    console.log(prompt);

    if (validatedRequest.stream) {
      return this.generateStream(validatedRequest, prompt);
    } else {
      return this.generateSync(validatedRequest, prompt);
    }
  }

  /**
   * 非流式生成
   */
  private async generateSync(request: QuestionRequest, prompt: string): Promise<QuestionResponse> {
    const result = await generateObject({
      model: this.model,
      schema: questionResponseSchema,
      prompt,
    });

    return {
      ...result.object,
      metadata: {
        ...result.object.metadata,
        generatedAt: new Date().toISOString(),
        model: this.modelName,
      }
    };
  }

  /**
   * 流式生成
   */
  private async generateStream(
    _request: QuestionRequest,
    prompt: string
  ): Promise<AsyncIterable<Partial<QuestionResponse>>> {
    const stream = streamObject({
      model: this.model,
      schema: questionResponseSchema,
      prompt,
    });

    return this.processStream(stream as any);
  }

  /**
   * 处理流式响应
   */
  private async* processStream(
    stream: ReturnType<typeof streamObject>
  ): AsyncIterable<Partial<QuestionResponse>> {
    for await (const chunk of stream.partialObjectStream) {
      if (chunk) {
        // 安全的类型转换和处理
        const safeChunk = chunk as Partial<QuestionResponse>;
        const processedChunk: Partial<QuestionResponse> = {
          questions: safeChunk.questions,
          metadata: {
            totalQuestions: safeChunk.metadata?.totalQuestions || 0,
            questionTypes: safeChunk.metadata?.questionTypes || [],
            difficulty: safeChunk.metadata?.difficulty || 'mixed',
            outlineId: safeChunk.metadata?.outlineId || '',
            generatedAt: new Date().toISOString(),
            model: this.modelName,
          }
        };
        yield processedChunk;
      }
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(request: QuestionRequest): string {
    const { content, questionType, count, difficulty, language } = request;

    // 题目类型映射
    const typeMapping: Record<string, string> = {
      single_choice: '单选题',
      multiple_choice: '多选题',
      fill: '填空题',
      essay: '问答题',
      mixed: '混合题型'
    };

    // 难度映射
    const difficultyMapping: Record<string, string> = {
      easy: '简单',
      medium: '中等',
      hard: '困难',
      mixed: '混合难度'
    };

    if (language === 'en') {
      return `
Based on the following learning content, generate ${count} practice questions.

Content to create questions from:
${content}

Requirements:
- Question type: ${questionType === 'mixed' ? 'Mix of different types' : typeMapping[questionType]}
- Difficulty level: ${difficulty === 'mixed' ? 'Mixed difficulty levels' : difficultyMapping[difficulty]}
- Total questions: ${count}

For each question, provide:
- A unique ID
- Question type (single_choice, multiple_choice, fill, or essay)
- Clear question title/text
- Answer options (for choice questions, empty array for others)
- Correct answer
- Detailed explanation of the answer

Question Type Guidelines:
- single_choice: One correct answer from 4 options
- multiple_choice: Multiple correct answers from 4-6 options  
- fill: Fill-in-the-blank format with blanks marked as ___
- essay: Open-ended questions requiring detailed responses

Ensure questions test understanding of the key concepts from the provided content.
Generate diverse questions that cover different aspects of the material.
      `.trim();
    }

    return `
基于以下学习内容，生成${count}道练习题目。

学习内容：
${content}

要求：
- 题目类型：${typeMapping[questionType]}
- 难度等级：${difficultyMapping[difficulty]}
- 题目总数：${count}道

每道题目需要包含：
- 唯一ID
- 题目类型（single_choice、multiple_choice、fill、essay）
- 清晰的题目标题/内容
- 选项（选择题需要选项，其他题型为空数组）
- 正确答案
- 详细的答案解释

题型指导原则：
- single_choice（单选题）：4个选项中选择1个正确答案
- multiple_choice（多选题）：4-6个选项中选择多个正确答案
- fill（填空题）：空白处用___标记的填空格式
- essay（问答题）：需要详细回答的开放性问题

确保题目能够测试学习者对提供内容中关键概念的理解。
生成多样化的题目，覆盖材料的不同方面。
    `.trim();
  }
}