import { describe, it, expect, beforeEach } from "vitest";
import {
  ProposeArtifactPatchUseCase,
  ResolveApprovalUseCase,
  ApplyArtifactPatchUseCase,
} from "../src/index.js";
import {
  InMemoryUnitOfWorkProvider,
  InMemoryArtifactRepository,
  InMemoryApprovalRepository,
  InMemoryDecisionRepository,
  InMemoryGovernanceRepository,
  InMemoryGraphRepository,
  InMemoryWorkspaceRepository,
  InMemorySourceRepository,
  InMemoryRatingRepository,
  InMemoryOutboxRepository,
  InMemoryMissionRepository,
  InMemoryMissionRunRepository,
  InMemoryEvidenceRepository,
  InMemoryMappingRepository,
  MockSecurityService,
} from "@epios/infrastructure-runtime";
import { LivingArtifact } from "@epios/domain";

describe("Artifact Patch Flow Integration", () => {
  let uowProvider: InMemoryUnitOfWorkProvider;
  let proposeUseCase: ProposeArtifactPatchUseCase;
  let resolveUseCase: ResolveApprovalUseCase;
  let applyUseCase: ApplyArtifactPatchUseCase;
  let artifactRepo: InMemoryArtifactRepository;
  let security: MockSecurityService;

  beforeEach(async () => {
    security = new MockSecurityService();
    security.authorize = vi.fn().mockResolvedValue(true);
    artifactRepo = new InMemoryArtifactRepository();
    const approvalRepo = new InMemoryApprovalRepository();
    const decisionRepo = new InMemoryDecisionRepository();
    const governanceRepo = new InMemoryGovernanceRepository();
    const graphRepo = new InMemoryGraphRepository();
    const workspaceRepo = new InMemoryWorkspaceRepository();
    const sourceRepo = new InMemorySourceRepository();
    const ratingRepo = new InMemoryRatingRepository();
    const outboxRepo = new InMemoryOutboxRepository();
    const missionRepo = new InMemoryMissionRepository();
    const missionRunRepo = new InMemoryMissionRunRepository();
    const evidenceRepo = new InMemoryEvidenceRepository();
    const mappingRepo = new InMemoryMappingRepository();

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

    proposeUseCase = new ProposeArtifactPatchUseCase(uowProvider, security);
    resolveUseCase = new ResolveApprovalUseCase(uowProvider, security);
    applyUseCase = new ApplyArtifactPatchUseCase(uowProvider, security);

    // Setup an artifact
    await artifactRepo.saveArtifact(
      new LivingArtifact({
        id: "art-1",
        missionId: "miss-1",
        artifactType: "architecture_document",
        title: "Core Arch",
        currentVersion: 1,
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  });

  it("should complete a full high-risk patch flow: propose -> approve -> apply", async () => {
    const author = { actorType: "user" as const, actorId: "user-1" };

    // 1. Propose
    const proposeResult = await proposeUseCase.execute({
      artifactId: "art-1",
      missionId: "miss-1",
      runId: "run-1",
      diff: "updated content",
      reason: "security fix",
      nodeRefs: ["node-1"],
      evidenceRefs: [],
      decisionRefs: [],
      riskClass: "high",
      author,
      idempotencyKey: "key-1",
    });

    expect(proposeResult.requiresApproval).toBe(true);
    expect(proposeResult.approvalId).toBeDefined();

    // 2. Resolve (Approve)
    const resolveResult = await resolveUseCase.execute({
      approvalId: proposeResult.approvalId!,
      decision: "approved",
      rationale: "looks good",
      actor: { actorType: "user", actorId: "reviewer-1" },
    });

    expect(resolveResult.status).toBe("approved");

    // 3. Apply
    const applyResult = await applyUseCase.execute({
      patchId: proposeResult.patchId,
      actor: { actorType: "user", actorId: "admin-1" },
    });

    expect(applyResult.versionNumber).toBe(1); // 0 -> 1 if first version, or baseVersion + 1

    const patch = await artifactRepo.findPatchById(proposeResult.patchId);
    expect(patch?.status).toBe("applied");

    const latest = await artifactRepo.getLatestVersion("art-1");
    expect(latest?.content).toBe("updated content");
  });

  it("should auto-apply a low-risk patch", async () => {
    const author = { actorType: "user" as const, actorId: "user-1" };

    // 1. Propose
    const proposeResult = await proposeUseCase.execute({
      artifactId: "art-1",
      missionId: "miss-1",
      runId: "run-1",
      diff: "typo fix",
      reason: "typo",
      nodeRefs: ["node-1"],
      evidenceRefs: [],
      decisionRefs: [],
      riskClass: "low",
      author,
      idempotencyKey: "key-2",
    });

    expect(proposeResult.requiresApproval).toBe(false);
    expect(proposeResult.approvalId).toBeUndefined();

    // 2. Apply (Auto-apply should work)
    const applyResult = await applyUseCase.execute({
      patchId: proposeResult.patchId,
      actor: { actorType: "user", actorId: "admin-1" },
    });

    expect(applyResult.versionNumber).toBe(1);

    const patch = await artifactRepo.findPatchById(proposeResult.patchId);
    expect(patch?.status).toBe("applied");
  });

  it("should fail to apply a high-risk patch without approval", async () => {
    const author = { actorType: "user" as const, actorId: "user-1" };

    const proposeResult = await proposeUseCase.execute({
      artifactId: "art-1",
      missionId: "miss-1",
      runId: "run-1",
      diff: "risky stuff",
      reason: "urgent",
      nodeRefs: ["node-1"],
      evidenceRefs: [],
      decisionRefs: [],
      riskClass: "critical",
      author,
      idempotencyKey: "key-3",
    });

    await expect(
      applyUseCase.execute({
        patchId: proposeResult.patchId,
        actor: { actorType: "user", actorId: "admin-1" },
      }),
    ).rejects.toThrow("PATCH_NOT_READY");
  });
});
