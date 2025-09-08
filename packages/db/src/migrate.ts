import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/ai_tools';

const migrationClient = postgres(connectionString, { max: 1 });

const db = drizzle(migrationClient);

async function main() {
  console.log('🚀 Running migrations...');
  
  await migrate(db, { migrationsFolder: './migrations' });
  
  console.log('✅ Migrations completed');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});