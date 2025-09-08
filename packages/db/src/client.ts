import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

// 数据库连接配置
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_tools';

// 创建连接池
const queryClient = postgres(connectionString, {
  max: 10, // 最大连接数
  idle_timeout: 90,
  connect_timeout: 10,
});

// 创建drizzle实例
export const db = drizzle(queryClient, { schema });

export type Database = typeof db;

// 导出schema用于类型推断
export { schema };