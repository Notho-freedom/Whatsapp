/**
 * Service de cache pour les avatars Google
 * Gère les erreurs 429 (Too Many Requests) et implémente un système de retry
 */

class AvatarCacheService {
  constructor() {
    this.cache = new Map();
    this.failedUrls = new Set();
    this.retryQueue = new Map();
    this.maxRetries = 3;
    this.baseDelay = 1000; // 1 seconde
    this.maxDelay = 30000; // 30 secondes
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures
    this.rateLimitDelay = 60000; // 1 minute entre les tentatives pour les URLs en erreur 429
  }

  /**
   * Génère une clé de cache pour une URL
   * @param {string} url - URL de l'avatar
   * @returns {string} Clé de cache
   */
  getCacheKey(url) {
    return `avatar_${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  /**
   * Vérifie si une URL est en cache et valide
   * @param {string} url - URL de l'avatar
   * @returns {Object|null} Données du cache ou null
   */
  getFromCache(url) {
    const key = this.getCacheKey(url);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Vérifier l'expiration
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }

  /**
   * Met en cache une URL d'avatar
   * @param {string} url - URL de l'avatar
   * @param {string} dataUrl - Data URL de l'image
   * @param {Object} metadata - Métadonnées supplémentaires
   */
  setCache(url, dataUrl, metadata = {}) {
    const key = this.getCacheKey(url);
    this.cache.set(key, {
      dataUrl,
      timestamp: Date.now(),
      metadata
    });
  }

  /**
   * Marque une URL comme ayant échoué
   * @param {string} url - URL de l'avatar
   * @param {number} statusCode - Code de statut HTTP
   */
  markAsFailed(url, statusCode = 429) {
    this.failedUrls.add(url);
    
    // Pour les erreurs 429, attendre plus longtemps avant de réessayer
    const delay = statusCode === 429 ? this.rateLimitDelay : this.baseDelay;
    this.retryQueue.set(url, {
      attempts: 0,
      nextRetry: Date.now() + delay,
      statusCode
    });
  }

  /**
   * Vérifie si une URL peut être réessayée
   * @param {string} url - URL de l'avatar
   * @returns {boolean} True si l'URL peut être réessayée
   */
  canRetry(url) {
    const retryInfo = this.retryQueue.get(url);
    if (!retryInfo) return true;
    
    return Date.now() >= retryInfo.nextRetry && retryInfo.attempts < this.maxRetries;
  }

  /**
   * Incrémente le compteur de tentatives pour une URL
   * @param {string} url - URL de l'avatar
   */
  incrementRetry(url) {
    const retryInfo = this.retryQueue.get(url);
    if (retryInfo) {
      retryInfo.attempts++;
      // Backoff exponentiel avec jitter
      const delay = Math.min(
        this.baseDelay * Math.pow(2, retryInfo.attempts) + Math.random() * 1000,
        this.maxDelay
      );
      retryInfo.nextRetry = Date.now() + delay;
    }
  }

  /**
   * Supprime une URL de la liste des échecs
   * @param {string} url - URL de l'avatar
   */
  clearFailure(url) {
    this.failedUrls.delete(url);
    this.retryQueue.delete(url);
  }

  /**
   * Génère un avatar de fallback basé sur les initiales
   * @param {string} name - Nom de la personne
   * @param {string} size - Taille de l'avatar (default: 40)
   * @returns {string} Data URL de l'avatar de fallback
   */
  generateFallbackAvatar(name, size = 40) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Couleurs de fond aléatoires mais cohérentes
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colorIndex = Math.abs(hash) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    // Fond
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // Initiales
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);
    
    return canvas.toDataURL();
  }

  /**
   * Charge une image avec gestion des erreurs et cache
   * @param {string} url - URL de l'image
   * @param {string} fallbackName - Nom pour l'avatar de fallback
   * @param {Object} options - Options de chargement
   * @returns {Promise<string>} Data URL de l'image
   */
  async loadAvatar(url, fallbackName = 'User', options = {}) {
    // Vérifier le cache d'abord
    const cached = this.getFromCache(url);
    if (cached) {
      return cached.dataUrl;
    }

    // Si l'URL a échoué récemment et ne peut pas être réessayée
    if (this.failedUrls.has(url) && !this.canRetry(url)) {
      return this.generateFallbackAvatar(fallbackName, options.size);
    }

    try {
      // Charger l'image
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'force-cache',
        ...options.fetchOptions
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const dataUrl = await this.blobToDataUrl(blob);
      
      // Mettre en cache
      this.setCache(url, dataUrl, {
        size: blob.size,
        type: blob.type,
        loadedAt: Date.now()
      });
      
      // Nettoyer les échecs précédents
      this.clearFailure(url);
      
      return dataUrl;
      
    } catch (error) {
      console.warn(`Erreur lors du chargement de l'avatar ${url}:`, error);
      
      // Marquer comme échoué
      const statusCode = error.message.includes('429') ? 429 : 500;
      this.markAsFailed(url, statusCode);
      
      // Incrémenter le compteur de tentatives
      this.incrementRetry(url);
      
      // Retourner l'avatar de fallback
      return this.generateFallbackAvatar(fallbackName, options.size);
    }
  }

  /**
   * Convertit un blob en data URL
   * @param {Blob} blob - Blob à convertir
   * @returns {Promise<string>} Data URL
   */
  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Préchage des avatars en arrière-plan
   * @param {Array} urls - URLs à précharger
   * @param {Array} names - Noms correspondants pour les fallbacks
   */
  async preloadAvatars(urls, names = []) {
    const promises = urls.map((url, index) => {
      const name = names[index] || 'User';
      return this.loadAvatar(url, name).catch(error => {
        console.warn(`Erreur lors du préchargement de ${url}:`, error);
        return null;
      });
    });
    
    await Promise.allSettled(promises);
  }

  /**
   * Nettoie le cache des entrées expirées
   */
  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtient les statistiques du cache
   * @returns {Object} Statistiques du cache
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      failedUrls: this.failedUrls.size,
      retryQueue: this.retryQueue.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estime l'utilisation mémoire du cache
   * @returns {number} Taille estimée en bytes
   */
  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, value] of this.cache.entries()) {
      totalSize += key.length * 2; // Unicode
      totalSize += value.dataUrl.length * 2; // Unicode
      totalSize += JSON.stringify(value.metadata).length * 2;
    }
    return totalSize;
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.clear();
    this.failedUrls.clear();
    this.retryQueue.clear();
  }
}

// Instance singleton
const avatarCacheService = new AvatarCacheService();

// Nettoyage automatique du cache toutes les heures
setInterval(() => {
  avatarCacheService.cleanExpiredCache();
}, 60 * 60 * 1000);

export default avatarCacheService;
export { AvatarCacheService };
