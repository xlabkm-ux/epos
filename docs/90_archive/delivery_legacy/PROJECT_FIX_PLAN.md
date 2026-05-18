# EPIOS Project Fix & Improvement Plan (Audit-Driven)

This plan is based on the comprehensive audits conducted by **DeepSeek**, **OpenAI**, and the **Internal Documentation Audit (EPIOS-00…EPIOS-11)**. It addresses critical (P0) and high-priority (P1) issues across infrastructure, documentation, architecture, and security.

## Execution Strategy
- **Short Independent Sprints**: 3-5 days each.
- **Vertical Slices**: Each sprint delivers a functional or structural improvement with tests.
- **Continuous Governance**: Documentation and CI gates are enforced before scaling domain logic.

---

## Phase 1: Repository Hygiene & CI (Sprint 1)
**Goal**: Establish automated quality gates and clean up environment configuration.

### Sprint 1.1: CI/CD & Security Baseline
- [x] **GitHub Actions**: Implement `.github/workflows/ci.yml` (Install → pnpm audit → Lint → Typecheck → Test → Build).
- [x] **Secret Scanning**: Add **Gitleaks** or similar secret scanning to CI.
- [ ] **Branch Protection**: (Recommendation for User) Protect `main` branch, require PRs and passing CI.
- [x] **Conventional Commits**: Implement `commitlint` and **Release Drafter** for automated release notes.
- [x] **Secret Hygiene**: Update `docker-compose.yml` and `.env.example` to use variable defaults (`${POSTGRES_PASSWORD}`).
- [x] **Docker Optimization**: Create `.dockerignore`; add `restart: unless-stopped` to services.
- [x] **Tooling Upgrade**: Update Turbo to v2; fix Node (v22 LTS) and pnpm versions.
- [x] **Pre-commit Hooks**: Implement **Husky** and **lint-staged** (lint, typecheck, test related).

---

## Phase 2: Documentation Governance (Sprint 2)
**Goal**: Resolve document drift, fix ADR conflicts, and implement a structured "Docs as Code" system.

### Sprint 2.1: Documentation Stabilization Pass
- [x] **Document Register**: Create `docs/00_project/DOCUMENT_REGISTER.md` with status/owner tracking.
- [x] **ADR Resolution**: 
    - [x] Fix numbering conflict between EPIOS-04 and EPIOS-09.
    - [x] Create individual ADR files for `ADR-0001` through `ADR-0010` and `ADR-0026` in `docs/02_adrs/`.
- [x] **License Finalization**: Finalize `ADR-0026-license-choice.md` as **Apache-2.0** and transition to `Accepted`.
- [x] **Status Update**: Transition core documents (EPIOS-00 to EPIOS-11) from `Draft` to `Accepted for MVP Bootstrap`.
- [x] **Open Decisions**: Create `docs/00_project/OPEN_DECISIONS_REGISTER.md`.
- [x] **Documentation Structure**: Implement **Diátaxis framework** (Reference / Explanation / How-to / Tutorial) in `docs/`.
- [x] **README Polish**: Add "Alpha - internal dev only" status, Quickstart, and **Mermaid/C4 architecture diagrams**.
- [x] **Project Map**: Create/Update `PROJECT_MAP.md` with visual architecture representation.

---

## Phase 3: Architecture Enforcement & Planning (Sprint 3)
**Goal**: Automate architectural boundaries and prepare the detailed backlog for domain development.

### Sprint 3.1: Enforcement & Quality
- [x] **Dependency Boundaries**: Implement **dependency-cruiser** to enforce `domain ← application ← infrastructure` constraints in CI.
- [x] **Quality Gates**: Set **Vitest coverage thresholds** (min 80% for `packages/domain`).
- [x] **GitHub Backlog**: Initialize GitHub Issues for the remaining work (P0 Delivery).
- [x] **Release Gate**: Publish `v0.1.0-rc.1` on GitHub.
- [x] **Branch Protection**: Enforce protection on `main` (Required PRs/CI).
- [x] **Planning**: Create `EPIOS-12-domain-and-persistence-issues-and-pr-bodies.md`.
- [x] **Milestones**: Initialize GitHub Milestones for Phase 4/5.

---

## Phase 4: Core Domain & Persistence (Sprint 4)
**Goal**: Implement the "System of Record" entities and database persistence.

### Sprint 4.1: Mission Core & DB
- [x] **Core Entities**: Implement `Mission`, `MissionRun`, `EpistemicNode`, and `ReasoningEdge` in `packages/domain`.
- [x] **Persistence**: 
    - PostgreSQL migrations 0002–0006.
    - Implement Repository ports and adapters.
- [ ] **Testing**: Domain invariant tests and Repository integration tests (Optimistic Concurrency & Idempotency).

---

## Phase 5: Application Specs & Logic (Sprint 5)
**Goal**: Define and implement the application-layer contracts and use cases.

### Sprint 5.1: Specs & Use Cases
- [x] **Contract Specs**: Create `API_CONTRACTS_MVP.md` and `APPLICATION_USE_CASE_CONTRACTS.md`.
- [x] **Error/Trace Catalogs**: Create `ERROR_CATALOG.md` and `TRACE_EVENT_CATALOG.md`.
- [x] **Logic**: Implement `CreateMission`, `UpdateMissionBrief`, and `IngestSource` use cases.

---

## Phase 6: Security & Shell (Sprint 6)
**Goal**: Secure the MCP bridge and initialize the UI.

### Sprint 6.1: MCP Security & Demo
- [x] **Security Specs**: Create `MCP_SECURITY_TEST_PLAN.md` and `DATA_RETENTION_AND_REDACTION_POLICY_MVP.md`.
- [ ] **Demo Shell**: Initialize `apps/demo-shell` (framework choice).
- [ ] **Bridge Validation**: Implement the nonce/capability validation pipeline for MCP messages.

---

## Phase 7: Release Prep & Legacy Handover (Parallel Track)
**Goal**: Sanitize assets and document deployment/handover processes.

### Sprint 7.1: Release Readiness
- [ ] **Deployment Docs**: Create `DEPLOY.md` with environment setup and release instructions.
- [ ] **ChatAVG Handover**: Create `CURRENT_STATE_V2_4.md`, `CHATAVG_EXTRACTION_INVENTORY.md`, and `SECURITY_STABILIZATION_NOTES.md`.
- [ ] **Sanitization**: Ensure no credentials or legacy spaghetti leaks into EPIOS.

---

## Definition of Done (Sprint)
1. Code passes `lint`, `typecheck`, and `test`.
2. Documentation updated (ADR, Specs, Register).
3. `PROJECT_BACKLOG.md` updated.
4. `PROJECT_MAP.md` updated (if structure changed).
5. Git commit & push.
