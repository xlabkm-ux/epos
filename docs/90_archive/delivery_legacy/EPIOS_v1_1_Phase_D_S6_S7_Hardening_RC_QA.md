Owner: @architect
Status: accepted

# EPIOS v1.1 — Phase D QA Plan: S6–S7 Hardening, Security, Retention, RC, Pilot

**Document ID:** `EPIOS-V1_1-PHASE-D-S6-S7-QA`  
**Version:** Draft 0.2  
**Date:** 2026-05-13  
**Phase duration:** Weeks 13–16 + optional 2-week pilot/fix window  
**Purpose:** Make the ADR Review MVP safe, repeatable, demoable, and pilot-ready.

---

## Phase D thesis

This phase does not add platform breadth. It hardens the narrow ADR Review product loop.

No new product surface enters Phase D unless it directly improves pilot reliability, safety, or user comprehension.

---

# Sprint S6 — Roles, Retention, Redaction, Security Baseline

**Duration:** Weeks 13–14  
**Primary goal:** Make MVP safe for internal and design-partner testing.

## S6 product increment

Real behavior:

```text
viewer / contributor / approver roles
soft delete states
redaction warnings
role-aware action availability
audit context in trace
```

## S6 scope

```text
- dev identity model with actorRole;
- viewer, contributor, approver permissions;
- soft delete for Mission and Source;
- append-only rating correction;
- redaction policy MVP;
- no secrets in trace payloads;
- security smoke tests;
- known limitations visible in UI/docs.
```

## S6 QA plan

### Security QA

```text
[ ] viewer cannot create patch.
[ ] viewer cannot rate source.
[ ] contributor can create mission/source/rating/patch.
[ ] contributor cannot approve high-risk patch.
[ ] approver can resolve approval.
[ ] direct apply without approval is rejected.
[ ] missing idempotency key rejected for write command.
[ ] UI cannot submit final readiness score as authority.
[ ] trace does not contain secret-like strings.
[ ] correlation-id exists for write actions.
```

### Retention QA

```text
[ ] Soft-deleted mission hidden from default read model.
[ ] Soft-deleted source hidden from active review but preserved for audit where required.
[ ] Rating correction creates new rating, old rating remains immutable/superseded.
[ ] Trace keeps deletion/audit event.
[ ] Retention behavior documented.
```

### Redaction QA

```text
[ ] Provider keys never appear in logs.
[ ] Authorization headers never appear in trace.
[ ] Raw prompt/source storage is documented and controlled.
[ ] Readiness explanations do not leak hidden/system instructions.
```

### UI/E2E QA

```text
[ ] Role switcher or dev actor selector works.
[ ] Disabled actions explain required role.
[ ] Soft delete state is visible.
[ ] Redaction/known limitation notice is visible.
[ ] Happy path still works for contributor + approver.
```

### Manual product QA

```text
[ ] Roles are understandable.
[ ] Security restrictions do not make the happy path confusing.
[ ] User understands what deletion means.
[ ] User understands what remains in audit trail.
```

## S6 exit gate

```text
[ ] MVP can be tested without obvious role/security/retention holes.
[ ] The happy path still works after security restrictions.
[ ] Known limitations are honest and visible.
```

---

# Sprint S7 — RC Pack + Pilot Readiness

**Duration:** Weeks 15–16  
**Primary goal:** Prepare repeatable release candidate for pilot users.

## S7 product increment

```text
Alpha/RC build
seeded ADR demo
runbook
known limitations
feedback form
release notes
pilot checklist
```

## S7 scope

```text
- clean setup path;
- seed data;
- demo script hardening;
- final Playwright happy path;
- failure-path coverage;
- release notes;
- DEMO_RUNBOOK_ADR_REVIEW.md;
- KNOWN_LIMITATIONS_V1_1_ALPHA.md;
- PILOT_FEEDBACK_FORM.md;
- sprint review summary.
```

## S7 QA plan

### Release QA

```text
[ ] Fresh clone setup works.
[ ] pnpm install works.
[ ] pnpm db:reset works.
[ ] pnpm demo:adr-review works.
[ ] pnpm qa:adr-review green.
[ ] Playwright full happy path green.
[ ] Known limitations file exists.
[ ] Release notes exist.
[ ] Demo runbook exists.
[ ] No generated artifacts accidentally committed.
```

### E2E scenarios

Required:

```text
[ ] Happy path.
[ ] Hard block path: key source unreliable.
[ ] Approval rejection path.
[ ] Async mapping failure path.
[ ] Idempotency conflict path.
[ ] Role-denied path.
[ ] Reload/resume path.
```

### Observability QA

```text
[ ] Every write action has correlation-id.
[ ] Every meaningful artifact mutation has TraceEvent.
[ ] ReadinessDelta or readiness update is linked to TraceEvent.
[ ] Outbox pending count is inspectable.
[ ] Outbox failed event is inspectable.
```

### Pilot UX QA

Run with at least 2 internal testers before design partners.

```text
[ ] Tester completes ADR Review in < 30 minutes first run.
[ ] Repeat tester completes in < 15 minutes.
[ ] Tester usefulness rating >= 4/5.
[ ] Tester can explain why patch was proposed.
[ ] Tester can identify weak/unreliable source.
[ ] Tester can distinguish readiness from truth.
[ ] Tester can explain who approved and why.
```

## S7 exit gate

```text
[ ] Product is ready for controlled pilot.
[ ] QA evidence exists.
[ ] Known limitations are explicit.
[ ] No P0 security or data loss issue is open.
```

---

# Pilot Window — Weeks 17–18

## Goal

Validate real usefulness with 2–3 design partners or internal proxy users.

## Pilot QA process

For each pilot session:

```text
1. Start from fresh seeded ADR review.
2. Observe without over-explaining.
3. Capture time to completion.
4. Capture confusion points.
5. Capture trust/readiness interpretation.
6. Capture whether user would use this in real ADR review.
7. Record bugs and product objections separately.
```

## Pilot success criteria

```text
[ ] At least 2 users complete the scenario.
[ ] Median first-run completion time <= 30 minutes.
[ ] Median usefulness rating >= 4/5.
[ ] Users understand readiness as guidance, not truth.
[ ] At least one real workflow improvement is identified.
```

## Pilot output

```text
docs/04_delivery/pilot/V1_1_PILOT_FINDINGS.md
```

Template:

```md
# EPIOS v1.1 Pilot Findings

## Participants

## Scenarios tested

## Completion metrics

## What worked

## What confused users

## Trust / readiness interpretation

## Bugs

## Scope changes recommended

## Decision
- Proceed to v1.1 RC hardening
- Extend pilot
- Cut/rework major feature
```

