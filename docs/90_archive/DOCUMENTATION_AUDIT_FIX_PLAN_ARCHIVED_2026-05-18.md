Owner: @architect
Status: for_review

# DOCUMENTATION AUDIT FIX PLAN

**Project:** Epistemic OS v1.1 Alpha
**Document ID:** `EPIOS-DOC-AUDIT-FIX-PLAN`
**Version:** 1.0
**Date:** 2026-05-18
**Source:** Documentation Audit Report (2026-05-18)
**Target Horizon:** 5 independent sprints

---

## 1. Context & Strategic Decision

### 1.1. Audit Findings Summary

A comprehensive documentation audit was conducted on 2026-05-18, revealing:

- **Total markdown files:** 152 files in `docs/`
- **Registered files:** ~96 entries in `DOCUMENT_REGISTER.md`
- **Unregistered files:** ~56 files (37% gap)
- **Broken ADR links:** 19 out of 26 ADRs (73%)
- **Outdated STATUS.md:** References v0.2.0-beta instead of v1.1 Alpha

### 1.2. Governing Principles

This plan follows the requirements from:

1. **GOVERNANCE_PLAN.md v1.3** — Governance-as-Code, Phase 0-2 requirements
2. **EPIOS-04-engineering-process.md** — Spiral model, sprint-based delivery
3. **SPRINT_QA_REGULATION.md** — Quality gates for sprint completion
4. **Authority Rule** (docs/README.md) — Only `accepted` documents are binding

### 1.3. Sprint Design Principle

Following GOVERNANCE_PLAN.md §6 "2-Level Planning & Sprint Isolation":

> **"Изоляция спринтов**: Оперативный план состоит из согласованных этапов, разбитых на **НЕЗАВИСИМЫЕ** спринты, которые можно выполнять параллельно."

Each sprint in this plan is designed to be **independent** and can be executed by a separate agent or developer without dependencies on other sprints.

---

## 2. Sprint Architecture

### 2.1. Sprint Classification

| Sprint | Type | Parallel Allowed? | Risk Level | Owner Role |
|--------|------|-------------------|------------|------------|
| S1 | Documentation Fix | ✅ Yes | Low | @tech-writer |
| S2 | Link Repair | ✅ Yes | Low | @tech-writer |
| S3 | Registry Completion | ✅ Yes | Medium | @tech-writer |
| S4 | Status Update | ✅ Yes | Low | @product-owner |
| S5 | QA & Validation | 🔒 UNIQUE | High | @architect |

### 2.2. Sprint Independence Matrix

```
S1 (Fix Broken Links)    → Independent, no prerequisites
S2 (Update STATUS.md)    → Independent, no prerequisites
S3 (Complete Register)   → Independent, no prerequisites
S4 (Update README.md)    → Independent, no prerequisites
S5 (QA Gate & Merge)     → 🔒 UNIQUE — requires S1-S4 completion
```

---

## 3. Sprint Plans

### **SPRINT S1: Fix Broken ADR Links**

**Type:** Documentation Fix
**Parallel Execution:** ✅ Allowed
**Estimated Effort:** 2-3 hours
**Priority:** 🔴 P0 (Critical)

#### Goal

Fix all 19 broken ADR file references in `DOCUMENT_REGISTER.md` to match actual filenames.

#### Scope

Only `docs/00_project/DOCUMENT_REGISTER.md` — lines 25-50 (ADR section).

#### Tasks

1. Read current `DOCUMENT_REGISTER.md` ADR section
2. For each ADR entry, verify filename exists in `docs/02_adrs/`
3. Update link text to match actual filename:

