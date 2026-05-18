/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateWorkspaceUseCase } from "../src/use-cases/create-workspace.js";
import { AddNodeUseCase } from "../src/use-cases/add-node.js";
import { AddEdgeUseCase } from "../src/use-cases/add-edge.js";
import { PatchNodeUseCase } from "../src/use-cases/patch-node.js";
import { SubmitClaimUseCase } from "../src/use-cases/submit-claim.js";
import { CastVoteUseCase } from "../src/use-cases/cast-vote.js";
import { ListWorkspacesUseCase } from "../src/use-cases/list-workspaces.js";
import { GetWorkspaceGraphUseCase } from "../src/use-cases/get-workspace-graph.js";
import {
  WorkspaceRepositoryPort,
  GraphRepositoryPort,
  GovernanceRepositoryPort,
} from "@epios/ports";
import { Workspace, EpistemicNode, GovernanceProcess } from "@epios/domain";

const mockWorkspaceRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
} as unknown as WorkspaceRepositoryPort;

const mockGraphRepo = {
  saveNode: vi.fn(),
  saveEdge: vi.fn(),
  findNodeById: vi.fn(),
  findEdgeById: vi.fn(),
  findNodesByWorkspaceId: vi.fn(),
  findEdgesByWorkspaceId: vi.fn(),
} as unknown as GraphRepositoryPort;

const mockGovernanceRepo = {
  saveProcess: vi.fn(),
  findProcessByNodeId: vi.fn(),
  findProcessesByWorkspaceId: vi.fn(),
  saveTraceEvent: vi.fn(),
  saveArtifactVersion: vi.fn(),
  findPatchById: vi.fn(),
  savePatch: vi.fn(),
  getLatestVersion: vi.fn(),
  saveReadiness: vi.fn(),
} as unknown as GovernanceRepositoryPort;
const mockOutboxRepo = {
  save: vi.fn(),
} as any;

const mockSecurity = {
  authorize: vi.fn().mockResolvedValue(true),
  getCurrentWorkPlace: vi.fn().mockResolvedValue({ id: "wp-1", role: "admin" }),
} as any;

const mockUnitOfWork = {
  workspaceRepository: mockWorkspaceRepo,
  graphRepository: mockGraphRepo,
  governanceRepository: mockGovernanceRepo,
  outboxRepository: mockOutboxRepo,
} as any;

const mockUowProvider = {
  runInTransaction: vi.fn((fn) => fn(mockUnitOfWork)),
  security: mockSecurity,
} as any;

