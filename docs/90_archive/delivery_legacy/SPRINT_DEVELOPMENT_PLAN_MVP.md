# EPIOS v1.1 — развернутый поэтапный план спринтов разработки

**Документ:** `EPIOS-v1.1-SPRINT-DEVELOPMENT-PLAN`  
**Статус:** historical_delivery
**Binding Level:** Advisory
**Причина:** This plan contains outdated S0-S7 sprint structures that do not match the current technical reality (Skeleton vs Product). Superseded by [STATUS.md](../../STATUS.md).

> [!WARNING]
> This document is not the active backlog.
> Active sprint execution lives in GitHub Issues.
**Версия:** Draft 0.1  
**Дата:** 2026-05-13  
**Репозиторий:** `https://github.com/xlabkm-ux/epios`  
**Целевой горизонт:** 10 недель до v1.1 MVP/RC  
**Режим:** bootstrap alpha → управляемый delivery  
**Первый продуктовый shell:** `EpiOS for Engineering Decisions`  
**Базовый принцип:** минимально достаточная архитектура, затем расширяемый путь.

---

## 0. Executive summary

EPIOS v1.1 должен развиваться не как набор AI-фич, а как эпистемическая операционная система для управляемых корпоративных AI-assisted artifacts.

Ключевое отличие v1.1 от v1.0:

```text
v1.0:
situation → distinction → evidence → artifact → decision → action

v1.1:
situation → distinction → evidence → adequacy assessment → artifact patch
→ human decision → controlled action → trace with adequacy delta
```

Главная delivery-цель: довести текущий bootstrap alpha репозиторий до демонстрируемого, тестируемого и расширяемого v1.1 MVP, где пользователь может создать инженерную миссию, загрузить исходный артефакт, получить EpistemicNodes, EvidenceRefs, AdequacyAssessment, ArtifactPatch, Approval/Decision и видеть Trace + AdequacyDelta.

---

## 1. Результаты исследования текущего репозитория

### 1.1. Наблюдаемое состояние

По публичному GitHub-репозиторию на момент исследования:

- репозиторий публичный: `xlabkm-ux/epios`;
- ветка по умолчанию: `master`;
- видно 12 commits;
- Issues: 0;
- Pull Requests: 0;
- Releases: нет опубликованных релизов;
- присутствуют `.github`, `.husky`, `apps/demo-shell`, `packages`, `docs`, `tests/e2e`, `dev_studio`, `work_doc`;
- присутствуют `PROJECT_BACKLOG.md`, `PROJECT_MAP.md`, `AGENT.md`, `.dependency-cruiser.cjs`, `.dockerignore`, `playwright.config.ts`, `turbo.json`, `pnpm-lock.yaml`;
- README позиционирует проект как Epistemic Operating System v1.0, alpha/MVP development, internal development and architecture validation only;
- README указывает Universal Mission Room как MVP goal и Apache-2.0 как primary license.

### 1.2. Архитектурная оценка

Проект уже прошел стадию пустого bootstrap. Это не “создать репозиторий с нуля”, а “превратить alpha skeleton в управляемый execution repository”.

Сильные стороны:

- правильный domain-first / hexagonal вектор;
- monorepo уже создан;
- есть public-safe базовые файлы;
- есть dependency boundary tooling;
- есть Docker/PostgreSQL направление;
- есть Playwright/e2e инфраструктурные следы;
- есть backlog/map документы;
- концепция v1.1 логически расширяет v1.0, а не ломает ее.

Слабые места / риски:

- GitHub Issues и PRs пустые, значит delivery еще не управляется публичными work items;
- нет опубликованных release tags;
- branch `master`, а документы говорят о protected `main`; нужно выбрать один стандарт и зафиксировать;
- README говорит Node v20+, а проектные документы требуют привести runtime к единому стандарту; целевой стандарт лучше сделать Node 22 LTS;
- текущий репозиторий, вероятно, содержит ранние артефакты разработки (`playwright-report`, `test-results`), которые не должны быть источником истины;
- Adequacy Layer еще концепт, не контракт, не доменная модель, не persistence, не API.

---

## 2. Delivery thesis

### 2.1. Что строим

Строим v1.1 MVP как вертикальный slice:

```text
Engineering Decision Mission
→ Source Artifact Intake
→ Human Source Adequacy Rating
→ Epistemic Mapping
→ Evidence Coverage
→ AdequacyAssessment
→ ArtifactPatch
→ Approval / DecisionRecord
→ Apply Patch
→ Artifact Version
→ Trace + AdequacyDelta
```

### 2.2. Что не строим в v1.1 MVP

Не строим:

- enterprise SaaS;
- billing;
- multi-tenant auth;
- marketplace;
- произвольный sandbox execution;
- production-grade Temporal rollout;
- graph database;
- autonomous external write actions;
- универсальную отраслевую библиотеку шаблонов;
- сложную математическую “истину” вместо scoped adequacy.

### 2.3. Непереговорные инварианты

1. Domain rules живут в `packages/domain`, не в UI, SQL, LLM-provider или MCP iframe.
2. PostgreSQL — system of record, но не hidden domain model.
3. Любое meaningful artifact mutation требует epistemic reason, evidence/boundary context, decision state, patch history и adequacy impact assessment.
4. AdequacyScore — это scoped fitness score, а не абсолютная истинность.
5. HumanAdequacyRating для внешних исходных артефактов создается человеком; система может предлагать draft, но не делает его authoritative.
6. MCP Apps render/request only; write path всегда идет через typed backend command, policy, validation, idempotency, audit.
7. Любая side-effecting команда получает idempotency key.
8. Trace не хранит секреты, raw provider payloads и hidden prompts без redaction policy.

---

## 3. Целевая v1.1 архитектура по слоям

### 3.1. Domain

Ответственность:

- Mission / MissionRun;
- EpistemicGraph;
- EvidenceSet;
- LivingArtifact / ArtifactPatch;
- ApprovalRequest / DecisionRecord / ConflictCard;
- AdequacyProfile;
- HumanAdequacyRating;
- AdequacyAssessment;
- AdequacyDelta;
- AdequacyPolicy / ScoreLaunderingGuard;
- инварианты, state machines, domain errors, domain events.

