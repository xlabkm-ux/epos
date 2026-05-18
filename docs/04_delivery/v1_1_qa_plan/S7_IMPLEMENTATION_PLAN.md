# Implementation Plan - Sprint S7: RC + Pilot Pack

## 1. Dockerization (Production-Ready)
- [ ] Create `Dockerfile` for the entire monorepo (optimized for production).
- [ ] Update `docker-compose.yml` to include:
    - `api` service (Node.js/Express)
    - `demo-shell` service (Static hosting/Nginx)
    - `postgres` (already exists, but harden config)
- [ ] Add healthchecks and dependency management (`depends_on` with healthchecks).

## 2. CI/CD Pipeline Hardening
- [ ] Update `.github/workflows/ci.yml` to include a `deploy` job (simulated or actual if target exists).
- [ ] Add a `containerize` job to verify Docker builds in CI.
- [ ] Ensure `pnpm verify` and `pnpm qa:adr-review` are blocking gates in CI.

## 3. Canonical Demo Fixture
- [ ] Refine `fixtures/adr-review/` to be the "one source of truth" for demo runs.
- [ ] Create a `seed:demo` script that loads these fixtures into the database.
- [ ] Ensure the fixture includes a complex ADR with multiple patches and approvals.

## 4. Runbook & Documentation
- [ ] Create `docs/05_operations/RUNBOOK.md` with step-by-step instructions for:
    - Clean setup.
    - Seeding demo data.
    - Performing a standard ADR review flow.
- [ ] Create `RELEASE_CHECKLIST.md` for v0.1.0-rc.1.

## 5. QA & Validation
- [ ] Verify the entire flow via `docker-compose up`.
- [ ] Run `pnpm qa:adr-review` against the dockerized environment.
- [ ] Document known limitations.

---

## 📅 Timeline
- **Phase 1: Infra** (Docker + Compose)
- **Phase 2: Data** (Fixtures + Seeding)
- **Phase 3: Pipeline** (CI/CD)
- **Phase 4: Docs** (Runbook + Checklist)
