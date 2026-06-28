// src/services/authService.ts

const API_URL = 'https://eden-hcr.onrender.com/api';
const TOKEN_KEY = 'eden_token';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  role: 'extra' | 'admin' | 'superadmin' | 'client';
  nom?: string;
  prenom?: string;
  societe?: string; // ← AJOUT : pour les clients
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Gestion du token ─────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const removeToken = (): void =>
  localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = (): boolean =>
  Boolean(getToken());

export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken() ?? ''}`,
});

// ─── Helper fetch ─────────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  const data = await response.json();

  console.log('==============================');
  console.log('API CALL =>', endpoint);
  console.log('STATUS =>', response.status);
  console.log('RESPONSE =>', data);
  console.log('==============================');

  if (!response.ok) {
    throw new Error(data.message ?? `Erreur ${response.status}`);
  }

  return data as T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Connexion unifiée
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {

  const data = await apiFetch<{
    token: string;
    user: AuthUser;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  console.log('========== LOGIN RESPONSE ==========');
  console.log('TOKEN =>', data.token);
  console.log('USER =>', data.user);
  console.log('ROLE =>', data.user?.role);
  console.log('====================================');

  const result: LoginResponse = {
    token: data.token,
    user: data.user,
  };

  // Stockage token
  setToken(result.token);

  // Stockage utilisateur
  localStorage.setItem(
    'eden_user',
    JSON.stringify(result.user)
  );

  console.log('TOKEN STOCKÉ DANS LOCALSTORAGE');
  console.log(localStorage.getItem(TOKEN_KEY));

  console.log('USER STOCKÉ DANS LOCALSTORAGE');
  console.log(localStorage.getItem('eden_user'));

  return result;
};

/**
 * Déconnexion
 */
export const logout = (): void => {
  console.log('LOGOUT');
  removeToken();
};

/**
 * Profil utilisateur connecté
 */
export const getMe = async (): Promise<AuthUser> => {

  console.log('========== GET ME ==========');
  console.log('TOKEN ENVOYÉ =>', getToken());

  const response = await fetch(
    `${API_URL}/auth/me`,
    {
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  console.log('GET /auth/me STATUS =>', response.status);
  console.log('GET /auth/me RESPONSE =>', data);

  if (!response.ok) {
    throw new Error(
      data.message ?? 'Session expirée.'
    );
  }

  console.log('USER CONNECTÉ =>', data.user);
  console.log('ROLE CONNECTÉ =>', data.user?.role);

  return data.user as AuthUser;
};

/**
 * Inscription extra
 */
export const register = async (payload: {
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  societe?: string;        // ← AJOUT : pour les clients
  role?: 'extra' | 'client'; // ← AJOUT : client accepté
}): Promise<LoginResponse> => {

  const data = await apiFetch<{
    token: string;
    user: AuthUser;
  }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      role: 'extra', // valeur par défaut si non précisé
      ...payload,    // écrase avec le role passé en paramètre
    }),
  });

  console.log('========== REGISTER RESPONSE ==========');
  console.log('USER =>', data.user);
  console.log('ROLE =>', data.user?.role);
  console.log('=======================================');

  const result: LoginResponse = {
    token: data.token,
    user: data.user,
  };

  setToken(result.token);

  localStorage.setItem(
    'eden_user',
    JSON.stringify(result.user)
  );

  return result;
};