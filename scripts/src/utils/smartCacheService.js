/**
 * Service de synchronisation intelligente
 * Combine le cache local avec les API existantes pour optimiser les performances
 */

import localCacheService from './localCacheService';
import firebaseService from './firebaseService';

class SmartCacheService {
  constructor() {
    this.localCache = localCacheService;
    this.firebaseService = firebaseService;
    this.syncQueue = new Map();
    this.isSyncing = false;
    this.lastSyncTime = 0;
    this.syncInterval = 30000; // 30 secondes entre synchronisations
    this.isInitialized = false;
    this.pendingChanges = new Set();
    this.syncInProgress = false;
  }

  /**
   * Initialisation intelligente - charge tout depuis le cache local
   */
  async initialize(userId) {
    if (this.isInitialized) return;
    
    console.log('🚀 Initialisation du cache intelligent en mode offline-first...');
    
    try {
      // Charger toutes les données depuis le cache local
      const conversations = this.localCache.getAllConversations();
      const users = this.localCache.getAllUsers();
      
      console.log(`📦 ${conversations.length} conversations et ${users.length} utilisateurs chargés depuis le cache local`);
      
      // Marquer comme initialisé
      this.isInitialized = true;
      this.lastSyncTime = Date.now();
      
      // Lancer la synchronisation initiale en arrière-plan (discrètement)
      this.scheduleBackgroundSync(userId);
      
      return { conversations, users };
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du cache:', error);
      throw error;
    }
  }