Новые v1.1 domain modules:

```text
packages/domain/src/adequacy/
  AdequacyDimension.ts
  AdequacyProfile.ts
  HumanAdequacyRating.ts
  AdequacyAssessment.ts
  AdequacyDelta.ts
  AdequacyPolicy.ts
  AdequacyCalculationService.ts
  ScoreLaunderingGuard.ts
  errors.ts
  events.ts
```

### 3.2. Application

Ответственность:

- orchestration через use cases;
- транзакционные границы;
- policies;
- idempotency;
- trace event emission;
- mapping между API DTO и domain commands;
- вызов портов, но не provider SDK напрямую.

Новые use cases:

```text
CreateAdequacyProfile
ActivateAdequacyProfile
RateSourceAdequacy
CalculateArtifactAdequacy
CalculatePatchAdequacyDelta
GenerateAdequacyReport
GetAdequacyReadModel
```

### 3.3. Interfaces

Ответственность:

- API/BFF routes;
- DTO schemas;
- validation;
- Demo Shell;
- MCP App Host;
- AdequacyPanel / AdequacyReport UI;
- Engineering Decision templates.

Запрещено:

- бизнес-правила адекватности в React;
- approval bypass из UI;
- прямой доступ UI к repositories;
- прямой apply patch из iframe.

### 3.4. Infrastructure

Ответственность:

- PostgreSQL repositories;
- migrations;
- transaction manager;
- outbox;
- fake deterministic model provider;
- optional OpenAI-compatible adapter;
- MCP bridge validator;
- observability store;
- seed data.

Новые persistence areas:

```text
adequacy_dimensions
adequacy_profiles
adequacy_profile_dimensions
human_adequacy_ratings
adequacy_assessments
adequacy_dimension_scores
adequacy_penalties_applied
adequacy_caps_applied
adequacy_deltas
adequacy_report_snapshots
```

### 3.5. Tests

Обязательные классы тестов:

- unit: domain invariants;
- application: use case contract tests;
- integration: PostgreSQL repositories/migrations;
- contract: API DTO/error schemas;
- security: MCP bridge, approval bypass, redaction;
- e2e smoke: Engineering Decision demo flow;
- regression: adequacy formula, caps, penalties, hard blocks.

---

## 4. План спринтов

Формат: 10 недель, 1 спринт = 1 неделя. Если нужен более агрессивный режим, Sprint 0–2 можно объединить, но это повысит риск архитектурного долга.

---

# Sprint 0 — Stabilization & Delivery Governance

**Цель:** зафиксировать текущее состояние репозитория, убрать delivery-хаос, создать управляемый backlog и release gates.

**Почему первым:** без Issues, PR hygiene, milestones и branch/release policy дальнейшая разработка быстро превратится в набор несвязанных коммитов.

## Scope

### Repository governance

- Выбрать стандарт branch name: `main` или оставить `master`.
- Если оставляем `master`, обновить документы; если переходим на `main`, выполнить rename и настроить redirects.
- Включить branch protection:
  - PR required;
  - required CI;
  - squash merge;
  - no direct push;
  - linear history where practical.
- Создать GitHub milestones:
  - `v1.1-s0-governance`
  - `v1.1-s1-contracts`
  - `v1.1-s2-domain-persistence`
  - `v1.1-s3-adequacy-domain`
  - `v1.1-s4-api-usecases`
  - `v1.1-s5-shell`
  - `v1.1-s6-mcp-security`
  - `v1.1-s7-template-library`
  - `v1.1-s8-hardening`
  - `v1.1-s9-rc`

### Backlog

- Перенести `PROJECT_BACKLOG.md` в GitHub Issues.
- Завести labels:
  - `type:feature`, `type:bug`, `type:security`, `type:architecture`, `type:test`, `type:docs`, `type:infra`, `type:ux`, `type:release`;
  - `area:domain`, `area:adequacy`, `area:postgres`, `area:api`, `area:mcp`, `area:demo-shell`, `area:observability`, `area:security`;
  - `P0`, `P1`, `P2`, `P3`;
  - `status:ready`, `status:blocked`, `status:review`, `status:done`.

### Documentation source of truth

- Создать/обновить `docs/00_project/DOCUMENT_REGISTER.md`.
- Создать `docs/00_project/OPEN_DECISIONS_REGISTER.md`.
- Принять `EPIOS-09` как authoritative ADR index.
- Синхронизировать `EPIOS` vs `EPOS` naming: выбрать публичное имя `EPIOS`, а `epos` оставить только если это intentional package/repo shorthand.

### CI / hygiene

- Проверить `.github/workflows`.
- CI минимум:
  - install;
  - lint;
  - typecheck;
  - unit tests;
  - dependency boundary check;
  - secret scan;
  - build.
- Исключить generated reports из Git, если они не нужны в репозитории:
  - `playwright-report/`;
  - `test-results/`.

## Deliverables

- GitHub milestones созданы.
- Issues созданы из backlog.
- Branch protection включен.
- `DOCUMENT_REGISTER.md` обновлен.
- `OPEN_DECISIONS_REGISTER.md` создан.
- CI baseline зеленый.
- `.gitignore`/`.dockerignore` очищены.
- `PROJECT_MAP.md` отражает фактическую структуру.

## Acceptance criteria

```text
[ ] В GitHub есть активный backlog минимум на Sprint 1–3.
[ ] Любая новая работа идет через Issue + PR.
[ ] main/master защищен.
[ ] CI запускается на PR.
[ ] Dependency boundary check включен в CI или явно запланирован на Sprint 1 как P0.
[ ] Документы не противоречат branch/runtime/license decisions.
[ ] Нет committed generated test reports, если они не нужны как fixtures.
```

## Suggested PRs

