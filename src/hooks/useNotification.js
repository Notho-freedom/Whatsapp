'use client';

import { useEffect, useState, useCallback } from 'react';

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({ categories: {}, quietHours: { enabled: false } });
  const [permission, setPermission] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Demander la permission au montage du composant
  useEffect(() => {
    if (permission === 'default' && typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(setPermission).catch(() => {});
    }
  }, [permission]);

  // Fonction d'ajout de notification simplifiée
  const handleAddNotification = (notificationData) => {
    try {
      const newNotification = { id: `${Date.now()}`, read: false, ...notificationData };
      setNotifications((prev) => [newNotification, ...prev]);
      return { success: true, notification: newNotification };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de suppression de notification simplifiée
  const handleRemoveNotification = (notificationId) => {
    try {
      setNotifications((prev) => prev.filter(n => n.id !== notificationId));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de marquage comme lu simplifiée
  const handleMarkAsRead = (notificationId) => {
    try {
      setNotifications((prev) => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de fermeture de notification simplifiée
  const handleDismissNotification = (notificationId) => handleRemoveNotification(notificationId);

  // Fonction de mise à jour des paramètres simplifiée
  const handleUpdateSettings = (updates) => {
    try {
      setSettings((prev) => ({ ...(prev || {}), ...updates }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de mise à jour des paramètres de catégorie simplifiée
  const handleUpdateCategorySettings = (category, enabled) => {
    try {
      setSettings((prev) => ({ ...(prev || {}), categories: { ...(prev?.categories || {}), [category]: enabled } }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de configuration des heures silencieuses simplifiée
  const handleSetQuietHours = (enabled, start, end) => {
    try {
      setSettings((prev) => ({ ...(prev || {}), quietHours: { enabled, start, end } }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de test de notification simplifiée
  const handleTestNotification = (category = 'system') => {
    try {
      return handleAddNotification({ title: 'Test', content: 'Notification de test', category, priority: 'normal' });
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de synchronisation simplifiée
  const handleSyncNotifications = async () => {
    try {
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de recherche simplifiée
  const handleSearchNotifications = (q) => {
    try {
      const term = (q || '').toLowerCase();
      const results = notifications.filter(n => `${n.title} ${n.content}`.toLowerCase().includes(term));
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de filtrage par catégorie simplifiée
  const handleFilterByCategory = (category) => {
    try {
      const results = notifications.filter(n => n.category === category);
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de filtrage par priorité simplifiée
  const handleFilterByPriority = (priority) => {
    try {
      const results = notifications.filter(n => n.priority === priority);
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Utilitaires
  const getNotificationStatsData = () => {
    const unread = notifications.filter(n => !n.read).length;
    return { total: notifications.length, unread };
  };

  const getUnreadCountData = () => notifications.filter(n => !n.read).length;

  const getUnreadNotificationsData = () => notifications.filter(n => !n.read);

  const isInQuietHoursNow = () => {
    if (!settings?.quietHours?.enabled) return false;
    return false;
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
    markAllAsRead: () => setNotifications((prev) => prev.map(n => ({ ...n, read: true }))),
    clearAllNotifications: () => setNotifications([]),
    clearReadNotifications: () => setNotifications((prev) => prev.filter(n => !n.read)),
    
    // Actions de permission et système
    requestPermission: () => Notification.requestPermission().then(setPermission),
    showSystemNotification: () => {},
    playNotificationSound: () => {},
    vibrateDevice: () => {},
    
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
    handleNotificationClick: () => {},
    
    // Fonctions de création prédéfinies
    createMessageNotification,
    createCallNotification,
    createStatusNotification,
    createMediaNotification,
    
    // Utilitaires
    clearError: () => setError(null),
    reset: () => setNotifications([])
  };
};