| Current (Broken) Link | Correct Filename |
|----------------------|------------------|
| `ADR-0002-close-chatavg-v2-3-development.md` | `ADR-0002-close-chatavg-v23-release-v24.md` |
| `ADR-0004-use-neutral-demo-shell.md` | `ADR-0004-neutral-demo-shell-first.md` |
| `ADR-0005-use-universal-mission-room.md` | `ADR-0005-universal-mission-room-mvp.md` |
| `ADR-0006-use-typescript-core.md` | `ADR-0006-typescript-core-go-rust-deferred.md` |
| `ADR-0007-use-postgresql-as-alpha-sor.md` | `ADR-0007-postgresql-alpha-system-of-record.md` |
| `ADR-0009-use-layered-hexagonal-architecture.md` | `ADR-0009-layered-hexagonal-architecture.md` |
| `ADR-0010-keep-domain-free-of-infra.md` | `ADR-0010-domain-free-of-infrastructure.md` |
| `ADR-0011-use-epistemicnode-as-core-primitive.md` | `ADR-0011-epistemic-node-core-primitive.md` |
| `ADR-0012-use-temporal-validity.md` | `ADR-0012-temporal-validity.md` |
| `ADR-0013-use-livingartifact-artifactpatch.md` | `ADR-0013-artifact-model.md` |
| `ADR-0014-use-approvalrequest-decisionrecord.md` | `ADR-0014-human-decisions.md` |
| `ADR-0018-treat-mcp-apps-as-untrusted-ui.md` | `ADR-0018-untrusted-mcp-ui.md` |
| `ADR-0021-keep-temporal-as-future-adapter.md` | `ADR-0021-temporal-future-adapter.md` |
| `ADR-0022-use-trace-events.md` | `ADR-0022-trace-events-observability.md` |
| `ADR-0023-use-fake-deterministic-model-provider.md` | `ADR-0023-fake-deterministic-provider.md` |
| `ADR-0024-do-not-import-chatavg.md` | `ADR-0024-no-chatavg-dependency.md` |
| `ADR-0025-reuse-chatavg-through-extraction.md` | `ADR-0025-reuse-strategy.md` |

4. Verify all links work after update
5. Commit with message: `docs(register): fix 19 broken ADR links in DOCUMENT_REGISTER.md`

#### Acceptance Criteria

- [ ] All 19 ADR links point to existing files
- [ ] No broken links remain in ADR section
- [ ] Link format consistent with working examples (ADR-0008, ADR-0015, etc.)
- [ ] `pnpm lint` passes
- [ ] Manual verification: click 5 random ADR links, all open correctly

#### Definition of Done

- Code merged to main
- All links verified working
- No regression in other register entries
- Sprint QA Gate passed (G1-G8)

---

### **SPRINT S2: Update STATUS.md**

**Type:** Documentation Update
**Parallel Execution:** ✅ Allowed
**Estimated Effort:** 1-2 hours
**Priority:** 🟡 P1 (Important)

#### Goal

Update `STATUS.md` to reflect current project state (v1.1 Alpha, ADR Review phase).

#### Scope

Only `STATUS.md` in repository root.

#### Tasks

1. Read current `STATUS.md`
2. Update header metadata:

```markdown
# 📊 PROJECT STATUS: Epistemic OS (epios)
> **Last Updated:** 2026-05-18
> **Version:** v1.1.0-alpha.1 (ADR Review MVP)
> **Phase:** v1.1 ADR Review Implementation
> **Primary Focus:** `docs/03_specs/ADR_REVIEW_*` contracts
```

3. Replace "Current Verdict" section with:

```markdown
## 🎯 Current Verdict

The project has transitioned to **v1.1 Alpha** focusing on the **ADR Review Workspace**.
Development follows the **Spiral Model** centered on governance artifacts and traceability.
Current priority is implementing ADR Review Workflow MVP with full contract compliance.
```

4. Update "Phase Status" table to reflect ADR Review components:

| Component | Status | Goal |
|-----------|--------|------|
| **ADR Contracts** | ✅ Completed | ArtifactPatch, Readiness, ReadModel contracts defined |
| **Trace Events** | ✅ Completed | TRACE_EVENT_CATALOG updated for governance events |
| **MCP Bridge** | ✅ Completed | Secure bridge with origin/schema/nonce validation |
| **Domain Core** | ✅ Completed | GovernanceArtifact, TraceLink, GovernanceFinding entities |
| **QA Gates** | ✅ Completed | Sprint QA Regulation enforced via CI |
| **UI Panels** | 🚧 In Progress | ADR Review workspace panels (Sprint S8+) |

5. Archive old sprint history:
   - Move "Sprint 1-8: User Management" section to `docs/90_archive/STATUS_ARCHIVED_2026-05-18.md`
   - Add reference link in current STATUS.md

6. Add new sprint roadmap for v1.1:

