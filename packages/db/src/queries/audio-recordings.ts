import { eq, desc } from 'drizzle-orm';
import type { Database } from '../client';
import { audioRecordings, type AudioRecording, type NewAudioRecording } from '../schema';

// 创建音频录制记录
export async function createAudioRecording(
  db: Database,
  data: NewAudioRecording
): Promise<AudioRecording> {
  const [recording] = await db
    .insert(audioRecordings)
    .values(data)
    .returning();
  
  return recording;
}

// 根据ID获取音频录制记录
export async function getAudioRecordingById(
  db: Database,
  id: string
): Promise<AudioRecording | null> {
  const [recording] = await db
    .select()
    .from(audioRecordings)
    .where(eq(audioRecordings.id, id));
  
  return recording || null;
}

// 获取用户的音频录制记录列表
export async function getUserAudioRecordings(
  db: Database,
  userId: string
): Promise<AudioRecording[]> {
  return await db
    .select()
    .from(audioRecordings)
    .where(eq(audioRecordings.userId, userId))
    .orderBy(desc(audioRecordings.createdAt));
}

// 更新音频录制记录状态
export async function updateAudioRecordingStatus(
  db: Database,
  id: string,
  status: string,
  metadata?: string
): Promise<AudioRecording | null> {
  const [updated] = await db
    .update(audioRecordings)
    .set({
      status,
      metadata,
      updatedAt: new Date(),
    })
    .where(eq(audioRecordings.id, id))
    .returning();
  
  return updated || null;
}

// 更新音频录制的元数据
export async function updateAudioRecordingMetadata(
  db: Database,
  id: string,
  updates: {
    duration?: number;
    sampleRate?: number;
    bitRate?: number;
    channels?: number;
    metadata?: string;
  }
): Promise<AudioRecording | null> {
  const [updated] = await db
    .update(audioRecordings)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(audioRecordings.id, id))
    .returning();
  
  return updated || null;
}

// 删除音频录制记录
export async function deleteAudioRecording(
  db: Database,
  id: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .delete(audioRecordings)
    .where(eq(audioRecordings.id, id))
    .returning();
  
  return result.length > 0;
}