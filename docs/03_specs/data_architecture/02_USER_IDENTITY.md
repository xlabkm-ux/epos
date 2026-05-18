**Owner**: @architect
**Status**: accepted_contract

# 🔑 Спецификация Личности Пользователя (User Identity & Security)

Регламент хранения и обработки данных учетных записей.

## 1. Структура Учетной Записи

| Поле | Обязательность | Безопасность | Описание |
| :--- | :--- | :--- | :--- |
| `uid` | Да | Public | Постоянный системный идентификатор. |
| `email` | Да | PII | Уникальный адрес, используется для логина. |
| `name` | Да | PII | Отображаемое имя в системе. |
| `passwordHash` | Да | Secret | Хеш (Argon2id). Прямое чтение запрещено. |
| `twoFactorSecret` | Нет | Secret | TOTP Secret (Base32). |
| `is2FAEnabled` | Да | Internal | Флаг активности защиты. |

## 2. Жизненный цикл Безопасности

### Смена пароля
- Обязательная проверка старого пароля.
- Требование к сложности: 12+ символов, спецсимволы, цифры.
- Инвалидация всех текущих сессий при смене.

### Двухфакторная Аутентификация (2FA)
- Реализация: RFC 6238 (TOTP).
- Приложения: Google Authenticator, Authy, Yubico.
- Резервные коды: 10 одноразовых кодов генерируются при активации.

## 3. Таблица Подчинения (Subordination Data)

Данные о вхождении пользователя в структуру хранятся в нормализованном виде:

```sql
CREATE TABLE user_memberships (
  user_uid UUID REFERENCES users(uid),
  unit_id UUID REFERENCES org_units(id),
  role_key VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  metadata JSONB -- Дополнительные данные (телефон в отделе и т.д.)
);
```

## 4. Защита Данных (Privacy)

- **Redaction:** При экспорте логов для роли `Observer`, поле `email` и `name` могут быть маскированы.
- **Audit:** Любое изменение в `user_memberships` фиксируется в `AuditRecord`.
