Owner: @architect
Status: accepted_concept

# API Contracts (v1.0 MVP)

**Status:** `accepted_concept` (Hardening in progress)
**Version:** 1.1
**Source of Truth:** [packages/api/src/contracts/schemas.ts](../../packages/api/src/contracts/schemas.ts) (Zod)

> [!NOTE]
> This document is a human-readable view of the formal contracts. In case of discrepancy, the Zod schemas in the codebase are authoritative.

## 1. Protocol Standards
- **Versioned API**: `/api/v1`
- **Format**: JSON only.
- **Idempotency**: `X-Idempotency-Key` (UUID v4) required for all state-changing requests.
- **Traceability**: `X-Trace-ID` and `X-Actor-ID` headers recommended.

> [!IMPORTANT]
> **API Separation Rule:** This document contains ONLY the generic v1.0 MVP API contracts (e.g., `CreateMission`, `UpdateMissionBrief`, `IngestSource`, `StartRun`, `ResolveApproval`). Any ADR-specific routes or read models must be specified in `ADR_REVIEW_API_EXTENSION_CONTRACT.md`.

## 2. Resource Schemas (Zod-ready)

### MissionReadModel
```typescript
{
  id: string (uuid),
  title: string,
  brief: {
    goal: string,
    successCriteria: string[],
    constraints: string[],
    unknowns: string[]
  },
  status: "draft" | "running" | "completed" | "archived",
  version: number,
  createdAt: string (iso8601),
  updatedAt: string (iso8601)
}
```

## 3. Endpoints

### 3.1. Mission Lifecycle

| Method | Path | Request Schema | Response | Trace Event |
|--------|------|----------------|----------|-------------|
| `POST` | `/missions` | `{ title: string, context?: string }` | `201: MissionReadModel` | `mission.created` |
| `GET` | `/missions/:id` | `n/a` | `200: MissionReadModel` | `n/a` |
| `PATCH` | `/missions/:id/brief` | `{ briefPatch: string }` | `200: OK` | `mission.brief.updated` |

### 3.2. Epistemic Actions

| Method | Path | Request Schema | Response | Trace Event |
|--------|------|----------------|----------|-------------|
| `POST` | `/missions/:id/sources` | `{ sourceType: "text" | "url", content: string }` | `202: Accepted` | `source.ingested` |
| `POST` | `/missions/:id/runs` | `{ runType: "mapping" | "refinement" }` | `202: Accepted { runId: string }` | `run.started` |

### 3.3. Governance

| Method | Path | Request Schema | Response | Trace Event |
|--------|------|----------------|----------|-------------|
| `POST` | `/approvals/:id/resolve` | `{ decision: "approved" | "rejected", comment?: string }` | `200: OK` | `approval.resolved` |
| `POST` | `/artifact-patches/:id/apply` | `n/a` | `200: OK` | `artifact.patch.applied` |

## 4. Error Mapping

| Domain Code | HTTP Status | Description |
|-------------|-------------|-------------|
| `VALIDATION_ERROR` | `400 Bad Request` | Malformed JSON or schema violation. |
| `FORBIDDEN` | `403 Forbidden` | Insufficient permissions for the actor. |
| `NOT_FOUND` | `404 Not Found` | Resource does not exist. |
| `CONCURRENCY_ERROR` | `409 Conflict` | Version mismatch detected (Optimistic Concurrency). |
| `INTERNAL_ERROR` | `500 Server Error` | Unexpected failure. |
