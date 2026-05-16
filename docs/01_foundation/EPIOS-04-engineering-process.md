# EPIOS-04 — Repository and Engineering Process

**Project:** Epistemic OS v1.0  
**Document ID:** `EPIOS-04-REPOSITORY-ENGINEERING-PROCESS`  
**Version:** 0.2-BETA
**Status:** accepted_contract
**Depends on:** `EPIOS-00`, `EPIOS-01`, `EPIOS-02`, `EPIOS-03`  
**Repository model:** Open-source from day one  
**Target MVP horizon:** 6 weeks or faster  
**Deployment target:** Internal dev only  
**Language policy:** TypeScript core; Go/Rust later only for infrastructure components  

---

## 1. Purpose of This Document

This document defines the repository structure and engineering process for **Epistemic OS v1.0**.

It specifies:

- open-source repository governance;
- initial repository structure;
- contribution model;
- ADR and RFC process;
- branching and PR rules;
- issue taxonomy;
- code ownership;
- CI gates;
- release tags;
- DORA delivery metrics;
- security disclosure process;
- documentation lifecycle;
- development model (Spiral/Sprints).

The goal is to avoid the document drift, unclear ownership and RC scope confusion that occurred in the predecessor project.

---

## 2. Repository Principles

The repository must be:

- open-source from day one;
- clean of private ChatAVG secrets, data and credentials;
- easy to run locally;
- contract-first;
- test-gated;
- documentation-aware;
- architecture-governed;
- friendly to external readers;
- strict enough to protect domain integrity.

Primary rule:

```text
The repository must make the correct architecture the easiest path.
```

---

## 3. Repository Bootstrap

### 3.1. Repository Name

```text
epistemic-os
```

### 3.2. Initial Files

```text
README.md
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
.env.example
.gitignore
.editorconfig
.nvmrc or .node-version
package.json
pnpm-workspace.yaml
docker-compose.yml
docs/README.md
```

### 3.3. Recommended License

Default recommendation:

```text
Apache-2.0
```

Rationale:

- permissive;
- enterprise-friendly;
- explicit patent grant;
- common for infrastructure/platform projects.

License decision must be captured in:

```text
ADR-0026-license-choice.md
```

Note: ADR numbering is authoritative in EPIOS-09. Older ADR numbering references in EPIOS-04 are superseded by EPIOS-09.

---

## 4. Workspace Structure

Recommended MVP workspace:

```text
epistemic-os/
  apps/
    work-shell/

  packages/
    domain/
    ports/
    application/
    api/
    infrastructure-postgres/
    infrastructure-models/
    infrastructure-mcp/
    infrastructure-runtime/
    observability/
    testing/

  docs/
    00_project/
    01_architecture/
    02_adrs/
    03_specs/
    04_delivery/
    05_runbooks/

  tools/
    scripts/
    dev/
```

### 4.1. Package Responsibilities

| Package | Responsibility |
|---|---|
| `domain` | entities, value objects, domain services, invariants |
| `ports` | interfaces for repositories, gateways, runtime, observability |
| `application` | use cases, orchestration, transactions, policy coordination |
| `api` | HTTP/BFF routes, DTO validation, error contract |
| `infrastructure-postgres` | migrations, repositories, transaction manager, outbox |
| `infrastructure-models` | fake deterministic provider, optional provider adapters |
| `infrastructure-mcp` | MCPAppRegistry, bridge validation, app manifests |
| `infrastructure-runtime` | lightweight runner, future Temporal adapter boundary |
| `observability` | trace schema, local logger, OTel-ready adapter |
| `testing` | fixtures, contract tests, fake ports, seed data |
| `work-shell` | neutral Mission Room UI and MCP App host integration |

### 4.2. Dependency Direction

Allowed dependency direction:

```text
domain ← ports ← application ← api ← work-shell
ports ← infrastructure-*
```

Prohibited:

```text
domain → infrastructure
application → provider SDK directly
work-shell → database repositories directly
MCP App → domain mutation directly
infrastructure-postgres → work-shell
```

A dependency check should be added to CI by Week 2 or earlier.

---

## 5. Development Model: The Spiral (Beta Version)

Epistemic OS has transitioned from the initial mockup/demo stage to a **functioning Beta version**. The engineering process now follows a **Spiral Model**, moving from the core domain to the periphery through iterative sprints.

### 5.1. Spiral Principles (Center to Periphery)
1.  **Core Domain (Center):** Every feature must first be anchored in the `domain` invariants.
2.  **Infrastructure Expansion:** The spiral expands by building out the necessary `ports` and `infrastructure` adapters.
3.  **Peripheral UI & Services:** UI components and external service integrations are the outer layers of the spiral, providing the interface to the functioning core.
4.  **Risk-Driven Iteration:** Each loop of the spiral (Sprint) starts with a review of architectural risks and ends with a functional increment.

