// ========================================
// 统一类型包入口文件
// ========================================

// Knowledge相关类型导出
export * from "./knowledge.js";

// API相关类型导出  
export * from "./api.js";

// 重新导出常用的类型组合
export type {
  // 核心业务类型
  Question,
  Outline,
  QuestionType,
  Difficulty,
  Language,
  OutlineLevel,
  
  // 请求类型
  OutlineGeneratorRequest,
  QuestionGeneratorRequest,
  OutlineApiRequest,
  QuestionApiRequest,
} from "./knowledge.js";

export type {
  // API特定类型
  ApiOutlineRequest,
  ApiQuestionRequest,
  OutlineApiResponse,
  QuestionApiResponse,
  ErrorApiResponse,
  ProviderType,
  ProviderConfig,
  BaseApiResponse,
  Pagination,
  Health,
  ListApiResponse
} from "./api.js";