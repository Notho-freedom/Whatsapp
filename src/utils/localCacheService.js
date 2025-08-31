/**
 * Service de cache local avancé pour les conversations et messages
 * Optimise l'affichage en gardant les données en mémoire et en localStorage
 */

class LocalCacheService {
  constructor() {
    this.memoryCache = new Map();
    this.conversationCache = new Map();
    this.messageCache = new Map();
    this.userCache = new Map();
    
    // Configuration du cache
    this.config = {
      maxConversations: 100,
      maxMessagesPerChat: 1000,
      maxUsers: 200,
      conversationTTL: 30 * 60 * 1000, // 30 minutes
      messageTTL: 24 * 60 * 60 * 1000, // 24 heures
      userTTL: 60 * 60 * 1000, // 1 heure
      cleanupInterval: 5 * 60 * 1000 // 5 minutes
    };
    
    // Vérifier si localStorage est disponible
    this.isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;
    
    // Initialiser le service
    this.init();
  }

  /**
   * Initialiser le service
   */
  init() {
    if (this.isLocalStorageAvailable) {
      this.loadFromStorage();
      this.startCleanupTimer();
    }
    
    console.log('🚀 Service de cache local initialisé');
  }

  /**
   * Gestion des conversations
   */
  
  // Sauvegarder une conversation
  saveConversation(conversation) {
    const key = `conv:${conversation.id}`;
    const cacheData = {
      data: conversation,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      accessCount: 1
    };
    
    this.conversationCache.set(key, cacheData);
    this.saveToStorage('conversations', key, cacheData);
    
    // Gérer la taille du cache
    this.manageCacheSize('conversations', this.config.maxConversations);
  }

  // Récupérer une conversation
  getConversation(conversationId) {
    const key = `conv:${conversationId}`;
    const cached = this.conversationCache.get(key);
    
    if (cached) {
      // Mettre à jour les statistiques d'accès
      cached.lastAccess = Date.now();
      cached.accessCount++;
      this.conversationCache.set(key, cached);
      this.saveToStorage('conversations', key, cached);
      
      return cached.data;
    }
    
    return null;
  }

  // Sauvegarder plusieurs conversations
  saveConversations(conversations) {
    conversations.forEach(conv => this.saveConversation(conv));
    console.log(`💾 ${conversations.length} conversations sauvegardées localement`);
  }

  // Récupérer toutes les conversations
  getAllConversations() {
    const conversations = [];
    for (const [key, cached] of this.conversationCache.entries()) {
      if (key.startsWith('conv:')) {
        conversations.push(cached.data);
      }
    }
    
    // Trier par dernière activité
    return conversations.sort((a, b) => {
      const aTime = this.conversationCache.get(`conv:${a.id}`)?.lastAccess || 0;
      const bTime = this.conversationCache.get(`conv:${b.id}`)?.lastAccess || 0;
      return bTime - aTime;
    });
  }

  /**
   * Gestion des messages
   */
  
  // Sauvegarder des messages pour une conversation
  saveMessages(conversationId, messages) {
    const key = `msgs:${conversationId}`;
    const cacheData = {
      data: messages,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      accessCount: 1,
      conversationId
    };
    
    this.messageCache.set(key, cacheData);
    this.saveToStorage('messages', key, cacheData);
    
    // Gérer la taille du cache des messages
    this.manageMessageCacheSize(conversationId);
  }

  // Récupérer les messages d'une conversation
  getMessages(conversationId, limit = 50, offset = 0) {
    const key = `msgs:${conversationId}`;
    const cached = this.messageCache.get(key);
    
    if (cached) {
      // Mettre à jour les statistiques d'accès
      cached.lastAccess = Date.now();
      cached.accessCount++;
      this.messageCache.set(key, cached);
      this.saveToStorage('messages', key, cached);
      
      // Retourner les messages avec pagination
      const messages = cached.data;
      return messages.slice(offset, offset + limit);
    }
    
    return [];
  }

  // Ajouter un nouveau message
  addMessage(conversationId, message) {
    const key = `msgs:${conversationId}`;
    const cached = this.messageCache.get(key);
    
    if (cached) {
      cached.data.unshift(message);
      cached.timestamp = Date.now();
      cached.lastAccess = Date.now();
      
      // Limiter le nombre de messages en cache
      if (cached.data.length > this.config.maxMessagesPerChat) {
        cached.data = cached.data.slice(0, this.config.maxMessagesPerChat);
      }
      
      this.messageCache.set(key, cached);
      this.saveToStorage('messages', key, cached);
    } else {
      // Créer un nouveau cache pour cette conversation
      this.saveMessages(conversationId, [message]);
    }
  }

  // Mettre à jour un message
  updateMessage(conversationId, messageId, updates) {
    const key = `msgs:${conversationId}`;
    const cached = this.messageCache.get(key);
    
    if (cached) {
      const messageIndex = cached.data.findIndex(msg => msg.id === messageId);
      if (messageIndex !== -1) {
        cached.data[messageIndex] = { ...cached.data[messageIndex], ...updates };
        cached.timestamp = Date.now();
        this.messageCache.set(key, cached);
        this.saveToStorage('messages', key, cached);
      }
    }
  }

