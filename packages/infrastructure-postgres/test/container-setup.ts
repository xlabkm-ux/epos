import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupTestContainer() {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("epios_test")
    .withUsername("postgres")
    .withPassword("postgres")
    .start();

  const connectionString = container.getConnectionString();
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  // Run migrations
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "../migrations"),
  });

  return {
    container,
    db,
    sql,
    connectionString,
  };
}
