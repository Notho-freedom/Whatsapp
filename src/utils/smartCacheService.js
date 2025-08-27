/**
 * Service de synchronisation intelligente
 * Combine le cache local avec les API existantes pour optimiser les performances
 */

import localCacheService from './localCacheService';
import cachedFirebaseService from './cachedFirebaseService';

class SmartCacheService {
  constructor() {
    this.localCache = localCacheService;
    this.firebaseService = cachedFirebaseService;
    this.syncQueue = new Map();
    this.isSyncing = false;
  }

  /**
   * Charger les conversations avec stratégie de cache intelligente
   */
  async getConversations(userId, options = {}) {
    const {
      forceRefresh = false,
      limit = 50,
      offset = 0,
      useLocalFirst = true
    } = options;

    try {
      // 1. Essayer le cache local d'abord (si activé)
      if (useLocalFirst && !forceRefresh) {
        const cachedConversations = this.localCache.getAllConversations();
        if (cachedConversations.length > 0) {
          console.log(`📦 ${cachedConversations.length} conversations récupérées du cache local`);
          
          // Retourner les conversations paginées
          const paginatedConversations = cachedConversations.slice(offset, offset + limit);
          
          // Synchroniser en arrière-plan si nécessaire
          this.syncInBackground('conversations', userId);
          
          return {
            data: paginatedConversations,
            fromCache: true,
            total: cachedConversations.length,
            hasMore: offset + limit < cachedConversations.length
          };
        }
      }

      // 2. Charger depuis Firebase si pas de cache
      console.log('🔥 Chargement des conversations depuis Firebase...');
      const firebaseConversations = await this.firebaseService.getConversations(userId, limit, offset);
      
      if (firebaseConversations && firebaseConversations.length > 0) {
        // Sauvegarder dans le cache local
        this.localCache.saveConversations(firebaseConversations);
        
        return {
          data: firebaseConversations,
          fromCache: false,
          total: firebaseConversations.length,
          hasMore: firebaseConversations.length === limit
        };
      }

      return {
        data: [],
        fromCache: false,
        total: 0,
        hasMore: false
      };
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      
      // En cas d'erreur, essayer de récupérer depuis le cache local
      const fallbackConversations = this.localCache.getAllConversations();
      if (fallbackConversations.length > 0) {
        console.log('🔄 Utilisation du cache local comme fallback');
        return {
          data: fallbackConversations.slice(offset, offset + limit),
          fromCache: true,
          total: fallbackConversations.length,
          hasMore: offset + limit < fallbackConversations.length,
          error: error.message
        };
      }
      
      throw error;
    }
  }

  /**
   * Charger les messages avec stratégie de cache intelligente
   */
  async getMessages(conversationId, options = {}) {
    const {
      forceRefresh = false,
      limit = 50,
      offset = 0,
      useLocalFirst = true
    } = options;

    try {
      // 1. Essayer le cache local d'abord
      if (useLocalFirst && !forceRefresh) {
        const cachedMessages = this.localCache.getMessages(conversationId, limit, offset);
        if (cachedMessages.length > 0) {
          console.log(`📦 ${cachedMessages.length} messages récupérés du cache local pour ${conversationId}`);
          
          return {
            data: cachedMessages,
            fromCache: true,
            total: cachedMessages.length,
            hasMore: cachedMessages.length === limit
          };
        }
      }

      // 2. Charger depuis Firebase si pas de cache
      console.log(`🔥 Chargement des messages depuis Firebase pour ${conversationId}...`);
      const firebaseMessages = await this.firebaseService.getMessages(conversationId, limit, offset);
      
      if (firebaseMessages && firebaseMessages.length > 0) {
        // Sauvegarder dans le cache local
        this.localCache.saveMessages(conversationId, firebaseMessages);
        
        return {
          data: firebaseMessages,
          fromCache: false,
          total: firebaseMessages.length,
          hasMore: firebaseMessages.length === limit
        };
      }

      return {
        data: [],
        fromCache: false,
        total: 0,
        hasMore: false
      };
    } catch (error) {
      console.error(`Erreur lors du chargement des messages pour ${conversationId}:`, error);
      
      // En cas d'erreur, essayer de récupérer depuis le cache local
      const fallbackMessages = this.localCache.getMessages(conversationId, limit, offset);
      if (fallbackMessages.length > 0) {
        console.log(`🔄 Utilisation du cache local comme fallback pour ${conversationId}`);
        return {
          data: fallbackMessages,
          fromCache: true,
          total: fallbackMessages.length,
          hasMore: fallbackMessages.length === limit,
          error: error.message
        };
      }
      
      throw error;
    }
  }

