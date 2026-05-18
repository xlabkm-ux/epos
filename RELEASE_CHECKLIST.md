# ✅ RELEASE CHECKLIST: v0.1.0-rc.1 (Pilot Pack)

## 🏗️ Infrastructure & Build
- [ ] `pnpm build` passes at the root.
- [ ] `docker build` succeeds for both `api` and `work-shell` targets.
- [ ] `docker compose up` starts all services without errors.
- [ ] Healthchecks for Postgres and API are passing.

## 🧪 Functional Verification (Scenario F)
- [ ] Workspace "Scenario F" is visible in the UI.
- [ ] Claims and Evidence for Scenario F are correctly rendered.
- [ ] Readiness assessment is calculated (no errors in console).
- [ ] Proposed patches are visible in the Patch Panel.
- [ ] Approval flow works correctly from end-to-end.
- [ ] Final ADR generation produces valid Markdown.

## 🔒 Security & Governance
- [ ] Role-switching correctly toggles UI permissions.
- [ ] PII/Secret redaction is active in Trace logs.
- [ ] Soft-delete works for missions/sources.

## 📄 Documentation
- [ ] `README.md` is up-to-date with Sprint S7 status.
- [ ] `DEPLOY.md` reflects the Docker-first approach.
- [ ] `RUNBOOK.md` exists and is verified.
- [ ] `STATUS.md` marks S7 as Completed.

## 🏁 Final Gate (Gate 6)
- [ ] Clean setup takes < 5 minutes.
- [ ] Happy path demo (Source -> Patch -> Approval -> ADR) takes < 15 minutes.
- [ ] System is stable under basic load (Pilot readiness).

---
**Sign-off:** Antigravity AI
**Date:** 2026-05-16
