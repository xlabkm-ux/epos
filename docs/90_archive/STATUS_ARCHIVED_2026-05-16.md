# 📊 PROJECT STATUS: Epistemic OS (epios)
> **Последнее обновление:** 2026-05-16  
> **Версия:** v0.1.0-alpha.2  
> **Фаза:** v1.1 Sprint Delivery (ADR Review MVP)  
> **Master QA Plan:** [`EPIOS_v1_1_Master_Sprint_QA_Plan.md`](docs/04_delivery/v1_1_qa_plan/EPIOS_v1_1_Master_Sprint_QA_Plan.md)  
> **Архив предыдущего статуса:** [`STATUS_ARCHIVED_2026-05-15.md`](docs/90_archive/STATUS_ARCHIVED_2026-05-15.md)

---

## 🎯 Текущий вердикт

Проект завершил **инфраструктурный цикл (Sprint A–F)** и переходит к **продуктовой разработке по v1.1 Sprint Map (S0–S7 + Pilot)**. Все базовые компоненты (Persistence, Domain, UI, MCP, QA) находятся в состоянии **✅ Ready**. Фокус — реализация сквозного ADR Review workflow от загрузки источника до финального артефакта.

---

## 🚦 Состояние компонентов

| Компонент | Статус | Краткое описание |
| :--- | :--- | :--- |
| **Persistence (Postgres)** | ✅ Ready | Все репозитории (Graph, Mission, Mapping, Governance) реализованы. InMemory-моки удалены. |
| **Domain Logic** | ✅ Ready | Сущности с инвариантами, оптимистичная конкурентность, Rich Domain Model. |
| **Application (Use Cases)** | ✅ Ready | Use cases подключены к Postgres-провайдеру через UoW. |
| **UI (Demo Shell)** | ✅ Ready | React UI интегрирован с API (без моков). |
| **MCP Bridge** | ✅ Ready | Nonce/Zod валидация, security-тесты. |
| **QA & CI** | ✅ Ready | `pnpm verify` проходит. Testcontainers настроены. |
| **Documentation** | ✅ Ready | Реестр нормализован, архив упорядочен. |

---

## 📅 Оперативный план: v1.1 Sprint Map

> **Источник:** `EPIOS_v1_1_Master_Sprint_QA_Plan.md`, раздел 3.  
> Все задачи дублируются в **GitHub Issues**. STATUS.md — стратегический обзор.  
> *⚠️ Спринты с пометкой `[🔒 УНИКАЛЬНЫЙ]` запрещают параллельную разработку.*

---

### Sprint S0: Governance + Shell Skeleton `[🔒 УНИКАЛЬНЫЙ]`
**Статус:** ✅ Завершен (в рамках Sprint A–F)
- [x] **Repo Governance:** CI, branch protection, `pnpm verify` pipeline.
- [x] **Demo Shell Init:** `apps/demo-shell` инициализирован, ADR Review Workspace skeleton виден.
- [x] **Dependency Boundaries:** Архитектурные границы между пакетами настроены.
- [x] **Smoke Tests:** Базовый `pnpm build` + `pnpm test` зелёный.

### Sprint S1: Contracts + Clickable Flow `[НЕЗАВИСИМЫЙ]`
**Статус:** ✅ Завершен (в рамках Sprint A–F)
- [x] **API Contracts:** Zod-схемы для Mission, Source, MappingRun зафиксированы.
- [x] **Mock ADR Flow:** UI показывает clickable mock end-to-end ADR Review.
- [x] **Contract Tests:** Валидация DTO и типизированных ошибок.

### Sprint S2: Core Domain + Persistence `[🔒 УНИКАЛЬНЫЙ]`
**Статус:** ✅ Завершен (в рамках Sprint A–F)
- [x] **Mission/Source/Rating Storage:** Postgres-репозитории реализованы и подключены.
- [x] **Domain Entities:** Mission, Evidence, Node — Rich Domain Model с инвариантами.
- [x] **Testcontainers:** Интеграционные тесты на эфемерной PostgreSQL.
- [x] **UI Panels:** Mission + Source + Rating панели подключены к реальным данным.

### Sprint S3: Async Mapping + Evidence `[🔒 УНИКАЛЬНЫЙ]`
**Статус:** ✅ Completed
- [x] **Async Run:** `RunMappingUseCase` возвращает `{ runId }` (202 Accepted). `workspaceId` включён в outbox payload.
- [x] **Outbox Worker:** Тип события унифицирован (`mapping_started`). `MappingProcessor` переведён на `UnitOfWorkPort`.
- [x] **Claims/Evidence Extraction:** Создаются `EpistemicNode` (claim) + 2x `EvidenceRef` за каждый шаг (5 шагов = 5 claims + 10 evidence). Ссылки `supportsNodeIds` связывают evidence→claim.
- [x] **SSE/Long-Polling:** Эндпоинт `GET /workspaces/:id/mapping/runs/:runId/stream` — стрим прогресса через SSE (1s интервал, 60s таймаут).
- [x] **Mapping Progress Panel:** `MappingPanel` обновляется в реальном времени через `EventSource`. Animated live card при активном run.
- [x] **PostgresEvidenceRepository:** Реализованы `saveRef`, `findRefById`, `findRefsByMissionId` (полный порт).
- [x] **QA:** `test:async`, outbox integration tests, SSE/polling tests.

