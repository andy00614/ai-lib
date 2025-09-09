import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

import type {
  ProviderConfig,
  ModelInstance,
  ProviderType
} from './types.js';
import { ENV_KEY_MAP, ProviderError } from './types.js';

/**
 * 简化的 AI Provider Factory
 */
export class ProviderFactory {
  /**
   * 创建模型实例
   */
  static createModel(config: ProviderConfig): ModelInstance {
    try {
      const apiKey = config.apiKey || process.env[ENV_KEY_MAP[config.provider]];
      if (!apiKey) {
        throw new Error(`API key not found for ${config.provider}. Please provide apiKey in config or set ${ENV_KEY_MAP[config.provider]} environment variable.`);
      }

      return this.createProviderModel(config, apiKey);

    } catch (error) {
      throw new ProviderError(
        `Failed to create ${config.provider} model: ${error instanceof Error ? error.message : String(error)}`,
        config.provider,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建具体Provider的模型
   */
  private static createProviderModel(config: ProviderConfig, apiKey: string): ModelInstance {
    // 设置环境变量（AI SDK会自动读取）
    if (!process.env[ENV_KEY_MAP[config.provider]]) {
      process.env[ENV_KEY_MAP[config.provider]] = apiKey;
    }

    switch (config.provider) {
      case 'google':
        return google(config.model);

      case 'openai':
        return openai(config.model);

      case 'anthropic':
        return anthropic(config.model);

      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  }
}

/**
 * 便捷方法：快速创建模型实例
 */
export function createProvider(config: ProviderConfig): ModelInstance {
  return ProviderFactory.createModel(config);
}

/**
 * 便捷方法：创建Google模型
 */
export function createGoogleModel(model: string = 'gemini-1.5-flash'): ModelInstance {
  return createProvider({
    provider: 'google',
    model
  });
}

/**
 * 便捷方法：创建OpenAI模型  
 */
export function createOpenAIModel(model: string = 'gpt-4o-mini'): ModelInstance {
  return createProvider({
    provider: 'openai',
    model
  });
}

/**
 * 便捷方法：创建Claude模型
 */
export function createClaudeModel(model: string = 'claude-3-5-haiku-20241022'): ModelInstance {
  return createProvider({
    provider: 'anthropic',
    model
  });
}