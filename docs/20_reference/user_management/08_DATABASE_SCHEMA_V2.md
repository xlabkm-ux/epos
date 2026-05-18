# Спецификация БД: Identity & Governance v2.3

Для реализации гибкой системы назначений (WP) и оргструктуры, база данных должна быть расширена следующими таблицами.

## 1. Организационная структура

### Таблица `org_units` (Подразделения)
| Колонки | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный ID подразделения |
| `name` | String | Название (напр. "Governance Group") |
| `parent_id` | UUID (FK) | Ссылка на родительское подразделение |

### Таблица `org_positions` (Должности)
| Колонки | Тип | Описание |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Уникальный ID должности |
| `name` | String | Название (напр. "Principal Architect") |
| `level` | Integer | Уровень в иерархии (для сортировки) |

## 2. Таблица назначений (Assignments)

### Таблица `user_assignments` (Рабочие места / WP)
Связывает пользователя с контекстом его работы.
| Колонки | Тип | Описание |
| :--- | :--- | :--- |
| **`workplace_id`** | UUID (PK) | Уникальный ID назначения (WP) |
| `user_id` | UUID (FK) | Ссылка на `users.id` |
| `unit_id` | UUID (FK) | Ссылка на `org_units.id` |
| `position_id` | UUID (FK) | Ссылка на `org_positions.id` |
| `role` | Enum | Роль в этом РМ (Owner, Contributor, Reviewer, Observer) |
| `workspace_id` | UUID (FK) | Ссылка на `workspaces.id` (РП) |
| `is_active` | Boolean | Статус назначения |
| `created_at` | Timestamp | Дата создания |

## 3. SQL Миграция (Draft)

```sql
CREATE TYPE user_context_role AS ENUM ('owner', 'contributor', 'reviewer', 'observer');

CREATE TABLE org_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES org_units(id)
);

CREATE TABLE org_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level INT DEFAULT 0
);

CREATE TABLE user_assignments (
    workplace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    unit_id UUID REFERENCES org_units(id),
    position_id UUID REFERENCES org_positions(id),
    role user_context_role NOT NULL DEFAULT 'observer',
    workspace_id UUID REFERENCES workspaces(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);
```
