Owner: @architect
Status: archived / historical_delivery
Binding Level: Advisory

# EPIOS-12 — Week 2: Domain & Persistence (Issues & PR Bodies)

**Project:** Epistemic OS v1.0  
**Document ID:** `EPIOS-12-WEEK-2-DOMAIN-AND-PERSISTENCE`  
**Status:** archived / historical_delivery  
**Sprint:** 4.1 (Phase 4)

## 1. Goal
Implement the core domain model for Missions and Epistemic Nodes, and establish the persistence layer using PostgreSQL.

---

## 2. GitHub Issues

### #25 Implement Mission Aggregate & Domain Invariants
**Description**: 
Implement the full `Mission` aggregate as defined in `EPIOS-02`.
- Entities: `Mission`, `MissionRun`.
- Invariants: 
  - Mission status transitions.
  - Required fields for each status.
  - Optimistic concurrency (versioning).
- Location: `packages/domain/src/mission/`.

### #26 Implement EpistemicNode & EvidenceRef
**Description**:
Implement the core building blocks for traceability.
- `EpistemicNode`: The unit of reasoning/data.
- `EvidenceRef`: Links to supporting evidence.
- `ReasoningEdge`: Connections between nodes.
- Location: `packages/domain/src/graph/`.

### #27 PostgreSQL Repository Implementation (Missions)
**Description**:
Implement the repository adapter for Missions.
- Port: `packages/ports/src/IMissionRepository.ts`.
- Adapter: `packages/infrastructure-postgres/src/repositories/PostgresMissionRepository.ts`.
- Use Drizzle or Kysely as per `ADR-0007`.

### #28 Database Migrations (Schema Update)
**Description**:
Add migrations for the full domain model.
- `0002_add_epistemic_nodes.sql`
- `0003_add_reasoning_edges.sql`
- `0004_add_evidence_references.sql`

### #29 Integration Tests for Persistence
**Description**:
Verify repository implementations with real database.
- Idempotency checks.
- Relationship integrity.
- Location: `packages/infrastructure-postgres/test/`.

---

## 3. PR Bodies

### PR: "feat(domain): implement full mission aggregate"
**Body**:
- Implements `Mission` and `MissionRun` entities.
- Adds comprehensive invariant checks.
- Coverage: 100% (target).
- Closes #25.

### PR: "feat(domain): epistemic graph core entities"
**Body**:
- Implements `EpistemicNode`, `EvidenceRef`, and `ReasoningEdge`.
- Establishes the foundation for the reasoning graph.
- Closes #26.

### PR: "feat(infra): postgresql repository for missions"
**Body**:
- Implements `PostgresMissionRepository`.
- Adds migrations for expanded schema.
- Includes integration tests.
- Closes #27, #28, #29.
