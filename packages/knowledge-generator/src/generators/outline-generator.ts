import { generateObject, streamObject } from 'ai';
import { createGoogleModel, type ModelInstance, type ProviderConfig } from '@wd-ai-tools/ai';
import {
  outlineRequestSchema,
  outlineResponseSchema,
  type OutlineRequest,
  type OutlineResponse
} from '../types/index.js';
import { createProvider } from '@wd-ai-tools/ai'

/**
 * Outline Generator Class
 * 负责生成知识点大纲，支持流式和非流式两种模式
 */
export class OutlineGenerator {
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
   * 生成大纲 - 支持流式和非流式
   */
  async generate(request: OutlineRequest): Promise<OutlineResponse | AsyncIterable<Partial<OutlineResponse>>> {
    // 验证请求参数
    const validatedRequest = outlineRequestSchema.parse(request);

    // 生成提示词
    const prompt = this.buildPrompt(validatedRequest);

    console.log(prompt)

    if (validatedRequest.stream) {
      return this.generateStream(validatedRequest, prompt);
    } else {
      return this.generateSync(validatedRequest, prompt);
    }
  }

  /**
   * 非流式生成
   */
  private async generateSync(request: OutlineRequest, prompt: string): Promise<OutlineResponse> {
    const result = await generateObject({
      model: this.model,
      schema: outlineResponseSchema,
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
    _request: OutlineRequest,
    prompt: string
  ): Promise<AsyncIterable<Partial<OutlineResponse>>> {
    const stream = streamObject({
      model: this.model,
      schema: outlineResponseSchema,
      prompt,
    });

    return this.processStream(stream as any);
  }

  /**
   * 处理流式响应
   */
  private async* processStream(
    stream: ReturnType<typeof streamObject>
  ): AsyncIterable<Partial<OutlineResponse>> {
    for await (const chunk of stream.partialObjectStream) {
      if (chunk) {
        // 安全的类型转换和处理
        const safeChunk = chunk as Partial<OutlineResponse>;
        const processedChunk: Partial<OutlineResponse> = {
          topic: safeChunk.topic,
          level: safeChunk.level,
          structure: safeChunk.structure,
          metadata: {
            totalTopics: safeChunk.metadata?.totalTopics || 0,
            estimatedTotalTime: safeChunk.metadata?.estimatedTotalTime || '',
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
  private buildPrompt(request: OutlineRequest): string {
    const { topic, level, depth, language, includeExamples } = request;

    const levelText: Record<string, string> = {
      beginner: '初学者',
      intermediate: '中级',
      advanced: '高级'
    };

    const exampleText = includeExamples ? '并在每个知识点中包含具体的学习要点' : '';

    if (language === 'en') {
      return `
Create a comprehensive learning outline for the topic: "${topic}"

Requirements:
- Target audience: ${level} level learners
- Generate ${depth} main topics with detailed subtopics
- Each topic should include:
  - A clear, descriptive title
  - Brief description of what will be learned
  - Key learning points (3-5 points per topic)
  - Estimated learning time
${includeExamples ? '- Include specific learning points for each knowledge area' : ''}

Please structure the content logically from basic concepts to advanced applications.
Ensure each topic builds upon previous knowledge and provides a clear learning progression.

Generate a well-structured learning outline that helps learners systematically master "${topic}".
      `.trim();
    }

    return `
请为知识主题"${topic}"创建一个完整的学习大纲。

要求：
- 目标受众：${levelText[level]}水平的学习者
- 生成${depth}个主要知识点，包含详细的子主题
- 每个知识点应该包含：
  - 清晰、描述性的标题
  - 简要说明将要学习的内容
  - 关键学习要点（每个主题3-5个要点）
  - 预估学习时间
${exampleText}

请按照从基础概念到高级应用的逻辑顺序组织内容。
确保每个主题都建立在先前知识的基础上，提供清晰的学习进程。

生成一个结构良好的学习大纲，帮助学习者系统地掌握"${topic}"。
    `.trim();
  }

}