1. `chore(repo): align branch governance and project metadata`
2. `docs(project): add document and decision registers`
3. `chore(ci): enforce baseline delivery gates`
4. `chore(repo): clean generated artifacts and ignore rules`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Команда продолжит прямые коммиты | High | branch protection |
| Документы расходятся с кодом | High | register + docs owner |
| CI медленный/ломкий | Medium | staged gates: baseline now, full release later |

---

# Sprint 1 — Executable Contracts & v1.1 Specification

**Цель:** превратить v1.1 концепт Adequacy Layer в исполняемые контракты: domain contracts, API schemas, events, errors, persistence draft.

## Scope

### Specs

Создать:

```text
docs/03_specs/ADEQUACY_DOMAIN_CONTRACTS.md
docs/03_specs/API_CONTRACTS_V1_1.md
docs/03_specs/APPLICATION_USE_CASE_CONTRACTS_V1_1.md
docs/03_specs/ERROR_CATALOG.md
docs/03_specs/TRACE_EVENT_CATALOG.md
docs/03_specs/ADEQUACY_EVENT_CATALOG.md
docs/03_specs/ENGINEERING_DECISION_TEMPLATE_CONTRACT.md
```

### Adequacy contracts

Зафиксировать:

- `AdequacyDimension`;
- `AdequacyProfile`;
- `AdequacyProfileDimension`;
- `HumanAdequacyRating`;
- `AdequacyAssessment`;
- `DimensionScore`;
- `AdequacyPenalty`;
- `AdequacyCap`;
- `AdequacyHardBlock`;
- `AdequacyDelta`;
- `AdequacyReport`.

### Error catalog additions

Добавить ошибки:

```text
ADEQUACY_PROFILE_NOT_ACTIVE
ADEQUACY_PROFILE_VERSION_REQUIRED
ADEQUACY_SCORE_OUT_OF_RANGE
HUMAN_RATING_REQUIRED
HUMAN_RATING_RATIONALE_REQUIRED
HUMAN_RATING_IMMUTABLE
ADEQUACY_HARD_BLOCKED
ADEQUACY_CAP_APPLIED
ADEQUACY_ASSESSMENT_BASIS_REQUIRED
SCORE_LAUNDERING_BLOCKED
SOURCE_RATING_TOO_LOW
TEMPLATE_PROFILE_MISMATCH
```

### Trace events

Добавить события:

```text
adequacy.profile_created
adequacy.profile_activated
adequacy.human_rating_created
adequacy.assessment_calculated
adequacy.cap_applied
adequacy.penalty_applied
adequacy.hard_block_triggered
adequacy.delta_calculated
adequacy.report_generated
```

### ADRs

Создать ADR:

```text
ADR-0027-adequacy-layer-in-v1-1.md
ADR-0028-scoped-adequacy-score-not-truth-score.md
ADR-0029-human-source-rating-for-external-artifacts.md
ADR-0030-score-laundering-guard.md
ADR-0031-engineering-decisions-first-product-shell.md
```

## Deliverables

- v1.1 contracts в `docs/03_specs`.
- ADR-0027..0031.
- Обновленный `DOCUMENT_REGISTER.md`.
- Contract test skeletons.

## Acceptance criteria

```text
[ ] Все новые v1.1 сущности имеют публичный контракт.
[ ] Для каждой write-команды определен idempotency behavior.
[ ] Для каждой domain error есть API mapping.
[ ] Для каждого significant event есть trace event schema.
[ ] AdequacyScore описан как scoped score, не truth score.
[ ] Engineering Decision Profile v0.1 описан как versioned template/profile.
```

## Suggested PRs

1. `docs(adequacy): add v1.1 domain contracts`
2. `docs(api): add v1.1 api and use case contracts`
3. `docs(adr): record adequacy layer decisions`
4. `test(contract): add adequacy contract test skeletons`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Adequacy превратится в произвольную метрику | High | ADR: scoped, versioned, explained score |
| Формула будет слишком сложной | Medium | v0.1 formula only; advanced methods deferred |
| Контракты не связаны с кодом | High | skeleton tests + CI TODO gates |

---

# Sprint 2 — Core Domain & Persistence Completion

**Цель:** довести v1.0 core domain/persistence до состояния, на которое можно безопасно посадить Adequacy Layer.

## Scope

### Domain

Реализовать или стабилизировать:

- Mission aggregate;
- MissionRun state machine;
- EpistemicNode;
- ReasoningEdge;
- DomainBoundary;
- Source;
- EvidenceRef;
- LivingArtifact;
- ArtifactPatch;
- ApprovalRequest;
- DecisionRecord;
- ConflictCard minimal.

### Persistence

Проверить/добавить миграции:

```text
0001_create_core_tables
0002_create_epistemic_tables
0003_create_evidence_tables
0004_create_artifact_tables
0005_create_decision_approval_tables
0006_create_runtime_tables
0007_add_trace_indexes
0008_seed_demo_data_optional
```

### Repository contracts

Порты:

- `MissionRepositoryPort`;
- `MissionRunRepositoryPort`;
- `EpistemicGraphRepositoryPort`;
- `EvidenceRepositoryPort`;
- `ArtifactRepositoryPort`;
- `ApprovalRepositoryPort`;
- `DecisionRepositoryPort`;
- `TraceEventRepositoryPort`;
- `IdempotencyRepositoryPort`.

### Tests

P0 invariant tests:

- mission without goal cannot run;
- invalid MissionRun transition rejected;
- terminal run cannot transition;
- strong system node without evidence rejected/downgraded;
- invalid citation cannot support strong node;
- patch without reason rejected;
- patch without node/decision refs rejected;
- high-risk patch requires approval;
- approval cannot resolve twice with different outcome;
- patch baseVersion conflict rejected;
- cross-mission edge rejected.

## Deliverables

- Core domain implemented.
- PostgreSQL repositories implemented or stabilized.
- Migrations apply cleanly.
- Repository integration tests green.
- Seed data for Engineering Decision scenario begins.

## Acceptance criteria

