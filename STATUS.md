# 📊 PROJECT STATUS: Epistemic OS (epios)
> **Последнее обновление:** 2026-05-16  
> **Версия:** v0.2.0-beta.1 (Functioning Beta)
> **Фаза:** v2.3 Identity & Governance Lifecycle (Spiral Model)
> **Основной фокус:** `docs/20_reference/user_management` (Assignments & Auth)

---

## 🎯 Текущий вердикт

Макет системы утвержден. Проект перешел в стадию **функционирующей Beta-версии**. Разработка ведется по **Спиральной модели** (от центра к периферии): каждая итерация (Спринт) наращивает функциональность вокруг стабильного доменного ядра. Текущий приоритет — реализация системы «Рабочих мест» (WP) и обязательной авторизации.

---

## 🚦 Состояние фазы: User Management

| Компонент | Статус | Цель |
| :--- | :--- | :--- |
| **Identity Model** | ✅ Completed | Модели `WP`, `WS` и `workplace_id` определены. |
| **Auth Interface** | ✅ Completed | Экран входа/регистрации (AuthScreen) реализован. |
| **Assignments API** | ✅ Completed | Эндпоинты для Таблицы назначений. |
| **Admin UI** | ✅ Completed | Панель управления WP Management. |
| **Data Security** | ✅ Completed | Redaction Rules & Retention Policies. |

---

## 🚀 План Спринтов: User Management (Spiral Model)

### Спринт 1: Auth & Identity Foundation (Завершено)
- [x] Разработка **AuthScreen** (Login/Registration) с премиальным дизайном.
- [x] Обновление **SecurityContext** и интеграция защиты роутов.
- [x] Проектирование схемы БД v2.3 (таблицы `org_units`, `org_positions`, `user_assignments`).
- [x] Актуализация регламентов под статус **Functioning Beta**.

### Спринт 2: Domain & Assignments API (Завершено)
- [x] Реализация доменных моделей `Assignment` и `WorkPlace` в `packages/domain`.
- [x] Разработка API для чтения и редактирования Таблицы назначений.
- [x] Интеграция `workplace_id` в механизмы авторизации (Security Port).

### Спринт 3: Admin Panel — Управление назначениями (Завершено)
- [x] Создание интерфейса **WP Management** в Админ-панели Настроек.
- [x] Реализация CRUD-операций для строк Таблицы назначений.
- [x] Поиск и фильтрация пользователей по Должностям и Подразделениям.

### Спринт 4: UX Polish & Context Switching (Завершено)
- [x] Реализация переключателя WP в пользовательских настройках.
- [x] Динамическая фильтрация Рабочих пространств (WS) на Слайдере в зависимости от активного WP.
- [x] Финальное тестирование семантической целостности интерфейса.

### Спринт 5: Commercial Hardening & Security (Завершено)
- [x] Реализация JWT-авторизации и защищенных сессий.
- [x] Интеграция хеширования паролей для коммерческой безопасности.
- [x] Скрипты инициализации промышленной базы данных (Seed Scripts).
- [x] Полный переход на PostgreSQL для всех продуктовых сред.

### Спринт 6: Architecture Boundary Enforcement & Clean Build (Завершено)
- [x] **Устранение нарушений `no-external-to-internal-apps`:** Перевести все прямые импорты из `@epios/domain` и `@epios/infrastructure-mcp` в компонентах `work-shell` на публичный API-слой (`@epios/api`), либо создать выделенный контрактный пакет `@epios/shared-types` для переиспользуемых типов.
  - `WorkspaceContext.tsx` → `@epios/domain` (типы Workspace)
  - `SecurityContext.tsx` → `@epios/domain` (типы Security/User)
  - `WorkspaceRoom.tsx` → `@epios/domain` (типы Workspace)
  - `Sidebar.tsx` → `@epios/domain` (типы навигации)
  - `MissionPanel.tsx` → `@epios/domain` (типы Mission)
  - `MappingPanel.tsx` → `@epios/domain` (типы MappingRun)
  - `AuthScreen.tsx` → `@epios/domain` (типы User/Auth)
  - `SecureMcpIframe.tsx` → `@epios/infrastructure-mcp` (типы MCP Bridge)
- [x] **Ликвидация orphan-файлов (`no-orphans`):** Очистить устаревшие артефакты сборки (`dist/`, `coverage/`) из `packages/*`, добавить их в `.gitignore`, настроить `depcruise` на исключение `dist`/`coverage` директорий.
- [x] **Ужесточение правила `no-external-to-internal-apps`:** Повысить severity с `warn` на `error` в `.dependency-cruiser.cjs` после завершения рефакторинга для предотвращения будущих регрессий.
- [x] **Целевой результат:** `depcruise` проходит с 0 нарушениями (0 errors, 2 warnings - orphans ignored).

### Спринт 7: Shell Rebranding & Production Identity (Завершено)
- [x] **Rebranding Directory**: Переименовать `apps/demo-shell` в `apps/work-shell` для отражения продуктового статуса.
- [x] **Dependency Update**: Обновить `package.json`, `pnpm-lock.yaml` и внутренние ссылки в монорепозитории.
- [x] **Config Migration**: Перенастроить `dependency-cruiser`, `turbo` и CI/CD скрипты под новые пути.
- [x] **Docs Alignment**: Обновить `PROJECT_MAP.md`, `AGENT.md` и все регламенты, ссылающиеся на `work-shell`.
- [x] **QA Gate G2-G8**: Прохождение всех гейтов качества под новым именем приложения.

### Спринт 8: Identity & Persona Transition (In Progress)
- [x] Интеграция RoleSwitcher в Sidebar для управления контекстом Identity.
- [x] Реализация смены Persona (ActorRef) в реальном времени.

---

## 📂 Навигация
- **Реестр документов:** [`DOCUMENT_REGISTER.md`](docs/00_project/DOCUMENT_REGISTER.md)
- **План разработки RBAC:** [`05_RBAC_DEVELOPMENT_PLAN.md`](docs/20_reference/user_management/05_RBAC_DEVELOPMENT_PLAN.md)
- **Архив предыдущего статуса:** [`docs/90_archive/STATUS_ARCHIVED_2026-05-16.md`](docs/90_archive/STATUS_ARCHIVED_2026-05-16.md)
