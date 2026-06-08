// src/services/authService.ts
// Service centralisé pour toutes les opérations d'authentification EDÈN HCR

const API_URL = 'https://eden-hcr-backend.onrender.com/api';
const TOKEN_KEY = 'userToken';

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

// ─── Helpers token ────────────────────────────────────────────────────────────

/** Récupère le token JWT stocké */
export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

/** Stocke le token JWT */
export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

/** Supprime le token (déconnexion) */
export const removeToken = (): void =>
  localStorage.removeItem(TOKEN_KEY);

/** Retourne true si un token est présent */
export const isAuthenticated = (): boolean =>
  Boolean(getToken());

/** Headers JSON + Authorization pour les requêtes protégées */
export const authHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken() ?? ''}`,
});

// ─── Requête générique avec gestion d'erreur ──────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers, // Permet d'injecter authHeaders() si passé en option
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // On remonte le message backend si disponible
    throw new Error(data.message ?? `Erreur ${response.status}`);
  }

  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

/**
 * Connexion prestataire / extra via le backend Render.
 * Stocke automatiquement le token JWT dans localStorage.
 */
export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const data = await apiFetch<{ token: string; data: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // Normalise la réponse backend (data.data → data.user)
  const result: LoginResponse = {
    token: data.token,
    user: data.data,
  };

  setToken(result.token);
  return result;
};

/**
 * Déconnexion — supprime le token et redirige si besoin.
 */
export const logout = (): void => {
  removeToken();
};

/**
 * Récupère le profil de l'utilisateur connecté.
 * Nécessite un token valide.
 */
export const getMe = async (): Promise<AuthUser> => {
  // Utilisation de l'apiFetch optimisé avec les headers d'autorisation passés proprement
  return apiFetch<AuthUser>('/auth/me', {
    method: 'GET',
    headers: authHeaders(),
  });
};

/**
 * Inscription d'un nouveau prestataire / extra.
 */
export const register = async (payload: {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role?: 'extra';
}): Promise<LoginResponse> => {
  const data = await apiFetch<{ token: string; data: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ role: 'extra', ...payload }),
  });

  const result: LoginResponse = {
    token: data.token,
    user: data.data,
  };

  setToken(result.token);
  return result;
};