### 5.2. Sprint-Based Delivery
- **Iterative Sprints:** Development is organized into sprints with clear, measurable goals.
- **Beta Readiness:** Each sprint increment must maintain system stability and architectural integrity.
- **Continuous Feedback:** The functioning Beta is used to gather real-time feedback, influencing the next loop of the spiral.

Recommended package manager:

```text
pnpm
```

Rationale:

- fast installs;
- strong workspace support;
- deterministic lockfile;
- good monorepo ergonomics.

Recommended tooling:

```text
TypeScript
Vitest or Node test runner
ESLint
Prettier or Biome
tsx / tsup
Drizzle or Kysely for PostgreSQL access
Vite React for demo shell
Docker Compose for local dev
```

Tool decisions should be finalized in `EPIOS-05` or ADRs if contested.

---

## 6. Branching Model

For the 6-week MVP, use a simple protected-main model.

```text
main = protected
feature branches = short-lived
PR required
squash merge recommended
weekly tags for milestones
```

Branch naming:

```text
feat/<short-name>
fix/<short-name>
docs/<short-name>
chore/<short-name>
spike/<short-name>
```

Examples:

```text
feat/mission-domain
feat/postgres-outbox
fix/mcp-nonce-validation
docs/adr-license
spike/temporal-adapter
```

Rules:

- no long-lived parallel architecture branches;
- no direct commits to `main` after bootstrap;
- no merging red CI except documented emergency exception;
- every schema change must include migration and rollback note.

---

## 7. Pull Request Process

### 7.1. PR Size

PRs should be small and reviewable.

Target:

```text
1 PR = 1 vertical or architectural slice
```

Avoid:

- large mixed refactors;
- code + unrelated docs + unrelated migrations;
- UI polish mixed with domain changes;
- dependency upgrades mixed with feature work.

### 7.2. PR Template

Every PR should answer:

```md
## Purpose
What does this PR enable?

## Scope
What changed?

## Contract Changes
- API:
- Domain:
- DB:
- MCP Bridge:
- Events:

## Tests
- [ ] Unit
- [ ] Contract
- [ ] Integration
- [ ] Security
- [ ] E2E / Demo smoke

## Risks
What could break?

## Rollback
How do we revert safely?

## Screenshots / Demo
If UI changed.
```

### 7.3. Required Checks Before Merge

Minimum PR checks:

```text
format
lint
typecheck
unit tests
package dependency check
secret scan
```

Additional checks depending on change:

| Change Type | Required Extra Checks |
|---|---|
| Domain | invariant tests |
| DB schema | migration test |
| API | DTO/contract tests |
| MCP | bridge security tests |
| Artifact/Approval | idempotency and policy tests |
| UI | smoke/manual screenshot note |
| Runtime | replay/idempotency tests |
| Security-sensitive | security reviewer approval |

---

## 8. Commit Conventions

Use semantic commit prefixes:

```text
feat:
fix:
docs:
chore:
test:
refactor:
perf:
security:
spike:
```

Examples:

```text
feat(domain): add EpistemicNode invariants
feat(postgres): add mission and artifact migrations
security(mcp): reject replayed bridge nonces
docs(adr): record PostgreSQL-first decision
```

For MVP speed, strict conventional commit automation is optional, but human-readable semantic commits are required.

---

## 9. Issue Taxonomy

### 9.1. Issue Types

```text
type:feature
type:bug
type:docs
type:security
type:architecture
type:spike
type:test
type:infra
type:ux
type:release
```

### 9.2. Priority Labels

```text
P0 — blocks MVP or security
P1 — important for MVP quality
P2 — useful but deferrable
P3 — later / nice-to-have
```

### 9.3. Area Labels

```text
area:domain
area:application
area:postgres
area:api
area:work-shell
area:mcp
area:runtime
area:evidence
area:artifact
area:approval
area:observability
area:docs
area:security
```

### 9.4. Status Labels

```text
status:triage
status:ready
status:in-progress
status:blocked
status:review
status:done
status:deferred
```

### 9.5. Decision Labels

```text
decision:accepted
decision:rejected
decision:research
decision:adr-needed
```

---

## 10. ADR Process

Architecture Decision Records are required for significant decisions.

### 10.1. ADR Required When

Create an ADR for:

- repository/license decisions;
- database choice;
- runtime choice;
- public API contract changes;
- domain model changes affecting invariants;
- provider abstraction decisions;
- security boundary decisions;
- MCP bridge decisions;
- major dependency adoption;
- irreversible migration paths.

### 10.2. ADR Template

