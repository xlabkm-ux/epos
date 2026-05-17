import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import { expand } from "dotenv-expand";
import * as schema from "./schema.js";
import { createMockData } from "../../api/src/mock-data.js";

const envConfig = dotenv.config({ path: "../../.env" });
expand(envConfig);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const queryClient = postgres(databaseUrl);
const db = drizzle(queryClient, { schema });

// --- DETERMINISTIC UUID MAPPING ---
function toUuid(
  id: string,
  type:
    | "workspace"
    | "node"
    | "edge"
    | "source"
    | "mission"
    | "run"
    | "artifact"
    | "patch"
    | "approval",
): string {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id.toLowerCase();
  }

  // Workspaces
  if (
    type === "workspace" &&
    id.startsWith("m") &&
    !isNaN(Number(id.substring(1)))
  ) {
    const num = id.substring(1);
    return `00000000-0000-0000-0000-${num.padStart(12, "0")}`;
  }

  // Missions & Runs
  if (
    type === "mission" &&
    id.startsWith("m") &&
    !isNaN(Number(id.substring(1)))
  ) {
    const num = id.substring(1);
    return `00000000-0000-0000-0001-${num.padStart(12, "0")}`;
  }
  if (type === "run" && id.startsWith("m") && !isNaN(Number(id.substring(1)))) {
    const num = id.substring(1);
    return `00000000-0000-0000-0002-${num.padStart(12, "0")}`;
  }

  // Scenario E (m5) nodes
  if (
    type === "node" &&
    id.startsWith("ne") &&
    !isNaN(Number(id.substring(2)))
  ) {
    const num = id.substring(2);
    return `00000000-0000-0000-0000-100000000${num.padStart(3, "0")}`;
  }

  // Scenario F (m6) nodes
  if (
    type === "node" &&
    id.startsWith("nf") &&
    !isNaN(Number(id.substring(2)))
  ) {
    const num = id.substring(2);
    return `00000000-0000-0000-0000-600000000${num.padStart(3, "0")}`;
  }

  // General deterministic hash mapping
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hex =
    Math.abs(hash).toString(16).padStart(8, "0") +
    Math.abs(hash * 33)
      .toString(16)
      .padStart(8, "0");
  const hexPart = hex.substring(0, 12).padEnd(12, "0");

  const typeMap = {
    workspace: "0000",
    node: "1000",
    edge: "2000",
    source: "3000",
    mission: "4000",
    run: "5000",
    artifact: "6000",
    patch: "7000",
    approval: "8000",
  };
  const typePrefix = typeMap[type] || "9000";
  return `00000000-0000-0000-${typePrefix}-${hexPart}`;
}

