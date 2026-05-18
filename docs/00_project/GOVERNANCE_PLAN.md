# **Стратегия управления: Governance-as-Code**

**Статус:** Accepted_contract (Принято к исполнению)

**Владелец:** Core Team

**Версия:** 1.3

## **Контекст и целевой принцип**

EPIOS позиционирует себя как «слой измеримого доверия» (Measurable Trust Layer). Однако текущая проблема проекта заключается в документационном дрейфе, конфликтующих ADR и разрыве между бэклогом и кодом.

Вместо того чтобы сразу строить сложную мета-систему или абстрактный «самоподдерживающийся граф знаний», мы принимаем строгий поэтапный принцип развития процессов управления:

1. **Governance-as-Code first.** (Реестры, физические файлы, CI-проверки).  
2. **Docs-as-Code second.** (Исполняемые контракты, линтеры связей).  
3. **Docs-as-Graph third.** (Доменная модель для артефактов управления).  
4. **EPIOS-dogfooding fourth.** (Использование MVP для ревью собственных ADR).  
5. **AI-Governance last.** (Автоматизированный аудит).

### **Принцип "Источника истины" (Source of Truth)**

**До появления стабильного ADR Review MVP репозиторий GitHub остается единственным источником истины.**

* EPIOS может строить read-only проекции (projections) governance-графа, но не становится авторитетным источником для статусов, ADR или бэклога.  
* Любое изменение состояния управления (governance-state) выполняется **только** через PR, human review и CI.

## **Governance Kernel v0/v1 Boundary**

Во избежание преждевременного усложнения, реализация разделяется на две границы:

**v0 — file-based governance (Фокус текущего спринта):**

* Registers (DOCUMENT\_REGISTER.md, OPEN\_DECISIONS\_REGISTER.md)  
* Физические файлы ADR  
* GitHub Issues / Pull Requests  
* CI checks & dependency rules

**v1 — graph-backed governance (Внедряется по мере готовности):**

* Доменные сущности GovernanceArtifact, TraceLink, GovernanceFinding  
* Сгенерированная проекция графа  
* EPIOS dogfooding

### **Целевая доменная модель (v1 Graph Kernel)**

Для обеспечения консистентности, вводится единый агрегат GovernanceGraph, который владеет артефактами, связями и нарушениями.

#### **Entity: GovernanceArtifact**

Управляемый артефакт в рамках графа.

type GovernanceArtifactKind \=  
  | 'project\_doc'  
  | 'adr'  
  | 'api\_contract'  
  | 'use\_case\_contract'  
  | 'error\_catalog'  
  | 'trace\_event\_catalog'  
  | 'runbook'  
  | 'registry'  
  | 'issue'  
  | 'pull\_request'  
  | 'milestone'  
  | 'release'; // code\_symbol отложен до Phase 3+

type GovernanceArtifactStatus \=  
  | 'draft'  
  | 'for\_review'  
  | 'accepted'  
  | 'needs\_review'  
  | 'superseded'  
  | 'deprecated'  
  | 'archived';

type GovernanceArtifact \= {  
  id: string;  
  kind: GovernanceArtifactKind;  
  title: string;  
  status: GovernanceArtifactStatus;  
  owner: string;  
  path: string; // URL или путь к файлу  
  lastReviewedAt?: string;  
  supersededBy?: string;  
  evidenceRefs: string\[\];  
};

**Инварианты:**

* accepted и draft документы обязаны иметь owner.  
* superseded документ обязан иметь supersededBy.  
* ADR в статусе accepted обязан быть физическим файлом.

#### **Aggregate: GovernanceGraph**

Владеет целостностью связей и находок.

type GovernanceGraph \= {  
  graphId: string;  
  projectId: string;  
  artifacts: GovernanceArtifact\[\];  
  links: TraceLink\[\];  
  findings: GovernanceFinding\[\];  
  generatedAt: string;  
};

#### **Entity: TraceLink (Value Object внутри графа)**

Связь между внешними/внутренними объектами.

type TraceLink \= {  
  id: string;  
  from: { type: GovernanceArtifactKind | 'business\_goal'; ref: string };  
  to: { type: GovernanceArtifactKind | 'business\_goal'; ref: string };  
  relation:  
    | 'implements'  
    | 'closes'  
    | 'justified\_by'  
    | 'supersedes'  
    | 'depends\_on'  
    | 'violates'  
    | 'documents';  
  evidenceRefs: string\[\];  
};

**Инварианты связей:**

* Смерженный PR (merged) обязан закрывать Issue (closes), за исключением No-Issue-Reason.  
* Issue обязана ссылаться на ADR, PRD или содержать явную причину no-ADR-needed.  
* PR, затрагивающий архитектуру, обязан ссылаться на ADR (justified\_by).

#### **Entity: GovernanceFinding**

Нарушение правила управления проектом.

type GovernanceFinding \= {  
  id: string;  
  severity: 'P0' | 'P1' | 'P2';  
  type:  
    | 'missing\_owner'  
    | 'stale\_document'  
    | 'missing\_trace\_link'  
    | 'adr\_conflict'  
    | 'dependency\_boundary\_violation'  
    | 'missing\_contract'  
    | 'unsafe\_ai\_agent\_behavior';  
  subjectRef: string; // Ссылка на артефакт  
  status: 'open' | 'triaged' | 'resolved' | 'accepted\_risk';  
  reason: string;  
  evidenceRefs: string\[\];  
};

**Инварианты:**

* Документ без ревью \> 90 дней порождает GovernanceFinding (stale\_document, P1). *Статус самого документа не мутируется автоматически, он меняется только через явный патч.*  
* Находка с приоритетом P0 блокирует релиз.  
* Статус accepted\_risk требует человеческого обоснования (reason).

