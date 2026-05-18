# 🏗️ План развития: User Management & Enterprise RBAC (v2.1)

Этот документ описывает стратегию оптимизации и реализации подсистемы управления пользователями, контроля доступа и безопасности данных.

## 🎯 Ключевые цели оптимизации

1.  **Контекстный RBAC (Workspace-Level):** Переход от глобальных ролей к ролям на уровне рабочего пространства. Пользователь может быть `Admin` в одном проекте и `Observer` в другом.
2.  **Audit-as-Event-Stream:** Интеграция аудита безопасности в общую шину событий (Outbox) для гарантии того, что ни одно критическое действие не останется незамеченным.
3.  **Policy-as-Code:** Формализация прав доступа в виде потребляемых системой конфигураций (Zod/YAML), а не только в виде текста в документации.
4.  **Deep Redaction:** Перенос механизмов маскирования данных (PII/Secret) на уровень репозиториев (Repository Layer), чтобы исключить утечки даже при прямом обращении к API.

---

## 🛠️ Предлагаемая архитектура

### 1. Модель "Actor-Role-Scope"
Вместо простой связи `User -> Role`, внедряем `Membership`:
- `User` (Identity)
- `Workspace` (Scope)
- `Role` (Set of Permissions)
- `Membership = (User, Workspace, Role)`

### 2. Единый SecurityContext
Создание провайдера `SecurityPort`, который:
- Резолвит `Actor` из JWT/Session.
- Определяет `Scope` запроса (например, из `:workspaceId`).
- Предоставляет метод `can(action, resource, scope)`.

### 3. Реактивный Redaction
Вместо regex-замены на лету в UI, внедряем `RedactionService` в `UnitOfWork`:
- При сохранении/чтении сущностей (Source, Node, Patch), сервис применяет активные `RedactionRules`.
- Администраторы видят "сырые" данные, остальные — маскированные.

---

## 📅 Roadmap реализации

### Фаза 1: Нормализация Доменов (Текущая)
- [ ] **Ревизия 01_IDENTITY_AND_ACCESS_MODEL.md**: Добавление понятия "Scope" и "Membership".
- [ ] **Ревизия 03_DATA_SECURITY_AND_RETENTION.md**: Описание `RedactionStore` и `RetentionWorker`.
- [ ] **Новый документ 06_SECURITY_POLICY_SCHEMA.md**: Определение JSON-схемы для ролей и пермиссий.

### Фаза 2: Core Identity & Auth
- [ ] Интеграция `NextAuth` / `Passport.js` в `apps/api`.
- [ ] Реализация `PostgresUserRepository` и `PostgresMembershipRepository`.
- [ ] Миграция UseCases на использование `SecurityContext`.

### Фаза 3: Enterprise Security Features
- [ ] Реализация `RedactionMiddleware` для эндпоинтов.
- [ ] Фоновый воркер для `RetentionPolicy`.
- [ ] Экспорт Audit Logs в формате JSONL для SIEM.

---

## 💡 Предложения по оптимизации (Для обсуждения)

1.  **JWT-Claims для RBAC**: Предлагаю хранить базовые роли в JWT для минимизации запросов к БД при проверке `read`-доступа, но проверять `write`-права через БД для мгновенного отзыва прав.
2.  **Immutable Audit**: Audit Logs должны записываться в отдельную таблицу/схему с `append-only` правами на уровне БД.
3.  **Shadowing Mode**: Возможность для Администратора "зайти под ролью" пользователя (Impersonation) для отладки прав доступа.
4.  **Auto-Redaction via LLM**: Добавление опционального шага в `MappingProcessor`, где LLM помечает потенциальные PII-данные для автоматического создания `RedactionRule`.

---

> [!IMPORTANT]
> Какое из направлений (Contextual RBAC, Redaction, или SSO) является наиболее приоритетным для текущего этапа пилотирования?
