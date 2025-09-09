import type { LanguageModelV1 } from 'ai';

/**
 * 支持的AI提供商类型
 */
export type ProviderType = 
  | 'google' 
  | 'openai' 
  | 'anthropic';

/**
 * Provider配置接口 - 简化版本
 */
export interface ProviderConfig {
  /** 提供商类型 */
  provider: ProviderType;
  /** 模型名称 */
  model: string;
  /** API密钥（可选，可从环境变量获取） */
  apiKey?: string;
}

/**
 * Provider工厂错误类型
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: ProviderType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

/**
 * 环境变量映射
 */
export const ENV_KEY_MAP: Record<ProviderType, string> = {
  google: 'GOOGLE_GENERATIVE_AI_API_KEY',
  openai: 'OPENAI_API_KEY', 
  anthropic: 'ANTHROPIC_API_KEY',
};

/**
 * 使用AI SDK原生类型
 */
export type ModelInstance = LanguageModelV1;