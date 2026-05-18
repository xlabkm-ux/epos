# EPIOS v1.1 — новый поэтапный план разработки с QA, продуктовой демонстрацией и sprint gates

**Document ID:** `EPIOS-V1_1-SPRINT-QA-MASTER-PLAN`  
**Version:** Draft 0.2  
**Date:** 2026-05-13  
**Repository:** `https://github.com/xlabkm-ux/epios`  
**Target:** ADR Review Readiness MVP  
**Delivery horizon:** 16 weeks + 2-week pilot/fix window  
**Primary shell:** `EpiOS for Engineering Decisions`  
**First workflow:** `ADR Review`  
**First artifact type:** `Architecture Decision Record`  
**First profile:** `engineering-adr-review-v0.1`  
**Mode:** product-visible incremental delivery from Sprint 0.

---

## 0. Executive decision

This plan replaces the earlier broad v1.1 platform roadmap.

EPIOS v1.1 is no longer planned as a full Adequacy Platform, Template Library, MCP Apps ecosystem, or enterprise governance suite.

EPIOS v1.1 is planned as a narrow but architecture-honest product slice:

```text
ADR source
→ human source readiness rating
→ async mapping run
→ claims and evidence
→ artifact patch
→ readiness assessment
→ human approval
→ artifact version
→ trace and readiness summary
```

The project must deliver a visible and testable product from the first sprint. The UI is not deferred. It starts as a clickable skeleton and gradually replaces mocked panels with real domain, application, persistence, async, and security behavior.

---

## 1. Non-negotiable delivery rules

### 1.1. Product visibility rule

Every sprint must leave behind a running Demo Shell where the user can see the future product shape.

Each panel must be marked as one of:

```text
mocked
partial
real
blocked
deferred
```

A feature that is implemented in backend code but cannot be seen, invoked, or validated through the demo flow is not considered product-done.

### 1.2. Architecture honesty rule

The MVP is small, but it must not be architecturally fake.

Required from early sprints:

```text
- async application flow for mapping and long-running steps;
- runId/jobId contracts instead of long synchronous responses;
- fake provider latency simulation;
- separate aggregate roots, no Mission god object;
- outbox table plus polling worker;
- SSE or long-polling event sync for UI refresh;
- typed domain errors;
- idempotency keys on write commands;
- correlation-id across API, app, DB, trace;
- dependency boundaries enforced by CI.
```

### 1.3. User-value rule

The main question after every sprint:

```text
Can a real engineering user better understand, review, approve, or reject an ADR because of this increment?
```

If the answer is no, the scope should be cut or reframed.

---

## 2. Product scope for v1.1 MVP

### 2.1. In scope

```text
- one product shell: EpiOS for Engineering Decisions;
- one workflow: ADR Review;
- one artifact type: Architecture Decision Record;
- one static profile: engineering-adr-review-v0.1;
- one deterministic demo fixture: event-sourcing ADR review;
- visible Demo Shell from Sprint 0;
- source intake;
- source readiness rating;
- async mapping run;
- minimal EpistemicNode and EvidenceRef extraction;
- ArtifactPatch proposal;
- ReadinessAssessment with three primary indicators;
- ApprovalRequest and DecisionRecord;
- artifact version creation;
- trace summary;
- markdown ADR output;
- basic roles: viewer, contributor, approver;
- soft delete and redaction MVP;
- QA automation tied to every sprint.
```

### 2.2. Out of scope for v1.1 MVP

```text
- Template Library registry;
- multiple templates;
- configurable profiles;
- AdequacyMatrixApp / Readiness MCP app;
- MCP as critical product path;
- enterprise RBAC / SSO;
- external GitHub/Slack/Notion integrations;
- hash-chain audit;
- event sourcing;
- Kafka / Temporal;
- numeric score as primary UI;
- full generalized Adequacy ontology in the product language;
- multi-reviewer scoring workflow.
```

---

## 3. Sprint map

