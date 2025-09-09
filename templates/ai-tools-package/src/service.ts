import type { BaseRequest, BaseResponse } from "./types";
import { BaseGenerator } from "./generators";

/**
 * Main {{PACKAGE_NAME_PASCAL}} Service
 * This is the primary interface for the package
 */
export class {{PACKAGE_NAME_PASCAL}}Service {
  private generators: Map<string, BaseGenerator> = new Map();

  /**
   * Register a generator
   */
  public registerGenerator(name: string, generator: BaseGenerator): void {
    this.generators.set(name, generator);
  }

  /**
   * Get available generators
   */
  public getGenerators(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * Process request with specified generator
   */
  public async process(
    generatorName: string,
    request: BaseRequest
  ): Promise<BaseResponse> {
    const generator = this.generators.get(generatorName);
    
    if (!generator) {
      throw new Error(`Generator '${generatorName}' not found`);
    }

    return generator.generate(request as any);
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return this.generators.size > 0;
  }
}