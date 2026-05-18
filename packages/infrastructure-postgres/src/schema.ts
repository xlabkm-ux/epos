import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  unique,
} from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  mode: text("mode").notNull(),
  sensitivity: text("sensitivity").notNull(),
  goal: text("goal").notNull(),
  context: text("context"),
  successCriteria: jsonb("success_criteria").notNull().default([]),
  constraints: jsonb("constraints").notNull().default([]),
  unknowns: jsonb("unknowns").notNull().default([]),
  desiredArtifactType: text("desired_artifact_type"),
  createdByEmail: text("created_by_email"),
  createdByType: text("created_by_type").notNull(),
  createdById: text("created_by_id").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archiveComment: text("archive_comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  version: integer("version").notNull().default(1),
});

export const epistemicNodes = pgTable("epistemic_nodes", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: text("type").notNull(),
  realityLevel: text("reality_level").notNull().default("unknown"),
  strength: text("strength").notNull().default("none"),
  status: text("status").notNull().default("active"),
  evidenceSetId: uuid("evidence_set_id"),
  validFrom: timestamp("valid_from", { withTimezone: true })
    .notNull()
    .defaultNow(),
  validTo: timestamp("valid_to", { withTimezone: true }),
  observedAt: timestamp("observed_at", { withTimezone: true }),
  assertedAt: timestamp("asserted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  temporalResolution: text("temporal_resolution").notNull().default("unknown"),
  validityBasis: text("validity_basis").notNull().default("unknown"),
  createdByType: text("created_by_type").notNull().default("system"),
  createdById: text("created_by_id").notNull().default("system"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  metadata: jsonb("metadata").notNull().default({}),
  version: integer("version").notNull().default(1),
});

export const epistemicEdges = pgTable("epistemic_edges", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  sourceNodeId: uuid("source_node_id")
    .notNull()
    .references(() => epistemicNodes.id, { onDelete: "cascade" }),
  targetNodeId: uuid("target_node_id")
    .notNull()
    .references(() => epistemicNodes.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  sourceType: text("source_type").notNull(),
  title: text("title").notNull(),
  uri: text("uri"),
  contentHash: text("content_hash"),
  freshness: timestamp("freshness", { withTimezone: true }),
  sourceQuality: text("source_quality").notNull().default("unknown"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sourceChunks = pgTable("source_chunks", {
  id: uuid("id").primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  ordinal: integer("ordinal").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const ratings = pgTable("ratings", {
  id: uuid("id").primaryKey(),
  subjectId: uuid("subject_id").notNull(),
  subjectType: text("subject_type").notNull(),
  actorId: text("actor_id").notNull(),
  value: integer("value").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const identities = pgTable("identities", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  passwordHash: text("password_hash"),
  isActive: integer("is_active").notNull().default(1), // 1 for true
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orgUnits = pgTable("org_units", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
});

export const orgPositions = pgTable("org_positions", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").notNull().default(1),
});

export const userAssignments = pgTable("user_assignments", {
  id: uuid("id").primaryKey(), // workplace_id
  userId: text("user_id")
    .notNull()
    .references(() => identities.id, { onDelete: "cascade" }),
  unitId: uuid("unit_id").references(() => orgUnits.id, { onDelete: "set null" }),
  positionId: uuid("position_id").references(() => orgPositions.id, {
    onDelete: "set null",
  }),
  role: text("role").notNull(),
  workspaceId: uuid("workspace_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const governanceProcesses = pgTable("governance_processes", {
  nodeId: uuid("node_id")
    .primaryKey()
    .references(() => epistemicNodes.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  votes: jsonb("votes").notNull().default([]),
  requiredVotes: integer("required_votes").notNull(),
  patchId: uuid("patch_id").references(() => nodePatches.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  version: integer("version").notNull().default(1),
});

export const nodePatches = pgTable("node_patches", {
  id: uuid("id").primaryKey(),
  targetNodeId: uuid("target_node_id")
    .notNull()
    .references(() => epistemicNodes.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  version: integer("version").notNull().default(1),
});

export const readinessAssessments = pgTable("readiness_assessments", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  profileId: text("profile_id").notNull(),
  methodVersion: text("method_version").notNull(),
  status: text("status").notNull(),
  indicators: jsonb("indicators").notNull().default({}),
  numericScore: integer("numeric_score"),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const livingArtifacts = pgTable("living_artifacts", {
  id: uuid("id").primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  artifactType: text("artifact_type").notNull(),
  title: text("title").notNull(),
  currentVersion: integer("current_version").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  version: integer("version").notNull().default(1),
});

export const artifactVersions = pgTable("artifact_versions", {
  id: uuid("id").primaryKey(),
  artifactId: uuid("artifact_id")
    .notNull()
    .references(() => livingArtifacts.id, { onDelete: "cascade" }),
  workspaceId: uuid("workspace_id").notNull(),
  version: integer("version").notNull(),
  content: text("content").notNull(),
  contentHash: text("content_hash").notNull(),
  patchId: uuid("patch_id"),
  authorId: text("author_id").notNull(),
  createdByType: text("created_by_type").notNull(),
  createdById: text("created_by_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const artifactPatches = pgTable("artifact_patches", {
  id: uuid("id").primaryKey(),
  artifactId: uuid("artifact_id")
    .notNull()
    .references(() => livingArtifacts.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  baseVersion: integer("base_version").notNull(),
  targetVersion: integer("target_version"),
  diff: text("diff").notNull(),
  reason: text("reason").notNull(),
  riskClass: text("risk_class").notNull(),
  status: text("status").notNull(),
  authorType: text("author_type").notNull(),
  authorId: text("author_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  version: integer("version").notNull().default(1),
});

export const artifactPatchNodeRefs = pgTable(
  "artifact_patch_node_refs",
  {
    patchId: uuid("patch_id")
      .notNull()
      .references(() => artifactPatches.id, { onDelete: "cascade" }),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => epistemicNodes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: [t.patchId, t.nodeId],
  }),
);

export const decisionRecords = pgTable("decision_records", {
  id: uuid("id").primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  runId: uuid("run_id").references(() => missionRuns.id, {
    onDelete: "set null",
  }),
  decisionType: text("decision_type").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectRef: text("subject_ref").notNull(),
  options: jsonb("options").notNull().default([]),
  selectedOptionId: text("selected_option_id"),
  rationale: text("rationale"),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const approvalRequests = pgTable("approval_requests", {
  id: uuid("id").primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  runId: uuid("run_id")
    .notNull()
    .references(() => missionRuns.id, { onDelete: "cascade" }),
  subjectType: text("subject_type").notNull(),
  subjectRef: text("subject_ref").notNull(),
  preview: jsonb("preview").notNull(),
  riskClass: text("risk_class").notNull(),
  status: text("status").notNull(),
  idempotencyKey: text("idempotency_key").notNull(),
  decisionId: uuid("decision_id").references(() => decisionRecords.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedByType: text("resolved_by_type"),
  resolvedById: text("resolved_by_id"),
  version: integer("version").notNull().default(1),
});

export const conflictCards = pgTable("conflict_cards", {
  id: uuid("id").primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  options: jsonb("options").notNull().default([]),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  decisionId: uuid("decision_id").references(() => decisionRecords.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  version: integer("version").notNull().default(1),
});

export const traceEvents = pgTable("trace_events", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  actorId: text("actor_id").notNull(),
  targetId: text("target_id").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").primaryKey(),
  aggregateType: text("aggregate_type").notNull(),
  aggregateId: text("aggregate_id").notNull(),
  aggregateVersion: integer("aggregate_version"),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  idempotencyKey: text("idempotency_key"),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  availableAt: timestamp("available_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const missions = pgTable("missions", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: text("status").notNull(),
  mode: text("mode").notNull(),
  sensitivity: text("sensitivity").notNull(),
  goal: text("goal").notNull(),
  context: text("context"),
  successCriteria: jsonb("success_criteria").notNull().default([]),
  constraints: jsonb("constraints").notNull().default([]),
  unknowns: jsonb("unknowns").notNull().default([]),
  desiredArtifactType: text("desired_artifact_type"),
  createdByType: text("created_by_type").notNull(),
  createdById: text("created_by_id").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  version: integer("version").notNull().default(1),
});

export const missionRuns = pgTable("mission_runs", {
  id: uuid("id").primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  currentStage: text("current_stage"),
  waitReason: text("wait_reason"),
  failureCode: text("failure_code"),
  failureMessage: text("failure_message"),
  pendingApprovalIds: jsonb("pending_approval_ids").notNull().default([]),
  failureRetryable: boolean("failure_retryable"),
  idempotencyKey: text("idempotency_key"),
  runtimeRef: text("runtime_ref"),
  startedByType: text("started_by_type").notNull(),
  startedById: text("started_by_id").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  version: integer("version").notNull().default(1),
});

// Redundant evidenceSources removed, use 'sources' table.

export const evidenceRefs = pgTable("evidence_refs", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  chunkId: uuid("chunk_id").references(() => sourceChunks.id, {
    onDelete: "set null",
  }),
  quote: text("quote"),
  startOffset: integer("start_offset"),
  endOffset: integer("end_offset"),
  locator: text("locator"),
  relevanceScore: doublePrecision("relevance_score"),
  citationStatus: text("citation_status").notNull().default("unverified"),
  boundaryNote: text("boundary_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const epistemicNodeEvidenceRefs = pgTable(
  "epistemic_node_evidence_refs",
  {
    nodeId: uuid("node_id")
      .notNull()
      .references(() => epistemicNodes.id, { onDelete: "cascade" }),
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => evidenceRefs.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: [t.nodeId, t.evidenceId],
  }),
);

export const evidenceSets = pgTable("evidence_sets", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  evidenceIds: uuid("evidence_ids").array().notNull().default([]),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const domainBoundaries = pgTable("domain_boundaries", {
  id: uuid("id").primaryKey(),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  appliesToNodeId: uuid("applies_to_node_id")
    .notNull()
    .references(() => epistemicNodes.id, { onDelete: "cascade" }),
  scopeDescription: text("scope_description").notNull(),
  validRealityLevels: jsonb("valid_reality_levels").notNull().default([]),
  excludedScopes: jsonb("excluded_scopes").notNull().default([]),
  downgradePolicy: text("downgrade_policy"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const mappingRuns = pgTable("mapping_runs", {
  id: uuid("id").primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  missionId: uuid("mission_id")
    .notNull()
    .references(() => missions.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  progress: integer("progress").notNull().default(0),
  claimsFound: integer("claims_found").notNull().default(0),
  evidenceFound: integer("evidence_found").notNull().default(0),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const userMapStates = pgTable(
  "user_map_states",
  {
    id: uuid("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => identities.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    selectedNodeId: uuid("selected_node_id"),
    viewport: jsonb("viewport").notNull().default({ x: 0, y: 0, zoom: 1 }),
    nodesState: jsonb("nodes_state").notNull().default([]),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uq: unique("uq_user_workspace").on(t.userId, t.workspaceId),
  }),
);
