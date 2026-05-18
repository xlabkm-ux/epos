import { describe, it, expect } from "vitest";
import { ArtifactPatch, PatchPolicyService } from "../src/index.js";

describe("PatchPolicyService", () => {
  const policy = new PatchPolicyService();

  const createPatch = (riskClass: string, nodeRefs: string[] = ["node-1"]) =>
    new ArtifactPatch({
      id: "patch-1",
      artifactId: "art-1",
      missionId: "miss-1",
      baseVersion: 1,
      diff: "content",
      reason: "fix",
      nodeRefs,
      evidenceRefs: [],
      decisionRefs: [],
      riskClass,
      author: { actorType: "user", actorId: "user-1" },
      status: "proposed",
      createdAt: new Date(),
    });

  it("should require approval for critical risk", () => {
    const patch = createPatch("critical");
    const verdict = policy.evaluate(patch);
    expect(verdict.requiresApproval).toBe(true);
    expect(verdict.autoApplyAllowed).toBe(false);
  });

  it("should require approval for high risk", () => {
    const patch = createPatch("high");
    const verdict = policy.evaluate(patch);
    expect(verdict.requiresApproval).toBe(true);
    expect(verdict.autoApplyAllowed).toBe(false);
  });

  it("should not require approval but disallow auto-apply for medium risk", () => {
    const patch = createPatch("medium");
    const verdict = policy.evaluate(patch);
    expect(verdict.requiresApproval).toBe(false);
    expect(verdict.autoApplyAllowed).toBe(false);
  });

  it("should allow auto-apply for low risk", () => {
    const patch = createPatch("low");
    const verdict = policy.evaluate(patch);
    expect(verdict.requiresApproval).toBe(false);
    expect(verdict.autoApplyAllowed).toBe(true);
  });

  it("should block patches without any context references regardless of risk", () => {
    const patch = createPatch("low", []); // No nodeRefs
    const verdict = policy.evaluate(patch);
    expect(verdict.requiresApproval).toBe(true);
    expect(verdict.autoApplyAllowed).toBe(false);
    expect(verdict.reason).toContain("must reference at least one node");
  });
});