```text
[ ] Mission persists and reloads.
[ ] MissionRun state persists and rejects invalid transitions.
[ ] EpistemicNode/EvidenceRef can be persisted and linked.
[ ] ArtifactPatch can be proposed but not applied without required approval.
[ ] ApprovalRequest resolves into DecisionRecord.
[ ] TraceEvents are written for major mutations.
[ ] Idempotency conflicts are tested.
[ ] Domain package has no infrastructure imports.
```

## Suggested PRs

1. `feat(domain): stabilize mission and run aggregates`
2. `feat(domain): implement epistemic graph invariants`
3. `feat(domain): implement artifact and approval policies`
4. `feat(postgres): add core persistence migrations and repositories`
5. `test(postgres): add repository integration tests`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Схема БД разрастется | Medium | только MVP tables, no premature normalization |
| Domain rules уйдут в repositories | High | invariant tests in domain package |
| Миграции будут ломаться | High | clean DB migration CI job |

---

# Sprint 3 — Adequacy Domain Kernel

**Цель:** реализовать Adequacy Layer как domain-first модуль без UI/API шума.

## Scope

### Domain entities

Реализовать:

- `AdequacyDimension`;
- `AdequacyProfile`;
- `AdequacyProfileDimension`;
- `HumanAdequacyRating`;
- `AdequacyAssessment`;
- `AdequacyDelta`;
- `AdequacyReportSnapshot`.

### Domain services

Реализовать:

```text
AdequacyProfilePolicy
HumanRatingPolicy
AdequacyCalculationService
AdequacyPenaltyEvaluator
AdequacyCapEvaluator
AdequacyHardBlockEvaluator
ScoreLaunderingGuard
AdequacyDeltaService
```

### Engineering Decision Profile v0.1

Seed profile:

| Dimension | Weight |
|---|---:|
| Evidence Coverage | 20 |
| Traceability | 15 |
| Boundary Clarity | 10 |
| Consistency | 15 |
| Risk Handling | 15 |
| Decision Quality | 10 |
| Completeness | 10 |
| Temporal Freshness | 5 |

Hard blocks:

- artifact mutation without trace;
- high-risk patch without approval;
- external write without idempotency key;
- missing active profile version.

Caps:

- key source average below 50 → max 70;
- unresolved critical conflict → max 60;
- more than 30% hypothesis-only key claims → max 75;
- high-risk decision without rationale → max 80.

Penalties:

- strong claim without evidence → downgrade or -15;
- stale source without boundary → -10;
- decision without rationale → -8;
- unresolved high conflict → -20.

### Tests

Unit tests:

- score 0..100 clamp;
- weight sum handling;
- inactive profile rejected;
- human rating cannot be created by system actor;
- human rating requires rationale for low/high scores;
- human rating immutable;
- derived assessment requires source rating or explicit absence explanation;
- hard block prevents promotion regardless of score;
- cap prevents score laundering;
- approval improves Decision Quality only, not Evidence Coverage;
- delta shows before/after dimensions.

## Deliverables

- `packages/domain/src/adequacy` implemented.
- Engineering Decision Adequacy Profile seed in domain/test fixtures.
- Adequacy domain tests green.

## Acceptance criteria

```text
[ ] AdequacyScore is always scoped by profileId + methodVersion + missionId.
[ ] Final score cannot exceed cap rules.
[ ] Hard blocks stop promotion/apply workflow.
[ ] Human source ratings are immutable.
[ ] System-calculated assessments include basis/explanation.
[ ] AdequacyDelta records before/after score and affected dimensions.
```

## Suggested PRs

1. `feat(domain): add adequacy profile and dimension model`
2. `feat(domain): add human adequacy rating invariants`
3. `feat(domain): implement adequacy calculation service`
4. `feat(domain): add score laundering guard and delta service`
5. `test(domain): add adequacy invariant matrix`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Numeric score создает ложную авторитетность | High | scoped score + explanation + caps + ADR |
| Формула становится слишком политической | Medium | profile versioning + human override later |
| Adequacy блокирует MVP | Medium | v0.1 deterministic formula, advanced evals later |

---

# Sprint 4 — Adequacy Persistence & Read Models

**Цель:** сохранить Adequacy Layer в PostgreSQL, обеспечить транзакционную связь с Mission, Source, ArtifactPatch, TraceEvent.

## Scope

### Migrations

Добавить:

```text
0009_create_adequacy_profiles
0010_create_human_adequacy_ratings
0011_create_adequacy_assessments
0012_create_adequacy_deltas
0013_seed_engineering_decision_profile
```

### Tables

Минимальный набор:

```sql
adequacy_dimensions
adequacy_profiles
adequacy_profile_dimensions
adequacy_penalty_rules
adequacy_cap_rules
adequacy_hard_block_rules
human_adequacy_ratings
human_adequacy_rating_dimensions
adequacy_assessments
adequacy_assessment_dimensions
adequacy_applied_penalties
adequacy_applied_caps
adequacy_deltas
adequacy_delta_dimensions
adequacy_report_snapshots
```

### Repository ports

Добавить:

```text
AdequacyProfileRepositoryPort
HumanAdequacyRatingRepositoryPort
AdequacyAssessmentRepositoryPort
AdequacyDeltaRepositoryPort
AdequacyReportRepositoryPort
```

### Transaction boundaries

Use cases later должны иметь возможность выполнять:

```text
rate source
→ insert human rating
→ emit trace event
→ commit

calculate patch adequacy
→ insert assessment
→ insert delta
→ insert trace event
→ optionally enqueue outbox
→ commit
```

### Read models

Создать read model:

```text
MissionAdequacyReadModel
ArtifactAdequacyReadModel
PatchAdequacyReadModel
AdequacyReportReadModel
```

## Deliverables

- Adequacy migrations.
- Repositories.
- Integration tests.
- Seed Engineering Decision profile.
- Read model query functions.

## Acceptance criteria

```text
[ ] Migrations apply on clean DB.
[ ] Engineering Decision Profile v0.1 is seeded once idempotently.
[ ] Human ratings persist with actor/rationale/profile version.
[ ] Assessments persist with dimensions, penalties, caps and explanation.
[ ] Deltas link to trace events where available.
[ ] Repository tests cover idempotency and optimistic concurrency where relevant.
[ ] Trace payload redaction policy is respected.
```