| Sprint | Duration | Phase | Primary outcome | Visible product increment | QA emphasis |
|---:|---:|---|---|---|---|
| S0 | Week 1 | Governance + Shell Skeleton | Managed repo and visible product frame | ADR Review Workspace skeleton | CI, boundaries, shell smoke |
| S1 | Week 2 | Contracts + Clickable Flow | Frozen MVP contracts and mock ADR flow | Clickable mock end-to-end flow | contract tests, mock e2e |
| S2 | Weeks 3–5 | Core Domain + Persistence | Real mission/source/rating storage | Real mission + source + rating panels | domain, Testcontainers, reload |
| S3 | Weeks 6–8 | Async Mapping + Evidence | Async run, claims/evidence, outbox, events | Mapping progress + claims/evidence panels | async, outbox, SSE/polling |
| S4 | Weeks 9–10 | Patch + Approval | Real patch and approval lifecycle | Patch review + approval panels | policy, idempotency, approval QA |
| S5 | Weeks 11–12 | Readiness + Artifact Version | Readiness v0.1, apply patch, final ADR | Readiness panel + final artifact + trace | readiness, trace, full e2e |
| S6 | Weeks 13–14 | Security + Retention | Pilot-safe roles, retention, redaction | Role-aware UI and deletion states | security, retention, audit |
| S7 | Weeks 15–16 | RC + Pilot Pack | Alpha/RC package for design partners | Demo-ready build and runbook | release QA, usability metrics |
| Pilot | Weeks 17–18 | Field validation | Feedback and fixes | Design partner pilot | product validation |

---

## 4. Standard QA layers

Every sprint uses a subset of these layers. From S5 onward, all layers are required.

| Layer | Purpose | Typical tools / checks |
|---|---|---|
| Domain QA | Validate invariants, state machines, domain errors | Vitest, property-like tests where useful |
| Contract QA | Validate DTOs, API responses, typed errors, event payloads | Zod, contract tests |
| Persistence QA | Validate migrations, repositories, concurrency, append-only records | Testcontainers PostgreSQL |
| Async QA | Validate runId/jobId, fake delay, outbox, worker, event sync | integration tests, fake timers where safe |
| UI QA | Validate visible product workflow | Playwright |
| Product QA | Validate user comprehension and usefulness | manual test script, feedback form |
| Security QA | Validate authorization, approval gates, idempotency, no secrets | security tests, secret scan |
| Observability QA | Validate trace, correlation-id, readiness deltas | trace assertions |
| Release QA | Validate clean setup, seed/demo commands, known limitations | release checklist |

---

## 5. Required test commands