describe("Use Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("CreateWorkspaceUseCase", () => {
    it("should create a workspace", async () => {
      const useCase = new CreateWorkspaceUseCase(mockWorkspaceRepo);
      const request = {
        title: "Test Workspace",
        brief: {
          goal: "Test Goal",
          successCriteria: [],
          constraints: [],
          unknowns: [],
        },
        createdBy: { type: "user", id: "user-1" },
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.title).toBe(request.title);
      expect(mockWorkspaceRepo.save).toHaveBeenCalled();
    });
  });

  describe("AddNodeUseCase", () => {
    it("should add a node to a workspace", async () => {
      const useCase = new AddNodeUseCase(mockWorkspaceRepo, mockGraphRepo);
      vi.mocked(mockWorkspaceRepo.findById).mockResolvedValue({
        id: "workspace-1",
      } as Workspace);

      const request = {
        workspaceId: "workspace-1",
        missionId: "mission-1",
        type: "claim" as const,
        content: "Test Claim",
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.content).toBe(request.content);
      expect(mockGraphRepo.saveNode).toHaveBeenCalled();
    });

    it("should throw if workspace not found", async () => {
      const useCase = new AddNodeUseCase(mockWorkspaceRepo, mockGraphRepo);
      vi.mocked(mockWorkspaceRepo.findById).mockResolvedValue(null);

      const request = {
        workspaceId: "invalid",
        missionId: "mission-1",
        type: "claim" as const,
        content: "Test",
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        "WORKSPACE_NOT_FOUND",
      );
    });
  });

  describe("AddEdgeUseCase", () => {
    it("should add an edge between nodes", async () => {
      const useCase = new AddEdgeUseCase(mockWorkspaceRepo, mockGraphRepo);
      vi.mocked(mockWorkspaceRepo.findById).mockResolvedValue({
        id: "workspace-1",
      } as Workspace);

      const request = {
        workspaceId: "workspace-1",
        sourceNodeId: "node-1",
        targetNodeId: "node-2",
        type: "supports" as const,
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(mockGraphRepo.saveEdge).toHaveBeenCalled();
    });

    it("should throw if workspace not found", async () => {
      const useCase = new AddEdgeUseCase(mockWorkspaceRepo, mockGraphRepo);
      vi.mocked(mockWorkspaceRepo.findById).mockResolvedValue(null);

      const request = {
        workspaceId: "invalid",
        sourceNodeId: "n1",
        targetNodeId: "n2",
        type: "supports" as const,
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        "WORKSPACE_NOT_FOUND",
      );
    });
  });

  describe("PatchNodeUseCase", () => {
    it("should patch an existing node", async () => {
      const useCase = new PatchNodeUseCase(mockGraphRepo);
      vi.mocked(mockGraphRepo.findNodeById).mockResolvedValue(
        new EpistemicNode({
          id: "node-1",
          workspaceId: "workspace-1",
          missionId: "mission-1",
          type: "claim",
          content: "Old Content",
          strength: "none",
          metadata: { key: "old" },
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const request = {
        id: "node-1",
        content: "New Content",
        metadata: { key: "new", other: "val" },
      };

      const result = await useCase.execute(request);

      expect(result.content).toBe("New Content");
      expect(result.metadata).toEqual({ key: "new", other: "val" });
      expect(mockGraphRepo.saveNode).toHaveBeenCalled();
    });

    it("should throw if node not found", async () => {
      const useCase = new PatchNodeUseCase(mockGraphRepo);
      vi.mocked(mockGraphRepo.findNodeById).mockResolvedValue(null);

      const request = {
        id: "invalid",
        content: "New",
      };

      await expect(useCase.execute(request)).rejects.toThrow("NODE_NOT_FOUND");
    });
  });

  describe("SubmitClaimUseCase", () => {
    it("should submit a claim and create a governance process", async () => {
      const useCase = new SubmitClaimUseCase(mockUowProvider, mockSecurity);
      const request = {
        workspaceId: "workspace-1",
        missionId: "mission-1",
        content: "New Claim Content",
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.content).toBe(request.content);
      expect(mockGraphRepo.saveNode).toHaveBeenCalled();
      expect(mockGovernanceRepo.saveProcess).toHaveBeenCalled();
    });
  });

  describe("CastVoteUseCase", () => {
    it("should cast a vote and keep status as pending if threshold not met", async () => {
      const useCase = new CastVoteUseCase(mockUowProvider, mockSecurity);
      const mockProcess = new GovernanceProcess({
        nodeId: "node-1",
        workspaceId: "workspace-1",
        status: "pending",
        votes: [],
        requiredVotes: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mockGovernanceRepo.findProcessByNodeId).mockResolvedValue(
        mockProcess,
      );

      const request = {
        nodeId: "node-1",
        actorId: "voter-1",
        decision: "approve" as const,
      };

      await useCase.execute(request);

      const savedProcess = vi.mocked(mockGovernanceRepo.saveProcess).mock
        .calls[0][0];
      expect(savedProcess.toJSON().status).toBe("pending");
    });

    it("should finalize process as approved if threshold met", async () => {
      const useCase = new CastVoteUseCase(mockUowProvider, mockSecurity);
      const mockProcess = new GovernanceProcess({
        nodeId: "node-1",
        workspaceId: "workspace-1",
        status: "pending",
        votes: [
          { actorId: "voter-1", decision: "approve", timestamp: new Date() },
        ],
        requiredVotes: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mockGovernanceRepo.findProcessByNodeId).mockResolvedValue(
        mockProcess,
      );
      vi.mocked(mockGraphRepo.findNodeById).mockResolvedValue(
        new EpistemicNode({
          id: "node-1",
          workspaceId: "workspace-1",
          missionId: "mission-1",
          type: "claim",
          content: "Test",
          strength: "none",
          metadata: {},
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const request = {
        nodeId: "node-1",
        actorId: "voter-2",
        decision: "approve" as const,
      };

      await useCase.execute(request);

      const savedProcess = vi.mocked(mockGovernanceRepo.saveProcess).mock
        .calls[0][0];
      expect(savedProcess.toJSON().status).toBe("approved");

      const savedNode = vi.mocked(mockGraphRepo.saveNode).mock.calls[0][0];
      expect(savedNode.strength).toBe("strong");
    });

    it("should finalize process as rejected if rejection threshold met", async () => {
      const useCase = new CastVoteUseCase(mockUowProvider, mockSecurity);
      const mockProcess = new GovernanceProcess({
        nodeId: "node-1",
        workspaceId: "workspace-1",
        status: "pending",
        votes: [
          { actorId: "voter-1", decision: "reject", timestamp: new Date() },
        ],
        requiredVotes: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(mockGovernanceRepo.findProcessByNodeId).mockResolvedValue(
        mockProcess,
      );

      const request = {
        nodeId: "node-1",
        actorId: "voter-2",
        decision: "reject" as const,
      };

      await useCase.execute(request);

      const savedProcess = vi.mocked(mockGovernanceRepo.saveProcess).mock
        .calls[0][0];
      expect(savedProcess.toJSON().status).toBe("rejected");
    });

    it("should throw if process not found", async () => {
      const useCase = new CastVoteUseCase(mockUowProvider, mockSecurity);
      vi.mocked(mockGovernanceRepo.findProcessByNodeId).mockResolvedValue(null);

      const request = {
        nodeId: "invalid",
        actorId: "v1",
        decision: "approve" as const,
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        "GOVERNANCE_PROCESS_NOT_FOUND",
      );
    });

    it("should throw if process already finalized", async () => {
      const useCase = new CastVoteUseCase(mockUowProvider, mockSecurity);
      vi.mocked(mockGovernanceRepo.findProcessByNodeId).mockResolvedValue(
        new GovernanceProcess({
          nodeId: "node-1",
          workspaceId: "workspace-1",
          status: "approved",
          votes: [],
          requiredVotes: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const request = {
        nodeId: "node-1",
        actorId: "v1",
        decision: "approve" as const,
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        "Cannot transition from approved to finalized",
      );
    });
  });

  describe("ListWorkspacesUseCase", () => {
    it("should list all workspaces", async () => {
      const useCase = new ListWorkspacesUseCase(mockWorkspaceRepo, mockSecurity);
      vi.mocked(mockWorkspaceRepo.findAll).mockResolvedValue([
        { id: "w1", title: "W1" },
      ] as unknown as Workspace[]);

      const result = await useCase.execute();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("W1");
    });
  });

  describe("GetWorkspaceGraphUseCase", () => {
    it("should return the graph for a workspace", async () => {
      const useCase = new GetWorkspaceGraphUseCase(mockGraphRepo);
      vi.mocked(mockGraphRepo.findNodesByWorkspaceId).mockResolvedValue([]);
      vi.mocked(mockGraphRepo.findEdgesByWorkspaceId).mockResolvedValue([]);

      const result = await useCase.execute("workspace-1");
      expect(result.nodes).toBeDefined();
      expect(result.edges).toBeDefined();
    });
  });
});