## Suggested PRs

1. `feat(postgres): add adequacy profile migrations`
2. `feat(postgres): add adequacy assessment repositories`
3. `feat(postgres): seed engineering decision adequacy profile`
4. `test(postgres): cover adequacy persistence integration`
5. `feat(read-model): add mission adequacy read models`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Too many tables too early | Medium | keep relational identity, JSONB only for explanation snapshots |
| Score recalculation inconsistency | High | store methodVersion + input refs + sourceRatingRefs |
| Seed drift | Medium | idempotent seeds and profile versioning |

---

# Sprint 5 — Application Use Cases & API v1.1

**Цель:** открыть v1.1 через typed use cases и API/BFF, сохранив transaction, idempotency, policy, trace.

## Scope

### Use cases

Реализовать:

```text
CreateMission
UpdateMissionBrief
IngestSource
RateSourceAdequacy
RunEpistemicMapping
CreateEvidenceRefs
ProposeArtifactPatch
CalculatePatchAdequacy
CreateApprovalRequest
ResolveApproval
ApplyArtifactPatch
CalculateArtifactAdequacy
GenerateAdequacyReport
GetMissionReadModel
GetTraceForMission
GetAdequacyReadModel
```

### API routes

Минимально:

```text
POST /v1/missions
PATCH /v1/missions/:missionId/brief
POST /v1/missions/:missionId/sources
POST /v1/missions/:missionId/sources/:sourceId/adequacy-ratings
POST /v1/missions/:missionId/runs/mapping
POST /v1/missions/:missionId/artifacts/:artifactId/patches
POST /v1/missions/:missionId/patches/:patchId/adequacy-assessments
POST /v1/approvals/:approvalId/resolve
POST /v1/patches/:patchId/apply
GET /v1/missions/:missionId/read-model
GET /v1/missions/:missionId/trace
GET /v1/missions/:missionId/adequacy
GET /v1/missions/:missionId/adequacy-report
```

### DTO validation

Использовать explicit schemas. Рекомендуется Zod или TypeBox, но не смешивать без причины.

### Error mapping

Все ошибки возвращают:

```ts
type ErrorResponse = {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    correlationId: string;
    details?: unknown;
  };
};
```

### Trace

Каждый use case пишет trace events:

- mission.created;
- source.ingested;
- adequacy.human_rating_created;
- epistemic.node_created;
- artifact.patch_proposed;
- adequacy.assessment_calculated;
- approval.created;
- approval.resolved;
- artifact.patch_applied;
- adequacy.delta_calculated.

## Deliverables

- Application services.
- API routes.
- DTO schemas.
- API smoke tests.
- Contract tests.
- Trace emission.
- Idempotency service integration.

## Acceptance criteria

```text
[ ] API can execute full non-UI Engineering Decision flow.
[ ] All write commands accept or derive idempotency key as specified.
[ ] High-risk patch cannot apply without approval.
[ ] Patch application triggers adequacy delta calculation.
[ ] API returns typed errors with correlationId.
[ ] Contract tests cover v1.1 DTOs.
[ ] Fake deterministic provider path works without secrets.
```

## Suggested PRs

1. `feat(app): add adequacy use cases`
2. `feat(api): expose adequacy v1.1 routes`
3. `feat(app): integrate adequacy with patch approval flow`
4. `test(api): add v1.1 contract and smoke tests`
5. `feat(observability): emit adequacy trace events`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Use cases станут god services | High | one use case = one workflow boundary |
| API начнет принимать domain shortcuts | Medium | DTO → command mapping only |
| Idempotency забыта в новых write routes | High | contract test per write command |

---

# Sprint 6 — Demo Shell: Engineering Decisions Product Slice

**Цель:** сделать первый понятный shell: `EpiOS for Engineering Decisions`, не как generic admin UI, а как безопасный интерфейс поверх Core.

## Scope

### UI areas

```text
Engineering Decision Workspace
Mission Brief Builder
Source Intake Panel
Human Source Adequacy Rating Panel
Epistemic Map / Claim List
Evidence Viewer Panel
Artifact Workspace
Patch Review Panel
Adequacy Panel
Approval Panel
Trace + Adequacy Delta Drawer
```

### Scenario templates

Добавить шаблоны:

1. ADR review;
2. RFC review;
3. Architecture Note improvement;
4. Technical Decision Memo.

### User flow

```text
Create Engineering Decision Mission
→ select template
→ paste/source upload text
→ rate source adequacy
→ run mapping
→ inspect nodes/evidence
→ generate patch
→ see adequacy assessment
→ approve/reject
→ apply patch
→ see final artifact version and adequacy delta
```

### UI rules

- UI не рассчитывает authoritative adequacy score.
- UI показывает score basis, penalties, caps, hard blocks.
- UI явно показывает profile version.
- UI не скрывает unresolved conflicts.
- UI не делает direct patch apply без backend use case.

## Deliverables

- Working shell flow.
- Engineering Decision templates.
- Adequacy panel.
- Trace delta drawer.
- UI smoke tests.
- Basic accessibility pass.

## Acceptance criteria

```text
[ ] User can complete one Engineering Decision scenario end-to-end.
[ ] Human Source Adequacy Rating is captured before derived artifact assessment.
[ ] Adequacy Panel shows dimensions, weights, penalties, caps and finalScore.
[ ] Patch Review shows why patch is proposed and what adequacy impact is expected.
[ ] Approval flow uses backend API.
[ ] Page reload preserves mission/artifact state.
[ ] UI has no direct repository/database dependency.
```

## Suggested PRs

1. `feat(shell): add engineering decision workspace`
2. `feat(shell): add source rating and adequacy panel`
3. `feat(shell): add patch review and approval flow`
4. `feat(shell): add trace adequacy delta drawer`
5. `test(e2e): add engineering decision happy path`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Shell станет product UI rabbit hole | Medium | focus on one end-to-end scenario |
| Score misunderstood by user | High | explanation, profile scope, caps visible |
| UI bypasses backend policy | High | API-only mutation, e2e/security tests |

