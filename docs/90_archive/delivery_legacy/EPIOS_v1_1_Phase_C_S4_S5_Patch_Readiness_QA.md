Owner: @architect
Status: accepted

# EPIOS v1.1 — Phase C QA Plan: S4–S5 Artifact Patch, Approval, Readiness, Trace

**Document ID:** `EPIOS-V1_1-PHASE-C-S4-S5-QA`  
**Version:** Draft 0.2  
**Date:** 2026-05-13  
**Phase duration:** Weeks 9–12  
**Purpose:** Complete the governed ADR artifact loop: patch, readiness, approval, apply, version, trace.

---

## Phase C thesis

This phase creates the core product value.

The user should no longer just inspect source and claims. The user should receive a governed artifact change:

```text
reasoned patch
→ evidence context
→ readiness signal
→ human approval
→ versioned ADR
→ trace summary
```

---

# Sprint S4 — ArtifactPatch + Approval Request

**Duration:** Weeks 9–10  
**Primary goal:** Make artifact mutation reviewable and approval-gated.

## S4 product increment

Real panels:

```text
Artifact Patch               [real]
Approval Panel               [partial real]
Trace Timeline               [real for patch/approval creation]
```

User can see a proposed patch and why it exists.

## S4 domain/application scope

```text
- LivingArtifact minimal model;
- ArtifactPatch model;
- ArtifactPatchPolicy;
- ApprovalRequest model;
- DecisionRecord model skeleton;
- ProposeArtifactPatch use case;
- CreateApprovalRequest use case;
- idempotency for patch proposal;
- trace event for patch proposal and approval creation.
```

## S4 QA plan

### Domain QA

```text
[ ] ArtifactPatch without reason is rejected.
[ ] ArtifactPatch without node/evidence/decision refs is rejected.
[ ] Patch baseVersion conflict is rejected.
[ ] High-risk patch requires ApprovalRequest.
[ ] Rejected patch cannot be applied.
[ ] ApprovalRequest starts as pending.
[ ] ApprovalRequest terminal status cannot change.
```

### Application QA

```text
[ ] ProposePatch writes patch + trace in one transaction.
[ ] ProposePatch creates approval when policy requires it.
[ ] ProposePatch same idempotency key + same request returns same response.
[ ] ProposePatch same idempotency key + different request returns conflict.
[ ] CreateApprovalRequest includes preview and risk class.
```

### Contract QA

```text
[ ] ProposePatch API schema.
[ ] ApprovalRequest read model schema.
[ ] Patch diff/read model schema.
[ ] Idempotency conflict error schema.
```

### UI/E2E QA

```text
[ ] Patch diff visible.
[ ] Patch reason visible.
[ ] Supporting claims/evidence visible.
[ ] Approval panel appears for required approval.
[ ] Apply button disabled while approval pending.
[ ] Rejected/blocked UI state can be displayed with fixture.
```

### Manual product QA

```text
[ ] Does user understand why patch was proposed?
[ ] Is patch diff readable?
[ ] Is supporting evidence one click away?
[ ] Does approval feel meaningful rather than rubber-stamp?
[ ] Does user understand risk class?
```

## S4 exit gate

```text
[ ] The product has a real reviewable ArtifactPatch.
[ ] Approval gating exists before apply.
[ ] Patch and approval creation are traceable.
```

---

# Sprint S5 — Readiness v0.1 + Apply Patch + Artifact Version + Trace Summary

**Duration:** Weeks 11–12  
**Primary goal:** Complete the first full ADR Review loop.

## S5 product increment

Real panels:

```text
Readiness Panel              [real]
Approval Panel               [real]
Trace Timeline               [real]
Final ADR Artifact           [real]
```

User can complete:

```text
source → rating → mapping → patch → readiness → approval → apply → final ADR → trace
```

## S5 readiness scope

Use three primary indicators:

```text
Evidence Coverage: high / medium / low
Traceability: complete / partial / missing
Risk Handling: explicit / weak / missing
```

Readiness status:

```text
ready
needs_review
blocked
```

Allowed internal detail:

```text
numericScore?: number
```

But score is not primary UI and cannot approve.

## S5 QA plan

### Readiness domain QA

```text
[ ] ReadinessAssessment references profileId.
[ ] ReadinessAssessment references methodVersion.
[ ] Hard block sets status=blocked regardless of numeric score.
[ ] Key source unreliable blocks final approval/apply.
[ ] Key source partial prevents ready/high state.
[ ] Score cannot auto-approve.
[ ] Explanation is derived from stored calculation inputs.
[ ] Assessment cannot trust score submitted from UI.
```

### Approval/apply domain QA

```text
[ ] Approval cannot resolve twice with different result.
[ ] ResolveApproval creates DecisionRecord.
[ ] ApplyPatch requires approved approval when required.
[ ] ApplyPatch creates new ArtifactVersion.
[ ] Applied patch cannot be applied again.
[ ] Meaningful artifact mutation creates TraceEvent.
```

### Integration QA

```text
[ ] ApplyPatch transaction writes artifact version + trace + outbox event.
[ ] ReadinessAssessment is stored or recomputable from stored inputs.
[ ] Read model updates after artifact.version_created event.
[ ] Trace summary links source → evidence → patch → approval → artifact version.
```

### UI/E2E QA

```text
[ ] Full ADR Review happy path.
[ ] Hard block path: key source unreliable.
[ ] Approval rejection path.
[ ] Reload after every major step preserves state.
[ ] Readiness panel shows qualitative indicators first.
[ ] Numeric score hidden, collapsed, or marked experimental.
[ ] Final ADR markdown visible/downloadable/copyable.
[ ] Trace summary visible and understandable.
```

### Manual product QA

```text
[ ] User understands why ADR is ready / needs review / blocked.
[ ] User can find weak or unreliable source.
[ ] User can explain why patch improved ADR.
[ ] User can identify who approved and why.
[ ] User does not treat readiness as objective truth.
```

### Product metrics to capture

```text
- time_to_complete_adr_review;
- time_to_first_patch;
- time_to_approval;
- user_help_requests_count;
- usefulness_rating_1_to_5;
- number_of_confusing_terms_reported.
```

## S5 exit gate

```text
[ ] First real end-to-end ADR Review loop works.
[ ] The final artifact is versioned.
[ ] Readiness and trace are visible.
[ ] Full happy path is covered by Playwright.
```

