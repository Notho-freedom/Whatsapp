import { auth } from '@/config/firebase';

/**
 * Intercepteur pour les requêtes API
 * Vérifie automatiquement l'expiration du token et le rafraîchit si nécessaire
 */
class ApiInterceptor {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.getToken = async () => {
      if (auth?.currentUser) {
        try {
          return await auth.currentUser.getIdToken();
        } catch (e) {
          return null;
        }
      }
      return null;
    };
    this.refreshToken = async () => {
      if (auth?.currentUser) {
        try {
          return await auth.currentUser.getIdToken(true);
        } catch (e) {
          return null;
        }
      }
      return null;
    };
  }

  /**
   * Traite la file d'attente des requêtes échouées
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Vérifie et rafraîchit le token si nécessaire
   */
  async checkAndRefreshToken() {
    const token = await this.getToken();
    if (token) return token;

    // Si déjà en train de rafraîchir, attendre
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();
      this.processQueue(null, newToken);
      return newToken;
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Wrapper pour fetch avec gestion automatique des tokens
   */
  async fetch(url, options = {}) {
    // Vérifier et rafraîchir le token si nécessaire
    const token = await this.checkAndRefreshToken();
    
    // Ajouter le token d'authentification si disponible
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    // Effectuer la requête
    const response = await fetch(url, options);

    // Si la réponse indique un token expiré, essayer de le rafraîchir
    if (response.status === 401) {
      try {
        const newToken = await this.checkAndRefreshToken();
        if (newToken) {
          // Réessayer la requête avec le nouveau token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          };
          return await fetch(url, options);
        }
      } catch (error) {
        throw error;
      }
    }

    return response;
  }
}

// Instance singleton
const apiInterceptor = new ApiInterceptor();

export default apiInterceptor;
