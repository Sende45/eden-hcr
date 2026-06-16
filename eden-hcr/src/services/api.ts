// src/services/api.ts

const API_URL = 'https://eden-hcr.onrender.com/api';

export const api = {
  missions: `${API_URL}/mission`,
  candidats: `${API_URL}/candidat`,
  messagerie: `${API_URL}/messagerie`,
  auth: `${API_URL}/auth`,
  admin: `${API_URL}/admin`,
};