```markdown
## 🚀 Roadmap: v1.1 ADR Review (Upcoming Sprints)

### Sprint S1-S4: Documentation Hardening (Current)
- [ ] Fix broken ADR links
- [ ] Complete DOCUMENT_REGISTER.md
- [ ] Update docs/README.md structure
- [ ] Validate all governance contracts

### Sprint S5-S8: ADR Review UI Foundation
- [ ] ADR Review workspace shell
- [ ] Artifact comparison panel
- [ ] Trace visualization
- [ ] Human approval workflow

### Sprint S9-S12: Multi-User Governance
- [ ] RBAC for governance roles
- [ ] Collaborative review sessions
- [ ] Decision provenance tracking
```

7. Update navigation links to point to current documents

8. Commit with message: `docs(status): update STATUS.md to v1.1 Alpha ADR Review phase`

#### Acceptance Criteria

- [ ] Header shows v1.1.0-alpha.1
- [ ] Old User Management sprints archived
- [ ] New v1.1 roadmap present
- [ ] All component statuses accurate
- [ ] Links to key documents work
- [ ] `pnpm lint` passes

#### Definition of Done

- STATUS.md reflects current reality
- Historical data preserved in archive
- Navigation links functional
- Sprint QA Gate passed (G1-G8)

---

### **SPRINT S3: Complete DOCUMENT_REGISTER.md**

**Type:** Registry Completion
**Parallel Execution:** ✅ Allowed
**Estimated Effort:** 4-6 hours
**Priority:** 🔴 P0 (Critical)

#### Goal

Add all 56 unregistered markdown files to `DOCUMENT_REGISTER.md` with appropriate statuses.

#### Scope

Only `docs/00_project/DOCUMENT_REGISTER.md`.

#### Tasks

1. Run inventory script to find all unregistered files:

```bash
# Compare all .md files in docs/ vs entries in DOCUMENT_REGISTER.md
# Generate list of missing entries
```

2. Categorize missing files by directory and assign status:

**Category A: Missing Specs (Status: `accepted_contract` or `reference`)**
- `docs/03_specs/RFC_TEMPLATE.md` → EPIOS-SPC-XXX, reference
- `docs/03_specs/data_architecture/*.md` (4 files) → EPIOS-SPC-XXX, deferred
- `docs/03_specs/scenarios/*.md` (4 files) → EPIOS-SPC-XXX, reference

**Category B: Missing Delivery Docs (Status: `accepted_contract` or `reference`)**
- `docs/04_delivery/ADR_REVIEW_DEMO_SCRIPT.md` → EPIOS-DEL-XXX, accepted_contract
- `docs/04_delivery/KNOWN_LIMITATIONS_V1_1_ADR_REVIEW.md` → EPIOS-DEL-XXX, accepted_contract
- `docs/04_delivery/RELEASE_STATE.md` → EPIOS-DEL-XXX, accepted_contract
- `docs/04_delivery/SPRINT_QA_REGULATION.md` → EPIOS-DEL-XXX, accepted_contract
- `docs/04_delivery/V1_1_DECISION_LOG.md` → EPIOS-DEL-XXX, reference
- `docs/04_delivery/V1_1_MILESTONE_GATES.md` → EPIOS-DEL-XXX, accepted_contract
- `docs/04_delivery/V1_1_QA_INDEX.md` → EPIOS-DEL-XXX, reference
- `docs/04_delivery/V1_1_RELEASE_ACCEPTANCE_CRITERIA.md` → EPIOS-DEL-XXX, accepted_contract
- `docs/04_delivery/V1_1_RISK_REGISTER.md` → EPIOS-DEL-XXX, reference
- `docs/04_delivery/sprint-reviews/*.md` (4 files) → EPIOS-DEL-XXX, archived
- `docs/04_delivery/v1_1_qa_plan/S7_IMPLEMENTATION_PLAN.md` → EPIOS-DEL-XXX, reference

**Category C: Missing Operations (Status: `reference`)**
- `docs/05_operations/RUNBOOK.md` → EPIOS-OPS-001, reference

**Category D: Missing Planning (Status: `deferred`)**
- `docs/10_planning/commercial_transition_plan.md` → EPIOS-PLAN-001, deferred

**Category E: Missing Reference Indexes (Status: `deferred`)**
- `docs/20_reference/ui_roadmap/00_ROADMAP_INDEX.md` → EPIOS-REF-XXX, deferred
- `docs/20_reference/ui_roadmap/05_UI_DESIGN_SYSTEM_GUIDE.md` → EPIOS-REF-XXX, deferred
- `docs/20_reference/ui_roadmap/06_UI_DEMO_INTERFACE_DESCRIPTION.md` → EPIOS-REF-XXX, deferred
- `docs/20_reference/user_management/*.md` (9 files) → EPIOS-REF-XXX, deferred
- `docs/20_reference/user_workflow/01_CORE_ROLES_AND_PERSONAS.md` → EPIOS-REF-XXX, deferred

