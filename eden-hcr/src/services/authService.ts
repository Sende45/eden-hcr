// src/services/authService.ts

const API_URL   = 'https://eden-hcr-backend.onrender.com/api';
const TOKEN_KEY = 'eden_token';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: 'extra' | 'admin' | 'client';
  nom?: string;
  prenom?: string;
  
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Gestion du token ─────────────────────────────────────────────────────────

export const getToken         = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken         = (token: string)   => localStorage.setItem(TOKEN_KEY, token);
export const removeToken      = ()                 => localStorage.removeItem(TOKEN_KEY);
export const isAuthenticated  = (): boolean        => Boolean(getToken());

export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken() ?? ''}`,
});

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? `Erreur ${response.status}`);
  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** Connexion prestataire — stocke automatiquement le token */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const data = await apiFetch<{ token: string; data: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const result: LoginResponse = { token: data.token, user: data.data };
  setToken(result.token);
  return result;
};

/** Déconnexion */
export const logout = (): void => removeToken();

/** Profil utilisateur connecté */
export const getMe = async (): Promise<AuthUser> => {
  const response = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? 'Session expirée.');
  return data.data as AuthUser;
};

// ✅ Corrigé
export const register = async (payload: {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role?: 'extra';   // ← cette ligne
}): Promise<LoginResponse> => {
  const data = await apiFetch<{ token: string; data: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ role: 'extra', ...payload }),
  });
  const result: LoginResponse = { token: data.token, user: data.data };
  setToken(result.token);
  return result;
};