import { describe, it, expect, vi } from "vitest";
import { AssessReadinessUseCase } from "../use-cases/assess-readiness";
import { GovernanceRepositoryPort, GraphRepositoryPort } from "@epios/ports";

describe("Readiness Domain Invariants", () => {
  const mockGovernanceRepo = {
    findProcessesByWorkspaceId: vi.fn(),
    saveReadiness: vi.fn(),
    saveTraceEvent: vi.fn(),
  } as unknown as GovernanceRepositoryPort;

  const mockGraphRepo = {
    findNodesByWorkspaceId: vi.fn(),
  } as unknown as GraphRepositoryPort;

  const useCase = new AssessReadinessUseCase(mockGovernanceRepo, mockGraphRepo);

  it("should be BLOCKED if risk handling is missing", async () => {
    vi.mocked(mockGraphRepo.findNodesByWorkspaceId).mockResolvedValue([
      {
        id: "1",
        type: "claim",
        content: "test",
        workspaceId: "w1",
      } as any,
    ]);
    vi.mocked(mockGovernanceRepo.findProcessesByWorkspaceId).mockResolvedValue([
      { id: "p1", status: "completed" } as any,
    ]);

    const result = await useCase.execute({
      workspaceId: "w1",
      profileId: "v1",
    });

    expect(result.status).toBe("blocked");
    expect(result.explanation).toContain("BLOCKED");
    expect(result.explanation).toContain("No risk nodes identified");
  });

  it("should be BLOCKED if evidence coverage is low", async () => {
    vi.mocked(mockGraphRepo.findNodesByWorkspaceId).mockResolvedValue([
      {
        id: "1",
        type: "claim",
        content: "test",
        workspaceId: "w1",
      } as any,
      {
        id: "2",
        type: "claim",
        content: "test",
        workspaceId: "w1",
      } as any,
      {
        id: "3",
        type: "risk",
        content: "test",
        workspaceId: "w1",
      } as any,
    ]);
    vi.mocked(mockGovernanceRepo.findProcessesByWorkspaceId).mockResolvedValue([
      { id: "p1", status: "completed" } as any,
    ]);

    const result = await useCase.execute({
      workspaceId: "w1",
      profileId: "v1",
    });

    expect(result.status).toBe("blocked");
    expect(result.explanation).toContain("Evidence coverage below 40%");
  });

  it("should be READY if all indicators are high", async () => {
    vi.mocked(mockGraphRepo.findNodesByWorkspaceId).mockResolvedValue([
      {
        id: "1",
        type: "claim",
        content: "test",
        workspaceId: "w1",
        evidenceSetId: "e1",
      } as any,
      {
        id: "2",
        type: "risk",
        content: "test",
        workspaceId: "w1",
        evidenceSetId: "e2",
      } as any,
      {
        id: "3",
        type: "risk",
        content: "test",
        workspaceId: "w1",
        evidenceSetId: "e3",
      } as any,
      {
        id: "4",
        type: "risk",
        content: "test",
        workspaceId: "w1",
        evidenceSetId: "e4",
      } as any,
    ]);
    vi.mocked(mockGovernanceRepo.findProcessesByWorkspaceId).mockResolvedValue([
      { id: "p1", status: "completed" } as any,
    ]);

    const result = await useCase.execute({
      workspaceId: "w1",
      profileId: "v1",
    });

    expect(result.status).toBe("ready");
    expect(result.indicators.evidenceCoverage).toBe("high");
    expect(result.indicators.traceability).toBe("full");
    expect(result.indicators.riskHandling).toBe("explicit");
  });
});
