# RELEASE STATE: Epistemic OS (epios)

## 1. Current Release Overview

| Metric | Value |
|--------|-------|
| **Current Release** | v0.1.0-rc.1 |
| **Status** | `rc` (Release Candidate) |
| **Release Date** | 2026-05-15 |
| **Milestone** | MVP Stabilization |
| **GitHub Release** | [PUBLISHED] (v0.1.0-rc.1) |

## 2. Release Status Definitions
- `rc`: Release Candidate. Feature complete for scope, undergoing hardening.
- `accepted`: Production/Stable. Verified by full QA suite and accepted by stakeholders.
- `failed`: Release aborted due to critical P0 blockers.
- `superseded`: Replaced by a newer stable release.

## 3. Current Workstream
**Focus:** v0.2.0 ADR Review Hardening / v1.1 Alpha
- **Goal:** Dogfooding EPIOS for architecture decisions.
- **Sprint:** ADR-0099 Hardening (Closing)
- **Next Milestone:** v0.2.0 (Stable ADR Review Shell)

## 4. Previous Release Evidence
- **CI Run:** [GitHub Actions CI](https://github.com/xlabkm-ux/epios/actions/workflows/ci.yml)
- **QA Report:** [docs/04_delivery/qa/V1.0_QA_FINAL_REPORT.md](qa/V1.0_QA_FINAL_REPORT.md)
- **Known Limitations:** [docs/04_delivery/KNOWN_LIMITATIONS_V1_1_ALPHA.md](KNOWN_LIMITATIONS_V1_1_ALPHA.md)
- **Release Notes:** [CHANGELOG.md](../../CHANGELOG.md)

## 5. Next Release Target
- **Target:** v0.2.0
- **Scope:** Formal API Contracts, Zod Validation, Async Runtime Tests.
- **Estimated Date:** 2026-05-22
