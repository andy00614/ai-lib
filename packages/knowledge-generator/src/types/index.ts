// 重新导出共享类型，保持向后兼容
export {
  // Schemas
  questionTypeSchema,
  difficultySchema,
  languageSchema,
  outlineLevelSchema,
  outlineTopicSchema,
  outlineGeneratorRequestSchema as outlineRequestSchema,
  outlineSchema as outlineResponseSchema,
  questionGeneratorRequestSchema as questionRequestSchema,
  questionsCollectionSchema as questionResponseSchema,
  questionSchema,
  
  // Types
  type QuestionType,
  type Difficulty,
  type Language,
  type OutlineLevel,
  type Question,
  type OutlineTopic,
  type Outline as OutlineResponse,
  type QuestionsCollection as QuestionResponse,
  type OutlineGeneratorRequest as OutlineRequest,
  type QuestionGeneratorRequest as QuestionRequest
} from "@wd-ai-tools/types/knowledge";