  // Supprimer un message
  deleteMessage(conversationId, messageId) {
    const key = `msgs:${conversationId}`;
    const cached = this.messageCache.get(key);
    
    if (cached) {
      cached.data = cached.data.filter(msg => msg.id !== messageId);
      cached.timestamp = Date.now();
      this.messageCache.set(key, cached);
      this.saveToStorage('messages', key, cached);
    }
  }

  /**
   * Gestion des utilisateurs
   */
  
  // Sauvegarder un utilisateur
  saveUser(user) {
    const key = `user:${user.id}`;
    const cacheData = {
      data: user,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      accessCount: 1
    };
    
    this.userCache.set(key, cacheData);
    this.saveToStorage('users', key, cacheData);
    
    // Gérer la taille du cache
    this.manageCacheSize('users', this.config.maxUsers);
  }

  // Récupérer un utilisateur
  getUser(userId) {
    const key = `user:${userId}`;
    const cached = this.userCache.get(key);
    
    if (cached) {
      cached.lastAccess = Date.now();
      cached.accessCount++;
      this.userCache.set(key, cached);
      this.saveToStorage('users', key, cached);
      
      return cached.data;
    }
    
    return null;
  }

  // Sauvegarder plusieurs utilisateurs
  saveUsers(users) {
    users.forEach(user => this.saveUser(user));
  }

  /**
   * Gestion de la mémoire et du stockage
   */
  
  // Sauvegarder dans localStorage
  saveToStorage(type, key, data) {
    if (!this.isLocalStorageAvailable) return;
    
    try {
      const storageKey = `whatsapp_cache_${type}`;
      let existing = {};
      
      // Charger les données existantes avec validation
      const existingData = localStorage.getItem(storageKey);
      if (existingData && existingData.trim() !== '') {
        try {
          existing = JSON.parse(existingData);
          if (!existing || typeof existing !== 'object') {
            existing = {};
          }
        } catch (parseError) {
          console.warn('Erreur lors du parsing des données existantes, réinitialisation:', parseError);
          existing = {};
        }
      }
      
      // Ajouter les nouvelles données
      existing[key] = data;
      
      // Sauvegarder avec validation
      const jsonString = JSON.stringify(existing);
      if (jsonString && jsonString !== '{}') {
        localStorage.setItem(storageKey, jsonString);
      }
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }

  // Charger depuis localStorage
  loadFromStorage() {
    if (!this.isLocalStorageAvailable) return;
    
    try {
      // Charger les conversations avec validation
      const conversationsData = localStorage.getItem('whatsapp_cache_conversations');
      if (conversationsData && conversationsData.trim() !== '') {
        try {
          const conversations = JSON.parse(conversationsData);
          if (conversations && typeof conversations === 'object') {
            Object.entries(conversations).forEach(([key, data]) => {
              this.conversationCache.set(key, data);
            });
          }
        } catch (parseError) {
          console.warn('Erreur lors du parsing des conversations, réinitialisation du cache:', parseError);
          localStorage.removeItem('whatsapp_cache_conversations');
        }
      }
      
      // Charger les messages avec validation
      const messagesData = localStorage.getItem('whatsapp_cache_messages');
      if (messagesData && messagesData.trim() !== '') {
        try {
          const messages = JSON.parse(messagesData);
          if (messages && typeof messages === 'object') {
            Object.entries(messages).forEach(([key, data]) => {
              this.messageCache.set(key, data);
            });
          }
        } catch (parseError) {
          console.warn('Erreur lors du parsing des messages, réinitialisation du cache:', parseError);
          localStorage.removeItem('whatsapp_cache_messages');
        }
      }
      
      // Charger les utilisateurs avec validation
      const usersData = localStorage.getItem('whatsapp_cache_users');
      if (usersData && usersData.trim() !== '') {
        try {
          const users = JSON.parse(usersData);
          if (users && typeof users === 'object') {
            Object.entries(users).forEach(([key, data]) => {
              this.userCache.set(key, data);
            });
          }
        } catch (parseError) {
          console.warn('Erreur lors du parsing des utilisateurs, réinitialisation du cache:', parseError);
          localStorage.removeItem('whatsapp_cache_users');
        }
      }
      
      console.log(`📦 Cache chargé: ${this.conversationCache.size} conversations, ${this.messageCache.size} conversations de messages, ${this.userCache.size} utilisateurs`);
    } catch (error) {
      console.warn('Erreur lors du chargement du cache:', error);
    }
  }

  // Gérer la taille du cache
  manageCacheSize(type, maxSize) {
    let cache;
    let storageKey;
    
    switch (type) {
      case 'conversations':
        cache = this.conversationCache;
        storageKey = 'whatsapp_cache_conversations';
        break;
      case 'users':
        cache = this.userCache;
        storageKey = 'whatsapp_cache_users';
        break;
      default:
        return;
    }
    
    if (cache.size > maxSize) {
      // Trier par fréquence d'accès et supprimer les moins utilisés
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => {
        const aScore = a[1].accessCount * (Date.now() - a[1].lastAccess);
        const bScore = b[1].accessCount * (Date.now() - b[1].lastAccess);
        return aScore - bScore;
      });
      
      const toRemove = entries.slice(0, cache.size - maxSize);
      toRemove.forEach(([key]) => {
        cache.delete(key);
      });
      
      // Mettre à jour localStorage
      this.updateStorageAfterCleanup(storageKey, cache);
      
      console.log(`🧹 Cache ${type} nettoyé: ${toRemove.length} éléments supprimés`);
    }
  }

