'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import realtimeService from '@/utils/realtimeService';

export const useRealtime = userId => {
  const [presence, setPresence] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [messageStatuses, setMessageStatuses] = useState({});
  const listenersRef = useRef(new Map());

  // ===== GESTION DE LA PRÉSENCE =====

  const updatePresence = useCallback(
    async (status = 'online') => {
      if (userId) {
        await realtimeService.setUserPresence(userId, status);
      }
    },
    [userId]
  );

  const listenToUserPresence = useCallback(targetUserId => {
    if (!targetUserId) return;

    const unsubscribe = realtimeService.onUserPresenceChange(
      targetUserId,
      data => {
        setPresence(prev => ({
          ...prev,
          [targetUserId]: data,
        }));
      }
    );

    listenersRef.current.set(`presence_${targetUserId}`, unsubscribe);
    return unsubscribe;
  }, []);

  // ===== INDICATEURS DE TYPING =====

  const setTypingStatus = useCallback(
    async (conversationId, isTyping = true) => {
      if (userId && conversationId) {
        await realtimeService.setTypingStatus(conversationId, userId, isTyping);
      }
    },
    [userId]
  );

  const listenToTypingStatus = useCallback(conversationId => {
    if (!conversationId) return;

    const unsubscribe = realtimeService.onTypingStatusChange(
      conversationId,
      users => {
        setTypingUsers(prev => ({
          ...prev,
          [conversationId]: users,
        }));
      }
    );

    listenersRef.current.set(`typing_${conversationId}`, unsubscribe);
    return unsubscribe;
  }, []);

  // ===== RECEIPTS DE LECTURE =====

  const markMessageAsRead = useCallback(
    async (conversationId, messageId) => {
      if (userId && conversationId && messageId) {
        // 1) Realtime DB receipt (optional, used for presence-style features)
        await realtimeService.setReadReceipt(conversationId, messageId, userId);

        // 2) Firestore message update (drives the WhatsApp-style blue double-check)
        try {
          const firebaseService = require('@/utils/firebaseService').default;
          await firebaseService.updateMessage(conversationId, messageId, {
            is_read: true,
            isRead: true,
            read_at: new Date().toISOString(),
            read_by: userId,
          });
        } catch (error) {
          console.warn('⚠️ Impossible de mettre à jour le message comme lu:', error);
        }
      }
    },
    [userId]
  );

  const listenToReadReceipts = useCallback(conversationId => {
    if (!conversationId) return;

    const unsubscribe = realtimeService.onReadReceiptsChange(
      conversationId,
      receipts => {
        // Traiter les receipts de lecture
        console.log('Receipts de lecture mis à jour:', receipts);
      }
    );

    listenersRef.current.set(`receipts_${conversationId}`, unsubscribe);
    return unsubscribe;
  }, []);

  // ===== STATUTS DES MESSAGES =====

  const updateMessageStatus = useCallback(async (messageId, status) => {
    if (messageId) {
      await realtimeService.setMessageStatus(messageId, status);
    }
  }, []);

  const listenToMessageStatus = useCallback(messageId => {
    if (!messageId) return;

    const unsubscribe = realtimeService.onMessageStatusChange(
      messageId,
      data => {
        setMessageStatuses(prev => ({
          ...prev,
          [messageId]: data,
        }));
      }
    );

    listenersRef.current.set(`messageStatus_${messageId}`, unsubscribe);
    return unsubscribe;
  }, []);

  // ===== NOTIFICATIONS =====

  const sendNotification = useCallback(async (targetUserId, notification) => {
    if (targetUserId) {
      await realtimeService.sendNotification(targetUserId, notification);
    }
  }, []);

  const listenToNotifications = useCallback(() => {
    if (!userId) return;

    const unsubscribe = realtimeService.onNotificationsChange(
      userId,
      notifications => {
        setNotifications(notifications);
      }
    );

    listenersRef.current.set(`notifications_${userId}`, unsubscribe);
    return unsubscribe;
  }, [userId]);

  // ===== STATUTS/STORIES =====

  const markStatusAsViewed = useCallback(
    async statusId => {
      if (userId && statusId) {
        await realtimeService.updateStatusView(statusId, userId);
      }
    },
    [userId]
  );

  const listenToStatusViews = useCallback(statusId => {
    if (!statusId) return;

    const unsubscribe = realtimeService.onStatusViewsChange(statusId, views => {
      // Traiter les vues de statut
      console.log('Vues de statut mises à jour:', views);
    });

    listenersRef.current.set(`statusViews_${statusId}`, unsubscribe);
    return unsubscribe;
  }, []);

  // ===== MESSAGES EN TEMPS RÉEL =====

  const listenToMessages = useCallback((conversationId, callback) => {
    if (!conversationId) return;

    // Import dynamique pour éviter les problèmes circulaires
    const firebaseService = require('@/utils/firebaseService').default;

    const unsubscribe = firebaseService.listenToMessages(
      conversationId,
      ({ changes, allMessages }) => {
        callback({ changes, allMessages });
      },
      50 // Limite de 50 messages
    );

    listenersRef.current.set(`messages_${conversationId}`, unsubscribe);
    return unsubscribe;
  }, []);

  const listenToConversation = useCallback((conversationId, callback) => {
    if (!conversationId) return;

    const firebaseService = require('@/utils/firebaseService').default;

    const unsubscribe = firebaseService.listenToConversation(
      conversationId,
      conversation => {
        callback(conversation);
      }
    );

    listenersRef.current.set(`conversation_${conversationId}`, unsubscribe);
    return unsubscribe;
  }, []);

  /**
   * Écoute les conversations d'un utilisateur en temps réel
   */
  const listenToConversations = useCallback((userId, callback) => {
    if (!userId) return;

    const firebaseService = require('@/utils/firebaseService').default;

    const unsubscribe = firebaseService.listenToConversations(
      userId,
      ({ changes, allConversations }) => {
        callback({ changes, allConversations });
      }
    );

    listenersRef.current.set(`conversations_${userId}`, unsubscribe);
    return unsubscribe;
  }, []);

  // ===== GESTION DU CYCLE DE VIE =====

  useEffect(() => {
    // Mettre à jour la présence au montage
    if (userId) {
      updatePresence('online');
    }

    // Nettoyer au démontage
    return () => {
      if (userId) {
        updatePresence('offline');
      }

      // Supprimer tous les écouteurs
      listenersRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      listenersRef.current.clear();
    };
  }, [userId, updatePresence]);

  // Écouter les notifications séparément pour éviter les boucles
  useEffect(() => {
    if (userId) {
      listenToNotifications();
    }
  }, [userId, listenToNotifications]);

  // Nettoyer les données anciennes périodiquement
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      realtimeService.cleanupOldData();
    }, 5 * 60 * 1000); // Toutes les 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  // ===== UTILITAIRES =====

  const removeListener = useCallback(key => {
    const unsubscribe = listenersRef.current.get(key);
    if (unsubscribe && typeof unsubscribe === 'function') {
      unsubscribe();
      listenersRef.current.delete(key);
    }
  }, []);

  const removeAllListeners = useCallback(() => {
    listenersRef.current.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    listenersRef.current.clear();
  }, []);

  return {
    // État
    presence,
    typingUsers,
    notifications,
    messageStatuses,

    // Actions
    updatePresence,
    setTypingStatus,
    markMessageAsRead,
    updateMessageStatus,
    sendNotification,
    markStatusAsViewed,

    // Écouteurs
    listenToUserPresence,
    listenToTypingStatus,
    listenToReadReceipts,
    listenToMessageStatus,
    listenToNotifications,
    listenToStatusViews,
    listenToMessages,
    listenToConversation,
    listenToConversations, // NOUVEAU: Écoute les conversations en temps réel

    // Utilitaires
    removeListener,
    removeAllListeners,
  };
};