### Sprint S4: Patch + Approval `[НЕЗАВИСИМЫЙ]`
**Статус:** ✅ Completed
- [x] **ArtifactPatch Lifecycle:** Релизованы rich-модели `ArtifactPatch` и `LivingArtifact`, обязательный `reason`, привязка к контексту.
- [x] **Approval Flow:** `ApprovalRequest` → `DecisionRecord`. Реализованы `ProposeArtifactPatch` и `ResolveApproval`.
- [x] **Policy Enforcement:** `PatchPolicyService` внедрён в `ApplyArtifactPatchUseCase`.
- [x] **UI Panels:** Patch Review + Approval панели в Demo Shell.
- [x] **QA:** Domain policy tests (`patch-policy.test.ts`), flow integration tests (`artifact-patch-flow.test.ts`).


### Sprint S5: Readiness + Artifact Version `[🔒 УНИКАЛЬНЫЙ]`
**Статус:** ✅ Completed
- [x] **ReadinessAssessment v0.1:** Три primary indicators. Numeric score де-эмфазирован (Gate 4).
- [x] **Apply Patch → Artifact Version:** Применение патча создаёт `ArtifactVersion` и фиксирует trace.
- [x] **Trace Summary:** Реализован `GetTraceSummaryUseCase` с человекочитаемым чейном событий.
- [x] **Hard Block:** Статус `blocked` при низком покрытии или отсутствии рисков/traceability (Gate 4).
- [x] **Final ADR Output:** Реализована генерация Markdown ADR с интеграцией в UI (Gate 5).
- [x] **QA:** Domain tests (`readiness.test.ts`), E2E full loop test (`adr_full_loop.spec.ts`).


### Sprint S6: Security + Retention `[НЕЗАВИСИМЫЙ]`
**Статус:** ✅ Completed
- [x] **Basic Roles:** viewer, contributor, approver — role-aware UI (RoleSwitcher).
- [x] **Soft Delete & Redaction:** Рекурсивное удаление Mission/Source, аудит-редакция TraceEvent.
- [x] **Secret Scan:** PII/Secret redaction utility интегрирована в репозиторий.
- [x] **UI:** Role-aware элементы и Persona Switcher в Demo Shell.
- [x] **QA:** Security smoke, authorization tests (SecurityContext).

### Sprint S7: RC + Pilot Pack `[🔒 УНИКАЛЬНЫЙ]`
**Статус:** ✅ Completed
- [x] **Docker Compose:** Production-ready `docker-compose.yml` (API + Postgres + Demo Shell).
- [x] **CI/CD Pipeline:** GitHub Actions: lint → build → test → deploy.
- [x] **Demo Fixture:** `fixtures/adr-review/` — каноническая fixture для event-sourcing ADR.
- [x] **Runbook:** Инструкции по развертыванию и демонстрации.
- [x] **Release Checklist:** Clean setup, seed/demo commands, known limitations.
- [x] **QA:** Release QA, usability metrics (happy path < 30 min, repeat < 15 min).

### Pilot: Field Validation
**Статус:** ⬜ Planned
- [ ] **Design Partner Pilot:** Пилотный запуск с реальными пользователями.
- [ ] **Feedback Collection:** Сбор обратной связи, usefulness rating ≥ 4/5.
- [ ] **Bug Fixes:** Исправление критических багов по результатам пилота.
- [ ] **Known Limitations Update:** Обновление документа ограничений.

---

## 🏁 Master Release Gates

> Из `EPIOS_v1_1_Master_Sprint_QA_Plan.md`, раздел 8.

| Gate | Описание | Спринт | Статус |
| :--- | :--- | :--- | :--- |
| **Gate 1** | Visible product from day one (Demo Shell + clickable flow) | S0–S1 | ✅ Passed |
| **Gate 2** | Architecture-honest async foundation (runId, outbox, SSE) | S3 | ✅ Passed |
| **Gate 3** | Governed artifact mutation (patch + approval + policy) | S4 | ✅ Passed |
| **Gate 4** | Readiness is useful, not false authority (3 indicators, no auto-approve) | S5 | ✅ Passed |
| **Gate 5** | Traceability (source → rating → mapping → patch → approval → version) | S5 | ✅ Passed |
| **Gate 6** | Pilot readiness (clean setup, demo fixture, < 30 min happy path) | S7 | ✅ Passed |

---

## ✅ Завершённые циклы

<details>
<summary><strong>Цикл 1: Инфраструктурный (Sprint A–F, v0.1.0-alpha.1)</strong> — завершён 2026-05-15</summary>

**Полный архив:** [`docs/90_archive/STATUS_ARCHIVED_2026-05-15.md`](docs/90_archive/STATUS_ARCHIVED_2026-05-15.md)

| Спринт | Название | Результат |
| :--- | :--- | :--- |
| A | Интеграция Persistence слоя | ✅ Завершен |
| B | Валидация и безопасность MCP | ✅ Завершен |
| C | UI De-mocking и Demo Shell | ✅ Завершен |
| D | Релизная документация и Handover | ✅ Завершен |
| E | Governance Persistence | ✅ Завершен |
| F | Infrastructure QA Hardening | ✅ Завершен |

</details>

---

## 📂 Навигация
- **Master QA Plan:** [`EPIOS_v1_1_Master_Sprint_QA_Plan.md`](docs/04_delivery/v1_1_qa_plan/EPIOS_v1_1_Master_Sprint_QA_Plan.md)
- **Проектный план:** [`V1_1_PROJECT_PLAN_ADR_REVIEW.md`](docs/04_delivery/V1_1_PROJECT_PLAN_ADR_REVIEW.md)
- **Реестр документов:** [`DOCUMENT_REGISTER.md`](docs/00_project/DOCUMENT_REGISTER.md)
- **Архив:** [`docs/90_archive/`](docs/90_archive/)