---

# Sprint 7 — MCP Apps & Security for v1.1

**Цель:** интегрировать MCP Apps как untrusted interactive views, включая AdequacyViewer, без передачи бизнес-правил в iframe.

## Scope

### Existing MVP apps

Стабилизировать:

- ClaimApp;
- EvidenceViewer;
- ApprovalApp.

### New v1.1 app

Добавить:

```text
AdequacyViewerApp
```

Responsibility:

- render AdequacyAssessment;
- show dimensions/weights;
- show penalties/caps/hard blocks;
- request report detail;
- never calculate or mutate score directly.

Allowed actions:

```text
read.adequacy
request.adequacy_report
```

Not allowed:

```text
change score
override score
approve patch
apply patch
modify profile
hide hard block
```

### Bridge

Расширить MCPBridgeMessage types:

```text
adequacy.report.requested
adequacy.assessment.viewed
```

Capabilities:

```text
read.adequacy
request.adequacy_report
```

### Security tests

Добавить к P0 matrix:

- AdequacyViewer cannot submit approval.resolve;
- AdequacyViewer cannot mutate profile;
- forged `finalScore` from iframe ignored/rejected;
- app cannot hide hard block by sending altered payload;
- invalid origin rejected;
- nonce replay rejected;
- command without capability rejected;
- raw hidden prompt/secret not present in app state.

## Deliverables

- MCP manifest updates.
- AdequacyViewerApp.
- Bridge schema updates.
- Capability tests.
- Security tests in CI.

## Acceptance criteria

```text
[ ] ClaimApp/EvidenceViewer/ApprovalApp still work.
[ ] AdequacyViewer renders assessment from backend state.
[ ] AdequacyViewer cannot mutate score/profile/approval.
[ ] All MCP write-capable paths require backend command + policy + idempotency.
[ ] P0 MCP security tests pass.
[ ] Audit events emitted for accepted/rejected MCP messages.
```

## Suggested PRs

1. `feat(mcp): add adequacy viewer manifest and capabilities`
2. `feat(mcp): implement adequacy viewer app`
3. `security(mcp): extend bridge tests for adequacy payload spoofing`
4. `test(e2e): cover mcp approval and adequacy viewer flow`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| iframe becomes trusted calculation surface | High | backend-only assessment, app read-only |
| Capability model too permissive | High | least privilege grants, negative tests |
| Security tests delayed | High | CI gate before RC |

---

# Sprint 8 — Template Library v0.1 & Adequacy Reports

**Цель:** оформить Engineering Decisions как первый product/template package, а не хардкод в UI.

## Scope

### Template model

Ввести `TemplateDefinition`:

```ts
type TemplateDefinition = {
  templateId: string;
  code: string;
  version: string;
  name: string;
  missionType: string;
  artifactTypes: string[];
  briefSchema: unknown;
  requiredSourceTypes: string[];
  adequacyProfileId: string;
  riskPolicyId: string;
  approvalPolicyId: string;
  artifactTemplateRefs: string[];
  mcpAppComposition: string[];
  seedExampleRefs: string[];
  acceptanceCriteria: string[];
  status: 'draft' | 'active' | 'deprecated';
};
```

### Templates

Seed active templates:

```text
engineering-adr-review-v0-1
engineering-rfc-review-v0-1
engineering-architecture-note-v0-1
engineering-decision-memo-v0-1
```

### Adequacy Report

Generate report with:

- mission summary;
- profile/version;
- source ratings;
- assessment dimensions;
- penalties/caps/hard blocks;
- before/after delta;
- unresolved conflicts;
- approval/decision records;
- recommended next actions;
- limitations.

### Export

Minimum:

- markdown report;
- JSON snapshot.

## Deliverables

- Template contracts.
- Template seed data.
- Adequacy report generator.
- Report UI/export.
- Tests.

## Acceptance criteria

```text
[ ] Engineering templates are versioned and not hardcoded only in UI.
[ ] New mission can be created from template.
[ ] Template selects AdequacyProfile v0.1.
[ ] Adequacy report can be generated as markdown.
[ ] Report includes score explanation and limitations.
[ ] Template changes require version bump or ADR/RFC when contract-impacting.
```

## Suggested PRs

1. `feat(template): add engineering decision template contracts`
2. `feat(template): seed engineering template library v0.1`
3. `feat(report): generate adequacy report markdown`
4. `feat(shell): display and export adequacy report`
5. `test(app): cover template-driven mission creation`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| Template system overbuilt | Medium | static config first, DB later if needed |
| Report becomes marketing text | Medium | report generated from trace/assessments only |
| Templates drift from profiles | Medium | profileId/version pinned |

---

# Sprint 9 — Hardening, Observability, Redaction, Release Candidate

**Цель:** подготовить v1.1 RC: clean setup, green gates, demo script, known limitations, release notes.

## Scope

### Release gates

Full release CI:

```text
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:domain
pnpm test:postgres
pnpm test:contracts
pnpm test:mcp-security
pnpm test:e2e
pnpm build
secret scan
dependency boundary check
```

### Observability

Проверить trace completeness:

- mission;
- source;
- human rating;
- mapping;
- evidence;
- patch;
- approval;
- apply;
- adequacy assessment;
- delta;
- report.

### Redaction

Создать/обновить:

```text
docs/04_delivery/DATA_RETENTION_AND_REDACTION_POLICY_MVP.md
docs/04_delivery/MCP_SECURITY_TEST_PLAN.md
docs/05_runbooks/LOCAL_DEV_RUNBOOK.md
docs/05_runbooks/DEMO_RUNBOOK_ENGINEERING_DECISIONS.md
docs/05_runbooks/RELEASE_RUNBOOK_V1_1_RC.md
```

### E2E smoke

Сценарии:

1. ADR Review happy path.
2. Source rating low cap path.
3. High-risk patch requires approval path.
4. MCP nonce replay rejected path.
5. Hard block prevents patch promotion path.

