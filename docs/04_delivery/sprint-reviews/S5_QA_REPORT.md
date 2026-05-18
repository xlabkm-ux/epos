# ❌ Sprint 5 — QA Gate Report

> **Дата:** 2026-05-16T12:40:06.638Z  
> **Коммит:** `97710ae`  
> **Ветка:** `feat/adr-0099-hardening-reconciliation`  
> **Общий статус:** **FAIL**

---

## Сводка

| Метрика | Значение |
| :--- | :--- |
| Пройдено гейтов | 7 |
| Провалено гейтов | 1 |
| Предупреждения | 1 |
| Пропущено | 0 |
| Общее время | 42.3s |

---

## Результаты гейтов

| Гейт | Название | Статус | Время |
| :--- | :--- | :--- | :--- |
| ✅ G1 | Static Analysis — Lint | **PASS** | 3372ms |
| ✅ G1b | Static Analysis — TypeCheck | **PASS** | 11709ms |
| ✅ G2 | Architecture Boundaries — Dependency Cruiser | **PASS** | 6067ms |
| ✅ G3 | Domain Invariants — Unit Tests | **PASS** | 4182ms |
| ❌ G4 | Full Test Suite (all packages) | **FAIL** | 11621ms |
| ⚠️ G5 | Security Audit & Secret Scan | **WARN** | 4209ms |
| ✅ G6 | Documentation Governance Check | **PASS** | 1120ms |
| ✅ G7 | STATUS.md — Sprint Checklist Completeness | **PASS** | 1ms |
| ✅ G8 | PROJECT_MAP.md — Freshness Check | **PASS** | 1ms |

---

## Детали

### G4: Full Test Suite (all packages) (FAIL)

```

```

### G5: Security Audit & Secret Scan (WARN)

```
[ERROR] Potential secret found in: C:\AG\epios\.turbo\cache\4453d98596e3a825-meta.json
```


---

## Чек-лист ручной приёмки (заполняется вручную)

- [ ] Demo Shell открывается из чистого состояния
- [ ] Канонический сценарий (ADR Review) проходит полностью
- [ ] Новая функциональность спринта визуально доступна в UI
- [ ] Нет регрессий в существующих функциях
- [ ] Readiness-индикаторы корректны
- [ ] Документация актуализирована

## Подпись

- **QA-инженер:** _______________
- **Дата приёмки:** _______________
- **Решение:** ПРИНЯТО / ОТКЛОНЕНО / ПРИНЯТО С ЗАМЕЧАНИЯМИ

---
*Автоматически сгенерировано: `pnpm sprint:qa -- --sprint 5`*
