'use client';

/**
 * Hook personnalisé pour la gestion du cache local
 * Optimise l'affichage en gardant les données en mémoire et en localStorage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import localCacheService from '@/utils/localCacheService';

export function useLocalCache() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheStats, setCacheStats] = useState(null);
  const syncInProgress = useRef(false);

  /**
   * Initialiser le cache
   */
  const initializeCache = useCallback(async () => {
    try {
      // Le service se charge automatiquement depuis localStorage
      setIsInitialized(true);
      updateCacheStats();
      console.log('✅ Cache local initialisé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du cache:', error);
    }
  }, []);

  /**
   * Mettre à jour les statistiques du cache
   */
  const updateCacheStats = useCallback(() => {
    const stats = localCacheService.getCacheStats();
    setCacheStats(stats);
  }, []);

  /**
   * Gestion des conversations
   */
  
  // Sauvegarder une conversation
  const saveConversation = useCallback((conversation) => {
    try {
      localCacheService.saveConversation(conversation);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la conversation:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Sauvegarder plusieurs conversations
  const saveConversations = useCallback((conversations) => {
    try {
      localCacheService.saveConversations(conversations);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des conversations:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Récupérer une conversation
  const getConversation = useCallback((conversationId) => {
    return localCacheService.getConversation(conversationId);
  }, []);

  // Récupérer toutes les conversations
  const getAllConversations = useCallback(() => {
    return localCacheService.getAllConversations();
  }, []);

  /**
   * Gestion des messages
   */
  
  // Sauvegarder des messages pour une conversation
  const saveMessages = useCallback((conversationId, messages) => {
    try {
      localCacheService.saveMessages(conversationId, messages);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des messages:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Récupérer les messages d'une conversation
  const getMessages = useCallback((conversationId, limit = 50, offset = 0) => {
    return localCacheService.getMessages(conversationId, limit, offset);
  }, []);

  // Ajouter un nouveau message
  const addMessage = useCallback((conversationId, message) => {
    try {
      localCacheService.addMessage(conversationId, message);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Mettre à jour un message
  const updateMessage = useCallback((conversationId, messageId, updates) => {
    try {
      localCacheService.updateMessage(conversationId, messageId, updates);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du message:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Supprimer un message
  const deleteMessage = useCallback((conversationId, messageId) => {
    try {
      localCacheService.deleteMessage(conversationId, messageId);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      return false;
    }
  }, [updateCacheStats]);

  /**
   * Gestion des utilisateurs
   */
  
  // Sauvegarder un utilisateur
  const saveUser = useCallback((user) => {
    try {
      localCacheService.saveUser(user);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Sauvegarder plusieurs utilisateurs
  const saveUsers = useCallback((users) => {
    try {
      localCacheService.saveUsers(users);
      updateCacheStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Récupérer un utilisateur
  const getUser = useCallback((userId) => {
    return localCacheService.getUser(userId);
  }, []);

  /**
   * Synchronisation intelligente
   */
  
  // Synchroniser les données avec le cache local
  const syncWithCache = useCallback(async (data, type) => {
    if (syncInProgress.current) {
      console.log('⏳ Synchronisation déjà en cours, ignorée');
      return;
    }

    syncInProgress.current = true;
    
    try {
      switch (type) {
        case 'conversations':
          if (Array.isArray(data)) {
            saveConversations(data);
          }
          break;
          
        case 'messages':
          if (data.conversationId && Array.isArray(data.messages)) {
            saveMessages(data.conversationId, data.messages);
          }
          break;
          
        case 'users':
          if (Array.isArray(data)) {
            saveUsers(data);
          }
          break;
          
        default:
          console.warn('Type de données non reconnu pour la synchronisation:', type);
      }
      
      console.log(`🔄 Données synchronisées avec le cache local: ${type}`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [saveConversations, saveMessages, saveUsers]);

  /**
   * Gestion du cache
   */
  
  // Vider le cache
  const clearCache = useCallback(() => {
    try {
      localCacheService.clearAll();
      updateCacheStats();
      console.log('🗑️ Cache local vidé');
      return true;
    } catch (error) {
      console.error('Erreur lors du vidage du cache:', error);
      return false;
    }
  }, [updateCacheStats]);

  // Exporter le cache
  const exportCache = useCallback(() => {
    return localCacheService.exportCache();
  }, []);

  // Charger des données depuis le cache avec fallback
  const loadFromCache = useCallback(async (key, fallbackFunction, options = {}) => {
    const { 
      type = 'conversations', 
      forceRefresh = false, 
      maxAge = 5 * 60 * 1000 // 5 minutes par défaut
    } = options;

    try {
      // Si pas de force refresh, essayer le cache d'abord
      if (!forceRefresh) {
        let cachedData = null;
        
        switch (type) {
          case 'conversations':
            if (key === 'all') {
              cachedData = getAllConversations();
            } else {
              cachedData = getConversation(key);
            }
            break;
            
          case 'messages':
            cachedData = getMessages(key, options.limit || 50, options.offset || 0);
            break;
            
          case 'users':
            cachedData = getUser(key);
            break;
        }

        if (cachedData && (Array.isArray(cachedData) ? cachedData.length > 0 : true)) {
          console.log(`📦 Données récupérées du cache local: ${type} - ${key}`);
          return { data: cachedData, fromCache: true };
        }
      }

      // Si pas de cache ou force refresh, utiliser le fallback
      if (fallbackFunction) {
        console.log(`🔥 Chargement des données depuis la source: ${type} - ${key}`);
        const freshData = await fallbackFunction();
        
        // Sauvegarder dans le cache
        if (freshData) {
          switch (type) {
            case 'conversations':
              if (Array.isArray(freshData)) {
                saveConversations(freshData);
              }
              break;
              
            case 'messages':
              if (options.conversationId && Array.isArray(freshData)) {
                saveMessages(options.conversationId, freshData);
              }
              break;
              
            case 'users':
              if (Array.isArray(freshData)) {
                saveUsers(freshData);
              }
              break;
          }
        }
        
        return { data: freshData, fromCache: false };
      }

      return { data: null, fromCache: false };
    } catch (error) {
      console.error(`Erreur lors du chargement depuis le cache: ${type} - ${key}`, error);
      return { data: null, fromCache: false, error };
    }
  }, [
    getAllConversations, 
    getConversation, 
    getMessages, 
    getUser, 
    saveConversations, 
    saveMessages, 
    saveUsers
  ]);

  /**
   * Préchargement intelligent
   */
  
  // Précharger les données fréquemment utilisées
  const preloadData = useCallback(async () => {
    try {
      console.log('🚀 Préchargement des données fréquemment utilisées...');
      
      // Précharger les conversations récentes
      const recentConversations = getAllConversations().slice(0, 10);
      
      // Précharger les messages des conversations récentes
      for (const conv of recentConversations) {
        const messages = getMessages(conv.id, 20, 0);
        if (messages.length === 0) {
          // Si pas de messages en cache, on pourrait les charger depuis l'API
          console.log(`📥 Préchargement des messages pour ${conv.id}`);
        }
      }
      
      console.log('✅ Préchargement terminé');
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    }
  }, [getAllConversations, getMessages]);

  // Initialiser le cache au montage
  useEffect(() => {
    initializeCache();
  }, [initializeCache]);

  // Mettre à jour les stats périodiquement
  useEffect(() => {
    if (isInitialized) {
      const interval = setInterval(updateCacheStats, 30000); // Toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [isInitialized, updateCacheStats]);

  return {
    // État
    isInitialized,
    cacheStats,
    
    // Gestion des conversations
    saveConversation,
    saveConversations,
    getConversation,
    getAllConversations,
    
    // Gestion des messages
    saveMessages,
    getMessages,
    addMessage,
    updateMessage,
    deleteMessage,
    
    // Gestion des utilisateurs
    saveUser,
    saveUsers,
    getUser,
    
    // Synchronisation
    syncWithCache,
    
    // Gestion du cache
    clearCache,
    exportCache,
    
    // Chargement intelligent
    loadFromCache,
    
    // Préchargement
    preloadData,
    
    // Utilitaires
    updateCacheStats
  };
}

export default useLocalCache;