## **Дорожная карта внедрения (Roadmap)**

### **Phase 0: Governance Freeze (Срок: 1–2 дня)**

**Цель:** Остановить документационный дрейф. Никаких новых концептов.

* **Сделать:**  
  * Создать DOCUMENT\_REGISTER.md и OPEN\_DECISIONS\_REGISTER.md.  
  * Утвердить EPIOS-09 как авторитетный индекс ADR.  
  * Создать физические файлы для ADR-0001...ADR-0010 и ADR-0026 (лицензия).  
  * Завести BACKLOG\_MIGRATION\_LOG.md перед переносом задач в GitHub.  
* **Acceptance Criteria:**  
  * Каждый активный документ имеет owner и унифицированный статус.  
  * Каждый Accepted ADR существует как физический markdown-файл.

### **Phase 1: GitHub Execution Skeleton (Срок: 2–3 дня)**

**Цель:** Перенести управление в инструменты репозитория.

* **Сделать:**  
  * Включить Branch protection для main (PR, CI, squash merge).  
  * Внедрить шаблоны Issues и PR. В шаблоне PR предусмотреть No-Issue-Reason (escape hatch: bootstrap | ci-repair | typo | emergency | release).  
  * Запустить CI baseline и dependency-cruiser.  
* **Acceptance Criteria:**  
  * PR без ссылки Closes \#ID ИЛИ явно указанного No-Issue-Reason блокируется CI.  
  * Нарушение границ dependency-cruiser (domain \-\> infra) блокирует сборку.

### **Phase 2: Executable Documentation Checks (Срок: 3–5 дней)**

**Цель:** Сделать документацию проверяемой.

* **Сделать:** Добавить скрипт tools/docs-governance/check-docs.ts.  
* **Acceptance Criteria:**  
  * CI блокирует сборку при отсутствии owner, отсутствии физического файла ADR по индексу или сломанной ссылке superseded.  
  * Устаревшие документы (\>90 дней) генерируют ворнинги (findings), но не мутируют состояние коммита.

### **Phase 3: Minimal Contract Specs (Блокер для Недели 2\)**

**Цель:** Зафиксировать минимальные контракты для P0-потоков.

* **Сделать:**  
  * APPLICATION\_USE\_CASE\_CONTRACTS.md (только для P0 use cases).  
  * ERROR\_CATALOG.md (только для P0 domain/application errors).  
  * TRACE\_EVENT\_CATALOG.md (только для P0 мутаций).  
* **Примечание:** Полные API-контракты, read models и MCP mappings откладываются на период *после* Week 2\.

### **Phase 4: EPIOS Dogfooding (После ADR Review MVP)**

**Цель:** Использовать продукт (EPIOS) для проверки собственных ADR.

* **Минимальный Workflow:** Создание ADR \-\> Извлечение утверждений \-\> Классификация (Evidence/Trace/Risk) \-\> Человеческий Approval \-\> Фиксация TraceEvent.

### **Phase 5: AI Auditor (Версия 1.2 и далее)**

**Цель:** Автоматизированный аудит без скрытой автономии.

* **Threat Model (Модель угроз):**  
  * *Prompt injection* через содержимое репозитория.  
  * Malicious markdown в файлах ADR.  
  * Отравленные комментарии в Issues (Poisoned issue comments).  
  * Confused deputy через токен GitHub.  
  * Утечка чувствительных данных (Sensitive data leakage) в отчетах.  
* **Жесткие правила (Invariants):**  
  * AI Auditor выполняет чтение **untrusted** контента репозитория.  
  * Все результаты (отчеты, findings, drafts) являются **untrusted recommendations** до прохождения человеческого триажа (Human triage).  
  * **ЗАПРЕЩЕНО:** Фоновый агент с write-доступом, авто-применение патчей, авто-закрытие Issues.

## **📋 Governance Enforcement**

### **Delivery Enforcement & Hygiene**

1. **No Direct Push**: All changes to `main` and `develop` MUST go through a Pull Request.
2. **Issue Traceability**: Every PR MUST link to at least one GitHub Issue using the `Closes #ID` or `Related to #ID` syntax.
3. **CI Dependency**: PRs cannot be merged without a green `pnpm verify` run.
4. **Fresh Delivery Rule**: To prevent documentation drift and cognitive load, the `docs/04_delivery/` folder must contain ONLY active or upcoming plans.
    *   Once a sprint or phase is completed and reviewed, the corresponding document MUST be set to `archived` status and moved to `docs/90_archive/` within 24 hours.
    *   Successful completion is not a reason to keep a plan in the active folder; its "truth" is now in the codebase and the `STATUS.md` dashboard.
5. **2-Level Planning & Sprint Isolation**:
    * **Двухуровневое планирование**: Отказ от понедельного планирования. Используется Проектный план (глобальные фазы) и Оперативный план (`STATUS.md`).
    * **Изоляция спринтов**: Оперативный план состоит из согласованных этапов, разбитых на **НЕЗАВИСИМЫЕ** спринты, которые можно выполнять параллельно.
    * **Уникальные спринты**: Если спринт затрагивает критически важные части системы и создает риски для разработки, он помечается как `[🔒 УНИКАЛЬНЫЙ]` и строго **запрещает параллельную разработку**.

**Live Execution Truth:** [GitHub Issues](https://github.com/xlabkm-ux/epios/issues)
**Release Status:** [RELEASE_STATE.md](../04_delivery/RELEASE_STATE.md)
**Compliance Checks:** Automated via `pnpm verify` (CI).

Any changes to this governance policy must be proposed via an ADR and implemented through a Pull Request.