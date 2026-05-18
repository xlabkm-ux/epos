import { API_BASE_URL } from "../api-config";

export interface RequestOptions extends RequestInit {
  userId?: string;
  workplaceId?: string;
}

export async function secureFetch(path: string, options: RequestOptions = {}) {
  const { userId, workplaceId, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  headers.set("Accept", "application/json");

  if (userId) {
    headers.set("x-user-id", userId);
  }
  if (workplaceId) {
    headers.set("x-workplace-id", workplaceId);
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  return response;
}
