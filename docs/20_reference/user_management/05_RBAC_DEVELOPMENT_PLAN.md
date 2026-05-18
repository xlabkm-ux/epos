Owner: @architect
Status: Accepted (Functioning Beta)

# План разработки Identity & Governance (Spiral Model)

Внедрение управления пользователями, Рабочими местами (WP) и Рабочими пространства (WS) разделено на 4 итерационных Спринта согласно Спиральной модели развития.

## 🚀 Спринт 1: Auth & Identity Foundation (Завершено)
*Фокус: Безопасный вход и структура данных.*
- [x] **Auth Interface:** Создан `AuthScreen` (Login/Registration) с премиальным дизайном.
- [x] **Session Management:** Реализованы `SecurityContext`, методы `login` и `logout`.
- [x] **DB Schema v2.3:** Спроектированы таблицы `org_units`, `org_positions` и `user_assignments` (с `workplace_id`).
- [x] **Documentation Sync:** Все регламенты переведены в статус Functioning Beta.

---

## 🚀 Спринт 2: Domain & Assignments API (В работе)
*Фокус: Логика назначений и связи WP -> WS.*
- [ ] **Domain Models:** Реализация `WorkPlace`, `Assignment` и `Position` в `packages/domain`.
- [ ] **Assignments Repository:** Создание Postgres-реализации для хранения Таблицы назначений.
- [ ] **Context API:** Эндпоинты для получения доступных WP и активации конкретного контекста.
- [ ] **Security Port:** Обновление механизмов авторизации для работы через `workplace_id`.

---

## 🚀 Спринт 3: Admin Panel — WP Management
*Фокус: Интерфейс управления корпоративной структурой.*
- [ ] **Table of Assignments UI:** Разработка редактора назначений в Админ-панели.
- [ ] **Unit & Position Management:** Интерфейсы для ведения справочников оргструктуры.
- [ ] **Access Matrix Preview:** Визуализация прав пользователя для выбранного назначения.

---

## 🚀 Спринт 4: UX Polish & Context Switching
*Фокус: Финализация пользовательского пути.*
- [ ] **WP Switcher:** Удобный интерфейс выбора «Рабочего места» в Настройках.
- [ ] **Slider Integration:** Динамическая фильтрация «Рабочих пространств» (WS) на Слайдере в зависимости от выбранного WP.
- [ ] **Audit Trail Baseline:** Базовая визуализация действий администратора по изменению назначений.

