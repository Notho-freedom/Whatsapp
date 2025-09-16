import { getAuth } from 'firebase/auth';

/**
 * Intercepteur pour les requêtes API
 * Vérifie automatiquement l'expiration du token et le rafraîchit si nécessaire
 */
class ApiInterceptor {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
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
    const auth = getAuth();
    const isAuthenticated = Boolean(auth.currentUser);
    if (!isAuthenticated) return null;

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await auth.currentUser.getIdToken(true);
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
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        try { await getAuth().signOut(); } catch {}
        throw error;
      }
    }

    return response;
  }
}

// Instance singleton
const apiInterceptor = new ApiInterceptor();

export default apiInterceptor;
