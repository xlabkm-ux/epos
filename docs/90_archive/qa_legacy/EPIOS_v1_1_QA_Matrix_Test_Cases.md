Owner: @architect
Status: accepted

# EPIOS v1.1 — QA Matrix and Test Case Catalog

**Document ID:** `EPIOS-V1_1-QA-MATRIX-TEST-CASES`  
**Version:** Draft 0.2  
**Date:** 2026-05-13  
**Purpose:** Consolidated test matrix for the ADR Review Readiness MVP.

---

## 1. Test suite map

| Suite | Command | Starts in | Required by |
|---|---|---:|---:|
| Domain invariants | `pnpm test:domain` | S1/S2 | S2 onward |
| Contract schemas | `pnpm test:contracts` | S1 | S1 onward |
| PostgreSQL integration | `pnpm test:postgres` | S2 | S2 onward |
| Async runtime/outbox | `pnpm test:async` | S3 | S3 onward |
| UI smoke/e2e | `pnpm test:e2e` | S0 | S0 onward |
| Security smoke | `pnpm test:security` | S6 | S6 onward |
| Trace/readiness assertions | `pnpm test:trace` | S3/S5 | S5 onward |
| Full ADR QA | `pnpm qa:adr-review` | S5 | S7 release |

---

## 2. Canonical E2E scenarios

### 2.1. Happy path

```text
Create ADR Review Mission
→ paste source
→ rate source as partial/key
→ start async mapping
→ inspect claims/evidence
→ propose patch
→ readiness = needs_review or usable_with_limitations
→ approve patch
→ apply patch
→ final ADR generated
→ trace summary visible
```

Expected:

```text
- no long synchronous request;
- patch has reason and refs;
- approval is required and resolved;
- artifact version is created;
- readiness summary is visible;
- trace links source → evidence → patch → approval → artifact.
```

### 2.2. Hard block path

```text
Key source = unreliable
→ mapping/patch may run
→ readiness = blocked
→ apply disabled
→ explanation includes KEY_SOURCE_UNRELIABLE
```

### 2.3. Approval rejection path

```text
Patch proposed
→ approver rejects
→ patch cannot be applied
→ DecisionRecord created
→ trace shows rejection
```

### 2.4. Async failure path

```text
Start mapping
→ fake provider fails
→ MissionRun failed
→ typed error shown
→ retry available if retryable
→ trace contains failure
```

### 2.5. Idempotency path

```text
Submit same approval twice with same key
→ same result returned

Submit same key with different resolution
→ IDEMPOTENCY_CONFLICT
```

### 2.6. Role denied path

```text
viewer attempts to propose patch
→ forbidden
→ no domain mutation
→ audit/trace security event written where appropriate
```

---

## 3. Domain invariant catalog

| Area | Invariant | Priority | Starts |
|---|---|---:|---:|
| Mission | Mission requires non-empty goal before active review | P0 | S2 |
| MissionRun | Terminal run cannot transition | P0 | S3 |
| MissionRun | Invalid transition rejected | P0 | S3 |
| SourceRating | System actor cannot create human rating | P0 | S2 |
| SourceRating | Rating is append-only | P0 | S2 |
| SourceRating | Rating requires rationale | P1 | S2 |
| Node/Evidence | EvidenceRef references existing Source | P0 | S3 |
| Node/Evidence | Unsupported strong system claim downgraded/rejected | P0 | S3 |
| Patch | Patch without reason rejected | P0 | S4 |
| Patch | Patch without refs rejected | P0 | S4 |
| Patch | Base version conflict rejected | P0 | S4 |
| Approval | High-risk patch requires approval | P0 | S4 |
| Approval | Approval cannot resolve twice inconsistently | P0 | S5 |
| Apply | Apply requires approved approval when required | P0 | S5 |
| Artifact | Applied patch creates artifact version | P0 | S5 |
| Readiness | Hard block sets blocked | P0 | S5 |
| Readiness | Score cannot auto-approve | P0 | S5 |
| Trace | Meaningful mutation creates TraceEvent | P0 | S5 |

---

## 4. Contract catalog

| Contract | Required fields | Starts |
|---|---|---:|
| ErrorResponse | code, message, retryable, correlationId | S1 |
| StartMappingRunResponse | runId, status | S1/S3 |
| SourceReadinessRatingDTO | rating, rationale, actor, criticality | S1/S2 |
| ArtifactPatchDTO | patchId, reason, refs, riskClass, status | S1/S4 |
| ApprovalRequestDTO | approvalId, subjectRef, riskClass, status, preview | S1/S4 |
| ReadinessAssessmentDTO | indicators, status, hardBlocks, warnings, profileRef | S1/S5 |
| TraceEventDTO | eventType, missionId, correlationId, actor, createdAt | S1/S3 |

---

## 5. Product QA questions

Ask these after every sprint review:

```text
1. Does the current product increment make ADR review clearer?
2. Does any panel feel like architecture theater?
3. Is readiness helpful or misleading?
4. Is evidence visible enough to support approval?
5. Does the approval step feel meaningful?
6. What would a real tech lead find unnecessary?
7. What must be cut before pilot?
```

---

## 6. Release blocker definitions

### P0 blockers

```text
- Demo Shell does not start.
- Full happy path broken after S5.
- Mapping is synchronous and blocks UI.
- ApplyPatch can bypass approval.
- Key unreliable source can produce approved artifact.
- Readiness shown as objective truth without explanation.
- Trace missing for artifact mutation.
- Domain imports infrastructure.
- Repository tests depend on dirty local DB state.
- Secrets or auth headers appear in logs/trace.
```

### P1 blockers

```text
- Readiness explanation confusing.
- Patch diff hard to read.
- Error state unclear.
- Outbox failures invisible.
- Known limitations missing.
- Manual QA notes not recorded.
```

---

## 7. Sprint review scoring rubric

After each sprint, score 1–5:

| Dimension | Question |
|---|---|
| Product clarity | Can user understand the flow? |
| Trust clarity | Can user see why the system suggests a patch? |
| Evidence clarity | Can user find supporting/weak evidence? |
| Control clarity | Can user see what requires approval? |
| Technical reliability | Does the flow survive reload and failures? |
| Architecture health | Were boundaries preserved? |

A sprint with any score below 3 requires a corrective issue before adding new surface area.

