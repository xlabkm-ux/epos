Owner: @architect
Status: accepted

# EPIOS v1.1 — Phase B QA Plan: S2–S3 Core Domain, Persistence, Async Mapping

**Document ID:** `EPIOS-V1_1-PHASE-B-S2-S3-QA`  
**Version:** Draft 0.2  
**Date:** 2026-05-13  
**Phase duration:** Weeks 3–8  
**Purpose:** Replace mock flow with real domain, persistence, async execution, outbox, and event-synchronized UI.

---

## Phase B thesis

This phase turns the clickable prototype into an architecture-honest proof loop.

The product remains narrow, but the backend must not be fake:

```text
- separate aggregate roots;
- real PostgreSQL persistence;
- append-only source ratings;
- MissionRun state machine;
- async mapping run;
- fake provider with latency;
- outbox worker;
- SSE or long-polling event sync;
- visible UI refresh from backend events.
```

---

# Sprint S2 — Core Domain + Persistence

**Duration:** Weeks 3–5  
**Primary goal:** Make mission, source, rating, and trace real under the existing UI.

## S2 product increment

Real panels:

```text
Source Intake                [real]
Source Readiness Rating      [real]
Trace Timeline               [partial real]
```

Still mocked/partial:

```text
Claims / Evidence            [mocked]
Artifact Patch               [mocked]
Readiness Panel              [mocked]
Approval Panel               [mocked]
```

User can create a real mission, paste source material, rate the source, reload the page, and see data persisted.

## S2 domain scope

```text
- Mission aggregate root: metadata/status only;
- Source aggregate/entity under EvidenceSet boundary;
- SourceReadinessRating append-only record;
- ActorRef with actorType, actorId, actorRole;
- TraceEvent MVP;
- typed domain errors;
- no Mission.nodes[];
- no deep fetch repositories.
```

## S2 persistence scope

```text
- missions table;
- sources table;
- source_readiness_ratings table;
- trace_events table;
- idempotency_keys table if needed for writes;
- version columns where mutable;
- add-only migrations;
- repository integration tests with Testcontainers.
```

## S2 QA plan

### Domain QA

```text
[ ] Mission requires non-empty goal before active review.
[ ] Mission status transition invalid cases are rejected.
[ ] Source must belong to a Mission.
[ ] SourceReadinessRating cannot be created by system actor.
[ ] SourceReadinessRating requires rationale.
[ ] SourceReadinessRating is append-only; correction creates new record.
[ ] ActorRef is required for source rating.
[ ] Domain errors are typed, no generic Error("bad state").
```

### Persistence QA

```text
[ ] Testcontainers PostgreSQL starts for tests.
[ ] Clean migrations apply.
[ ] Migration policy is add-only.
[ ] MissionRepository create/find works.
[ ] SourceRepository create/find works.
[ ] RatingRepository append works.
[ ] RatingRepository does not update previous rating.
[ ] TraceEventRepository writes events.
[ ] Repository methods do not deep fetch unrelated aggregates.
[ ] Optimistic concurrency is tested where version exists.
```

### Contract QA

```text
[ ] CreateMission request/response schema.
[ ] AddSource request/response schema.
[ ] RateSourceReadiness request/response schema.
[ ] ErrorResponse schema for validation errors.
[ ] Correlation-id returned or propagated.
```

### UI QA

```text
[ ] User can create real mission from UI.
[ ] User can paste source.
[ ] User can rate source reliable/partial/unreliable.
[ ] User must enter rationale for rating.
[ ] Reload preserves mission/source/rating.
[ ] UI labels rating data as real, not mock.
[ ] Mock panels remain visible but clearly marked.
```

### Manual product QA

```text
[ ] Are reliable/partial/unreliable enough?
[ ] Is source criticality needed now or later?
[ ] Does rationale feel like useful audit or annoying friction?
[ ] Does the user understand that source rating constrains later readiness?
```

## S2 exit gate

```text
[ ] First real product loop works: mission + source + human rating.
[ ] Data survives reload.
[ ] Domain and persistence tests are green.
[ ] No aggregate root deep-fetch pattern introduced.
```

---

# Sprint S3 — Async Mapping Run + Claims/Evidence + Outbox/Event Sync

**Duration:** Weeks 6–8  
**Primary goal:** Implement architecture-honest async mapping and event-synchronized UI.

## S3 product increment

Real panels:

```text
Claims / Evidence            [partial real]
Trace Timeline               [real for mapping events]
```

New visible behavior:

```text
Start Mapping
→ UI shows queued/running
→ fake provider waits 2–3 seconds
→ UI updates after event/refetch
→ claims/evidence appear
```

## S3 domain/application scope

```text
- MissionRun aggregate with explicit state machine;
- StartMappingRun use case returns runId;
- fake provider with configurable delay;
- EpistemicNode minimal model;
- EvidenceRef minimal model;
- NodeMap/EpistemicGraph separate boundary;
- typed failures and retryable flag;
- no synchronous long-running HTTP mapping result.
```

## S3 infrastructure scope

```text
- outbox_events table;
- basic polling worker;
- event types for mapping started/completed/failed;
- SSE or long-polling endpoint;
- read-model refetch trigger in UI;
- idempotent event processing.
```

## S3 QA plan

### Async QA

```text
[ ] POST mapping-runs returns 202 + runId.
[ ] Response does not include final nodes.
[ ] Fake provider sleeps 2–3 seconds.
[ ] MissionRun transitions queued → running → completed.
[ ] Failed mapping transitions running → failed.
[ ] Retryable failures are marked retryable.
[ ] UI does not block on a long HTTP request.
[ ] UI gets event through SSE/long polling or refetch trigger.
```

### Outbox QA

```text
[ ] Domain mutation and outbox event are committed in one transaction.
[ ] Polling worker reads pending events.
[ ] Worker marks processed events.
[ ] Worker records attempts and last_error on failure.
[ ] Duplicate processing is safe.
[ ] outbox_failed_count can be inspected in logs/debug output.
```

### Domain QA

```text
[ ] MissionRun terminal states cannot transition again.
[ ] Invalid transition is rejected.
[ ] EpistemicNode belongs to mission.
[ ] EvidenceRef references existing Source.
[ ] Unsupported strong system claim is downgraded or rejected.
[ ] NodeMap is fetched separately from Mission.
```

### Persistence QA

```text
[ ] mission_runs repository tests.
[ ] epistemic_nodes repository tests.
[ ] evidence_refs repository tests.
[ ] outbox repository tests.
[ ] indexes support mission-scoped reads.
```

### UI/E2E QA

```text
[ ] Playwright: start mapping and see running state.
[ ] Playwright: claims appear after event/refetch.
[ ] Playwright: failure state is visible when fake provider fails.
[ ] Playwright: reload after mapping shows persisted nodes/evidence.
```

### Manual product QA

```text
[ ] Is mapping progress understandable?
[ ] Does the latency feel realistic?
[ ] Are extracted claims useful enough for ADR review?
[ ] Can user identify overbroad or unsupported claim?
[ ] Is the evidence view too noisy or too thin?
```

## S3 exit gate

```text
[ ] Async mapping works end-to-end.
[ ] Outbox worker exists and processes events.
[ ] UI updates from backend state, not command response.
[ ] Claims/evidence panel is partially real and testable.
```

