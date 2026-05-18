# GitHub Issues Template: Documentation Audit Fix Sprints

Use these templates to create GitHub Issues for each sprint.

---

## Issue Template for S1: Fix Broken ADR Links

```markdown
---
title: "S1: Fix 19 broken ADR links in DOCUMENT_REGISTER.md"
labels: ["type:docs", "area:docs", "P0", "sprint:S1-doc-audit"]
assignees: []
---

## Goal

Fix all 19 broken ADR file references in `DOCUMENT_REGISTER.md` to match actual filenames in `docs/02_adrs/`.

## Scope

- **File:** `docs/00_project/DOCUMENT_REGISTER.md` (lines 25-50, ADR section)
- **Changes:** Update link text for 19 ADR entries only
- **No other changes allowed**

## Tasks

- [ ] Read current DOCUMENT_REGISTER.md ADR section
- [ ] Verify each ADR filename exists in docs/02_adrs/
- [ ] Update 19 broken links (see table below)
- [ ] Verify all links work after update
- [ ] Run `pnpm lint` locally
- [ ] Submit PR with message: `docs(register): fix 19 broken ADR links in DOCUMENT_REGISTER.md`

## Broken Links to Fix

| # | Current (Broken) | Correct Filename |
|---|------------------|------------------|
| 1 | `ADR-0002-close-chatavg-v2-3-development.md` | `ADR-0002-close-chatavg-v23-release-v24.md` |
| 2 | `ADR-0004-use-neutral-demo-shell.md` | `ADR-0004-neutral-demo-shell-first.md` |
| 3 | `ADR-0005-use-universal-mission-room.md` | `ADR-0005-universal-mission-room-mvp.md` |
| 4 | `ADR-0006-use-typescript-core.md` | `ADR-0006-typescript-core-go-rust-deferred.md` |
| 5 | `ADR-0007-use-postgresql-as-alpha-sor.md` | `ADR-0007-postgresql-alpha-system-of-record.md` |
| 6 | `ADR-0009-use-layered-hexagonal-architecture.md` | `ADR-0009-layered-hexagonal-architecture.md` |
| 7 | `ADR-0010-keep-domain-free-of-infra.md` | `ADR-0010-domain-free-of-infrastructure.md` |
| 8 | `ADR-0011-use-epistemicnode-as-core-primitive.md` | `ADR-0011-epistemic-node-core-primitive.md` |
| 9 | `ADR-0012-use-temporal-validity.md` | `ADR-0012-temporal-validity.md` |
| 10 | `ADR-0013-use-livingartifact-artifactpatch.md` | `ADR-0013-artifact-model.md` |
| 11 | `ADR-0014-use-approvalrequest-decisionrecord.md` | `ADR-0014-human-decisions.md` |
| 12 | `ADR-0018-treat-mcp-apps-as-untrusted-ui.md` | `ADR-0018-untrusted-mcp-ui.md` |
| 13 | `ADR-0021-keep-temporal-as-future-adapter.md` | `ADR-0021-temporal-future-adapter.md` |
| 14 | `ADR-0022-use-trace-events.md` | `ADR-0022-trace-events-observability.md` |
| 15 | `ADR-0023-use-fake-deterministic-model-provider.md` | `ADR-0023-fake-deterministic-provider.md` |
| 16 | `ADR-0024-do-not-import-chatavg.md` | `ADR-0024-no-chatavg-dependency.md` |
| 17 | `ADR-0025-reuse-chatavg-through-extraction.md` | `ADR-0025-reuse-strategy.md` |

## Acceptance Criteria

- [ ] All 19 ADR links point to existing files
- [ ] No broken links remain in ADR section
- [ ] Link format consistent with working examples
- [ ] `pnpm lint` passes
- [ ] Manual verification: click 5 random ADR links, all open correctly

## References

- Full plan: [DOCUMENTATION_AUDIT_FIX_PLAN.md](DOCUMENTATION_AUDIT_FIX_PLAN.md)
- Sprint QA Regulation: [SPRINT_QA_REGULATION.md](SPRINT_QA_REGULATION.md)
- Related: Closes #[S5-issue-number] (will be linked after creation)

## Notes

- This sprint is INDEPENDENT - can execute in parallel with S2, S3, S4
- Estimated effort: 2-3 hours
- Priority: P0 (Critical)
```

