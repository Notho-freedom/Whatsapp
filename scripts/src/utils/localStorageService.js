/**
 * Service de stockage local pour optimiser les performances
 * Cache les données fréquemment utilisées pour réduire les requêtes Firebase
 */

class LocalStorageService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes par défaut
    this.maxCacheSize = 100; // Nombre maximum d'éléments en cache
    
    // Vérifier si localStorage est disponible (côté client uniquement)
    this.isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    // Initialiser le cache depuis localStorage seulement si disponible
    if (this.isLocalStorageAvailable) {
      this.loadFromStorage();
      
      // Nettoyer le cache expiré périodiquement
      setInterval(() => this.cleanupExpiredCache(), 60000); // Toutes les minutes
    }
  }

  /**
   * Générer une clé de cache
   */
  generateKey(prefix, identifier) {
    return `${prefix}:${identifier}`;
  }

  /**
   * Vérifier si une clé existe et n'est pas expirée
   */
  has(key) {
    if (!this.cache.has(key)) return false;
    
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Récupérer une valeur du cache
   */
  get(key) {
    if (!this.has(key)) return null;
    return this.cache.get(key);
  }

  /**
   * Stocker une valeur dans le cache
   */
  set(key, value, ttl = this.defaultTTL) {
    // Gérer la taille du cache
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
    
    // Sauvegarder dans localStorage pour la persistance
    this.saveToStorage();
  }

  /**
   * Supprimer une clé du cache
   */
  delete(key) {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    this.saveToStorage();
  }

  /**
   * Vider tout le cache
   */
  clear() {
    this.cache.clear();
    this.cacheExpiry.clear();
    this.saveToStorage();
  }

  /**
   * Supprimer les éléments expirés
   */
  cleanupExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now > expiry) {
        this.delete(key);
      }
    }
  }

  /**
   * Supprimer les éléments les plus anciens
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (expiry < oldestTime) {
        oldestTime = expiry;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  /**
   * Sauvegarder le cache dans localStorage
   */
  saveToStorage() {
    if (!this.isLocalStorageAvailable) return;
    
    try {
      const cacheData = {
        cache: Array.from(this.cache.entries()),
        expiry: Array.from(this.cacheExpiry.entries())
      };
      localStorage.setItem('whatsapp_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  /**
   * Charger le cache depuis localStorage
   */
  loadFromStorage() {
    if (!this.isLocalStorageAvailable) return;
    
    try {
      const cacheData = localStorage.getItem('whatsapp_cache');
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(parsed.cache || []);
        this.cacheExpiry = new Map(parsed.expiry || []);
        
        // Nettoyer les éléments expirés au chargement
        this.cleanupExpiredCache();
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
      this.clear();
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: this.getHitRate(),
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Calculer le taux de réussite du cache
   */
  getHitRate() {
    // Implémentation simplifiée - pourrait être améliorée avec des métriques réelles
    return this.cache.size / this.maxCacheSize;
  }

  /**
   * Estimer l'utilisation mémoire
   */
  getMemoryUsage() {
    try {
      const cacheString = JSON.stringify(Array.from(this.cache.entries()));
      return cacheString.length;
    } catch (error) {
      return 0;
    }
  }

  // Méthodes spécialisées pour les différents types de données

  /**
   * Cache pour les conversations
   */
  getConversation(conversationId) {
    return this.get(this.generateKey('conversation', conversationId));
  }

  setConversation(conversationId, conversation, ttl = 10 * 60 * 1000) { // 10 minutes
    this.set(this.generateKey('conversation', conversationId), conversation, ttl);
  }

  /**
   * Cache pour les messages
   */
  getMessages(conversationId) {
    return this.get(this.generateKey('messages', conversationId));
  }

  setMessages(conversationId, messages, ttl = 5 * 60 * 1000) { // 5 minutes
    this.set(this.generateKey('messages', conversationId), messages, ttl);
  }

  /**
   * Cache pour les utilisateurs
   */
  getUser(userId) {
    return this.get(this.generateKey('user', userId));
  }

  setUser(userId, user, ttl = 30 * 60 * 1000) { // 30 minutes
    this.set(this.generateKey('user', userId), user, ttl);
  }

  /**
   * Cache pour les contacts
   */
  getContacts(userId) {
    return this.get(this.generateKey('contacts', userId));
  }

  setContacts(userId, contacts, ttl = 15 * 60 * 1000) { // 15 minutes
    this.set(this.generateKey('contacts', userId), contacts, ttl);
  }

  /**
   * Cache pour les notifications
   */
  getNotifications(userId) {
    return this.get(this.generateKey('notifications', userId));
  }

  setNotifications(userId, notifications, ttl = 2 * 60 * 1000) { // 2 minutes
    this.set(this.generateKey('notifications', userId), notifications, ttl);
  }

  /**
   * Invalider le cache pour une conversation
   */
  invalidateConversation(conversationId) {
    this.delete(this.generateKey('conversation', conversationId));
    this.delete(this.generateKey('messages', conversationId));
  }

  /**
   * Invalider le cache pour un utilisateur
   */
  invalidateUser(userId) {
    this.delete(this.generateKey('user', userId));
    this.delete(this.generateKey('contacts', userId));
  }

  /**
   * Invalider tout le cache lié aux messages
   */
  invalidateAllMessages() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('messages:')) {
        this.delete(key);
      }
    }
  }

  /**
   * Invalider tout le cache lié aux conversations
   */
  invalidateAllConversations() {
    for (const key of this.cache.keys()) {
      if (key.startsWith('conversation:')) {
        this.delete(key);
      }
    }
  }
}

// Instance singleton
const localStorageService = new LocalStorageService();

export default localStorageService;