```md
# ADR-XXXX — Title

## Status
Proposed / Accepted / Superseded / Rejected

## Context
What problem are we solving?

## Decision
What did we decide?

## Consequences
Positive and negative outcomes.

## Alternatives Considered
Option A, B, C.

## Impact
Domain / API / DB / Security / Ops / UX.

## Rollback / Revisit Trigger
When should this be revisited?
```

### 10.3. Initial ADR List

```text
ADR-0001-create-epistemic-os-project.md
ADR-0002-close-chatavg-v23-development.md
ADR-0003-open-source-from-day-one.md
ADR-0004-postgresql-first-alpha.md
ADR-0005-typeScript-core-language-policy.md
ADR-0006-mcp-apps-in-mvp.md
ADR-0007-neutral-demo-shell-first.md
ADR-0008-mcp-apps-in-mvp.md
ADR-0009-layered-hexagonal-architecture.md
ADR-0010-domain-free-of-infrastructure.md
ADR-0026-license-choice.md
```

---

## 11. RFC Process

Use RFCs for design proposals that need discussion but are not yet decisions.

### 11.1. RFC Required When

Use RFC for:

- new workflow type;
- new MCP App;
- new storage adapter;
- external integration;
- major UI interaction pattern;
- new domain concept;
- security model change.

### 11.2. RFC Template

```md
# RFC-XXXX — Title

## Summary
Short description.

## Motivation
Why is this needed?

## Proposal
What changes?

## Domain Impact
Entities, invariants, state machines.

## API / Contract Impact
Schemas, commands, events.

## Security Impact
Capabilities, trust boundaries, abuse cases.

## Observability Impact
Events, traces, metrics.

## Test Plan
How will this be verified?

## Alternatives
What else was considered?

## Open Questions
What remains unknown?
```

RFCs may become ADRs after approval.

---

## 12. CI/CD Gates

### 12.1. MVP CI Stages

```text
install
format
lint
typecheck
unit
contract
integration-postgres
mcp-security
build
```

### 12.2. Week 1 CI Minimum

```text
pnpm install
pnpm typecheck
pnpm test
```

### 12.3. Week 2 CI Additions

```text
pnpm test:domain
pnpm test:postgres
pnpm check:deps
```

### 12.4. Week 5 CI Additions

```text
pnpm test:mcp-security
pnpm test:e2e:smoke
```

### 12.5. Release CI

Before MVP RC:

```text
pnpm ci:release
```

Should run:

- clean install;
- lint;
- typecheck;
- unit tests;
- domain invariant tests;
- PostgreSQL integration tests;
- API smoke;
- MCP bridge security tests;
- demo shell build;
- E2E demo smoke;
- secret scan.

---

## 13. Code Ownership

Use `CODEOWNERS` from early MVP.

Initial ownership model:

```text
/packages/domain/                 @architect @domain-owner
/packages/application/            @architect @backend-owner
/packages/infrastructure-postgres/ @backend-owner @data-owner
/packages/infrastructure-mcp/      @security-owner @frontend-owner
/packages/api/                    @backend-owner
/apps/work-shell/                 @frontend-owner @product-owner
/docs/01_architecture/            @architect
/docs/02_adrs/                    @architect
/docs/03_specs/                   @architect @backend-owner
/SECURITY.md                      @security-owner
```

If individuals are not assigned yet, roles may be placeholders.

Every P0/P1 area needs one accountable owner.

---

## 14. Documentation Lifecycle

### 14.1. Document Statuses

```text
Draft
For Review
Accepted
Superseded
Archived
```

### 14.2. Document Rules

- Every document has ID, version, status and owner.
- Accepted docs are authoritative until superseded.
- Superseded docs must link to replacement.
- Code changes that violate accepted docs require ADR/RFC update.
- Documentation drift is treated as engineering debt.

### 14.3. Required Document Register

Maintain:

```text
docs/00_project/DOCUMENT_REGISTER.md
```

Fields:

```text
Document ID
Title
Owner
Status
Version
Last updated
Applies to
Supersedes
Superseded by
```

---

## 15. Open-Source Contribution Model

### 15.1. Contribution Policy for MVP

Because the project is open-source from day one but MVP is time-constrained, contribution policy should be conservative.

Recommended MVP policy:

```text
External issues welcome.
External PRs reviewed case-by-case.
Core architecture changes require RFC.
Security reports use SECURITY.md.
Maintainers reserve right to defer non-MVP features.
```

### 15.2. CONTRIBUTING.md Must Include

- local setup;
- branch naming;
- test commands;
- PR template;
- coding standards;
- architecture rules;
- how to propose RFC/ADR;
- security reporting link;
- non-goals for MVP.

### 15.3. Public Communication Rule

Do not overpromise.

Public README should say:

```text
Epistemic OS is an early-stage open-source project exploring traceable reasoning,
evidence-backed artifacts and human-in-the-loop AI workflows.
```

Avoid claiming:

