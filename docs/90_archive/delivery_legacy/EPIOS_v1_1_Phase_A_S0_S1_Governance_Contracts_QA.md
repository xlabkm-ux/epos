Owner: @architect
Status: accepted

# EPIOS v1.1 — Phase A QA Plan: S0–S1 Governance, Contracts, Visible Product Skeleton

**Document ID:** `EPIOS-V1_1-PHASE-A-S0-S1-QA`  
**Version:** Draft 0.2  
**Date:** 2026-05-13  
**Phase duration:** Weeks 1–2  
**Purpose:** Create managed delivery foundation and a visible ADR Review product skeleton.

---

## Phase A thesis

Do not start with invisible architecture. Start with a visible shell and executable contracts.

By the end of Phase A, EPIOS must have:

```text
- governed repository workflow;
- visible ADR Review Workspace;
- clickable mock end-to-end product flow;
- frozen v1.1 MVP scope;
- first API/domain/readiness contracts;
- test skeletons for every contract;
- first Playwright smoke tests.
```

---

# Sprint S0 — Governance Lock + Visible Shell Skeleton

**Duration:** Week 1  
**Primary goal:** Remove delivery blockers and expose the future product frame immediately.

## S0 product increment

The Demo Shell opens and shows:

```text
ADR Review Workspace
├─ Source Intake                [mocked]
├─ Source Readiness Rating      [mocked]
├─ Claims / Evidence            [mocked]
├─ Artifact Patch               [mocked]
├─ Readiness Panel              [mocked]
├─ Approval Panel               [mocked]
└─ Trace Timeline               [mocked]
```

The UI may be ugly. It must be understandable.

## S0 engineering scope

```text
- decide master/main branch standard;
- add/confirm CI baseline;
- add/confirm dependency boundary check;
- create GitHub labels and milestones;
- create first S0/S1 issues;
- clean generated artifacts from source tree where needed;
- create DOCUMENT_REGISTER.md;
- create OPEN_DECISIONS_REGISTER.md;
- add Demo Shell route for ADR Review Workspace;
- add mock panel status labels;
- add canonical ADR fixture file.
```

## S0 QA plan

### Automated QA

```text
[ ] pnpm install works.
[ ] pnpm lint works or has documented placeholder.
[ ] pnpm typecheck works.
[ ] pnpm test works.
[ ] dependency-cruiser / boundary check runs in CI.
[ ] Playwright smoke: app loads.
[ ] Playwright smoke: ADR Review route loads.
[ ] Playwright smoke: all seven product panels are visible.
[ ] Secret scan or documented manual secret check passes.
```

### Manual product QA

Checklist:

```text
[ ] Can I understand what product is being built within 30 seconds?
[ ] Do panel names make sense?
[ ] Is the ADR Review flow visible from left to right or top to bottom?
[ ] Are mocked/partial/real states honest?
[ ] Does the UI avoid “Adequacy as truth” language?
[ ] Does the shell start from user pain: Review an ADR?
```

### Architecture QA

```text
[ ] Domain package does not import infrastructure.
[ ] Demo shell does not import repositories.
[ ] No provider SDK in application services.
[ ] No generated artifacts are treated as source of truth.
```

## S0 exit gate

```text
[ ] Repository is ready for managed delivery.
[ ] Demo Shell shows the future ADR Review product.
[ ] First sprint review can happen in the UI, not only in markdown.
```

---

# Sprint S1 — MVP Spec + Contracts + Clickable Mock ADR Flow

**Duration:** Week 2  
**Primary goal:** Freeze a narrow ADR Review MVP and create executable contracts.

## S1 product increment

A user can click through a full mocked flow:

```text
Paste ADR source
→ see mock source rating
→ see mock claims/evidence
→ see mock patch
→ see mock readiness indicators
→ approve mock patch
→ see mock final ADR
→ see mock trace timeline
```

No backend completeness is required yet. The user journey must be reviewable.

## S1 engineering scope

```text
- create docs/03_specs/V1_1_INTERNAL_MVP_SPEC.md;
- define ADR Review happy path;
- define SourceReadinessRating contract;
- define ReadinessAssessment contract;
- define ArtifactPatch contract;
- define ApprovalRequest/DecisionRecord contract;
- define TraceEvent contract for MVP events;
- define ErrorResponse contract;
- define async API shape for mapping: returns runId;
- add test skeletons for each contract;
- add mock state machine in UI for click-through flow.
```

## S1 QA plan

### Contract QA

```text
[ ] Mission DTO contract test.
[ ] Source DTO contract test.
[ ] SourceReadinessRating DTO contract test.
[ ] ArtifactPatch DTO contract test.
[ ] ReadinessAssessment DTO contract test.
[ ] ApprovalRequest DTO contract test.
[ ] TraceEvent DTO contract test.
[ ] ErrorResponse contract test.
[ ] Mapping start response returns runId, not nodes.
```

### UI QA

```text
[ ] Playwright: user can paste mock ADR.
[ ] Playwright: user can move from source to rating.
[ ] Playwright: user can inspect mock claims/evidence.
[ ] Playwright: user can inspect mock patch.
[ ] Playwright: readiness panel shows qualitative indicators.
[ ] Playwright: approval action changes mock flow state.
[ ] Playwright: trace timeline appears.
[ ] Empty state for missing source is clear.
[ ] Error state for invalid source input is clear.
```

### Manual UX QA

```text
[ ] User understands “Readiness” without explanation.
[ ] User understands score is not objective truth.
[ ] User understands the difference between source rating and artifact readiness.
[ ] User understands why approval exists.
[ ] User can describe the workflow in their own words.
```

### Product discovery QA

Run 3–5 short interviews using the clickable mock.

Questions:

```text
- Would this help you review an ADR?
- Which panel feels most useful?
- Which panel feels unnecessary?
- What evidence do you expect to see before approving a patch?
- Is “ready / needs review / blocked” clear?
```

## S1 exit gate

```text
[ ] v1.1 MVP scope is frozen.
[ ] Clickable mock flow is demonstrable.
[ ] Every contract has at least one test skeleton.
[ ] Discovery feedback is captured and reflected in backlog.
```

