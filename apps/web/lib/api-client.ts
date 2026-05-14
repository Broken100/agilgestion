// apps/web/lib/api-client.ts
import { useAuthStore } from '@/stores/auth-store';

export function getToken(): string | null {
  return useAuthStore.getState().token;
}

export async function apiFetch(url: string, options?: RequestInit) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}