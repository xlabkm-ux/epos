# MCP Security Test Plan (MVP)

**Document ID**: `MCP-SEC-TEST-001`  
**Status**: accepted  
**Owner**: @architect  
**Target**: `packages/api/src/mcp-bridge` & `apps/demo-shell`

## 1. Objective
Ensure the integrity and confidentiality of communication between the Epistemic Shell (Host) and MCP Servers/Clients (Iframe/Process).

## 2. Threat Model (MCP Context)
- **Injection**: Malicious MCP messages bypassing Zod schemas.
- **Unauthorized Access**: MCP servers calling domain methods without capability grants.
- **Origin Spoofing**: Messages from untrusted origins or parent frames.
- **Data Leakage**: Sensitive epistemic data leaking through trace events or logs.

## 3. Test Cases

### T-SEC-01: Schema Validation (Zod)
- **Goal**: Verify all incoming MCP messages match `mcp-bridge/schemas.ts`.
- **Test**: Send malformed JSON, extra fields, and invalid types.
- **Expectation**: Immediate rejection with `E_INVALID_PROTOCOL`.

### T-SEC-02: Origin & Nonce Verification
- **Goal**: Prevent replay and spoofing attacks.
- **Test**: Send a valid message with an old nonce or incorrect `origin` header.
- **Expectation**: Rejection with `E_SECURITY_VIOLATION`.

### T-SEC-03: Capability Enforcement
- **Goal**: Ensure the MCP client can only call allowed methods.
- **Test**: Request `domain:admin:execute` from a client with only `domain:read` capabilities.
- **Expectation**: Rejection with `E_UNAUTHORIZED`.

### T-SEC-04: Data Redaction in Traces
- **Goal**: Ensure no PII or secrets are logged.
- **Test**: Trigger a trace event with a payload containing a simulated secret.
- **Expectation**: Trace output should show `[REDACTED]` or be filtered as per `DATA_RETENTION_AND_REDACTION_POLICY_MVP.md`.

## 4. Automated Verification
- **Command**: `pnpm test:security`
- **Tools**: Vitest (for unit tests), Gitleaks (for secret scanning).
- **CI Integration**: Blocking gate in `.github/workflows/ci.yml`.

## 5. Compliance
- [ ] Zod schemas cover 100% of MCP methods.
- [ ] Nonce generation uses `crypto.randomBytes`.
- [ ] Redaction policy is enforced at the `TraceEventEmitter` level.