The repository should converge on these commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:domain
pnpm test:contracts
pnpm test:postgres
pnpm test:async
pnpm test:e2e
pnpm test:security
pnpm test:trace
pnpm qa:adr-review
pnpm demo:adr-review
```

`pnpm qa:adr-review` should eventually run:

```text
lint
→ typecheck
→ domain tests
→ contract tests
→ postgres integration tests
→ async/outbox tests
→ security smoke
→ Playwright ADR happy path
→ trace/readiness assertions
```

`pnpm demo:adr-review` should always produce a demonstrable artifact for the current sprint maturity level.

---

## 6. Canonical ADR demo fixture

The same fixture is used across all sprints to avoid moving targets.

```text
Scenario: Review an ADR for adopting event sourcing.
```

Input source:

```text
A draft ADR proposes event sourcing for all mission history.
It claims better auditability and replay, but ignores complexity,
migration cost, query model overhead and team familiarity.
```

Expected product behavior by maturity:

```text
- human rates source readiness;
- system extracts claims;
- system marks the broad “use event sourcing for all mission history” claim as overbroad;
- evidence coverage is partial;
- patch proposes narrower decision: use append-only trace for MVP, defer full event sourcing;
- readiness improves but remains usable_with_limitations / needs_review until approval;
- human approves patch;
- final ADR includes evidence and trace summary.
```

Recommended fixture files:

```text
fixtures/adr-review/event-sourcing-draft.md
fixtures/adr-review/expected-claims.json
fixtures/adr-review/expected-readiness.json
fixtures/adr-review/expected-final-adr.md
fixtures/adr-review/manual-qa-script.md
```

---

## 7. Sprint detail overview

The detailed sprint-level QA gates are split into phase documents:

```text
EPIOS_v1_1_Phase_A_S0_S1_Governance_Contracts_QA.md
EPIOS_v1_1_Phase_B_S2_S3_Domain_Async_QA.md
EPIOS_v1_1_Phase_C_S4_S5_Patch_Readiness_QA.md
EPIOS_v1_1_Phase_D_S6_S7_Hardening_RC_QA.md
```

---

## 8. Master release gates

### Gate 1 — Visible product from day one

```text
[ ] Demo Shell opens.
[ ] ADR Review Workspace is visible.
[ ] Future panels are visible with honest status labels.
[ ] Mock happy path can be clicked by Sprint 1.
```

### Gate 2 — Architecture-honest async foundation

```text
[ ] Long-running mapping returns runId, not final nodes.
[ ] Fake provider simulates 2–3s latency.
[ ] MissionRun status is queryable.
[ ] Outbox worker processes events.
[ ] UI refreshes via SSE / long polling / read-model refetch.
```

### Gate 3 — Governed artifact mutation

```text
[ ] ArtifactPatch requires reason.
[ ] ArtifactPatch references evidence/node/decision context.
[ ] High-risk patch requires approval.
[ ] ApplyPatch cannot bypass backend policy.
[ ] Applied patch creates artifact version.
```

### Gate 4 — Readiness is useful, not false authority

```text
[ ] Readiness uses three primary indicators.
[ ] Numeric score is not primary UI.
[ ] Score cannot auto-approve.
[ ] Hard block sets blocked status regardless of score.
[ ] Explanation is derived from stored inputs.
```

### Gate 5 — Traceability

```text
[ ] Source rating is traceable.
[ ] Mapping run is traceable.
[ ] Patch proposal is traceable.
[ ] Approval is traceable.
[ ] Artifact version creation is traceable.
[ ] Trace summary is understandable without reading raw logs.
```

### Gate 6 — Pilot readiness

```text
[ ] Clean setup works.
[ ] Demo fixture works.
[ ] Full ADR happy path works.
[ ] Known limitations are documented.
[ ] Internal tester completes happy path in < 30 minutes.
[ ] Repeat tester completes in < 15 minutes.
[ ] Usefulness rating target: >= 4/5.
```

---

## 9. Manual QA ritual after every sprint

At the end of every sprint, run a 45–60 minute product review:

```text
1. Open Demo Shell from clean state.
2. Run canonical ADR Review scenario.
3. Mark which panels are mocked / partial / real.
4. Record user confusion points.
5. Record where flow feels too heavy.
6. Record whether readiness is helpful or misleading.
7. Decide: keep, change, cut, or defer each new increment.
8. Update known limitations.
```

Output file per sprint:

```text
docs/04_delivery/sprint-reviews/SX_REVIEW_NOTES.md
```

Template:

```md
# Sprint X Review Notes

## Build / Environment
- Commit:
- Date:
- Tester:

## Product Flow Result
- Completed path: yes/no
- Time to complete:
- Main blocker:

## What felt useful

## What felt confusing

## Readiness / Trust Feedback

## Bugs

## Product decisions
- Keep:
- Change:
- Cut:
- Defer:

## Follow-up issues
```

---

## 10. QA ownership

| Area | Owner role | Required output |
|---|---|---|
| Domain invariants | Domain/backend owner | `test:domain` green |
| API contracts | Backend owner | contract tests green |
| Persistence | Data/backend owner | Testcontainers tests green |
| Async runtime/outbox/events | Runtime/backend owner | `test:async` green |
| Demo shell | Frontend owner | Playwright smoke/e2e green |
| Product QA | Product/architect | sprint review notes |
| Security QA | Security reviewer | security smoke green |
| Release QA | Maintainer | release checklist |

For a small team, the same person may hold multiple roles, but the quality gates remain separate.

---

## 11. Decision log for scope control

Every sprint planning must classify items as:

```text
must
should
defer
cut
```

If sprint scope exceeds available capacity × 0.8, reduce scope before the sprint starts.

No new platform-level feature enters v1.1 unless it strengthens the ADR Review loop.

---

## 12. Final target

The v1.1 MVP succeeds when an engineering user can:

```text
paste a weak ADR
→ rate source trust/readiness
→ see extracted claims and evidence
→ review a proposed patch
→ understand readiness blockers or warnings
→ approve the patch
→ receive a versioned ADR
→ inspect trace and readiness delta
```

The product must be visible, testable, and challengeable from the first sprint.
