import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateMissionUseCase } from "../src/use-cases/create-mission.js";
import { UpdateMissionBriefUseCase } from "../src/use-cases/update-mission-brief.js";
import { IngestSourceUseCase } from "../src/use-cases/ingest-source.js";
import { RunMappingUseCase } from "../src/use-cases/run-mapping.js";
import { UnitOfWorkPort } from "@epios/ports";
import { Mission } from "@epios/domain";

const mockMissionRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
};

const mockMissionRunRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findByMissionId: vi.fn(),
};

const mockSourceRepo = {
  save: vi.fn(),
  findById: vi.fn(),
  findByMissionId: vi.fn(),
};

const mockGovernanceRepo = {
  saveTraceEvent: vi.fn(),
};

const mockOutboxRepo = {
  save: vi.fn(),
};

const mockSecurity = {
  authorize: vi.fn().mockResolvedValue(true),
  getCurrentWorkPlace: vi.fn().mockResolvedValue({ id: "wp-1", role: "admin" }),
} as any;

const mockUnitOfWork = {
  missionRepository: mockMissionRepo,
  missionRunRepository: mockMissionRunRepo,
  sourceRepository: mockSourceRepo,
  governanceRepository: mockGovernanceRepo,
  outboxRepository: mockOutboxRepo,
} as any;

const mockUowProvider = {
  runInTransaction: vi.fn((fn) => fn(mockUnitOfWork)),
  security: mockSecurity,
} as any;

describe("Mission Use Cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMissionRunRepo.findByMissionId.mockResolvedValue([]);
  });

  describe("CreateMissionUseCase", () => {
    it("should create a mission", async () => {
      const useCase = new CreateMissionUseCase(mockUowProvider, mockSecurity);
      const request = {
        workspaceId: "ws-1",
        title: "New Mission",
        brief: {
          goal: "Explore the unknown",
          successCriteria: [],
          constraints: [],
          unknowns: [],
        },
        createdBy: { actorType: "user" as const, actorId: "user-1" },
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.title).toBe(request.title);
      expect(mockMissionRepo.save).toHaveBeenCalled();
      expect(mockGovernanceRepo.saveTraceEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "mission_created" }),
      );
    });
  });

  describe("UpdateMissionBriefUseCase", () => {
    it("should update mission brief", async () => {
      const useCase = new UpdateMissionBriefUseCase(mockUowProvider, mockSecurity);
      const mission = new Mission({
        id: "m1",
        workspaceId: "ws1",
        title: "M1",
        brief: { goal: "Old", successCriteria: [], constraints: [], unknowns: [] },
        status: "draft",
        mode: "studio",
        sensitivity: "low",
        artifactIds: [],
        runIds: [],
        createdBy: { actorType: "user", actorId: "u1" },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
      mockMissionRepo.findById.mockResolvedValue(mission);

      await useCase.execute({
        missionId: "m1",
        briefPatch: { goal: "New Goal" },
        actorId: "u1",
      });

      expect(mission.brief.goal).toBe("New Goal");
      expect(mission.status).toBe("briefed");
      expect(mockMissionRepo.save).toHaveBeenCalled();
      expect(mockGovernanceRepo.saveTraceEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "mission_brief_updated" }),
      );
    });
  });

  describe("IngestSourceUseCase", () => {
    it("should ingest a source into a mission", async () => {
      const useCase = new IngestSourceUseCase(mockUowProvider, mockSecurity);
      const mission = new Mission({
        id: "m1",
        workspaceId: "ws1",
        title: "M1",
        brief: { goal: "G", successCriteria: [], constraints: [], unknowns: [] },
        status: "draft",
        mode: "studio",
        sensitivity: "low",
        artifactIds: [],
        runIds: [],
        createdBy: { actorType: "user", actorId: "u1" },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
      mockMissionRepo.findById.mockResolvedValue(mission);

      const request = {
        missionId: "m1",
        type: "document" as const,
        title: "Doc 1",
        content: "Some content",
        actorId: "u1",
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.title).toBe("Doc 1");
      expect(mockSourceRepo.save).toHaveBeenCalled();
      expect(mockGovernanceRepo.saveTraceEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "source_ingested" }),
      );
    });
  });

  describe("RunMappingUseCase", () => {
    it("should start a mapping run", async () => {
      const useCase = new RunMappingUseCase(mockUowProvider, mockSecurity);
      const mission = new Mission({
        id: "m1",
        workspaceId: "ws1",
        title: "M1",
        brief: { goal: "G", successCriteria: [], constraints: [], unknowns: [] },
        status: "draft",
        mode: "studio",
        sensitivity: "low",
        artifactIds: [],
        runIds: [],
        createdBy: { actorType: "user", actorId: "u1" },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
      mockMissionRepo.findById.mockResolvedValue(mission);

      const request = {
        missionId: "m1",
        sourceIds: ["s1"],
        actorId: "u1",
      };

      const result = await useCase.execute(request);

      expect(result.id).toBeDefined();
      expect(result.status).toBe("running");
      expect(result.currentStage).toBe("mapping");
      expect(mockMissionRunRepo.save).toHaveBeenCalled();
      expect(mockOutboxRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ type: "mapping_started" }),
      );
    });
  });
});
