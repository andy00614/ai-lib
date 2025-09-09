import { eq } from 'drizzle-orm';
import type { Database } from '../client';
import { users, type User, type NewUser } from '../schema';

// 创建用户
export async function createUser(
  db: Database,
  data: NewUser
): Promise<User> {
  const [user] = await db
    .insert(users)
    .values(data)
    .returning();
  
  return user;
}

// 根据ID获取用户
export async function getUserById(
  db: Database,
  id: string
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
  
  return user || null;
}

// 根据邮箱获取用户
export async function getUserByEmail(
  db: Database,
  email: string
): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  
  return user || null;
}

// 更新用户信息
export async function updateUser(
  db: Database,
  id: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<User | null> {
  const [updated] = await db
    .update(users)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();
  
  return updated || null;
}