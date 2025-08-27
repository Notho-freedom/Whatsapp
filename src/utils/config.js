// Configuration pour les URLs de l'API
const getApiBaseUrl = () => {
  // En développement, utiliser le port dynamique
  if (typeof window !== 'undefined') {
    // Côté client
    const port = window.location.port || '3000';
    return `http://localhost:${port}`;
  }
  // Côté serveur
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

// URLs des endpoints
export const API_ENDPOINTS = {
  TEMP_CONVERSATIONS: `${API_BASE_URL}/api/temp-conversations`,
  CONVERSATIONS: `${API_BASE_URL}/api/conversations`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    VERIFY: `${API_BASE_URL}/api/auth/verify`
  }
};
