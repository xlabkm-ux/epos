import { FastifyInstance } from "fastify";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { buildServer } from "../src/server.js";
import {
  WorkspaceRepositoryPort,
  GraphRepositoryPort,
  GovernanceRepositoryPort,
  IdentityRepositoryPort,
  MCPAppRegistryPort,
  MCPBridgePort,
  SourceRepositoryPort,
} from "@epios/ports";
import { Workspace, EpistemicNode, GovernanceProcess } from "@epios/domain";

describe("API E2E", () => {
  let app: FastifyInstance;

  process.env.EPIOS_DATABASE_MODE = "mock";

  const mockWorkspaceRepo = {
    save: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
  };

  const mockGraphRepo = {
    saveNode: vi.fn(),
    saveEdge: vi.fn(),
    findNodeById: vi.fn(),
    findEdgeById: vi.fn(),
    findNodesByWorkspaceId: vi.fn(),
    findEdgesByWorkspaceId: vi.fn(),
  };

  const mockGovernanceRepo = {
    saveProcess: vi.fn(),
    findProcessByNodeId: vi.fn(),
    saveTraceEvent: vi.fn(),
    findPatchById: vi.fn(),
    savePatch: vi.fn(),
    getLatestVersion: vi.fn(),
    saveArtifactVersion: vi.fn(),
    findPatchesByWorkspaceId: vi.fn().mockResolvedValue([]),
    findReadinessByWorkspaceId: vi.fn(),
    findTraceByWorkspaceId: vi.fn().mockResolvedValue([]),
  };

  const mockSourceRepo = {
    save: vi.fn(),
    findById: vi.fn(),
    findByMissionId: vi.fn().mockResolvedValue([]),
  };

  const mockMCPRegistry = {
    listApps: vi.fn().mockResolvedValue([]),
    registerApp: vi.fn().mockResolvedValue({ id: "app-1" }),
  };

  const mockMCPBridge = {
    executeTool: vi.fn().mockResolvedValue({ success: true }),
  };

  const mockIdentityRepo = {
    findById: vi
      .fn()
      .mockResolvedValue({ id: "admin-1", username: "admin", role: "admin" }),
  };

  beforeEach(async () => {
    app = buildServer({
      workspaceRepo: mockWorkspaceRepo as unknown as WorkspaceRepositoryPort,
      graphRepo: mockGraphRepo as unknown as GraphRepositoryPort,
      governanceRepo: mockGovernanceRepo as unknown as GovernanceRepositoryPort,
      sourceRepo: mockSourceRepo as unknown as SourceRepositoryPort,
      mcpRegistry: mockMCPRegistry as unknown as MCPAppRegistryPort,
      mcpBridge: mockMCPBridge as unknown as MCPBridgePort,
      identityRepo: mockIdentityRepo as unknown as IdentityRepositoryPort,
      startWorkers: false,
    });
    await app.ready();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it("should return health status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ ok: true });
  });

  it("should create a workspace", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/workspaces",
      payload: {
        title: "Test Workspace",
        brief: {
          goal: "Test Goal",
          successCriteria: ["ok"],
          constraints: [],
          unknowns: [],
        },
        createdBy: { type: "user", id: "user-1" },
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toHaveProperty("id");
  });

  it("should add a node to a workspace", async () => {
    mockWorkspaceRepo.findById.mockResolvedValue(
      new Workspace({
        id: "workspace-1",
        title: "Workspace 1",
        status: "running",
        mode: "assisted",
        sensitivity: "internal",
        version: 1,
        brief: {
          goal: "G",
          successCriteria: [],
          constraints: [],
          unknowns: [],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: { type: "user", id: "u1" },
      }),
    );

    const response = await app.inject({
      method: "POST",
      url: "/workspaces/workspace-1/nodes",
      payload: {
        missionId: "mission-1",
        type: "claim",
        content: "Test Claim",
      },
    });

    expect(response.statusCode).toBe(201);
  });

  it("should submit a governance claim", async () => {
    // Mock the Unit of Work for SubmitClaim
    const response = await app.inject({
      method: "POST",
      url: "/governance/claims",
      headers: { "x-user-id": "admin-1" },
      payload: {
        workspaceId: "w1",
        missionId: "m1",
        content: "Governance Claim",
      },
    });

    expect(response.statusCode).toBe(201);
  });

  it("should cast a governance vote", async () => {
    mockGovernanceRepo.findProcessByNodeId.mockResolvedValue(
      new GovernanceProcess({
        nodeId: "n1",
        workspaceId: "w1",
        status: "pending",
        votes: [],
        requiredVotes: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      }),
    );

    mockGraphRepo.findNodeById.mockResolvedValue(
      new EpistemicNode({
        id: "n1",
        workspaceId: "w1",
        missionId: "m1",
        type: "claim",
        content: "Test",
        strength: "none",
        metadata: {},
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const response = await app.inject({
      method: "POST",
      url: "/governance/votes",
      headers: { "x-user-id": "admin-1" },
      payload: {
        nodeId: "n1",
        actorId: "v1",
        decision: "approve",
      },
    });

    expect(response.statusCode).toBe(204);
  });

  it("should patch a node", async () => {
    mockGraphRepo.findNodeById.mockResolvedValue(
      new EpistemicNode({
        id: "node-1",
        workspaceId: "workspace-1",
        missionId: "m1",
        type: "claim",
        content: "Old Content",
        strength: "none",
        metadata: {},
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const response = await app.inject({
      method: "PATCH",
      url: "/workspaces/workspace-1/nodes/node-1",
      payload: {
        content: "New Content",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().content).toBe("New Content");
  });
});