---

## Issue Template for S2: Update STATUS.md

```markdown
---
title: "S2: Update STATUS.md to v1.1 Alpha ADR Review phase"
labels: ["type:docs", "area:docs", "P1", "sprint:S2-doc-audit"]
assignees: []
---

## Goal

Update `STATUS.md` to reflect current project state (v1.1 Alpha, ADR Review phase).

## Scope

- **File:** `STATUS.md` (repository root)
- **Changes:** Update version, phase, roadmap; archive old sprints
- **No other changes allowed**

## Tasks

- [ ] Update header metadata to v1.1.0-alpha.1
- [ ] Replace "Current Verdict" section with ADR Review focus
- [ ] Update component status table for ADR Review components
- [ ] Archive old User Management sprints to docs/90_archive/
- [ ] Add new v1.1 roadmap section
- [ ] Update navigation links
- [ ] Run `pnpm lint` locally
- [ ] Submit PR with message: `docs(status): update STATUS.md to v1.1 Alpha ADR Review phase`

## Acceptance Criteria

- [ ] Header shows v1.1.0-alpha.1
- [ ] Old User Management sprints archived
- [ ] New v1.1 roadmap present
- [ ] All component statuses accurate
- [ ] Links to key documents work
- [ ] `pnpm lint` passes

## References

- Full plan: [DOCUMENTATION_AUDIT_FIX_PLAN.md](DOCUMENTATION_AUDIT_FIX_PLAN.md)
- Archive location: `docs/90_archive/STATUS_ARCHIVED_2026-05-18.md`

## Notes

- This sprint is INDEPENDENT - can execute in parallel with S1, S3, S4
- Estimated effort: 1-2 hours
- Priority: P1 (Important)
```

---

## Issue Template for S3: Complete DOCUMENT_REGISTER.md

```markdown
---
title: "S3: Add 56 missing files to DOCUMENT_REGISTER.md"
labels: ["type:docs", "area:docs", "P0", "sprint:S3-doc-audit"]
assignees: []
---

## Goal

Add all 56 unregistered markdown files to `DOCUMENT_REGISTER.md` with appropriate statuses.

## Scope

- **File:** `docs/00_project/DOCUMENT_REGISTER.md`
- **Changes:** Add 56 new entries across all categories
- **No other changes allowed**

## Tasks

- [ ] Run inventory to find all unregistered files
- [ ] Categorize files by directory and assign status
- [ ] Add entries to appropriate sections (SPECS, DELIVERY, OPERATIONS, PLANNING, REFERENCE, ARCHIVE)
- [ ] Ensure sequential ID numbering (continue from EPIOS-ARC-014)
- [ ] Verify all new links work
- [ ] Run `pnpm check:docs-governance` locally
- [ ] Submit PR with message: `docs(register): add 56 missing files to DOCUMENT_REGISTER.md`

## Missing Files by Category

### Category A: Specs (Status: reference or deferred)
- RFC_TEMPLATE.md
- data_architecture/*.md (4 files)
- scenarios/*.md (4 files)

### Category B: Delivery (Status: accepted_contract or reference)
- ADR_REVIEW_DEMO_SCRIPT.md
- KNOWN_LIMITATIONS_V1_1_ADR_REVIEW.md
- RELEASE_STATE.md
- SPRINT_QA_REGULATION.md
- V1_1_DECISION_LOG.md
- V1_1_MILESTONE_GATES.md
- V1_1_QA_INDEX.md
- V1_1_RELEASE_ACCEPTANCE_CRITERIA.md
- V1_1_RISK_REGISTER.md
- sprint-reviews/*.md (4 files)
- v1_1_qa_plan/S7_IMPLEMENTATION_PLAN.md

### Category C: Operations (Status: reference)
- RUNBOOK.md

### Category D: Planning (Status: deferred)
- commercial_transition_plan.md

### Category E: Reference (Status: deferred)
- ui_roadmap/00_ROADMAP_INDEX.md
- ui_roadmap/05_UI_DESIGN_SYSTEM_GUIDE.md
- ui_roadmap/06_UI_DEMO_INTERFACE_DESCRIPTION.md
- user_management/*.md (9 files)
- user_workflow/01_CORE_ROLES_AND_PERSONAS.md

### Category F: Archive (Status: archived)
- PROJECT_BACKLOG_LEGACY.md
- STATUS_ARCHIVED_*.md (2 files)
- backlog/*.md (2 files)
- delivery_legacy/*.md (11 files)
- qa_legacy/*.md (2 files)

## Acceptance Criteria

- [ ] All 152 markdown files have entries in register
- [ ] Each entry has correct status
- [ ] Each entry has owner assigned
- [ ] All links resolve correctly
- [ ] Sequential ID numbering maintained
- [ ] `pnpm check:docs-governance` passes
- [ ] No duplicate entries

## References

- Full plan: [DOCUMENTATION_AUDIT_FIX_PLAN.md](DOCUMENTATION_AUDIT_FIX_PLAN.md)
- Governance Plan: [GOVERNANCE_PLAN.md](../00_project/GOVERNANCE_PLAN.md)

## Notes

- This sprint is INDEPENDENT - can execute in parallel with S1, S2, S4
- Estimated effort: 4-6 hours (largest sprint)
- Priority: P0 (Critical)
```

