// 使用共享类型，只定义API特有的扩展
export {
  // 直接导出API相关的schemas和types
  apiOutlineRequestSchema as outlineRequestSchema,
  apiQuestionRequestSchema as questionRequestSchema,
  outlineApiResponseSchema as outlineResponseSchema,
  questionApiResponseSchema as questionsResponseSchema,
  errorApiResponseSchema as ErrorSchema,
  providerConfigSchema,
  
  // Types
  type ApiOutlineRequest as OutlineRequest,
  type ApiQuestionRequest as QuestionRequest,
  type OutlineApiResponse,
  type QuestionApiResponse as QuestionsResponse
} from "@wd-ai-tools/types/api";