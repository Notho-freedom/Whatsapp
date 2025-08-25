'use client';

import { useNotificationStore } from '../stores/notificationStore';
import { useEffect } from 'react';

export const useNotification = () => {
  const {
    notifications,
    settings,
    permission,
    isLoading,
    error,
    addNotification,
    removeNotification,
    markAsRead,
    dismissNotification,
    markAllAsRead,
    clearAllNotifications,
    clearReadNotifications,
    requestPermission,
    showSystemNotification,
    playNotificationSound,
    vibrateDevice,
    updateSettings,
    updateCategorySettings,
    setQuietHours,
    isInQuietHours,
    searchNotifications,
    filterByCategory,
    filterByPriority,
    getUnreadNotifications,
    getUnreadCount,
    getNotificationStats,
    handleNotificationClick,
    testNotification,
    syncNotifications,
    clearError,
    reset
  } = useNotificationStore();

  // Demander la permission au montage du composant
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Fonction d'ajout de notification simplifiée
  const handleAddNotification = (notificationData) => {
    try {
      const newNotification = addNotification(notificationData);
      return { success: true, notification: newNotification };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de suppression de notification simplifiée
  const handleRemoveNotification = (notificationId) => {
    try {
      removeNotification(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de marquage comme lu simplifiée
  const handleMarkAsRead = (notificationId) => {
    try {
      markAsRead(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de fermeture de notification simplifiée
  const handleDismissNotification = (notificationId) => {
    try {
      dismissNotification(notificationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de mise à jour des paramètres simplifiée
  const handleUpdateSettings = (updates) => {
    try {
      updateSettings(updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de mise à jour des paramètres de catégorie simplifiée
  const handleUpdateCategorySettings = (category, enabled) => {
    try {
      updateCategorySettings(category, enabled);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de configuration des heures silencieuses simplifiée
  const handleSetQuietHours = (enabled, start, end) => {
    try {
      setQuietHours(enabled, start, end);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de test de notification simplifiée
  const handleTestNotification = (category = 'system') => {
    try {
      testNotification(category);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de synchronisation simplifiée
  const handleSyncNotifications = async () => {
    try {
      await syncNotifications();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de recherche simplifiée
  const handleSearchNotifications = (query) => {
    try {
      const results = searchNotifications(query);
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de filtrage par catégorie simplifiée
  const handleFilterByCategory = (category) => {
    try {
      const results = filterByCategory(category);
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de filtrage par priorité simplifiée
  const handleFilterByPriority = (priority) => {
    try {
      const results = filterByPriority(priority);
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Utilitaires
  const getNotificationStatsData = () => {
    return getNotificationStats();
  };

  const getUnreadCountData = () => {
    return getUnreadCount();
  };

  const getUnreadNotificationsData = () => {
    return getUnreadNotifications();
  };

  const isInQuietHoursNow = () => {
    return isInQuietHours();
  };

  // Fonctions de création de notifications prédéfinies
  const createMessageNotification = (senderName, messagePreview, conversationId, messageId) => {
    const notificationData = {
      title: 'Nouveau message',
      content: `${senderName}: ${messagePreview}`,
      category: 'messages',
      priority: 'normal',
      icon: '/icons/message.svg',
      actions: [
        {
          id: 'reply',
          title: 'Répondre',
          icon: '/icons/reply.svg'
        },
        {
          id: 'view',
          title: 'Voir',
          icon: '/icons/view.svg'
        }
      ],
      metadata: {
        conversationId,
        messageId,
        senderName
      }
    };

    return handleAddNotification(notificationData);
  };

  const createCallNotification = (callerName, callType, callId) => {
    const notificationData = {
      title: callType === 'missed' ? 'Appel manqué' : 'Appel entrant',
      content: `${callerName} ${callType === 'missed' ? 'a essayé de vous appeler' : 'vous appelle'}`,
      category: 'calls',
      priority: callType === 'missed' ? 'high' : 'urgent',
      icon: '/icons/call.svg',
      actions: [
        {
          id: 'call_back',
          title: 'Rappeler',
          icon: '/icons/call.svg'
        }
      ],
      metadata: {
        callerName,
        callType,
        callId
      }
    };

    return handleAddNotification(notificationData);
  };

  const createStatusNotification = (userName, statusType, statusId) => {
    const notificationData = {
      title: 'Nouveau statut',
      content: `${userName} a mis à jour son statut`,
      category: 'status',
      priority: 'low',
      icon: '/icons/status.svg',
      actions: [
        {
          id: 'view_status',
          title: 'Voir le statut',
          icon: '/icons/status.svg'
        }
      ],
      metadata: {
        userName,
        statusType,
        statusId
      }
    };

    return handleAddNotification(notificationData);
  };

  const createMediaNotification = (senderName, mediaType, conversationId, mediaId) => {
    const notificationData = {
      title: 'Média reçu',
      content: `${senderName} vous a envoyé ${mediaType === 'image' ? 'une image' : mediaType === 'video' ? 'une vidéo' : 'un fichier'}`,
      category: 'media',
      priority: 'normal',
      icon: '/icons/media.svg',
      actions: [
        {
          id: 'view_media',
          title: 'Voir',
          icon: '/icons/media.svg'
        },
        {
          id: 'download',
          title: 'Télécharger',
          icon: '/icons/download.svg'
        }
      ],
      metadata: {
        senderName,
        mediaType,
        conversationId,
        mediaId
      }
    };

    return handleAddNotification(notificationData);
  };

  return {
    // État
    notifications,
    settings,
    permission,
    isLoading,
    error,
    
    // Actions de base
    addNotification: handleAddNotification,
    removeNotification: handleRemoveNotification,
    markAsRead: handleMarkAsRead,
    dismissNotification: handleDismissNotification,
    markAllAsRead,
    clearAllNotifications,
    clearReadNotifications,
    
    // Actions de permission et système
    requestPermission,
    showSystemNotification,
    playNotificationSound,
    vibrateDevice,
    
    // Actions de paramètres
    updateSettings: handleUpdateSettings,
    updateCategorySettings: handleUpdateCategorySettings,
    setQuietHours: handleSetQuietHours,
    isInQuietHours: isInQuietHoursNow,
    
    // Actions de recherche et filtrage
    searchNotifications: handleSearchNotifications,
    filterByCategory: handleFilterByCategory,
    filterByPriority: handleFilterByPriority,
    
    // Actions de test et synchronisation
    testNotification: handleTestNotification,
    syncNotifications: handleSyncNotifications,
    
    // Utilitaires
    getNotificationStats: getNotificationStatsData,
    getUnreadCount: getUnreadCountData,
    getUnreadNotifications: getUnreadNotificationsData,
    
    // Actions de gestion des clics
    handleNotificationClick,
    
    // Fonctions de création prédéfinies
    createMessageNotification,
    createCallNotification,
    createStatusNotification,
    createMediaNotification,
    
    // Utilitaires
    clearError,
    reset
  };
};