  // Gérer la taille du cache des messages
  manageMessageCacheSize(conversationId) {
    const key = `msgs:${conversationId}`;
    const cached = this.messageCache.get(key);
    
    if (cached && cached.data.length > this.config.maxMessagesPerChat) {
      cached.data = cached.data.slice(0, this.config.maxMessagesPerChat);
      this.messageCache.set(key, cached);
      this.saveToStorage('messages', key, cached);
    }
  }

  // Mettre à jour localStorage après nettoyage
  updateStorageAfterCleanup(storageKey, cache) {
    if (!this.isLocalStorageAvailable) return;
    
    try {
      const storageData = {};
      for (const [key, data] of cache.entries()) {
        storageData[key] = data;
      }
      localStorage.setItem(storageKey, JSON.stringify(storageData));
    } catch (error) {
      console.warn('Erreur lors de la mise à jour du localStorage:', error);
    }
  }

  // Nettoyer le cache expiré
  cleanupExpiredCache() {
    const now = Date.now();
    
    // Nettoyer les conversations expirées
    this.cleanupExpiredItems(this.conversationCache, this.config.conversationTTL, 'conversations');
    
    // Nettoyer les messages expirés
    this.cleanupExpiredItems(this.messageCache, this.config.messageTTL, 'messages');
    
    // Nettoyer les utilisateurs expirés
    this.cleanupExpiredItems(this.userCache, this.config.userTTL, 'users');
  }

  // Nettoyer les éléments expirés
  cleanupExpiredItems(cache, ttl, type) {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, data] of cache.entries()) {
      if (now - data.timestamp > ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      cache.delete(key);
    });
    
    if (expiredKeys.length > 0) {
      const storageKey = `whatsapp_cache_${type}`;
      this.updateStorageAfterCleanup(storageKey, cache);
      console.log(`🧹 Cache ${type} nettoyé: ${expiredKeys.length} éléments expirés supprimés`);
    }
  }

  // Démarrer le timer de nettoyage
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.config.cleanupInterval);
  }

  /**
   * Statistiques et informations
   */
  
  // Obtenir les statistiques du cache
  getCacheStats() {
    return {
      conversations: {
        count: this.conversationCache.size,
        memory: this.getMemoryUsage(this.conversationCache)
      },
      messages: {
        count: this.messageCache.size,
        totalMessages: Array.from(this.messageCache.values()).reduce((sum, cached) => sum + cached.data.length, 0),
        memory: this.getMemoryUsage(this.messageCache)
      },
      users: {
        count: this.userCache.size,
        memory: this.getMemoryUsage(this.userCache)
      },
      totalMemory: this.getTotalMemoryUsage()
    };
  }

  // Calculer l'utilisation mémoire
  getMemoryUsage(cache) {
    let size = 0;
    for (const [key, value] of cache.entries()) {
      size += new Blob([JSON.stringify(key)]).size;
      size += new Blob([JSON.stringify(value)]).size;
    }
    return size;
  }

  // Calculer l'utilisation mémoire totale
  getTotalMemoryUsage() {
    return this.getMemoryUsage(this.conversationCache) + 
           this.getMemoryUsage(this.messageCache) + 
           this.getMemoryUsage(this.userCache);
  }

  // Vider tout le cache
  clearAll() {
    this.conversationCache.clear();
    this.messageCache.clear();
    this.userCache.clear();
    
    if (this.isLocalStorageAvailable) {
      localStorage.removeItem('whatsapp_cache_conversations');
      localStorage.removeItem('whatsapp_cache_messages');
      localStorage.removeItem('whatsapp_cache_users');
    }
    
    console.log('🗑️ Cache local entièrement vidé');
  }

  // Exporter le cache (pour debug)
  exportCache() {
    return {
      conversations: Object.fromEntries(this.conversationCache),
      messages: Object.fromEntries(this.messageCache),
      users: Object.fromEntries(this.userCache),
      stats: this.getCacheStats()
    };
  }
}

// Créer une instance singleton
const localCacheService = new LocalCacheService();

export default localCacheService;