**Category F: Missing Archive Entries (Status: `archived`)**
- `docs/90_archive/PROJECT_BACKLOG_LEGACY.md` → EPIOS-ARC-XXX, archived
- `docs/90_archive/STATUS_ARCHIVED_*.md` (2 files) → EPIOS-ARC-XXX, archived
- `docs/90_archive/backlog/*.md` (2 files) → EPIOS-ARC-XXX, archived
- `docs/90_archive/delivery_legacy/*.md` (11 files) → EPIOS-ARC-XXX, archived
- `docs/90_archive/qa_legacy/*.md` (2 files) → EPIOS-ARC-XXX, archived

3. Add entries to appropriate sections in DOCUMENT_REGISTER.md:

```markdown
| **SPECS** (continued) | | | | | | |
| EPIOS-SPC-013| [RFC_TEMPLATE.md](../03_specs/RFC_TEMPLATE.md) | @architect | reference | 0.1 | 2026-05-14 | Template | - | v1.1 Alpha | Advisory |
| EPIOS-SPC-014| [DATA_STRUCTURE_MASTER.md](../03_specs/data_architecture/00_DATA_STRUCTURE_MASTER.md) | @architect | deferred | 0.1 | 2026-05-14 | Data | - | Future | Advisory |
...

| **DELIVERY** (continued) | | | | | | |
| EPIOS-DEL-014| [ADR_REVIEW_DEMO_SCRIPT.md](../04_delivery/ADR_REVIEW_DEMO_SCRIPT.md) | @architect | accepted_contract | 1.0 | 2026-05-15 | Demo | - | v1.1 Alpha | Mandatory |
...

| **OPERATIONS** | | | | | | |
| EPIOS-OPS-001| [RUNBOOK.md](../05_operations/RUNBOOK.md) | @architect | reference | 0.1 | 2026-05-14 | Ops | - | v1.0 MVP | Advisory |

| **PLANNING** | | | | | | |
| EPIOS-PLAN-001| [commercial_transition_plan.md](../10_planning/commercial_transition_plan.md) | @architect | deferred | 0.1 | 2026-05-14 | Business | - | Future | Advisory |

| **REFERENCE** (continued) | | | | | | |
| EPIOS-REF-006| [UI Roadmap Index](../20_reference/ui_roadmap/00_ROADMAP_INDEX.md) | @architect | deferred | 0.1 | 2026-05-14 | UI | - | v1.1 Alpha | Advisory |
...

| **ARCHIVE** (continued) | | | | | | |
| EPIOS-ARC-007| [Project Backlog Legacy](../90_archive/PROJECT_BACKLOG_LEGACY.md) | @architect | archived | 0.1 | 2026-05-14 | Legacy | - | - | Advisory |
...
```

4. Ensure sequential numbering continues from last entry (EPIOS-ARC-014)

5. Verify all new links work

6. Update document count in header comment if present

7. Commit with message: `docs(register): add 56 missing files to DOCUMENT_REGISTER.md`

#### Acceptance Criteria

- [ ] All 152 markdown files have entries in register
- [ ] Each entry has correct status (accepted/reference/deferred/archived)
- [ ] Each entry has owner assigned
- [ ] All links resolve correctly
- [ ] Sequential ID numbering maintained
- [ ] `pnpm check:docs-governance` passes
- [ ] No duplicate entries

#### Definition of Done

- 100% documentation coverage achieved
- All links verified
- Status assignments reviewed by @architect
- Sprint QA Gate passed (G1-G8)

---

### **SPRINT S4: Update docs/README.md Structure**

**Type:** Documentation Update
**Parallel Execution:** ✅ Allowed
**Estimated Effort:** 1-2 hours
**Priority:** 🟢 P2 (Nice-to-have)

#### Goal

Update `docs/README.md` to accurately reflect current directory structure and add missing categories.

#### Scope

Only `docs/README.md`.

#### Tasks

1. Read current `docs/README.md`

2. Update "Documentation Structure" table to include all existing categories:

```markdown
## Documentation Structure

| Category | Purpose | Directory | Status |
|----------|---------|-----------|--------|
| **Authority** | Project governance and rules | `docs/00_project/` | ✅ Active |
| **Foundation** | Core architecture and domain models | `docs/01_foundation/` | ✅ Active |
| **Decision** | Architecture Decision Records (ADRs) | `docs/02_adrs/` | ✅ Active |
| **Specs** | Technical contracts and specifications | `docs/03_specs/` | ✅ Active |
| **Delivery** | Release evidence, QA plans, runbooks | `docs/04_delivery/` | ✅ Active |
| **Operations** | Operational procedures and runbooks | `docs/05_operations/` | 📖 Reference |
| **Client** | Customer-facing and methodology guides | `docs/06_client/` | ✅ Active |
| **Planning** | Strategic and commercial planning | `docs/10_planning/` | 📅 Deferred |
| **Reference** | Roadmaps and справочные материалы | `docs/20_reference/` | 📖 Reference |
| **Archive** | Legacy and superseded docs | `docs/90_archive/` | 🗄️ Archived |
```

3. Add subsection details for Specs:

```markdown
### Specs Subcategories

- `docs/03_specs/` — Core contracts (ADR Review, API, Security)
- `docs/03_specs/data_architecture/` — Data structure definitions (deferred)
- `docs/03_specs/scenarios/` — Usage scenario descriptions (reference)
```

4. Add Quick Links for newly registered important documents:

```markdown
## Quick Links (Updated)

1. **[DOCUMENT_REGISTER.md](00_project/DOCUMENT_REGISTER.md)**: The authoritative list of all documents.
2. **[GOVERNANCE_PLAN.md](00_project/GOVERNANCE_PLAN.md)**: The rules of project management.
3. **[OPEN_DECISIONS_REGISTER.md](00_project/OPEN_DECISIONS_REGISTER.md)**: Current pending decisions.
4. **[SPRINT_QA_REGULATION.md](04_delivery/SPRINT_QA_REGULATION.md)**: Mandatory QA gate process.
5. **[RELEASE_STATE.md](04_delivery/RELEASE_STATE.md)**: Current release status dashboard.
6. **[ADR_REVIEW_WORKFLOW_MVP.md](03_specs/ADR_REVIEW_WORKFLOW_MVP.md)**: Core MVP workflow.
```

5. Update "Current planning model" section:

```markdown
## Current Planning Model

- **Operational planning:** GitHub Issues / sprints
- **Project planning:** [V1_1_PROJECT_PLAN_ADR_REVIEW.md](04_delivery/V1_1_PROJECT_PLAN_ADR_REVIEW.md)
- **v1.0 baseline:** [EPIOS-03-v1_0-mvp-scope.md](01_foundation/EPIOS-03-v1_0-mvp-scope.md)
- **v1.1 roadmap:** [EPIOS-v1_1-adr-review-roadmap.md](01_foundation/EPIOS-v1_1-adr-review-roadmap.md)
- **Release status:** [RELEASE_STATE.md](04_delivery/RELEASE_STATE.md)
- **Project health:** [STATUS.md](../../STATUS.md)
- **Deployment guide:** [DEPLOY.md](../../DEPLOY.md)
```

6. Verify all new links work

7. Commit with message: `docs(readme): update docs/README.md structure and quick links`

#### Acceptance Criteria

- [ ] All 10 directory categories listed in table
- [ ] Missing categories (05_operations, 10_planning) added
- [ ] Specs subcategories documented
- [ ] All quick links functional
- [ ] Current planning model up to date
- [ ] `pnpm lint` passes

#### Definition of Done

- docs/README.md accurately reflects repository structure
- All links verified working
- No outdated references remain
- Sprint QA Gate passed (G1-G8)

---

### **SPRINT S5: QA Gate & Final Merge** 🔒 UNIQUE

**Type:** Quality Assurance & Integration
**Parallel Execution:** 🔒 FORBIDDEN (requires S1-S4 completion)
**Estimated Effort:** 2-3 hours
**Priority:** 🔴 P0 (Critical Blocker)

#### Goal

Execute comprehensive QA gate validation for all documentation fixes and merge to main.

#### Scope

All changes from S1-S4, final validation, and merge.

#### Prerequisites

- ✅ S1 completed: All ADR links fixed
- ✅ S2 completed: STATUS.md updated
- ✅ S3 completed: DOCUMENT_REGISTER.md complete
- ✅ S4 completed: docs/README.md updated

#### Tasks

1. **Pre-QA Verification:**

