import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { 
  identities, 
  orgUnits, 
  orgPositions, 
  userAssignments,
  workspaces
} from "../schema.js";
import * as dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const queryClient = postgres(databaseUrl);
const db = drizzle(queryClient);

async function seed() {
  console.log("🌱 Seeding commercial identity data...");

  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  console.log(`Using default password: ${defaultPassword}`);

  // 1. Create Org Units
  const units = [
    { id: randomUUID(), name: "Corporate Governance" },
    { id: randomUUID(), name: "Product Engineering" },
    { id: randomUUID(), name: "Security & Audit" },
  ];
  for (const u of units) {
    await db.insert(orgUnits).values(u).onConflictDoNothing();
  }

  // 2. Create Org Positions
  const positions = [
    { id: randomUUID(), name: "Chief Architect", level: 1 },
    { id: randomUUID(), name: "Senior Governance Officer", level: 2 },
    { id: randomUUID(), name: "Lead Developer", level: 2 },
    { id: randomUUID(), name: "Associate Analyst", level: 3 },
  ];
  for (const p of positions) {
    await db.insert(orgPositions).values(p).onConflictDoNothing();
  }

  // 3. Create Identities
  const users = [
    { id: "admin_1", username: "admin_1", email: "admin_1@epios.corp", role: "admin" as const },
    { id: "owner_1", username: "owner_1", email: "owner_1@epios.corp", role: "reviewer" as const },
    { id: "reviewer_1", username: "reviewer_1", email: "reviewer_1@epios.corp", role: "reviewer" as const },
    { id: "contributor_1", username: "contributor_1", email: "contributor_1@epios.corp", role: "contributor" as const },
    { id: "observer_1", username: "observer_1", email: "observer_1@epios.corp", role: "observer" as const },
  ];

  for (const u of users) {
    await db.insert(identities).values({
      ...u,
      passwordHash,
      isActive: 1,
      createdAt: new Date(),
    }).onConflictDoUpdate({
      target: identities.id,
      set: { passwordHash }
    });
  }

  // 4. Create a default Workspace to link assignments if needed
  const defaultWsId = randomUUID();
  await db.insert(workspaces).values({
    id: defaultWsId,
    title: "Commercial Pilot Alpha",
    status: "running",
    mode: "standard",
    sensitivity: "internal",
    goal: "Demonstrate commercial readiness",
    createdByType: "system",
    createdById: "system",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoNothing();

  // 5. Create Assignments (WorkPlaces)
  const assignments = [
    { 
      id: randomUUID(), // WP ID
      userId: "admin_1", 
      unitId: units[0].id, 
      positionId: positions[0].id, 
      role: "owner" as const,
      isActive: true,
      createdAt: new Date()
    },
    { 
      id: randomUUID(), 
      userId: "owner_1", 
      unitId: units[0].id, 
      positionId: positions[1].id, 
      role: "owner" as const,
      isActive: true,
      createdAt: new Date()
    },
    { 
      id: randomUUID(), 
      userId: "reviewer_1", 
      unitId: units[1].id, 
      positionId: positions[2].id, 
      role: "reviewer" as const,
      workspaceId: defaultWsId,
      isActive: true,
      createdAt: new Date()
    },
    { 
      id: randomUUID(), 
      userId: "contributor_1", 
      unitId: units[1].id, 
      positionId: positions[3].id, 
      role: "contributor" as const,
      workspaceId: defaultWsId,
      isActive: true,
      createdAt: new Date()
    },
  ];

  for (const a of assignments) {
    await db.insert(userAssignments).values(a).onConflictDoNothing();
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
