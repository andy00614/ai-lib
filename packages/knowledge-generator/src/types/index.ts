import z from "zod";

export const questionTypeSchema = z.enum([
  "single_choice",
  "multiple_choice",
  "fill",
  "essay",
  "mixed"
]).default("mixed");

export const difficultySchema = z.enum([
  "easy",
  "medium",
  "hard",
  "mixed"
]).default("mixed");

export const languageSchema = z.enum(["zh", "en"]).default("zh");

// Outline-specific schemas
export const outlineTopicSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Topic title is required"),
  description: z.string(),
  keyPoints: z.array(z.string()),
  estimatedTime: z.string(),
});

export const outlineRequestSchema = z.object({
  topic: z.string().min(1, "Knowledge topic is required"),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  depth: z.number().min(1).max(10).default(8), // 大纲深度
  language: languageSchema,
  includeExamples: z.boolean().default(true),
  stream: z.boolean().default(false),
});

export const outlineResponseSchema = z.object({
  topic: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  structure: z.array(outlineTopicSchema),
  metadata: z.object({
    totalTopics: z.number(),
    estimatedTotalTime: z.string(),
    generatedAt: z.string(), // 改为字符串，因为AI生成不能直接生成Date对象
    model: z.string(),
  }),
});


export const questionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  title: z.string().min(1, "Question title is required"),
  options: z.array(z.string()),
  answer: z.string().min(1, "Answer is required"),
  explanation: z.string(),
});


export const questionRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  questionType: questionTypeSchema.default("mixed"),
  count: z.number().min(1).max(50).default(10),
  difficulty: difficultySchema,
  language: languageSchema,
  outlineId: z.string().default(""),
  stream: z.boolean().default(false),
});

export const questionResponseSchema = z.object({
  questions: z.array(questionSchema),
  metadata: z.object({
    totalQuestions: z.number(),
    questionTypes: z.array(questionTypeSchema),
    difficulty: difficultySchema,
    outlineId: z.string(),
    generatedAt: z.string(), // 改为字符串
    model: z.string(),
  }),
});


export type QuestionType = z.infer<typeof questionTypeSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type Language = z.infer<typeof languageSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionRequest = z.infer<typeof questionRequestSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;

// Outline types
export type OutlineTopic = z.infer<typeof outlineTopicSchema>;
export type OutlineRequest = z.infer<typeof outlineRequestSchema>;
export type OutlineResponse = z.infer<typeof outlineResponseSchema>;