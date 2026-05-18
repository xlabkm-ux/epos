Owner: @architect
Status: accepted

# Demo Runbook: ADR Review Flow

## Introduction
This runbook guides you through the canonical ADR Review demonstration for Epistemic OS v1.1.

## Environment Setup
1. **Repository:** `C:\AG\epios`
2. **Commands:**
   - `pnpm db:reset` — Resets the database and seeds initial scenarios.
   - `pnpm dev` — Starts the API and Demo Shell.
3. **URL:** `http://localhost:5173`

## The Scenario: Event Sourcing ADR
**Goal:** Review a proposal for Event Sourcing and arrive at a more balanced "Append-Only Audit Trace" decision.

### Phase 1: Context & Source
1. Select **Scenario F: ADR Review - Event Sourcing** from the sidebar.
2. Observe the initial goal and constraints.
3. Review the **Event Sourcing Draft ADR** in the Sources panel.
4. Rate the source as **Reliable**.

### Phase 2: Epistemic Analysis
1. Trigger **Run Epistemic Mapping**.
2. Watch the graph expand as claims are extracted.
3. Verify the 3 key claims:
   - Perfect audit trail (Strong)
   - State reconstruction (Moderate)
   - Simplicity (Weak)

### Phase 3: Readiness Assessment
1. Open the **Readiness Panel**.
2. Note the `needs_review` status.
3. Highlight the warning: "Claim #3 is not backed by evidence".
4. Discuss the recommendation: "Narrowing the scope to an append-only audit log is recommended".

### Phase 4: Governance & Approval
1. Go to the **Governance Panel**.
2. Use the **Propose Patch** button.
3. Enter the corrective decision: "Adopt Append-Only Audit Trace instead of full ES".
4. (Role Play) Switch to **Admin** role.
5. Review and **Approve** the patch.

### Phase 5: Result & Trace
1. Verify the workspace status changed to `ready`.
2. View the **Final Artifact** (the versioned ADR).
3. Inspect the **Trace Summary** to show the full reasoning chain to the pilot user.

