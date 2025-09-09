import { z } from "zod";

// ========================================
// 基础枚举和常量类型
// ========================================

export const questionTypeSchema = z.enum([
  "single_choice",
  "multiple_choice", 
  "fill",
  "essay",
  "mixed"
]);

export const difficultySchema = z.enum([
  "easy",
  "medium",
  "hard",
  "mixed"
]);

export const languageSchema = z.enum(["zh", "en"]);

export const outlineLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

// ========================================
// 核心数据结构
// ========================================

// Outline相关结构
export const outlineTopicSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Topic title is required"),
  description: z.string(),
  keyPoints: z.array(z.string()),
  estimatedTime: z.string(),
});

export const outlineSchema = z.object({
  id: z.string(),
  topic: z.string(),
  level: outlineLevelSchema,
  structure: z.array(outlineTopicSchema),
  metadata: z.object({
    totalTopics: z.number(),
    estimatedTotalTime: z.string(),
    generatedAt: z.string(),
    model: z.string(),
  }),
});

// Question相关结构
export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  title: z.string().min(1, "Question title is required"),
  options: z.array(questionOptionSchema).optional(),
  answer: z.string().optional(),
  explanation: z.string(),
  difficulty: difficultySchema,
  tags: z.array(z.string()).default([]),
});

export const questionsCollectionSchema = z.object({
  id: z.string(),
  questions: z.array(questionSchema),
  metadata: z.object({
    totalQuestions: z.number(),
    questionTypes: z.array(questionTypeSchema),
    difficulty: difficultySchema,
    outlineId: z.string(),
    generatedAt: z.string(),
    model: z.string(),
  }),
});

// ========================================
// 请求/响应 Schema
// ========================================

// Knowledge Generator 内部使用的请求格式
export const outlineGeneratorRequestSchema = z.object({
  topic: z.string().min(1, "Knowledge topic is required"),
  level: outlineLevelSchema.default("intermediate"),
  depth: z.number().min(1).max(10).default(8),
  language: languageSchema.default("zh"),
  includeExamples: z.boolean().default(true),
  stream: z.boolean().default(false),
});

export const questionGeneratorRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  questionType: questionTypeSchema.default("mixed"),
  count: z.number().min(1).max(50).default(10),
  difficulty: difficultySchema.default("mixed"),
  language: languageSchema.default("zh"),
  outlineId: z.string().default(""),
  stream: z.boolean().default(false),
});

// API层使用的请求格式（更灵活的接口）
export const outlineApiRequestSchema = z.object({
  content: z.string().min(1, "Content is required").default("Python Web开发基础"),
  stream: z.boolean().default(false),
  targetAudience: z.string().default("初学者"),
  difficultyLevel: outlineLevelSchema.default("intermediate"),
  estimatedDuration: z.string().default("2小时"),
  language: languageSchema.default("zh"),
});

export const questionApiRequestSchema = z.object({
  content: z.string().min(1, "Content is required").default("JavaScript变量和数据类型基础"),
  stream: z.boolean().default(false),
  questionTypes: z.array(questionTypeSchema).default(["single_choice", "multiple_choice"]),
  count: z.number().min(1).max(50).default(5),
  difficulty: difficultySchema.default("mixed"),
  language: languageSchema.default("zh"),
});

// ========================================
// TypeScript 类型导出
// ========================================

export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type Language = z.infer<typeof languageSchema>;
export type OutlineLevel = z.infer<typeof outlineLevelSchema>;

// 核心数据结构类型
export type OutlineTopic = z.infer<typeof outlineTopicSchema>;
export type Outline = z.infer<typeof outlineSchema>;
export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionsCollection = z.infer<typeof questionsCollectionSchema>;

// 请求类型
export type OutlineGeneratorRequest = z.infer<typeof outlineGeneratorRequestSchema>;
export type QuestionGeneratorRequest = z.infer<typeof questionGeneratorRequestSchema>;
export type OutlineApiRequest = z.infer<typeof outlineApiRequestSchema>;
export type QuestionApiRequest = z.infer<typeof questionApiRequestSchema>;

// 响应类型（生成器直接返回的数据）
export type OutlineGeneratorResponse = Outline;
export type QuestionGeneratorResponse = QuestionsCollection;