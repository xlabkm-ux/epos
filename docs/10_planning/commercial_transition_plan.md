**Owner**: @architect
**Status**: accepted_contract

# 🏗️ Implementation Plan: Transition to Commercial-Ready Epistemic OS

This plan outlines the steps to move from simulated logic and mock data to a production-grade system with real authentication and full persistence.

## 1. Identity & Auth (Critical Path)
- [ ] **Real Login Flow**: Implement `POST /api/v1/auth/login` in the API.
- [ ] **JWT Integration**: Use JSON Web Tokens for session management instead of client-side local storage hacks.
- [ ] **Password Hashing**: Implement secure storage for user credentials.
- [ ] **AuthScreen Refactoring**: Replace simulated login with a real API call.

## 2. Infrastructure Hardening
- [ ] **Postgres Identity Repositories**:
    - [ ] `PostgresAssignmentRepository`
    - [ ] `PostgresOrgRepository`
- [ ] **Migration Scripts**: Ensure Drizzle schemas are fully synced with the production database.
- [ ] **Mode Switching**: Deprecate `EPIOS_DATABASE_MODE=mock` and enforce `DATABASE_URL` connectivity.

## 3. Governance & Security
- [ ] **RBAC Enforcement**: Finalize the `SecurityPort` implementation to check permissions against real database assignments.
- [ ] **PII Redaction**: Fully implement the `RedactNodeUseCase` for sensitive nodes in Postgres.
- [ ] **Audit Logging**: Ensure all security-sensitive actions are logged to a real audit table.

## 4. UX/UI Polish (Commercial Standard)
- [ ] **Form Validation**: Replace `prompt()` and `alert()` with custom Modal forms and Toast notifications.
- [ ] **Responsive Design**: Ensure full functionality on tablet and high-res displays.
- [ ] **Loading States**: Implement skeleton screens and loading indicators for all async operations.

## Next Step
I will begin by implementing the `PostgresAssignmentRepository` and `PostgresOrgRepository` to enable real identity management.
