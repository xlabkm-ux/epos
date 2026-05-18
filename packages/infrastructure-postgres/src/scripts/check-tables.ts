import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(databaseUrl);

(async () => {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('Tables in database:', JSON.stringify(tables, null, 2));
    
    // Check identities table
    const identitiesCount = await sql`SELECT COUNT(*) as count FROM identities`;
    console.log('\nIdentities count:', identitiesCount[0].count);
    
    if (identitiesCount[0].count > 0) {
      const users = await sql`SELECT id, username, email FROM identities LIMIT 10`;
      console.log('\nSample users:', JSON.stringify(users, null, 2));
    }
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
    process.exit(1);
  }
})();