  /**
   * Ajouter un message avec synchronisation intelligente
   */
  async addMessage(conversationId, message) {
    try {
      // 1. Ajouter au cache local immédiatement (pour l'affichage instantané)
      this.localCache.addMessage(conversationId, message);
      
      // 2. Synchroniser avec Firebase en arrière-plan
      this.syncInBackground('message', { conversationId, message });
      
      return {
        success: true,
        message: message,
        fromCache: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un message avec synchronisation intelligente
   */
  async updateMessage(conversationId, messageId, updates) {
    try {
      // 1. Mettre à jour le cache local immédiatement
      this.localCache.updateMessage(conversationId, messageId, updates);
      
      // 2. Synchroniser avec Firebase en arrière-plan
      this.syncInBackground('messageUpdate', { conversationId, messageId, updates });
      
      return {
        success: true,
        fromCache: true
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  /**
   * Supprimer un message avec synchronisation intelligente
   */
  async deleteMessage(conversationId, messageId) {
    try {
      // 1. Supprimer du cache local immédiatement
      this.localCache.deleteMessage(conversationId, messageId);
      
      // 2. Synchroniser avec Firebase en arrière-plan
      this.syncInBackground('messageDelete', { conversationId, messageId });
      
      return {
        success: true,
        fromCache: true
      };
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  /**
   * Synchronisation en arrière-plan
   */
  async syncInBackground(type, data) {
    const syncKey = `${type}:${Date.now()}`;
    
    // Ajouter à la queue de synchronisation
    this.syncQueue.set(syncKey, { type, data, timestamp: Date.now() });
    
    // Démarrer la synchronisation si pas déjà en cours
    if (!this.isSyncing) {
      this.processSyncQueue();
    }
  }

  /**
   * Traiter la queue de synchronisation
   */
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.size === 0) return;
    
    this.isSyncing = true;
    
    try {
      const entries = Array.from(this.syncQueue.entries());
      
      for (const [key, { type, data }] of entries) {
        try {
          await this.syncWithFirebase(type, data);
          this.syncQueue.delete(key);
          console.log(`✅ Synchronisation réussie: ${type}`);
        } catch (error) {
          console.error(`❌ Erreur de synchronisation pour ${type}:`, error);
          // Garder dans la queue pour réessayer plus tard
        }
      }
    } finally {
      this.isSyncing = false;
      
      // Reprocesser la queue s'il y a de nouveaux éléments
      if (this.syncQueue.size > 0) {
        setTimeout(() => this.processSyncQueue(), 1000);
      }
    }
  }

  /**
   * Synchroniser avec Firebase
   */
  async syncWithFirebase(type, data) {
    switch (type) {
      case 'conversations':
        // Synchroniser les conversations
        break;
        
      case 'message':
        // Ajouter le message à Firebase
        if (data.conversationId && data.message) {
          await this.firebaseService.addMessage(data.conversationId, data.message);
        }
        break;
        
      case 'messageUpdate':
        // Mettre à jour le message dans Firebase
        if (data.conversationId && data.messageId && data.updates) {
          await this.firebaseService.updateMessage(data.conversationId, data.messageId, data.updates);
        }
        break;
        
      case 'messageDelete':
        // Supprimer le message de Firebase
        if (data.conversationId && data.messageId) {
          await this.firebaseService.deleteMessage(data.conversationId, data.messageId);
        }
        break;
        
      default:
        console.warn('Type de synchronisation non reconnu:', type);
    }
  }

  /**
   * Précharger les données fréquemment utilisées
   */
  async preloadFrequentlyUsedData(userId) {
    try {
      console.log('🚀 Préchargement des données fréquemment utilisées...');
      
      // Précharger les conversations récentes
      const conversations = await this.getConversations(userId, { limit: 20, useLocalFirst: true });
      
      // Précharger les messages des conversations récentes
      if (conversations.data.length > 0) {
        for (const conv of conversations.data.slice(0, 5)) {
          await this.getMessages(conv.id, { limit: 30, useLocalFirst: true });
        }
      }
      
      console.log('✅ Préchargement terminé');
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    }
  }

  /**
   * Obtenir les statistiques de performance
   */
  getPerformanceStats() {
    const cacheStats = this.localCache.getCacheStats();
    const queueSize = this.syncQueue.size;
    
    return {
      cache: cacheStats,
      syncQueue: {
        size: queueSize,
        isProcessing: this.isSyncing
      },
      performance: {
        cacheHitRate: this.calculateCacheHitRate(),
        syncEfficiency: this.calculateSyncEfficiency()
      }
    };
  }

  /**
   * Calculer le taux de succès du cache
   */
  calculateCacheHitRate() {
    // Logique pour calculer le taux de succès du cache
    // À implémenter avec des métriques réelles
    return 0.85; // Exemple
  }

  /**
   * Calculer l'efficacité de la synchronisation
   */
  calculateSyncEfficiency() {
    // Logique pour calculer l'efficacité de la synchronisation
    // À implémenter avec des métriques réelles
    return 0.92; // Exemple
  }

  /**
   * Nettoyer le cache et la queue de synchronisation
   */
  cleanup() {
    this.localCache.clearAll();
    this.syncQueue.clear();
    this.isSyncing = false;
    console.log('🧹 Service de cache intelligent nettoyé');
  }
}

// Créer une instance singleton
const smartCacheService = new SmartCacheService();

export default smartCacheService;