---

## Issue Template for S4: Update docs/README.md

```markdown
---
title: "S4: Update docs/README.md structure and quick links"
labels: ["type:docs", "area:docs", "P2", "sprint:S4-doc-audit"]
assignees: []
---

## Goal

Update `docs/README.md` to accurately reflect current directory structure and add missing categories.

## Scope

- **File:** `docs/README.md`
- **Changes:** Update structure table, add quick links, update planning model
- **No other changes allowed**

## Tasks

- [ ] Update "Documentation Structure" table to include all 10 categories
- [ ] Add subsection details for Specs
- [ ] Add Quick Links for newly registered important documents
- [ ] Update "Current planning model" section
- [ ] Verify all new links work
- [ ] Run `pnpm lint` locally
- [ ] Submit PR with message: `docs(readme): update docs/README.md structure and quick links`

## Missing Categories to Add

- **Operations:** `docs/05_operations/` (reference)
- **Planning:** `docs/10_planning/` (deferred)

## New Quick Links to Add

- SPRINT_QA_REGULATION.md
- RELEASE_STATE.md

## Acceptance Criteria

- [ ] All 10 directory categories listed in table
- [ ] Missing categories (05_operations, 10_planning) added
- [ ] Specs subcategories documented
- [ ] All quick links functional
- [ ] Current planning model up to date
- [ ] `pnpm lint` passes

## References

- Full plan: [DOCUMENTATION_AUDIT_FIX_PLAN.md](DOCUMENTATION_AUDIT_FIX_PLAN.md)

## Notes

- This sprint is INDEPENDENT - can execute in parallel with S1, S2, S3
- Estimated effort: 1-2 hours
- Priority: P2 (Nice-to-have)
```

---

## Issue Template for S5: QA Gate & Final Merge 🔒 UNIQUE

