Owner: @architect
Status: accepted

# Epistemic OS Documentation

This directory contains the **Engineering and Development Documentation** for Epistemic OS.

## Authority Rule

Only documents with status `accepted` in **[DOCUMENT_REGISTER.md](00_project/DOCUMENT_REGISTER.md)** are binding.

Documents with status `reference`, `deferred`, `archived` or `superseded` must not be used as implementation instructions unless explicitly referenced by an accepted ADR, GitHub Issue or PR.

Roadmap documents are not backlog. Backlog lives in GitHub Issues.

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

### Specs Subcategories

- `docs/03_specs/` — Core contracts (ADR Review, API, Security)
- `docs/03_specs/data_architecture/` — Data structure definitions (deferred)
- `docs/03_specs/scenarios/` — Usage scenario descriptions (reference)

---

## Quick Links

1. **[DOCUMENT_REGISTER.md](00_project/DOCUMENT_REGISTER.md)**: The authoritative list of all documents.
2. **[GOVERNANCE_PLAN.md](00_project/GOVERNANCE_PLAN.md)**: The rules of project management.
3. **[OPEN_DECISIONS_REGISTER.md](00_project/OPEN_DECISIONS_REGISTER.md)**: Current pending decisions.
4. **[SPRINT_QA_REGULATION.md](04_delivery/SPRINT_QA_REGULATION.md)**: Mandatory QA gate process.
5. **[RELEASE_STATE.md](04_delivery/RELEASE_STATE.md)**: Current release status dashboard.
6. **[ADR_REVIEW_WORKFLOW_MVP.md](03_specs/ADR_REVIEW_WORKFLOW_MVP.md)**: Core MVP workflow.

## Current Planning Model

- **Operational planning:** GitHub Issues / sprints
- **Project planning:** [V1_1_PROJECT_PLAN_ADR_REVIEW.md](04_delivery/V1_1_PROJECT_PLAN_ADR_REVIEW.md)
- **v1.0 baseline:** [EPIOS-03-v1_0-mvp-scope.md](01_foundation/EPIOS-03-v1_0-mvp-scope.md)
- **v1.1 roadmap:** [EPIOS-v1_1-adr-review-roadmap.md](01_foundation/EPIOS-v1_1-adr-review-roadmap.md)
- **Release status:** [RELEASE_STATE.md](04_delivery/RELEASE_STATE.md)
- **Project health:** [STATUS.md](../../STATUS.md)
- **Deployment guide:** [DEPLOY.md](../../DEPLOY.md)
