'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import localCacheService from '@/utils/localCacheService';
import smartCacheService from '@/utils/smartCacheService';

export function useLocalCache() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheStats, setCacheStats] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const initializationRef = useRef(false);

  // Initialisation intelligente du cache
  const initializeCache = useCallback(async (userId = null) => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      console.log('🚀 Initialisation du cache local...');
      
      // Initialiser le cache local
      localCacheService.init();
      
      // Initialiser le service intelligent
      if (userId) {
        await smartCacheService.initialize(userId);
      }
      
      setIsInitialized(true);
      updateCacheStats();
      
      console.log('✅ Cache local initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du cache:', error);
      setIsInitialized(false);
    } finally {
      initializationRef.current = false;
    }
  }, []);

  // Mise à jour des statistiques du cache
  const updateCacheStats = useCallback(() => {
    try {
      const localStats = localCacheService.getCacheStats();
      const smartStats = smartCacheService.getPerformanceStats();
      
      setCacheStats({
        ...localStats,
        smart: smartStats,
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.warn('⚠️ Erreur lors de la mise à jour des statistiques:', error);
    }
  }, []);

  // Sauvegarder une conversation (instantané)
  const saveConversation = useCallback((conversation) => {
    try {
      localCacheService.saveConversation(conversation);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la conversation:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Sauvegarder plusieurs conversations (instantané)
  const saveConversations = useCallback((conversations) => {
    try {
      localCacheService.saveConversations(conversations);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des conversations:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Récupérer toutes les conversations (asynchrone et non-bloquante)
  const getAllConversations = useCallback(async () => {
    try {
      // Utiliser requestIdleCallback pour ne pas bloquer l'interface
      if (window.requestIdleCallback) {
        return new Promise((resolve) => {
          window.requestIdleCallback(() => {
            const result = localCacheService.getAllConversations();
            resolve(result);
          }, { timeout: 500 });
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
        return new Promise((resolve) => {
          setTimeout(() => {
            const result = localCacheService.getAllConversations();
            resolve(result);
          }, 50);
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }, []);

  // Récupérer une conversation spécifique (asynchrone)
  const getConversation = useCallback(async (conversationId) => {
    try {
      if (window.requestIdleCallback) {
        return new Promise((resolve) => {
          window.requestIdleCallback(() => {
            const result = localCacheService.getConversation(conversationId);
            resolve(result);
          }, { timeout: 100 });
        });
      } else {
        return new Promise((resolve) => {
          setTimeout(() => {
            const result = localCacheService.getConversation(conversationId);
            resolve(result);
          }, 10);
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la conversation:', error);
      return null;
    }
  }, []);

  // Sauvegarder des messages (instantané)
  const saveMessages = useCallback((conversationId, messages) => {
    try {
      localCacheService.saveMessages(conversationId, messages);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des messages:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Récupérer des messages (asynchrone et non-bloquante)
  const getMessages = useCallback(async (conversationId, limit = 50, offset = 0) => {
    try {
      if (window.requestIdleCallback) {
        return new Promise((resolve) => {
          window.requestIdleCallback(() => {
            const result = localCacheService.getMessages(conversationId, limit, offset);
            resolve(result);
          }, { timeout: 200 });
        });
      } else {
        return new Promise((resolve) => {
          setTimeout(() => {
            const result = localCacheService.getMessages(conversationId, limit, offset);
            resolve(result);
          }, 20);
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      return [];
    }
  }, []);

  // Récupérer les derniers messages d'une conversation (asynchrone et optimisé)
  const getLastMessages = useCallback(async (conversationId, count = 5) => {
    try {
      if (window.requestIdleCallback) {
        return new Promise((resolve) => {
          window.requestIdleCallback(() => {
            const messages = localCacheService.getMessages(conversationId, count, 0);
            const sortedMessages = messages.sort((a, b) => new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time));
            resolve(sortedMessages);
          }, { timeout: 100 });
        });
      } else {
        return new Promise((resolve) => {
          setTimeout(() => {
            const messages = localCacheService.getMessages(conversationId, count, 0);
            const sortedMessages = messages.sort((a, b) => new Date(b.timestamp || b.time) - new Date(a.timestamp || a.time));
            resolve(sortedMessages);
          }, 10);
        });
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lors de la récupération des derniers messages pour ${conversationId}:`, error);
      return [];
    }
  }, []);

  // Ajouter un message (instantané + synchronisation discrète)
  const addMessage = useCallback(async (conversationId, message) => {
    try {
      // Utiliser le service intelligent pour la synchronisation
      const result = await smartCacheService.addMessage(conversationId, message);
      updateCacheStats();
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  }, [updateCacheStats]);

  // Mettre à jour un message (instantané + synchronisation discrète)
  const updateMessage = useCallback(async (conversationId, messageId, updates) => {
    try {
      const result = await smartCacheService.updateMessage(conversationId, messageId, updates);
      updateCacheStats();
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }, [updateCacheStats]);

  // Supprimer un message (instantané + synchronisation discrète)
  const deleteMessage = useCallback(async (conversationId, messageId) => {
    try {
      const result = await smartCacheService.deleteMessage(conversationId, messageId);
      updateCacheStats();
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }, [updateCacheStats]);

  // Sauvegarder un utilisateur (instantané)
  const saveUser = useCallback((user) => {
    try {
      localCacheService.saveUser(user);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'utilisateur:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Sauvegarder plusieurs utilisateurs (instantané)
  const saveUsers = useCallback((users) => {
    try {
      localCacheService.saveUsers(users);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des utilisateurs:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Récupérer un utilisateur (instantané)
  const getUser = useCallback((userId) => {
    try {
      return localCacheService.getUser(userId);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }, []);

  // Récupérer tous les utilisateurs (instantané)
  const getAllUsers = useCallback(() => {
    try {
      return localCacheService.getAllUsers();
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }, []);

  // Synchronisation avec le cache (instantané)
  const syncWithCache = useCallback((data, type) => {
    try {
      switch (type) {
        case 'conversations':
          saveConversations(data);
          break;
        case 'users':
          saveUsers(data);
          break;
        case 'messages':
          if (data.conversationId && data.messages) {
            saveMessages(data.conversationId, data.messages);
          }
          break;
        default:
          console.warn(`⚠️ Type de synchronisation non géré: ${type}`);
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec le cache:', error);
      return false;
    }
  }, [saveConversations, saveUsers, saveMessages]);

  // Préchargement intelligent des données (discrètement)
  const preloadData = useCallback(async (userId = null) => {
    try {
      setIsSyncing(true);
      console.log('🔄 Préchargement intelligent des données...');
      
      // Utiliser le service intelligent pour le préchargement
      await smartCacheService.preloadData(userId);
      
      // Mettre à jour les statistiques
      updateCacheStats();
      setLastSyncTime(Date.now());
      
      console.log('✅ Préchargement terminé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [updateCacheStats]);

  // Nettoyer le cache
  const clearCache = useCallback(async () => {
    try {
      localCacheService.clearAll();
      smartCacheService.cleanup();
      updateCacheStats();
      console.log('🧹 Cache nettoyé');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage du cache:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Exporter le cache
  const exportCache = useCallback(() => {
    try {
      return localCacheService.exportCache();
    } catch (error) {
      console.error('❌ Erreur lors de l\'export du cache:', error);
      return null;
    }
  }, []);

  // Mise à jour périodique des statistiques
  useEffect(() => {
    if (isInitialized) {
      const statsInterval = setInterval(updateCacheStats, 10000); // Toutes les 10 secondes
      return () => clearInterval(statsInterval);
    }
  }, [isInitialized, updateCacheStats]);

  return {
    // État
    isInitialized,
    cacheStats,
    isSyncing,
    lastSyncTime,
    
    // Initialisation
    initializeCache,
    
    // Gestion des conversations
    saveConversation,
    saveConversations,
    getAllConversations,
    getConversation,
    
    // Gestion des messages
    saveMessages,
    getMessages,
    getLastMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    
    // Gestion des utilisateurs
    saveUser,
    saveUsers,
    getUser,
    getAllUsers,
    
    // Synchronisation
    syncWithCache,
    preloadData,
    
    // Maintenance
    clearCache,
    exportCache,
    updateCacheStats
  };
}
