// AI Provider 系统 - 简化版本
// 支持 Google, OpenAI, Anthropic

// Types
export type {
  ProviderType,
  ProviderConfig,
  ModelInstance
} from './types.js';

export { ProviderError, ENV_KEY_MAP } from './types.js';

// Factory
export {
  ProviderFactory,
  createProvider,
  createGoogleModel,
  createOpenAIModel,
  createClaudeModel
} from './factory.js';

// Default model configs
export const DEFAULT_MODELS = {
  google: 'gemini-1.5-flash',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-haiku-20241022'
} as const;

// 便捷导出已有方法
export { createGoogleModel as createDefaultGoogleModel } from './factory.js';
export { createOpenAIModel as createDefaultOpenAIModel } from './factory.js'; 
export { createClaudeModel as createDefaultClaudeModel } from './factory.js';