- production readiness;
- autonomous agent safety;
- regulated compliance;
- full enterprise support;
- final architecture stability.

---

## 16. Security Process

### 16.1. SECURITY.md

Must define:

- supported versions;
- how to report vulnerabilities;
- expected response time;
- safe harbor statement if desired;
- what not to disclose publicly;
- security scope.

### 16.2. Secret Handling

Rules:

```text
- no secrets in repo;
- .env ignored;
- .env.example contains placeholders only;
- no private ChatAVG data copied;
- no raw provider tokens in logs;
- no secrets in MCP iframe;
- no secrets in demo screenshots.
```

### 16.3. Security Review Required For

- MCP bridge changes;
- approval/action execution;
- provider credentials;
- sandbox/forge logic;
- external tool integration;
- auth changes;
- data export;
- logging/tracing payload changes.

### 16.4. MVP Security Tests

Required by Week 5:

```text
invalid MCP origin rejected
invalid MCP schema rejected
replayed nonce rejected
write command without capability rejected
approval cannot be resolved twice with different outcome
artifact patch cannot be applied directly from UI
no secrets in logs test or scan
```

---

## 17. Engineering Metrics

### 17.1. DORA Metrics

Track lightweight DORA metrics from early project phase:

```text
Deployment frequency:
  weekly tags or internal demo releases.

Lead time for changes:
  PR open to merge time.

Change failure rate:
  merged changes causing gate failure or demo regression.

Mean time to recovery:
  time to restore green state after broken main or failed demo.
```

MVP target:

```text
main should remain demo-capable at least at weekly gates.
```

### 17.2. Architecture Health Metrics

Track:

```text
number of dependency rule violations
number of accepted ADRs
number of superseded docs without replacement
number of P0 invariant tests
number of MCP bridge security tests
migration count and rollback coverage
```

### 17.3. Product Demo Metrics

Track during MVP demo:

```text
time to create mission
time to first nodes
time to patch proposal
approval success/failure
trace completeness
manual user confusion notes
```

---

## 18. Release Management

### 18.1. Weekly Tags

Use weekly tags:

```text
mvp-w1-foundation
mvp-w2-domain
mvp-w3-api
mvp-w4-shell
mvp-w5-mcp
mvp-w6-rc
```

### 18.2. MVP RC Tag

Final MVP release candidate tag:

```text
v1.0.0-mvp-rc1
```

### 18.3. Release Notes

Each release note must include:

```text
What works
What is incomplete
Known limitations
Security notes
Setup instructions
Demo script
Breaking changes
```

---

## 19. Definition of Done

A change is done when:

```text
- code merged to main;
- tests pass;
- docs updated if contract changed;
- migration included if schema changed;
- no secrets introduced;
- owner assigned for follow-up risk;
- release note updated if user-visible;
- architecture rule not violated.
```

A domain change is done when:

```text
- invariant test exists;
- domain error defined if needed;
- application use case updated;
- persistence behavior clear;
- trace event considered.
```

An MCP change is done when:

```text
- bridge schema updated;
- origin/schema/nonce/capability tests pass;
- audit event emitted;
- no direct domain mutation possible.
```

A database change is done when:

```text
- migration exists;
- rollback or mitigation note exists;
- repository test passes;
- seed data updated if needed.
```

---

## 20. Initial Backlog for Engineering Process

### P0

```text
Create repository
Add license
Add SECURITY.md
Add CONTRIBUTING.md
Add CODE_OF_CONDUCT.md
Add pnpm workspace
Add package scripts
Add Docker Compose PostgreSQL
Add PR template
Add issue labels
Add CODEOWNERS
Add CI baseline
Add document register
Add ADR template
Add RFC template
```

### P1

```text
Add dependency graph check
Add secret scanning
Add release note template
Add weekly tag process
Add architecture health dashboard script
Add DORA metrics note
Add docs status checker
```

### P2

```text
Add automated changelog
Add external contributor guide examples
Add public roadmap board
Add docs website
Add benchmark dashboard
```

---

## 21. Approval Checklist

This document is approved when the project owner confirms:

- repository structure is acceptable;
- branch/PR process is acceptable;
- ADR/RFC process is acceptable;
- CI gates are acceptable;
- issue taxonomy is acceptable;
- code ownership model is acceptable;
- open-source contribution model is acceptable;
- security process is acceptable;
- engineering metrics are acceptable;
- release management is acceptable.

---

## 22. Next Document After Approval

After this document is approved, create:

```text
EPIOS-05 — PostgreSQL Data Model and Persistence
```

That document should define:

- PostgreSQL schema baseline;
- migrations;
- table design;
- indexes;
- optimistic concurrency;
- outbox_events;
- idempotency_keys;
- repository contracts;
- transaction boundaries;
- seed data;
- rollback policy.

