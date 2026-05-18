import postgres from "postgres";
import * as dotenv from "dotenv";
import { expand } from "dotenv-expand";

import * as path from "path";
import { fileURLToPath } from "url";

// Load .env from project root relative to this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envConfig = dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
expand(envConfig);

console.log(
  "Using DATABASE_URL:",
  process.env.DATABASE_URL?.replace(/:[^:@]+@/, ":****@"),
);
const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running manual migration...");
  try {
    await sql`ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE`;
    await sql`ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ`;
    await sql`ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS archive_comment TEXT`;
    
    // Create user_map_states table
    await sql`
      CREATE TABLE IF NOT EXISTS user_map_states (
        id UUID PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES identities(id) ON DELETE CASCADE,
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        selected_node_id UUID,
        viewport JSONB NOT NULL DEFAULT '{"x": 0, "y": 0, "zoom": 1}'::jsonb,
        nodes_state JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_user_workspace UNIQUE (user_id, workspace_id)
      )
    `;
    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await sql.end();
  }
}

migrate();
