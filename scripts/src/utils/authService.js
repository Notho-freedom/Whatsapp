// Service d'authentification pour centraliser la logique métier
class AuthService {
  constructor() {
    this.baseURL = '/api/auth';
  }

  // Connexion avec Google
  async loginWithGoogle(token) {
    const response = await fetch(`${this.baseURL}/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur de connexion Google');
    }

    return response.json();
  }

  // Rafraîchissement du token
  async refreshToken(refreshToken) {
    const response = await fetch(`${this.baseURL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur de rafraîchissement du token');
    }

    return response.json();
  }

  // Vérification du token
  async verifyToken(accessToken) {
    const response = await fetch(`${this.baseURL}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token invalide');
    }

    return response.json();
  }

  // Vérification de l'expiration du token
  isTokenExpired(expiresAt) {
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  }

  // Vérification si le token expire bientôt (dans les 5 minutes)
  isTokenExpiringSoon(expiresAt) {
    if (!expiresAt) return true;
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes en millisecondes
    return Date.now() >= (expiresAt - fiveMinutes);
  }

  // Stockage sécurisé des tokens (optionnel, pour plus de sécurité)
  storeTokens(accessToken, refreshToken, expiresAt) {
    // En production, vous pourriez vouloir stocker les tokens de manière plus sécurisée
    // Par exemple, dans des cookies httpOnly ou dans le localStorage avec chiffrement
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('expiresAt', expiresAt.toString());
  }

  // Récupération des tokens stockés
  getStoredTokens() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const expiresAt = localStorage.getItem('expiresAt');

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? parseInt(expiresAt) : null,
    };
  }

  // Suppression des tokens stockés
  clearStoredTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
  }
}

// Instance singleton du service
export const authService = new AuthService();
export default authService;
