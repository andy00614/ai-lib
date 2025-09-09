import { pgTable, uuid, varchar, text, timestamp, integer, decimal, boolean, bytea } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 音频录制表
export const audioRecordings = pgTable('audio_recordings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(), // 文件大小（字节）
  duration: decimal('duration', { precision: 10, scale: 2 }), // 音频时长（秒）
  format: varchar('format', { length: 50 }).notNull().default('wav'), // 音频格式
  sampleRate: integer('sample_rate'), // 采样率
  bitRate: integer('bit_rate'), // 比特率
  channels: integer('channels').default(1), // 声道数
  status: varchar('status', { length: 50 }).notNull().default('processing'), // processing, completed, failed
  metadata: text('metadata'), // JSON格式的额外元数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 语音模型表
export const voiceModels = pgTable('voice_models', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  audioRecordingId: uuid('audio_recording_id').references(() => audioRecordings.id),
  voiceName: varchar('voice_name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('training'), // training, ready, failed
  falVoiceId: varchar('fal_voice_id', { length: 255 }), // fal.ai返回的语音ID
  trainingProgress: integer('training_progress').default(0), // 训练进度百分比
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 语音生成记录表
export const voiceGenerations = pgTable('voice_generations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id').references(() => users.id).notNull(),
  voiceModelId: uuid('voice_model_id').references(() => voiceModels.id).notNull(),
  text: text('text').notNull(),
  audioUrl: text('audio_url'),
  duration: decimal('duration', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).notNull().default('processing'), // processing, completed, failed
  falRequestId: varchar('fal_request_id', { length: 255 }),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 导出类型定义
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type AudioRecording = typeof audioRecordings.$inferSelect;
export type NewAudioRecording = typeof audioRecordings.$inferInsert;

export type VoiceModel = typeof voiceModels.$inferSelect;
export type NewVoiceModel = typeof voiceModels.$inferInsert;

export type VoiceGeneration = typeof voiceGenerations.$inferSelect;
export type NewVoiceGeneration = typeof voiceGenerations.$inferInsert;