// Thin client for the PawPortal API. Same-origin: nginx proxies /api to the
// backend in production; Vite proxies /api in dev (see vite.config.ts).
import { AuthUser } from '../types';

const BASE = '/api';
const TOKEN_KEY = 'pawportal-token';

export const getToken = (): string | null => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token: string | null): void => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
};

export type Scope = 'user' | 'global';

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data as T;
}

export interface AuthResponse { token: string; user: AuthUser; }

export const api = {
  // --- Auth ---
  register: (body: { email: string; password: string; name: string; role: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request<{ user: AuthUser }>('/auth/me'),
  updateMe: (body: { name?: string; avatar?: string }) =>
    request<{ user: AuthUser }>('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),

  // --- Generic persistence ---
  list: <T = any>(scope: Scope, collection: string) =>
    request<T[]>(`/${scope}/${collection}`),
  create: <T = any>(scope: Scope, collection: string, item: any) =>
    request<T>(`/${scope}/${collection}`, { method: 'POST', body: JSON.stringify(item) }),
  update: <T = any>(scope: Scope, collection: string, id: string, item: any) =>
    request<T>(`/${scope}/${collection}/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  remove: (scope: Scope, collection: string, id: string) =>
    request<{ ok: boolean }>(`/${scope}/${collection}/${id}`, { method: 'DELETE' }),
};
