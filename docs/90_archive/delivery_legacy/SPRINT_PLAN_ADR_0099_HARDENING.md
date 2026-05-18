# SPRINT PLAN: ADR-0099 Architectural Hardening (S1)
**Status:** archived
**Owner:** @architect
**Date:** 2026-05-15
**Traceability:** Implements [ADR-0099](../02_adrs/ADR-0099-mvp-audit-directives.md) (Directives 3.3, 4.2, 4.3, 5.2)

## 1. Goal
Achieve full compliance with the "P0 Hardening" requirements of ADR-0099, focusing on transactional integrity, reliable event emission (Outbox), and secure iframe communication.

## 2. Scope & Tasks

### 2.1. Sprint 1: Транзакционный фундамент (Directive 3.3)
- [x] **Define `UnitOfWorkPort`**: Interface in `packages/ports` for transaction management.
- [x] **Implement `PostgresUnitOfWork`**: Drizzle-based transaction manager in `infrastructure-postgres`.
- [x] **Domain Events**: Add `domainEvents` collection to `EpistemicNode` and `GovernanceProcess` classes to capture side effects.
- [x] **Refactor Use Cases**: Update `CastVote`, `SubmitClaim`, and `ApplyPatch` to use the `UnitOfWork` for atomic execution.

### 2.2. Sprint 2: Консистентность и Фоновые задачи (Directive 4.2 & 4.3)
- [x] **Outbox Worker**: Implement a background worker in `infrastructure-runtime` to process events from the `outbox` table.
- [x] **Optimistic Concurrency**: Add `version: number` property to `EpistemicNode` and ensure it is checked during repository `save()`.

### 2.3. Sprint 3: Безопасность и Финализация (Directive 5.2)
- [x] **Secure MCP Bridge**: Refactor `packages/infrastructure-mcp` to use Zod for strict message validation.
- [x] **Bridge Protocol**: Implement `nonce` and `origin` checks for all `postMessage` communications.

## 3. Success Criteria
1. [x] **Transactional Integrity**: 100% of mutation-based Use Cases (`CastVote`, `SubmitClaim`, `ApplyPatch`) utilize the `UnitOfWork` pattern for atomic execution.
2. [x] **Reliable Event Emission**: Domain side-effects are captured in the `outbox` and processed by the background worker (Verified via integration tests).
3. [x] **Race Condition Prevention**: Optimistic concurrency is enforced at the repository level via `version` column checks and `ConcurrencyError` handling.
4. [x] **Secure Communication**: The MCP Bridge validates all incoming requests via Zod and enforces `nonce` checks for replay protection.
5. [x] **Automated Verification**: `pnpm test` and `dependency-cruiser` pass without errors or boundary violations.

## 4. Risks & Mitigation
- **Risk: Concurrency Conflicts on High-Traffic Nodes.** High-contention nodes (e.g., Global Governance) may trigger frequent `ConcurrencyError` results due to optimistic locking.
  - **Mitigation**: Implement exponential backoff retries in critical Use Cases and ensure the UI provides clear "State Stale" feedback with a "Refresh & Merge" option.
- **Risk: Iframe Communication Vulnerabilities.** The MCP bridge is a critical attack surface for malicious parent or child frames.
  - **Mitigation**: Enforce strict `origin` whitelist validation, Zod-based payload schemas, and unique request `nonce` tracking to prevent replay attacks.
- **Risk: Increased Complexity in Unit Testing.** Moving to a `UnitOfWork` pattern makes mocking repository interactions more complex.
  - **Mitigation**: Standardize on a `MockUnitOfWork` helper that automatically provides mocked repositories, ensuring tests remain concise and focused on business logic.
- **Risk: Outbox Processing Lag.** Background event processing may introduce visible latency in UI updates if polling intervals are too high.
  - **Mitigation**: Use a short 5s polling interval for the MVP and optimize for PostgreSQL `SKIP LOCKED` to allow horizontal scaling of workers if needed.
- **Risk: Schema Migration Side-Effects.** Adding mandatory `version` columns to existing data models might break legacy data or unpatched environments.
  - **Mitigation**: Deploy atomic migrations with default values (`version = 1`) and include sanity checks in the repository layer to handle legacy records.

---
*Created by Antigravity Agent as part of the Epistemic OS development cycle.*