async function seed() {
  console.log(
    "🚀 Starting Master Synchronization of all seed data to PostgreSQL...",
  );

  // --- 1. CLEANING OLD DATABASE DATA ---
  console.log("🧹 Clearing legacy/outdated workspace data...");
  await db.delete(schema.epistemicEdges);
  await db.delete(schema.epistemicNodeEvidenceRefs);
  await db.delete(schema.evidenceRefs);
  await db.delete(schema.sourceChunks);
  await db.delete(schema.sources);
  await db.delete(schema.nodePatches);
  await db.delete(schema.governanceProcesses);
  await db.delete(schema.readinessAssessments);
  await db.delete(schema.artifactPatchNodeRefs);
  await db.delete(schema.artifactPatches);
  await db.delete(schema.approvalRequests);
  await db.delete(schema.conflictCards);
  await db.delete(schema.decisionRecords);
  await db.delete(schema.livingArtifacts);
  await db.delete(schema.epistemicNodes);
  await db.delete(schema.missionRuns);
  await db.delete(schema.missions);
  await db.delete(schema.userAssignments);
  await db.delete(schema.orgPositions);
  await db.delete(schema.orgUnits);
  await db.delete(schema.identities);
  await db.delete(schema.workspaces);

  // --- 2. RETRIEVE HIGH-FIDELITY MOCK DATA ---
  const mock = createMockData();
  console.log(
    `Loaded ${mock.workspaces.length} workspaces, ${mock.nodes.length} nodes, ${mock.edges.length} edges from mock-data.ts`,
  );

  // --- 3. SEED IDENTITIES (USERS, ORG UNITS, POSITIONS, ASSIGNMENTS) ---
  console.log("👤 Seeding system identities and assignments...");
  await db.insert(schema.identities).values([
    {
      id: "admin-1",
      username: "admin",
      email: "admin@epios.ai",
      role: "admin",
      isActive: 1,
    },
    {
      id: "architect-1",
      username: "architect",
      email: "arch@epios.ai",
      role: "reviewer",
      isActive: 1,
    },
    {
      id: "analyst-1",
      username: "analyst",
      email: "analyst@epios.ai",
      role: "contributor",
      isActive: 1,
    },
    {
      id: "observer-1",
      username: "observer",
      email: "obs@epios.ai",
      role: "observer",
      isActive: 1,
    },
    // compatibility with old tests:
    {
      id: "approver-1",
      username: "approver",
      email: "approver@epios.local",
      role: "approver",
      isActive: 1,
    },
    {
      id: "contributor-1",
      username: "contributor",
      email: "contributor@epios.local",
      role: "contributor",
      isActive: 1,
    },
  ]);

  const unit1_UUID = "00000000-0000-0000-0000-010000000001";
  const unit2_UUID = "00000000-0000-0000-0000-010000000002";
  const unit3_UUID = "00000000-0000-0000-0000-010000000003";

  await db.insert(schema.orgUnits).values([
    { id: unit1_UUID, name: "Governance Group" },
    { id: unit2_UUID, name: "Product Squad S7" },
    { id: unit3_UUID, name: "Security Audit Team" },
  ]);

  const pos1_UUID = "00000000-0000-0000-0000-020000000001";
  const pos2_UUID = "00000000-0000-0000-0000-020000000002";
  const pos3_UUID = "00000000-0000-0000-0000-020000000003";
  const pos4_UUID = "00000000-0000-0000-0000-020000000004";

  await db.insert(schema.orgPositions).values([
    { id: pos1_UUID, name: "Principal Architect", level: 1 },
    { id: pos2_UUID, name: "Technical Lead", level: 2 },
    { id: pos3_UUID, name: "Security Officer", level: 2 },
    { id: pos4_UUID, name: "Senior Analyst", level: 3 },
  ]);

  await db.insert(schema.userAssignments).values([
    {
      id: "00000000-0000-0000-0000-030000000001",
      userId: "admin-1",
      role: "owner",
      unitId: unit1_UUID,
      positionId: pos1_UUID,
      isActive: true,
    },
    {
      id: "00000000-0000-0000-0000-030000000002",
      userId: "architect-1",
      role: "reviewer",
      unitId: unit2_UUID,
      positionId: pos2_UUID,
      isActive: true,
    },
  ]);

  // --- 4. SEED WORKSPACES, MISSIONS, AND RUNS ---
  console.log("📂 Seeding workspaces and active mission run containers...");
  for (const ws of mock.workspaces) {
    const wsUuid = toUuid(ws.id, "workspace");
    const missionUuid = toUuid(ws.id, "mission");
    const runUuid = toUuid(ws.id, "run");

    await db.insert(schema.workspaces).values({
      id: wsUuid,
      title: ws.title,
      status: ws.status,
      mode: ws.mode,
      sensitivity: ws.sensitivity,
      goal: ws.brief.goal,
      context: ws.brief.context ?? null,
      successCriteria: ws.brief.successCriteria,
      constraints: ws.brief.constraints,
      unknowns: ws.brief.unknowns,
      desiredArtifactType: ws.desiredArtifactType ?? null,
      createdByType: ws.createdBy.type,
      createdById: ws.createdBy.id,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      version: ws.version,
    });

    await db.insert(schema.missions).values({
      id: missionUuid,
      workspaceId: wsUuid,
      title: "Primary Mission",
      status: "active",
      mode: ws.mode,
      sensitivity: ws.sensitivity,
      goal: ws.brief.goal,
      successCriteria: ws.brief.successCriteria,
      constraints: ws.brief.constraints,
      unknowns: ws.brief.unknowns,
      desiredArtifactType: ws.desiredArtifactType ?? null,
      createdByType: "user",
      createdById: ws.createdBy.id,
    });

    await db.insert(schema.missionRuns).values({
      id: runUuid,
      missionId: missionUuid,
      status: "running",
      startedByType: "user",
      startedById: ws.createdBy.id,
    });
  }

  // --- 5. SEED EPISTEMIC NODES ---
  console.log("📌 Seeding high-fidelity epistemic nodes...");
  for (const node of mock.nodes) {
    await db.insert(schema.epistemicNodes).values({
      id: toUuid(node.id, "node"),
      workspaceId: toUuid(node.workspaceId, "workspace"),
      missionId: toUuid(node.workspaceId, "mission"),
      content: node.content,
      type: node.type,
      strength: node.strength,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      version: node.version,
      metadata: node.metadata || {},
    });
  }

  // --- 6. SEED EPISTEMIC EDGES ---
  console.log("🔗 Seeding semantic edges...");
  for (const edge of mock.edges) {
    await db.insert(schema.epistemicEdges).values({
      id: toUuid(edge.id, "edge"),
      workspaceId: toUuid(edge.workspaceId, "workspace"),
      sourceNodeId: toUuid(edge.sourceNodeId, "node"),
      targetNodeId: toUuid(edge.targetNodeId, "node"),
      type: edge.type,
      metadata: edge.metadata || {},
      createdAt: edge.createdAt,
    });
  }

  // --- 7. SEED SOURCES ---
  console.log("🗂️ Seeding empirical sources...");
  for (const src of mock.sources || []) {
    await db.insert(schema.sources).values({
      id: toUuid(src.id, "source"),
      workspaceId: toUuid(src.workspaceId, "workspace"),
      missionId: toUuid(src.workspaceId, "mission"),
      sourceType: src.sourceType,
      title: src.title,
      uri: src.metadata?.url || null,
      sourceQuality: src.sourceQuality || "high",
      createdAt: src.createdAt,
    });
  }

  // --- 8. SEED SPECIFIC SCENARIO F (ADR REVIEW) WORKFLOW ITEMS ---
  console.log("⚡ Seeding Scenario F (ADR Review) patches and approvals...");
  const wsF_UUID = toUuid("m6", "workspace");
  const missionF_UUID = toUuid("m6", "mission");
  const runF_UUID = toUuid("m6", "run");

  // Living Artifact
  const artifactId = "00000000-0000-0000-0000-500000000001";
  await db.insert(schema.livingArtifacts).values({
    id: artifactId,
    missionId: missionF_UUID,
    artifactType: "ADR",
    title: "Event Sourcing Strategy",
    status: "draft",
    currentVersion: 1,
  });

  // Patch
  const patchId = "00000000-0000-0000-0000-600000002001";
  await db.insert(schema.artifactPatches).values({
    id: patchId,
    artifactId: artifactId,
    missionId: missionF_UUID,
    baseVersion: 1,
    diff: "Add Snapshotting pattern to mitigate complexity",
    reason: "Addressing complexity risks",
    riskClass: "medium",
    status: "proposed",
    authorType: "user",
    authorId: "contributor-1",
  });

  // Approval Request
  await db.insert(schema.approvalRequests).values({
    id: "00000000-0000-0000-0000-600000003001",
    missionId: missionF_UUID,
    runId: runF_UUID,
    subjectType: "artifact_patch",
    subjectRef: patchId,
    preview: { title: "Patch Review" },
    riskClass: "medium",
    status: "pending",
    idempotencyKey: "seed-patch-1",
  });

  console.log(
    "✅ Database successfully synchronized with the high-fidelity mock datasets!",
  );
}

seed()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => queryClient.end());