```markdown
---
title: "🔒 S5: QA Gate validation and merge for documentation audit fix"
labels: ["type:test", "area:docs", "P0", "sprint:S5-doc-audit", "decision:adr-needed"]
assignees: ["@architect"]
---

## ⚠️ CRITICAL: UNIQUE SPRINT - NO PARALLEL EXECUTION

This sprint **REQUIRES** completion of S1, S2, S3, S4 before starting.

**DO NOT START THIS SPRINT UNTIL ALL PREVIOUS SPRINTS ARE MERGED TO MAIN.**

## Goal

Execute comprehensive QA gate validation for all documentation fixes and merge to main.

## Scope

- All changes from S1-S4
- Sprint QA Gate execution
- Final merge to main
- Archive sprint plan

## Prerequisites

- ✅ S1 completed: All ADR links fixed (PR merged)
- ✅ S2 completed: STATUS.md updated (PR merged)
- ✅ S3 completed: DOCUMENT_REGISTER.md complete (PR merged)
- ✅ S4 completed: docs/README.md updated (PR merged)

## Tasks

- [ ] Verify all S1-S4 PRs merged to main
- [ ] Run `pnpm sprint:qa -- --sprint DOC-AUDIT`
- [ ] Verify all 8 gates pass (G5 WARN acceptable)
- [ ] Complete manual QA checklist
- [ ] Generate QA report in docs/04_delivery/sprint-reviews/S_DOC_AUDIT_QA_REPORT.md
- [ ] Commit QA report
- [ ] Update STATUS.md to mark DOC-AUDIT sprint as completed
- [ ] Archive DOCUMENTATION_AUDIT_FIX_PLAN.md to docs/90_archive/
- [ ] Final push to main

## QA Gates Expected Results

| Gate | Expected Status | Notes |
|------|----------------|-------|
| G1 (Lint) | ✅ PASS | No lint errors |
| G1b (TypeCheck) | ✅ PASS | Type checking clean |
| G2 (Architecture) | ✅ PASS | Boundaries intact |
| G3 (Domain Tests) | ✅ PASS | Invariants verified |
| G4 (Full Test Suite) | ✅ PASS | All tests green |
| G5 (Security) | ⚠️ WARN | Non-blocking warnings OK |
| G6 (Docs Governance) | ✅ PASS | **CRITICAL** - All docs registered |
| G7 (STATUS.md) | ✅ PASS | Checklist complete |
| G8 (PROJECT_MAP) | ✅ PASS | Map fresh |

## Manual QA Checklist

- [ ] DOCUMENT_REGISTER.md loads (all 152 entries visible)
- [ ] Random ADR link test (5/5 working)
- [ ] STATUS.md accuracy (shows v1.1.0-alpha.1)
- [ ] docs/README.md structure (all 10 categories present)
- [ ] Broken link scan (zero 404 errors)
- [ ] Duplicate detection (no duplicate register entries)

## Acceptance Criteria

- [ ] All 8 QA gates pass (G5 WARN acceptable)
- [ ] Manual QA checklist completed
- [ ] QA report generated and committed
- [ ] All changes merged to main
- [ ] STATUS.md updated with completion
- [ ] Sprint plan archived

## If QA Gate Fails

1. Identify failing gate(s)
2. Create hotfix issue immediately
3. Revert problematic sprint(s) if needed
4. Fix issues in isolation
5. Re-run QA gate

## References

- Full plan: [DOCUMENTATION_AUDIT_FIX_PLAN.md](DOCUMENTATION_AUDIT_FIX_PLAN.md)
- Sprint QA Regulation: [SPRINT_QA_REGULATION.md](SPRINT_QA_REGULATION.md)
- Depends on: #S1-issue, #S2-issue, #S3-issue, #S4-issue

## Notes

- This sprint is 🔒 UNIQUE - NO parallel execution allowed
- Estimated effort: 2-3 hours (plus fix time if failures)
- Priority: P0 (Critical Blocker)
- Requires @architect sign-off
```

---

## How to Use These Templates

1. Copy each template into a separate GitHub Issue
2. Remove markdown code block markers (```)
3. Fill in assignees based on team availability
4. Link related issues using "Depends on" / "Blocks" relationships
5. Label with appropriate sprint tags
6. Set milestones if using GitHub Milestones feature

## Issue Relationships

```
S1 ──┐
S2 ──┤
S3 ──┼──> S5 (blocks until all complete)
S4 ──┘

S5 blocks: Any other development until QA gate passes
```

## Labels to Create

- `sprint:S1-doc-audit`
- `sprint:S2-doc-audit`
- `sprint:S3-doc-audit`
- `sprint:S4-doc-audit`
- `sprint:S5-doc-audit`
- `documentation-audit`
- `parallel-allowed`
- `unique-sprint`
