Owner: @architect
Status: accepted

# Implementation Plan: Week 5 - MCP Apps & Approval Flow

This plan covers the integration of the Model Context Protocol (MCP) and the implementation of governance flows (Claims and Approvals) within Epistemic OS.

## Goals
- [x] **MCP Registry**: Establish a registry for managing MCP-compatible applications.
- [x] **Bridge Validation**: Implement secure communication between EPIOS core and MCP apps.
- [x] **Claim Flow**: Develop the `ClaimApp` for submitting evidence-based nodes.
- [x] **Approval Flow**: Develop the `ApprovalApp` for community-based node validation.
- [x] **Audit Trail**: Implement logging and auditing for all MCP-driven actions.

## Architecture
- **Protocol**: Model Context Protocol (MCP) over JSON-RPC / SSE.
- **Service Layer**: New services in `packages/application` to handle MCP app logic.
- **Infrastructure**: Concrete implementations in `packages/infrastructure-mcp`.
- **Domain**: Updates to `Mission` or new `Governance` aggregate to track approvals.

## Tasks

### 1. MCP Core Infrastructure
- [x] Implement `MCPAppRegistry` to track installed and active apps.
- [x] Create `MCPBridge` to map EPIOS domain events to MCP tool calls.
- [x] Implement capability discovery for MCP apps.
- [x] Add health checks and validation for external MCP connections.

### 2. Claim Application (ClaimApp)
- [x] Define the `Claim` domain model (extends `EpistemicNode`).
- [x] Implement `SubmitClaimUseCase`.
- [x] Create MCP tools for `submit_claim` and `add_evidence`.
- [x] UI: Add "Make a Claim" interface in the Mission Room.

### 3. Approval Application (ApprovalApp)
- [x] Define the `Approval` process (Pending, Approved, Rejected).
- [x] Implement `CastVoteUseCase`.
- [x] Create MCP tools for `review_claim` and `approve_claim`.
- [x] Implement automated approval thresholds (e.g., 2/3 majority).
- [x] UI: Add "Approval Queue" and voting buttons.

### 4. Audit & Observability
- [x] Integrate with `packages/observability` to log every MCP tool invocation.
- [x] Create an `AuditLog` entity in the persistence layer.
- [x] Implement a read-only audit view for mission transparency.

## Success Criteria
- MCP Apps can be registered and queried via the API.
- A user can submit a claim which appears in the "Pending Approval" state.
- Multiple users/agents can approve a claim, changing its state in the graph.
- All actions are recorded in the audit log with proper timestamps and actor IDs.