  /**
   * Récupération des conversations - PRIORITÉ AU CACHE LOCAL
   */
  async getConversations(userId, options = {}) {
    try {
      // 1. Récupérer immédiatement depuis le cache local
      const cachedConversations = this.localCache.getAllConversations();
      
      if (cachedConversations.length > 0) {
        console.log(`📱 ${cachedConversations.length} conversations récupérées depuis le cache local (instantané)`);
        
        // Retourner immédiatement les données du cache
        return cachedConversations;
      }
      
      // 2. Si pas de cache, alors seulement récupérer depuis Firebase
      console.log('⚠️ Aucune conversation en cache, récupération depuis Firebase...');
      const firebaseConversations = await this.firebaseService.getConversationsByUserId(userId, options.limit || 50, options.offset || 0);
      
      // Sauvegarder dans le cache local
      this.localCache.saveConversations(firebaseConversations);
      
      return firebaseConversations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  /**
   * Récupération des messages - PRIORITÉ AU CACHE LOCAL
   */
  async getMessagesFromCache(conversationId, options = {}) {
    try {
      // 1. Récupérer immédiatement depuis le cache local
      const cachedMessages = this.localCache.getMessages(conversationId, options.limit || 50, options.offset || 0);
      
      if (cachedMessages.length > 0) {
        console.log(`📝 ${cachedMessages.length} messages récupérés depuis le cache local pour ${conversationId} (instantané)`);
        
        // Retourner immédiatement les données du cache
        return cachedMessages;
      }
      
      // 2. Si pas de cache, alors seulement récupérer depuis Firebase
      console.log(`⚠️ Aucun message en cache pour ${conversationId}, récupération depuis Firebase...`);
      const firebaseMessages = await this.firebaseService.getMessages(conversationId, options.limit || 50, options.offset || 0);
      
      // Sauvegarder dans le cache local
      this.localCache.saveMessages(conversationId, firebaseMessages);
      
      return firebaseMessages;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  /**
   * Ajout de message - CACHE LOCAL D'ABORD, puis synchronisation discrète
   */
  async addMessage(conversationId, message) {
    try {
      // 1. Ajouter immédiatement au cache local (instantané)
      const messageWithId = {
        ...message,
        id: message.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: message.timestamp || new Date().toISOString(),
        isLocal: true // Marquer comme message local
      };
      
      this.localCache.addMessage(conversationId, messageWithId);
      console.log(`✅ Message ajouté au cache local (instantané): ${messageWithId.id}`);
      
      // 2. Ajouter à la queue de synchronisation (discrètement)
      this.addToSyncQueue('message', { conversationId, message: messageWithId });
      
      // 3. Retourner immédiatement le message
      return messageWithId;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  }

  /**
   * Mise à jour de message - CACHE LOCAL D'ABORD
   */
  async updateMessage(conversationId, messageId, updates) {
    try {
      // 1. Mettre à jour immédiatement le cache local
      this.localCache.updateMessage(conversationId, messageId, updates);
      console.log(`✅ Message mis à jour dans le cache local: ${messageId}`);
      
      // 2. Ajouter à la queue de synchronisation (discrètement)
      this.addToSyncQueue('message_update', { conversationId, messageId, updates });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  /**
   * Suppression de message - CACHE LOCAL D'ABORD
   */
  async deleteMessage(conversationId, messageId) {
    try {
      // 1. Supprimer immédiatement du cache local
      this.localCache.deleteMessage(conversationId, messageId);
      console.log(`✅ Message supprimé du cache local: ${messageId}`);
      
      // 2. Ajouter à la queue de synchronisation (discrètement)
      this.addToSyncQueue('message_delete', { conversationId, messageId });
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  /**
   * Ajout intelligent à la queue de synchronisation
   */
  addToSyncQueue(type, data) {
    const syncKey = `${type}:${Date.now()}`;
    
    // Éviter les doublons
    if (this.pendingChanges.has(syncKey)) return;
    
    this.syncQueue.set(syncKey, { 
      type, 
      data, 
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 2
    });
    
    this.pendingChanges.add(syncKey);
    
    // Programmer la synchronisation en arrière-plan
    this.scheduleBackgroundSync();
  }

  /**
   * Programmation intelligente de la synchronisation en arrière-plan
   */
  scheduleBackgroundSync(userId = null) {
    // Éviter les synchronisations trop fréquentes
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    
    if (timeSinceLastSync < this.syncInterval) {
      const delay = this.syncInterval - timeSinceLastSync;
      console.log(`⏰ Synchronisation programmée dans ${Math.round(delay / 1000)}s`);
      
      setTimeout(() => {
        this.processSyncQueue(userId);
      }, delay);
    } else {
      // Synchronisation immédiate si assez de temps s'est écoulé
      this.processSyncQueue(userId);
    }
  }

  /**
   * Traitement intelligent de la queue de synchronisation
   */
  async processSyncQueue(userId = null) {
    if (this.syncInProgress || this.syncQueue.size === 0) return;
    
    this.syncInProgress = true;
    console.log('🔄 Début de la synchronisation en arrière-plan...');
    
    try {
      const entries = Array.from(this.syncQueue.entries());
      let successCount = 0;
      let errorCount = 0;
      
      for (const [key, syncItem] of entries) {
        try {
          await this.syncWithFirebase(syncItem.type, syncItem.data);
          
          // Supprimer de la queue et des changements en attente
          this.syncQueue.delete(key);
          this.pendingChanges.delete(key);
          successCount++;
          
        } catch (error) {
          console.warn(`⚠️ Échec de synchronisation pour ${syncItem.type}:`, error);
          
          // Gérer les retry
          if (syncItem.retryCount < syncItem.maxRetries) {
            syncItem.retryCount++;
            syncItem.timestamp = Date.now();
            console.log(`🔄 Nouvelle tentative ${syncItem.retryCount}/${syncItem.maxRetries} pour ${syncItem.type}`);
          } else {
            // Supprimer après trop d'échecs
            this.syncQueue.delete(key);
            this.pendingChanges.delete(key);
            errorCount++;
          }
        }
      }
      
      if (successCount > 0 || errorCount > 0) {
        console.log(`✅ Synchronisation terminée: ${successCount} succès, ${errorCount} échecs`);
      }
      
      this.lastSyncTime = Date.now();
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement de la queue de synchronisation:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Synchronisation avec Firebase - UNIQUEMENT les nouvelles données
   */
  async syncWithFirebase(type, data) {
    try {
      switch (type) {
        case 'message':
          // Vérifier si le message existe déjà sur Firebase
          const existingMessage = await this.firebaseService.getMessages(data.conversationId, 1, 0);
          const messageExists = existingMessage.some(msg => 
            msg.text === data.message.text && 
            msg.sender === data.message.sender &&
            Math.abs(new Date(msg.timestamp) - new Date(data.message.timestamp)) < 60000 // 1 minute
          );
          
          if (!messageExists) {
            await this.firebaseService.addMessage(data.conversationId, data.message);
            console.log(`☁️ Nouveau message synchronisé avec Firebase: ${data.message.id}`);
          } else {
            console.log(`ℹ️ Message déjà synchronisé, ignoré: ${data.message.id}`);
          }
          break;
          
        case 'message_update':
          await this.firebaseService.updateMessage(data.conversationId, data.messageId, data.updates);
          console.log(`☁️ Mise à jour de message synchronisée avec Firebase: ${data.messageId}`);
          break;
          
        case 'message_delete':
          await this.firebaseService.deleteMessage(data.conversationId, data.messageId);
          console.log(`☁️ Suppression de message synchronisée avec Firebase: ${data.messageId}`);
          break;
          
        default:
          console.warn(`⚠️ Type de synchronisation non géré: ${type}`);
      }
    } catch (error) {
      console.error(`❌ Erreur de synchronisation pour ${type}:`, error);
      throw error;
    }
  }

  /**
   * Préchargement intelligent - UNIQUEMENT si nécessaire
   */
  async preloadData(userId) {
    if (!this.isInitialized) {
      console.log('⚠️ Cache non initialisé, initialisation en cours...');
      await this.initialize(userId);
      return;
    }
    
    // Vérifier si une synchronisation est nécessaire
    const timeSinceLastSync = Date.now() - this.lastSyncTime;
    
    if (timeSinceLastSync < this.syncInterval) {
      console.log(`ℹ️ Synchronisation récente (${Math.round(timeSinceLastSync / 1000)}s), préchargement ignoré`);
      return;
    }
    
    console.log('🔄 Préchargement des données depuis Firebase en arrière-plan...');
    
    try {
      // Récupérer uniquement les nouvelles conversations
      const firebaseConversations = await this.firebaseService.getConversationsByUserId(userId, 50, 0);
      const cachedConversations = this.localCache.getAllConversations();
      
      // Identifier les nouvelles conversations
      const newConversations = firebaseConversations.filter(fbConv => 
        !cachedConversations.some(cachedConv => cachedConv.id === fbConv.id)
      );
      
      if (newConversations.length > 0) {
        console.log(`🆕 ${newConversations.length} nouvelles conversations détectées`);
        this.localCache.saveConversations(newConversations);
      }
      
      // Mettre à jour le timestamp de synchronisation
      this.lastSyncTime = Date.now();
      
    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
    }
  }

  /**
   * Statistiques de performance
   */
  getPerformanceStats() {
    const cacheStats = this.localCache.getCacheStats();
    const queueSize = this.syncQueue.size;
    const pendingChanges = this.pendingChanges.size;
    
    return {
      cache: cacheStats,
      sync: {
        queueSize,
        pendingChanges,
        lastSync: this.lastSyncTime,
        isSyncing: this.syncInProgress,
        isInitialized: this.isInitialized
      },
      performance: {
        cacheHitRate: this.calculateCacheHitRate(),
        syncEfficiency: this.calculateSyncEfficiency()
      }
    };
  }

  /**
   * Calcul du taux de succès du cache
   */
  calculateCacheHitRate() {
    const stats = this.localCache.getCacheStats();
    const totalRequests = stats.totalRequests || 1;
    const cacheHits = stats.cacheHits || 0;
    
    return Math.round((cacheHits / totalRequests) * 100);
  }

  /**
   * Calcul de l'efficacité de la synchronisation
   */
  calculateSyncEfficiency() {
    if (this.syncQueue.size === 0) return 100;
    
    const totalItems = this.syncQueue.size + this.pendingChanges.size;
    const processedItems = totalItems - this.syncQueue.size;
    
    return Math.round((processedItems / totalItems) * 100);
  }

  /**
   * Nettoyage et réinitialisation
   */
  cleanup() {
    this.syncQueue.clear();
    this.pendingChanges.clear();
    this.isSyncing = false;
    this.syncInProgress = false;
    this.isInitialized = false;
    console.log('🧹 Cache intelligent nettoyé');
  }
}

// Instance singleton
const smartCacheService = new SmartCacheService();

export default smartCacheService;