### Release artifacts

- `CHANGELOG.md`;
- `RELEASE_NOTES_v1.1.0-rc1.md`;
- `KNOWN_LIMITATIONS_v1.1.md`;
- `DEMO_SCRIPT_ENGINEERING_DECISIONS.md`;
- tag `v1.1.0-rc1`.

## Deliverables

- RC checklist.
- Green CI.
- Demo runbook.
- Known limitations.
- Security notes.
- Release notes.
- Tag candidate.

## Acceptance criteria

```text
[ ] Clean clone setup works.
[ ] Postgres migrations apply cleanly.
[ ] Seed data loads.
[ ] One Engineering Decision scenario works end-to-end.
[ ] Adequacy report generated.
[ ] Trace + AdequacyDelta visible.
[ ] MCP security tests pass.
[ ] No known P0 security issue.
[ ] Known limitations documented honestly.
[ ] Release notes complete.
```

## Suggested PRs

1. `test(e2e): add v1.1 rc smoke suite`
2. `security(redaction): add retention and redaction policy`
3. `docs(runbook): add engineering decisions demo runbook`
4. `chore(release): prepare v1.1.0-rc1 notes and checklist`

## Risks

| Risk | Severity | Mitigation |
|---|---:|---|
| E2E flaky | Medium | deterministic fake provider + stable seed data |
| Secret/redaction gap | High | scan + explicit redaction tests |
| RC overclaims readiness | High | known limitations and internal-dev status |

---

# Sprint 10 — Post-RC Stabilization & v1.1 MVP Release

**Цель:** закрыть RC defects, стабилизировать demo, зафиксировать MVP release.

## Scope

- Исправить P0/P1 defects из RC.
- Провести architecture drift review.
- Провести security review.
- Провести demo rehearsal.
- Обновить docs по фактическому поведению.
- Создать final tag `v1.1.0-mvp` или `v1.1.0-mvp-rc2`, если есть нерешенные P1.

## Acceptance criteria

```text
[ ] Нет открытых P0.
[ ] Все P1 либо закрыты, либо явно accepted as known limitation.
[ ] Demo script проходит на clean environment.
[ ] Release notes отражают фактическое состояние.
[ ] Public README не обещает production readiness.
[ ] v1.1 MVP tag создан.
```

---

## 5. Сводная roadmap-таблица

| Sprint | Theme | Primary outcome | Release gate |
|---:|---|---|---|
| 0 | Governance | repo becomes managed delivery project | Issues, milestones, CI, protected branch |
| 1 | Contracts | v1.1 Adequacy contracts executable | specs, ADRs, error/event catalogs |
| 2 | Core Domain/Persistence | v1.0 core stable enough for v1.1 | domain + postgres integration tests |
| 3 | Adequacy Domain | adequacy kernel implemented | adequacy invariant tests |
| 4 | Adequacy Persistence | adequacy stored and queryable | migrations + repos + read models |
| 5 | App/API | non-UI v1.1 flow works | API smoke and contract tests |
| 6 | Shell | Engineering Decisions user flow | UI e2e happy path |
| 7 | MCP Security | safe apps including AdequacyViewer | MCP P0 security matrix |
| 8 | Templates/Reports | productized template + report | markdown/json adequacy report |
| 9 | RC Hardening | release candidate | full CI + demo runbook |
| 10 | Stabilization | MVP release | tag + no P0 |

---

## 6. Backlog decomposition by epic

## Epic A — Delivery Governance

Issues:

- Create GitHub milestones for v1.1.
- Convert PROJECT_BACKLOG.md into GitHub Issues.
- Protect default branch.
- Align `master`/`main` decision.
- Add PR template enforcement.
- Add CODEOWNERS if missing/stale.
- Add release tags policy.

## Epic B — Architecture Contracts

Issues:

- Add Adequacy Domain Contracts.
- Add API Contracts v1.1.
- Add Use Case Contracts v1.1.
- Add Error Catalog.
- Add Trace Event Catalog.
- Add Adequacy Event Catalog.
- Add ADR-0027..0031.

## Epic C — Core Domain

Issues:

- Implement Mission aggregate.
- Implement MissionRun state machine.
- Implement EpistemicGraph.
- Implement EvidenceSet.
- Implement LivingArtifact/ArtifactPatch.
- Implement ApprovalRequest/DecisionRecord.
- Add P0 invariant tests.

## Epic D — PostgreSQL Persistence

Issues:

- Complete migrations 0001..0008.
- Implement repositories.
- Add transaction manager.
- Add idempotency repository.
- Add trace repository.
- Add integration tests.

## Epic E — Adequacy Layer

Issues:

- Implement AdequacyProfile.
- Implement HumanAdequacyRating.
- Implement AdequacyAssessment.
- Implement AdequacyDelta.
- Implement caps/penalties/hard blocks.
- Implement ScoreLaunderingGuard.
- Add Engineering Decision Profile seed.
- Add adequacy persistence.

## Epic F — Application/API

Issues:

- Add source rating use case.
- Add calculate adequacy use case.
- Add patch adequacy delta use case.
- Add generate adequacy report use case.
- Add API routes.
- Add contract tests.

## Epic G — Demo Shell

Issues:

- Add Engineering Decision workspace.
- Add source intake.
- Add human rating panel.
- Add adequacy panel.
- Add patch review panel.
- Add trace delta drawer.
- Add report viewer.

## Epic H — MCP Apps

Issues:

- Stabilize ClaimApp.
- Stabilize EvidenceViewer.
- Stabilize ApprovalApp.
- Add AdequacyViewerApp.
- Extend bridge schema.
- Add capability tests.
- Add security matrix.

## Epic I — Release / Ops

Issues:

- Add redaction policy.
- Add MCP security test plan.
- Add local dev runbook.
- Add demo runbook.
- Add release notes.
- Add known limitations.
- Add RC smoke tests.

---

## 7. Definition of Ready

Issue готова к разработке, если:

```text
[ ] Есть цель.
[ ] Есть scope / non-scope.
[ ] Есть affected packages.
[ ] Есть public contract or explicit no-contract-change.
[ ] Есть acceptance criteria.
[ ] Есть required tests.
[ ] Есть security/idempotency/observability notes where relevant.
[ ] Есть dependency on prior issue if any.
```

---

## 8. Definition of Done

Обычная задача done, если:

```text
[ ] PR merged.
[ ] CI green.
[ ] Tests added/updated.
[ ] Docs updated if contract changed.
[ ] No secret introduced.
[ ] No dependency boundary violation.
[ ] Trace/error behavior considered.
[ ] Rollback path documented for DB changes.
```

Domain задача done, если:

```text
[ ] Invariant test exists.
[ ] Domain error exists if needed.
[ ] Domain event considered.
[ ] No infra import in domain.
[ ] State machine transition rules tested where relevant.
```

Adequacy задача done, если:

```text
[ ] Score scope includes missionId/profileId/methodVersion.
[ ] Basis/explanation stored.
[ ] Caps/penalties/hard blocks tested.
[ ] Score laundering risk considered.
[ ] Human vs system responsibility clear.
```

MCP задача done, если:

```text
[ ] Bridge schema updated.
[ ] Capability grant minimal.
[ ] Invalid origin/schema/nonce/capability tests pass.
[ ] Rejected message emits audit event.
[ ] No iframe direct domain mutation.
```

DB задача done, если:

```text
[ ] Migration exists.
[ ] Rollback or mitigation note exists.
[ ] Clean DB migration test passes.
[ ] Seed impact considered.
[ ] Repository integration test exists.
```

---

## 9. Риски уровня программы

| Risk | Severity | Early signal | Mitigation |
|---|---:|---|---|
| Adequacy score воспринимается как truth score | Critical | UI показывает только число | Scope/profile/version/explanation mandatory |
| Delivery без Issues/PRs | High | новые direct commits | branch protection + Issue discipline |
| Domain rules уходят в UI/API/SQL | High | tests require DB/UI to validate rules | domain invariant tests first |
| MCP write path bypass | Critical | iframe can apply patch | backend-only command + security tests |
| Persistence overengineering | Medium | много таблиц без use cases | implement only queried/read models |
| Template Library overbuilt | Medium | generic template editor в MVP | static versioned templates only |
| Fake provider hides reality | Medium | demo passes only with synthetic output | optional real provider adapter after core stability |
| Trace leaks sensitive payload | Critical | raw prompts/logs in trace_events | redaction policy + tests |
| Score laundering через низкие source ratings | High | final artifact score > source cap | cap rules + explicit override later |
| v1.1 scope exceeds 10 weeks | High | Sprint 3 not done by week 4 | cut to one scenario + ClaimApp/ApprovalApp only |

---

## 10. Cut lines if schedule compresses

Если нужно уложиться в 6 недель:

Keep:

```text
Governance
Core Domain/Persistence
AdequacyProfile
HumanAdequacyRating
AdequacyAssessment
AdequacyDelta
Engineering Decision Profile
API happy path
Demo Shell happy path
ApprovalApp
Trace
```

Cut/defer:

```text
Template Library generalization
AdequacyViewer MCP app
four templates → one ADR Review template
advanced report export
optional real model provider
ConflictApp
ArtifactPatchPreviewApp
full outbox worker
advanced e2e matrix
```

Fast MVP target:

```text
One Engineering ADR Review scenario
→ source rating
→ 3 nodes
→ 2 evidence refs
→ 1 patch
→ approval
→ applied artifact version
→ adequacy assessment + delta
→ trace visible
```

---

## 11. Рекомендуемый порядок первых 10 GitHub Issues

1. `P0 docs(project): create v1.1 sprint milestones and issue taxonomy`
2. `P0 chore(repo): enforce protected branch and CI baseline`
3. `P0 docs(adr): add ADR-0027 adequacy layer`
4. `P0 docs(spec): add adequacy domain contracts`
5. `P0 feat(domain): stabilize Mission and MissionRun aggregates`
6. `P0 feat(domain): implement AdequacyProfile and HumanAdequacyRating`
7. `P0 feat(domain): implement AdequacyAssessment calculation and caps`
8. `P0 feat(postgres): add adequacy persistence migrations`
9. `P0 feat(app): add RateSourceAdequacy and CalculatePatchAdequacy use cases`
10. `P0 feat(shell): add Engineering Decision happy path`

---

## 12. Критерии успеха v1.1 MVP

v1.1 MVP успешен, если внутренний пользователь может:

1. Создать Engineering Decision Mission.
2. Выбрать ADR/RFC/Architecture Note template.
3. Добавить исходный источник.
4. Дать human adequacy rating источнику.
5. Запустить epistemic mapping.
6. Увидеть claims/nodes/evidence/boundaries.
7. Получить ArtifactPatch.
8. Увидеть AdequacyAssessment patch/artifact.
9. Увидеть penalties/caps/hard blocks.
10. Approve/reject через backend-controlled Approval flow.
11. Применить patch после approval.
12. Увидеть новую artifact version.
13. Увидеть Trace + AdequacyDelta.
14. Сгенерировать AdequacyReport.
15. Повторить demo из clean local setup.

---

## 13. Итоговый вердикт

Текущий репозиторий уже прошел стадию пустого старта. Следующая правильная фаза — не генерировать еще один концепт, а сделать v1.1 operational delivery plan с жесткими gates.

Главный архитектурный риск v1.1 — превратить AdequacyScore в красивый, но опасный “truth score”. Поэтому Adequacy Layer должен быть реализован как:

```text
scoped + versioned + explainable + capped + trace-linked + human-governed
```

Главный delivery-риск — продолжить работу без публичных Issues/PR/milestones. Поэтому Sprint 0 обязателен и должен быть коротким, но жестким.

Рекомендуемый путь: 10 недель до v1.1 MVP с одним сильным продуктовым shell `EpiOS for Engineering Decisions`; при сжатии — 6 недель за счет урезания Template Library, MCP AdequacyViewer и количества сценариев.