```bash
# Verify all source branches merged
git log --oneline --grep="docs(register): fix 19 broken ADR"
git log --oneline --grep="docs(status): update STATUS.md"
git log --oneline --grep="docs(register): add 56 missing files"
git log --oneline --grep="docs(readme): update docs/README.md"
```

2. **Run Full Sprint QA Gate:**

```bash
pnpm sprint:qa -- --sprint DOC-AUDIT
```

Expected results:
- G1 (Lint): ✅ PASS
- G1b (TypeCheck): ✅ PASS
- G2 (Architecture): ✅ PASS
- G3 (Domain Tests): ✅ PASS
- G4 (Full Test Suite): ✅ PASS
- G5 (Security): ⚠️ WARN (acceptable)
- G6 (Docs Governance): ✅ PASS ← **Critical for this sprint**
- G7 (STATUS.md Checklist): ✅ PASS
- G8 (PROJECT_MAP Freshness): ✅ PASS

3. **Manual QA Checklist:**

| # | Check | Expected Result |
|---|-------|-----------------|
| 1 | DOCUMENT_REGISTER.md loads | All 152 entries visible |
| 2 | Random ADR link test | Click 5 ADR links, all open |
| 3 | STATUS.md accuracy | Shows v1.1.0-alpha.1 |
| 4 | docs/README.md structure | All 10 categories present |
| 5 | Broken link scan | Zero 404 errors |
| 6 | Duplicate detection | No duplicate register entries |

4. **Generate Final Audit Report:**

Create `docs/04_delivery/sprint-reviews/S_DOC_AUDIT_QA_REPORT.md` with:

```markdown
# Sprint QA Report: Documentation Audit Fix

**Sprint ID:** DOC-AUDIT
**Date:** 2026-05-18
**Commit:** <hash>
**Branch:** main

## Automated Gate Results

| Gate | Status | Duration | Notes |
|------|--------|----------|-------|
| G1 | ✅ PASS | XXs | No lint errors |
| G1b | ✅ PASS | XXs | Type checking clean |
| G2 | ✅ PASS | XXs | Architecture boundaries intact |
| G3 | ✅ PASS | XXs | Domain invariants verified |
| G4 | ✅ PASS | XXs | Full test suite green |
| G5 | ⚠️ WARN | XXs | X non-blocking warnings |
| G6 | ✅ PASS | XXs | All docs registered, owners assigned |
| G7 | ✅ PASS | XXs | STATUS.md checklist complete |
| G8 | ✅ PASS | XXs | PROJECT_MAP.md fresh |

## Manual QA Checklist

- [x] DOCUMENT_REGISTER.md complete (152/152 files)
- [x] All ADR links functional (26/26 working)
- [x] STATUS.md reflects v1.1 Alpha
- [x] docs/README.md structure accurate
- [x] No broken links detected
- [x] No duplicate entries

## Summary

**Total Files Registered:** 152
**Previously Unregistered:** 56 (now resolved)
**Broken Links Fixed:** 19
**Documentation Coverage:** 100%

## Sign-off

**QA Engineer:** @architect
**Date:** 2026-05-18
**Decision:** ✅ APPROVED FOR MERGE
```

5. **Final Commit & Push:**

```bash
git commit -m "chore(doc-audit): pass sprint QA gate for documentation audit fix"
git push origin main
```

6. **Update STATUS.md:**

Mark this sprint as completed:

```markdown
### Sprint DOC-AUDIT: Documentation Hardening (Completed ✅)
- [x] Fix broken ADR links
- [x] Complete DOCUMENT_REGISTER.md
- [x] Update docs/README.md structure
- [x] Validate all governance contracts
```

7. **Archive Sprint Plan:**

Move this document to archive:

```bash
mv docs/04_delivery/DOCUMENTATION_AUDIT_FIX_PLAN.md \
   docs/90_archive/DOCUMENTATION_AUDIT_FIX_PLAN_ARCHIVED_2026-05-18.md
```

#### Acceptance Criteria

- [ ] All 8 QA gates pass (G5 WARN acceptable)
- [ ] Manual QA checklist completed
- [ ] QA report generated and committed
- [ ] All changes merged to main
- [ ] STATUS.md updated with completion
- [ ] Sprint plan archived

#### Definition of Done

