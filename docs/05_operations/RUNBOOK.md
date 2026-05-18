**Owner**: @architect
**Status**: accepted_contract

# 📘 RUNBOOK: Epistemic OS (epios)

This runbook provides step-by-step instructions for deploying, seeding, and demonstrating the Epistemic OS MVP (v0.1.0-rc.1).

## 🚀 Deployment (Docker Compose)

The fastest way to get the system up and running is using Docker Compose.

### 1. Prerequisites
- Docker & Docker Compose installed.
- `.env` file configured (copy from `.env.example`).

### 2. Start the Environment
```bash
docker compose up -d
```
This will start:
- **Postgres**: [localhost:5432](localhost:5432)
- **API Server**: [localhost:3000](localhost:3000)
- **Demo Shell**: [localhost:5173](localhost:5173)

### 3. Initialize Data
Run the seed script to load the Pilot Pack fixtures:
```bash
docker exec -it epios-api pnpm --filter @epios/infrastructure-postgres seed
```

---

## 🧪 Demo Scenario: ADR Review (Scenario F)

Scenario F is the "Pilot Pack" designed to show the full E2E governance flow.

### Step 1: Access the Demo Shell
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 2: Select Scenario F
Choose **"Scenario F: ADR Review - Event Sourcing"** from the workspace list.

### Step 3: Review the Evidence Graph
- Observe the extracted claims (nodes) and evidence.
- Note the contradictions and supports between nodes.
- Check the **Readiness Panel** — it should show the current assessment status.

### Step 4: Propose a Patch
1. Go to the **Patch Panel**.
2. Observe the existing proposed patch: *"Add Snapshotting pattern to mitigate complexity"*.
3. Note the reason: *"Addressing the risk of increased complexity noted in Gate 4 review."*

### Step 5: Approve the Change
1. Switch your role to **Approver** (using the Role Switcher in the sidebar).
2. Go to the **Approval Panel**.
3. Locate the approval request for the patch.
4. Click **Approve**.

### Step 6: Verify Versioning & Traceability
- Once approved, the patch is applied.
- Check the **Trace Summary** to see the full chain of custody for this decision.

---

## 🛠️ Troubleshooting

### Database Reset
If you need to wipe everything and start clean:
```bash
docker compose down -v
docker compose up -d
docker exec -it epios-api pnpm --filter @epios/infrastructure-postgres migrate
docker exec -it epios-api pnpm --filter @epios/infrastructure-postgres seed
```

### Logs
View logs for all services:
```bash
docker compose logs -f
```

View logs for specific service:
```bash
docker compose logs -f api
```

---
*Last Updated: 2026-05-16*
