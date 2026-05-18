import Fastify from "fastify";
import cors from "@fastify/cors";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  PostgresWorkspaceRepository,
  PostgresGraphRepository,
  PostgresSourceRepository,
  PostgresRatingRepository,
  PostgresIdentityRepository,
  PostgresGovernanceRepository,
  PostgresOutboxRepository,
  PostgresMappingRepository,
  PostgresMissionRepository,
  PostgresMissionRunRepository,
  PostgresEvidenceRepository,
  PostgresArtifactRepository,
  PostgresDecisionRepository,
  PostgresApprovalRepository,
  PostgresAssignmentRepository,
  PostgresOrgRepository,
  PostgresUnitOfWorkProvider,
} from "@epios/infrastructure-postgres";
import {
  CreateWorkspaceUseCase,
  ListWorkspacesUseCase,
  PatchWorkspaceUseCase,
  AddNodeUseCase,
  AddEdgeUseCase,
  PatchNodeUseCase,
  GetWorkspaceGraphUseCase,
  SubmitClaimUseCase,
  CastVoteUseCase,
  ListADRsUseCase,
  GetADRUseCase,
  IngestSourceUseCase,
  ListSourcesUseCase,
  RateNodeUseCase,
  GetNodeRatingsUseCase,
  ProposePatchUseCase,
  ListPatchesUseCase,
  AssessReadinessUseCase,
  GetReadinessUseCase,
  ApplyPatchUseCase,
  GetTraceUseCase,
  RedactNodeUseCase,
  ApplyRetentionUseCase,
  RunMappingUseCase,
  GetMappingRunUseCase,
  ListMappingRunsUseCase,
  MappingProcessor,
  GenerateFinalADRUseCase,
  GetTraceSummaryUseCase,
  ProposeArtifactPatchUseCase,
  ResolveApprovalUseCase,
  ApplyArtifactPatchUseCase,
  ListArtifactPatchesUseCase,
  ListApprovalsUseCase,
} from "@epios/application";
import { IdentityContext } from "./identity-context.js";
import { workspaceRoutes } from "./routes/workspace.routes.js";
import { mappingRoutes } from "./routes/mapping.routes.js";
import { governanceRoutes } from "./routes/governance.routes.js";
import { adrRoutes } from "./routes/adr.routes.js";
import { mcpRoutes } from "./routes/mcp.routes.js";
import { sourceRoutes } from "./routes/source.routes.js";
import { ratingRoutes } from "./routes/rating.routes.js";
import { securityRoutes } from "./routes/security.routes.js";
import { identityRoutes } from "./routes/identity.routes.js";
import {
  InMemoryGovernanceRepository,
  InMemoryWorkspaceRepository,
  InMemoryGraphRepository,
  InMemoryADRRepository,
  InMemorySourceRepository,
  InMemoryRatingRepository,
  InMemoryMappingRepository,
  InMemoryOutboxRepository,
  InMemoryIdentityRepository,
  InMemoryUnitOfWorkProvider,
  InMemoryMissionRepository,
  InMemoryMissionRunRepository,
  InMemoryEvidenceRepository,
  InMemoryArtifactRepository,
  InMemoryDecisionRepository,
  InMemoryApprovalRepository,
  InMemoryAssignmentRepository,
  InMemoryOrgRepository,
  MockSecurityService,
  MOCK_ADRS,
  OutboxWorker,
} from "@epios/infrastructure-runtime";
import { User, Assignment, OrgUnit, OrgPosition } from "@epios/domain";
import {
  InMemoryMCPAppRegistry,
  MockMCPBridge,
} from "@epios/infrastructure-mcp";
import { createMockData } from "./mock-data.js";
import {
  WorkspaceRepositoryPort,
  GraphRepositoryPort,
  GovernanceRepositoryPort,
  SourceRepositoryPort,
  RatingRepositoryPort,
  MappingRepositoryPort,
  OutboxRepositoryPort,
  MCPAppRegistryPort,
  MCPBridgePort,
  SecurityPort,
  IdentityRepositoryPort,
  MissionRepositoryPort,
  MissionRunRepositoryPort,
  EvidenceRepositoryPort,
  ArtifactRepositoryPort,
  DecisionRepositoryPort,
  ApprovalRepositoryPort,
  AssignmentRepositoryPort,
  OrgRepositoryPort,
  UnitOfWorkPort,
} from "@epios/ports";

