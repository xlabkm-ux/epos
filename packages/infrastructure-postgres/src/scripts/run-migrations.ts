import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

console.log('Running migrations...');
console.log('Database URL:', databaseUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

const queryClient = postgres(databaseUrl, { max: 1 });
const db = drizzle(queryClient);

const migrationsFolder = path.join(__dirname, '../../migrations');

(async () => {
  try {
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations completed successfully!');
    await queryClient.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await queryClient.end();
    process.exit(1);
  }
})();
