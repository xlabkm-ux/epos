import postgres from "postgres";
import * as dotenv from "dotenv";
import { expand } from "dotenv-expand";

const envConfig = dotenv.config({ path: "./.env" });
expand(envConfig);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const sql = postgres(databaseUrl);

async function checkTables() {
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;
  console.log("Tables in database:", tables.map(t => t.table_name).join(", "));
  process.exit(0);
}

checkTables().catch(err => {
  console.error(err);
  process.exit(1);
});
