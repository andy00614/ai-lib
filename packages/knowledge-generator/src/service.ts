import type { OutlineRequest, OutlineResponse } from "./types/index.js";
import { OutlineGenerator } from "./generators/index.js";

/**
 * Main KnowledgeGenerator Service
 * This is the primary interface for the package
 */
export class KnowledgeGeneratorService {
  private outlineGenerator: OutlineGenerator;

  constructor() {
    // 使用默认配置创建大纲生成器
    this.outlineGenerator = new OutlineGenerator();
  }

  /**
   * 生成知识大纲
   */
  public async generateOutline(
    request: OutlineRequest
  ): Promise<OutlineResponse | AsyncIterable<Partial<OutlineResponse>>> {
    return this.outlineGenerator.generate(request);
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return !!this.outlineGenerator;
  }
}