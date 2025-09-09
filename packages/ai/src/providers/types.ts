import type { LanguageModel } from 'ai';

/**
 * 支持的AI提供商类型
 */
export type ProviderType = 
  | 'google' 
  | 'openai' 
  | 'anthropic'
  | 'grok'
  | 'deepseek';

/**
 * Provider配置接口 - 完整版本
 */
export interface ProviderConfig {
  /** 提供商类型 */
  provider: ProviderType;
  /** 模型名称 */
  model: string;
  /** API密钥（可选，可从环境变量获取） */
  apiKey?: string;
  /** 温度参数（可选，控制输出随机性） */
  temperature?: number;
  /** 最大token数（可选，控制输出长度） */
  maxTokens?: number;
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
  grok: 'GROK_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
};

/**
 * 模型实例类型 - 使用any来避免AI SDK版本兼容性问题
 */
export type ModelInstance = any;