const envConfig = dotenv.config();
import { expand } from "dotenv-expand";
expand(envConfig);

export type ServerDependencies = {
  workspaceRepo?: WorkspaceRepositoryPort;
  graphRepo?: GraphRepositoryPort;
  governanceRepo?: GovernanceRepositoryPort;
  sourceRepo?: SourceRepositoryPort;
  ratingRepo?: RatingRepositoryPort;
  mappingRepo?: MappingRepositoryPort;
  outboxRepo?: OutboxRepositoryPort;
  mcpRegistry?: MCPAppRegistryPort;
  mcpBridge?: MCPBridgePort;
  security?: SecurityPort;
  identityRepo?: IdentityRepositoryPort;
  assignmentRepo?: AssignmentRepositoryPort;
  orgRepo?: OrgRepositoryPort;
  startWorkers?: boolean;
};

export async function buildServer(deps: ServerDependencies = {}) {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "X-User-Id",
      "x-workplace-id",
      "X-Workplace-Id",
      "Accept",
      "Origin",
    ],
    credentials: true,
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
      });
    }
    return reply.status(500).send({ error: "Internal Server Error" });
  });

  let workspaceRepo: WorkspaceRepositoryPort;
  let graphRepo: GraphRepositoryPort;
  let sourceRepo: SourceRepositoryPort;
  let ratingRepo: RatingRepositoryPort;
  let identityRepo: IdentityRepositoryPort;
  let governanceRepo: GovernanceRepositoryPort;
  let outboxRepo: OutboxRepositoryPort;
  let mappingRepo: MappingRepositoryPort;
  let missionRepo: MissionRepositoryPort;
  let missionRunRepo: MissionRunRepositoryPort;
  let evidenceRepo: EvidenceRepositoryPort;
  let artifactRepo: ArtifactRepositoryPort;
  let decisionRepo: DecisionRepositoryPort;
  let approvalRepo: ApprovalRepositoryPort;
  let assignmentRepo: AssignmentRepositoryPort;
  let orgRepo: OrgRepositoryPort;
  let uowProvider: UnitOfWorkPort;

  const databaseUrl = process.env.DATABASE_URL;
  const isMockMode = process.env.EPIOS_DATABASE_MODE === "mock" || !databaseUrl;

  if (isMockMode) {
    const mock = createMockData();
    workspaceRepo =
      deps.workspaceRepo ?? new InMemoryWorkspaceRepository(mock.workspaces);
    graphRepo =
      deps.graphRepo ?? new InMemoryGraphRepository(mock.nodes, mock.edges);
    sourceRepo = deps.sourceRepo ?? new InMemorySourceRepository(mock.sources);
    ratingRepo = deps.ratingRepo ?? new InMemoryRatingRepository();
    identityRepo = deps.identityRepo ?? new InMemoryIdentityRepository();

    // Initialize mock users
    const mockUsers: User[] = [
      {
        id: "admin-1",
        username: "admin",
        role: "admin",
        email: "admin@epios.ai",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "architect-1",
        username: "architect",
        role: "reviewer",
        email: "arch@epios.ai",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "analyst-1",
        username: "analyst",
        role: "contributor",
        email: "analyst@epios.ai",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "observer-1",
        username: "observer",
        role: "observer",
        email: "obs@epios.ai",
        isActive: true,
        createdAt: new Date(),
      },
    ];
    for (const u of mockUsers) await identityRepo.save(u);

    governanceRepo = deps.governanceRepo ?? new InMemoryGovernanceRepository();
    outboxRepo = deps.outboxRepo ?? new InMemoryOutboxRepository();
    mappingRepo = deps.mappingRepo ?? new InMemoryMappingRepository();

    missionRepo = new InMemoryMissionRepository();
    missionRunRepo = new InMemoryMissionRunRepository();
    evidenceRepo = new InMemoryEvidenceRepository();
    artifactRepo = new InMemoryArtifactRepository();
    decisionRepo = new InMemoryDecisionRepository();
    approvalRepo = new InMemoryApprovalRepository();

    // Initialize mock org structure
    const mockUnits: OrgUnit[] = [
      { id: "unit-1", name: "Governance Group" },
      { id: "unit-2", name: "Product Squad S7" },
      { id: "unit-3", name: "Security Audit Team" },
    ];
    const mockPositions: OrgPosition[] = [
      { id: "pos-1", name: "Principal Architect", level: 1 },
      { id: "pos-2", name: "Technical Lead", level: 2 },
      { id: "pos-3", name: "Security Officer", level: 2 },
      { id: "pos-4", name: "Senior Analyst", level: 3 },
    ];
    orgRepo =
      deps.orgRepo ?? new InMemoryOrgRepository(mockUnits, mockPositions);

    // Initialize mock assignments
    const mockAssignments = [
      new Assignment({
        id: "wp-1",
        userId: "admin-1",
        role: "owner",
        unitId: "unit-1",
        positionId: "pos-1",
        isActive: true,
        createdAt: new Date(),
      }),
      new Assignment({
        id: "wp-2",
        userId: "architect-1",
        role: "reviewer",
        unitId: "unit-2",
        positionId: "pos-2",
        isActive: true,
        createdAt: new Date(),
      }),
    ];
    assignmentRepo =
      deps.assignmentRepo ?? new InMemoryAssignmentRepository(mockAssignments);
    uowProvider = new InMemoryUnitOfWorkProvider(
      graphRepo,
      governanceRepo,
      workspaceRepo,
      sourceRepo,
      ratingRepo,
      outboxRepo,
      missionRepo,
      missionRunRepo,
      evidenceRepo,
      artifactRepo,
      decisionRepo,
      approvalRepo,
      mappingRepo,
    );
  } else {
    const queryClient = postgres(databaseUrl!);
    const db = drizzle(queryClient);
    workspaceRepo = deps.workspaceRepo ?? new PostgresWorkspaceRepository(db);
    graphRepo = deps.graphRepo ?? new PostgresGraphRepository(db);
    sourceRepo = deps.sourceRepo ?? new PostgresSourceRepository(db);
    ratingRepo = deps.ratingRepo ?? new PostgresRatingRepository(db);
    identityRepo = deps.identityRepo ?? new PostgresIdentityRepository(db);
    governanceRepo =
      deps.governanceRepo ?? new PostgresGovernanceRepository(db);
    outboxRepo = deps.outboxRepo ?? new PostgresOutboxRepository(db);
    mappingRepo = deps.mappingRepo ?? new PostgresMappingRepository(db);
    // eslint-disable-next-line no-useless-assignment
    missionRepo = new PostgresMissionRepository(db);
    // eslint-disable-next-line no-useless-assignment
    missionRunRepo = new PostgresMissionRunRepository(db);

    evidenceRepo = new PostgresEvidenceRepository(db);

    artifactRepo = new PostgresArtifactRepository(db);
    // eslint-disable-next-line no-useless-assignment
    decisionRepo = new PostgresDecisionRepository(db);

    approvalRepo = new PostgresApprovalRepository(db);
    assignmentRepo =
      deps.assignmentRepo ?? new PostgresAssignmentRepository(db);
    orgRepo = deps.orgRepo ?? new PostgresOrgRepository(db);
    uowProvider = new PostgresUnitOfWorkProvider(db);
  }

  const mcpRegistry = deps.mcpRegistry ?? new InMemoryMCPAppRegistry();
  const mcpBridge = deps.mcpBridge ?? new MockMCPBridge(mcpRegistry);

  const security =
    deps.security ?? new MockSecurityService(identityRepo, assignmentRepo);

  // S2: Ensure non-null repositories (repos are now guaranteed defined)
  const createWorkspaceUseCase = new CreateWorkspaceUseCase(workspaceRepo);
  const listWorkspacesUseCase = new ListWorkspacesUseCase(
    workspaceRepo,
    security,
  );
  const patchWorkspaceUseCase = new PatchWorkspaceUseCase(workspaceRepo);
  const addNodeUseCase = new AddNodeUseCase(workspaceRepo, graphRepo);
  const addEdgeUseCase = new AddEdgeUseCase(workspaceRepo, graphRepo);
  const patchNodeUseCase = new PatchNodeUseCase(graphRepo);
  const getWorkspaceGraphUseCase = new GetWorkspaceGraphUseCase(graphRepo);
  const ingestSourceUseCase = new IngestSourceUseCase(uowProvider, security);
  const listSourcesUseCase = new ListSourcesUseCase(sourceRepo);
  const rateNodeUseCase = new RateNodeUseCase(ratingRepo);
  const getNodeRatingsUseCase = new GetNodeRatingsUseCase(ratingRepo);

  const adrRepo = new InMemoryADRRepository(MOCK_ADRS);
  const listADRsUseCase = new ListADRsUseCase(adrRepo);
  const getADRUseCase = new GetADRUseCase(adrRepo);

  const submitClaimUseCase = new SubmitClaimUseCase(uowProvider, security);
  const proposePatchUseCase = new ProposePatchUseCase(
    governanceRepo,
    graphRepo,
    security,
  );
  const listPatchesUseCase = new ListPatchesUseCase(governanceRepo);
  const castVoteUseCase = new CastVoteUseCase(uowProvider, security);
  const assessReadinessUseCase = new AssessReadinessUseCase(
    governanceRepo,
    graphRepo,
  );
  const getReadinessUseCase = new GetReadinessUseCase(governanceRepo);
  const applyPatchUseCase = new ApplyPatchUseCase(uowProvider);
  const getTraceUseCase = new GetTraceUseCase(governanceRepo);

  const proposeArtifactPatchUseCase = new ProposeArtifactPatchUseCase(
    uowProvider,
    security,
  );
  const resolveApprovalUseCase = new ResolveApprovalUseCase(
    uowProvider,
    security,
  );
  const applyArtifactPatchUseCase = new ApplyArtifactPatchUseCase(
    uowProvider,
    security,
  );
  const listArtifactPatchesUseCase = new ListArtifactPatchesUseCase(
    artifactRepo,
  );
  const listApprovalsUseCase = new ListApprovalsUseCase(approvalRepo);

  // S2: Identity Governance Context
  const identityContext = new IdentityContext(
    identityRepo,
    assignmentRepo,
    orgRepo,
    security,
  );

  const generateFinalADRUseCase = new GenerateFinalADRUseCase(
    governanceRepo,
    graphRepo,
    workspaceRepo,
    evidenceRepo,
  );
  const getTraceSummaryUseCase = new GetTraceSummaryUseCase(governanceRepo);

  // Security identity injection
  app.addHook("onRequest", async (request) => {
    app.log.info(
      `[CORS-DEBUG] Method: ${request.method}, URL: ${request.url}, Headers: ${JSON.stringify(request.headers)}`,
    );

    let userId: string | undefined;

    const authHeader = request.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const decoded = (await security.verifyToken(token)) as { id?: string };
        userId = decoded.id;
      } catch (e) {
        app.log.warn(`Token verification failed: ${e}`);
      }
    }

    if (!userId) {
      userId =
        (request.headers["x-user-id"] as string) ||
        (request.headers["X-User-Id"] as string);
    }

    // Default to observer-1 only if no auth provided
    userId = userId || "observer-1";

    const workplaceId =
      (request.headers["x-workplace-id"] as string) ||
      (request.headers["X-Workplace-Id"] as string);

    const user = await identityRepo.findById(userId);
    (security as MockSecurityService).setCurrentUser(user);
    if (workplaceId) {
      await (security as MockSecurityService).setCurrentWorkPlace(workplaceId);
    }
  });

  const redactNodeUseCase = new RedactNodeUseCase(graphRepo, security);
  const applyRetentionUseCase = new ApplyRetentionUseCase(
    graphRepo,
    governanceRepo,
    security,
  );

  app.get("/", async () => ({
    message: "Epistemic OS API",
    version: "0.1.0-rc.1",
    status: "online",
    docs: "/health",
  }));

  app.get("/health", async () => ({
    ok: true,
    service: "epistemic-os-api",
    timestamp: new Date().toISOString(),
  }));

  const runMappingUseCase = new RunMappingUseCase(uowProvider, security);
  const getMappingRunUseCase = new GetMappingRunUseCase(mappingRepo);
  const listMappingRunsUseCase = new ListMappingRunsUseCase(mappingRepo);

  if (deps.startWorkers !== false) {
    const mappingProcessor = new MappingProcessor(uowProvider);
    mappingProcessor.start();

    const outboxWorker = new OutboxWorker(outboxRepo);
    outboxWorker.start();

    // Hook into close to stop workers
    app.addHook("onClose", async () => {
      mappingProcessor.stop();
      outboxWorker.stop();
    });
  }

  // Register Routes
  app.register(workspaceRoutes, {
    createWorkspaceUseCase,
    listWorkspacesUseCase,
    patchWorkspaceUseCase,
  });
  app.register(mappingRoutes, {
    addNodeUseCase,
    addEdgeUseCase,
    patchNodeUseCase,
    getWorkspaceGraphUseCase,
    runMappingUseCase,
    getMappingRunUseCase,
    listMappingRunsUseCase,
  });
  app.register(governanceRoutes, {
    submitClaimUseCase,
    castVoteUseCase,
    proposePatchUseCase,
    listPatchesUseCase,
    assessReadinessUseCase,
    getReadinessUseCase,
    applyPatchUseCase,
    getTraceUseCase,
    proposeArtifactPatchUseCase,
    resolveApprovalUseCase,
    applyArtifactPatchUseCase,
    generateFinalADRUseCase,
    getTraceSummaryUseCase,
    listArtifactPatchesUseCase,
    listApprovalsUseCase,
    security,
  });

  app.register(adrRoutes, { listADRsUseCase, getADRUseCase });
  app.register(mcpRoutes, { registry: mcpRegistry, bridge: mcpBridge });
  app.register(sourceRoutes, { ingestSourceUseCase, listSourcesUseCase });
  app.register(ratingRoutes, { rateNodeUseCase, getNodeRatingsUseCase });
  app.register(securityRoutes, {
    security,
    redactNodeUseCase,
    applyRetentionUseCase,
  });
  app.register(identityRoutes, {
    prefix: "/api/v1",
    context: identityContext,
  });

  // Save and load workspace map states per user
  app.post("/api/v1/users/map-state", async (request, reply) => {
    const userId = (request.headers["x-user-id"] as string) || "observer-1";
    const { workspaceId, selectedNodeId, viewport, nodes } = request.body as {
      workspaceId: string;
      selectedNodeId?: string | null;
      viewport: { x: number; y: number; zoom: number };
      nodes: Array<{ id: string; position: { x: number; y: number } }>;
    };

    if (!workspaceId) {
      return reply.status(400).send({ error: "Missing workspaceId" });
    }

    if (isMockMode) {
      const key = `${userId}:${workspaceId}`;
      if (!(app as any).decoratorMapStates) {
        (app as any).decoratorMapStates = new Map();
      }
      (app as any).decoratorMapStates.set(key, { selectedNodeId, viewport, nodes });
      return reply.send({ success: true });
    } else {
      const db = (workspaceRepo as any).db;
      const id = randomUUID();
      
      await db.execute(sql`
        INSERT INTO user_map_states (id, user_id, workspace_id, selected_node_id, viewport, nodes_state, updated_at)
        VALUES (${id}, ${userId}, ${workspaceId}, ${selectedNodeId || null}, ${JSON.stringify(viewport)}::jsonb, ${JSON.stringify(nodes)}::jsonb, NOW())
        ON CONFLICT (user_id, workspace_id)
        DO UPDATE SET
          selected_node_id = EXCLUDED.selected_node_id,
          viewport = EXCLUDED.viewport,
          nodes_state = EXCLUDED.nodes_state,
          updated_at = NOW()
      `);
      return reply.send({ success: true });
    }
  });

  app.get("/api/v1/users/map-state", async (request, reply) => {
    const userId = (request.headers["x-user-id"] as string) || "observer-1";
    const { workspaceId } = request.query as { workspaceId: string };

    if (!workspaceId) {
      return reply.status(400).send({ error: "Missing workspaceId" });
    }

    if (isMockMode) {
      const key = `${userId}:${workspaceId}`;
      if (!(app as any).decoratorMapStates) {
        (app as any).decoratorMapStates = new Map();
      }
      const state = (app as any).decoratorMapStates.get(key) || null;
      return reply.send({ state });
    } else {
      const db = (workspaceRepo as any).db;
      const rows = await db.execute(sql`
        SELECT selected_node_id as "selectedNodeId", viewport, nodes_state as "nodesState"
        FROM user_map_states
        WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
      `);
      
      const record = rows[0] || null;
      return reply.send({ state: record });
    }
  });

  return app;
}
