# Changelog

All notable changes to the Epistemic OS (epios) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-rc.1] - 2026-05-15

### Added
- Initial project structure based on Hexagonal Architecture.
- Domain models for Epistemic Nodes, Governance Processes, and Living Artifacts.
- PostgreSQL infrastructure with transactional support (Unit of Work).
- Outbox pattern for background event processing.
- Secure MCP Bridge for frontend-to-backend communication.
- Zod-based API schema validation foundation.
- Comprehensive Governance-as-Code framework with document registration.
- CI/CD pipeline with security auditing and dependency boundary checks.

### Changed
- Migrated from ad-hoc documentation to a formal Registry and ADR-based decision process.
- Refactored anemic domain models to rich models with strict invariants.

### Fixed
- Resolved build-time export collisions for `ApprovalStatus` and `SourceRepositoryPort`.
- Fixed `packages/domain` test failures by reconciling `Mission` entity invariants.
- Remediated `packages/api` E2E regressions by updating mocks to match modernized domain models.
- Corrected application layer export mismatches (e.g., `AddSource` vs `IngestSource`).
- Implemented idempotency in `RunMappingUseCase`.
- Fixed documentation drift and inconsistent release statuses.

## [0.1.0-alpha] - 2026-05-10
- Initial bootstrap of the project.