- Sprint QA Gate passed with zero FAIL statuses
- All documentation fixes live on main branch
- QA report stored in `docs/04_delivery/sprint-reviews/`
- This sprint plan archived per GOVERNANCE_PLAN.md §6 rule 4
- Next sprint can begin

---

## 4. Risk Assessment

### 4.1. Sprint Risks

| Sprint | Risk | Probability | Impact | Mitigation |
|--------|------|-------------|--------|------------|
| S1 | Wrong filename mapping | Low | Medium | Cross-reference with actual files |
| S2 | Outdated information persists | Medium | Low | Review with @product-owner |
| S3 | Incorrect status assignment | Medium | Medium | @architect review required |
| S4 | Missed directory category | Low | Low | Verify against filesystem |
| S5 | QA gate failure blocks merge | High | High | Fix issues before retry |

### 4.2. Dependency Risks

**S5 is marked as 🔒 UNIQUE** because:
- Requires all previous sprints to be complete
- Validates entire documentation system
- Any failure blocks project progress
- Cannot be parallelized with other work

### 4.3. Rollback Plan

If S5 QA gate fails repeatedly:

1. Identify failing gate(s)
2. Revert specific sprint(s) causing failure:
   ```bash
   git revert <commit-hash-s1|s2|s3|s4>
   ```
3. Fix issues in isolation
4. Re-attempt S5

---

## 5. Success Metrics

### 5.1. Quantitative Targets

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Documentation coverage | 63% | **100%** | Files in register / Total files |
| ADR link accuracy | 27% | **100%** | Working ADR links / Total ADRs |
| STATUS.md currency | v0.2.0 | **v1.1.0** | Version string matches reality |
| README.md accuracy | 8/10 categories | **10/10** | Categories present / Total |

### 5.2. Qualitative Targets

- AI agent can navigate documentation without confusion
- New developer onboarding time reduced
- Governance compliance automated via CI
- Zero ambiguity about document authority

---

## 6. Agent Instructions

### 6.1. Parallel Execution Guidelines

For S1-S4 (parallel allowed):

```markdown
IMPORTANT: Sprints S1, S2, S3, S4 are INDEPENDENT and can be executed simultaneously.

Each agent should:
1. Create separate feature branch: feat/doc-fix-s<N>
2. Complete only assigned sprint tasks
3. Run `pnpm lint` and `pnpm typecheck` locally
4. Submit PR with clear description
5. DO NOT wait for other sprints

S5 agent should:
1. Wait for ALL S1-S4 PRs merged
2. Execute QA gate on combined changes
3. Report any failures immediately
```

### 6.2. Quality Standards

Per EPIOS-04 §19 "Definition of Done":

- Code merged to main
- Tests pass (QA gate green)
- Docs updated if contract changed
- No secrets introduced
- Architecture rule not violated

### 6.3. Communication Protocol

- Each sprint updates its own issue in GitHub
- Blockers reported immediately via issue comments
- S5 agent coordinates with S1-S4 agents for timing
- Final sign-off by @architect required

---

## 7. Approval & Execution

### 7.1. Approval Checklist

This plan is approved when:

- [ ] @architect confirms sprint independence design
- [ ] @product-owner validates STATUS.md update scope
- [ ] @tech-writer accepts documentation fix responsibilities
- [ ] QA engineer available for S5 execution
- [ ] Timeline agreed upon (target: 2-3 days total)

### 7.2. Execution Timeline

**Day 1:**
- Morning: S1, S2, S3, S4 start (parallel)
- Afternoon: S1, S2 complete
- Evening: S3, S4 complete

**Day 2:**
- Morning: S5 QA gate execution
- Afternoon: Fix any issues found
- Evening: Final merge and archive

**Day 3 (buffer):**
- Contingency for QA gate failures
- Additional fixes if needed

---

## 8. References

| Document | Path |
|----------|------|
| GOVERNANCE_PLAN.md | `docs/00_project/GOVERNANCE_PLAN.md` |
| EPIOS-04 Engineering Process | `docs/01_foundation/EPIOS-04-engineering-process.md` |
| SPRINT_QA_REGULATION.md | `docs/04_delivery/SPRINT_QA_REGULATION.md` |
| DOCUMENT_REGISTER.md | `docs/00_project/DOCUMENT_REGISTER.md` |
| Documentation Audit Report | *(this plan's source)* |
| AGENT.md | `AGENT.md` |

---

*Plan created: 2026-05-18*
*Next review: After S5 completion*
*Supersedes: N/A (new plan)*
