/**
 * Централизованная конфигурация API URL.
 * В режиме разработки использует localhost:3000,
 * в продакшене — относительный путь /api.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:4000");
