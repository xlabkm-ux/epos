import { ArtifactPatch } from "./artifact.js";

/**
 * Verdict produced by PatchPolicyService after evaluating a patch.
 */
export interface PolicyVerdict {
  /** Whether an explicit human approval is required before applying */
  requiresApproval: boolean;
  /** Human-readable reason explaining the verdict */
  reason: string;
  /** Whether the patch can be auto-applied without any manual step */
  autoApplyAllowed: boolean;
}

/**
 * Domain service that evaluates patch risk and determines
 * the governance requirements for applying an ArtifactPatch.
 *
 * Rules:
 * - critical / high risk → requires approval, no auto-apply
 * - medium risk → no mandatory approval, but no auto-apply
 * - low risk → no approval needed, auto-apply allowed
 * - Patches without any context references are always blocked
 */
export class PatchPolicyService {
  evaluate(patch: ArtifactPatch): PolicyVerdict {
    // Rule 1: patches must reference at least one context artifact
    if (!patch.hasContextRefs) {
      return {
        requiresApproval: true,
        reason: "Patch must reference at least one node, evidence, or decision",
        autoApplyAllowed: false,
      };
    }

    // Rule 2: risk-based policy
    switch (patch.riskClass) {
      case "critical":
        return {
          requiresApproval: true,
          reason: "Critical-risk patch requires explicit human approval",
          autoApplyAllowed: false,
        };
      case "high":
        return {
          requiresApproval: true,
          reason: "High-risk patch requires explicit human approval",
          autoApplyAllowed: false,
        };
      case "medium":
        return {
          requiresApproval: false,
          reason:
            "Medium-risk patch — manual apply required but no approval gate",
          autoApplyAllowed: false,
        };
      case "low":
        return {
          requiresApproval: false,
          reason: "Low-risk patch — auto-apply permitted",
          autoApplyAllowed: true,
        };
      default:
        return {
          requiresApproval: true,
          reason: "Unknown risk class — defaulting to approval required",
          autoApplyAllowed: false,
        };
    }
  }
}
