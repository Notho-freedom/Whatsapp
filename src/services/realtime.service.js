import { db } from '@/lib/firebase-client';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';

export class RealtimeService {
  constructor() {
    this.listeners = new Map();
    this.reconnectTimeouts = new Map();
  }

  /**
   * Écouter les changements d'une conversation
   */
  subscribeToConversation(conversationId, callbacks) {
    const unsubscribe = onSnapshot(
      doc(db, 'conversations', conversationId),
      {
        includeMetadataChanges: false
      },
      (doc) => {
        if (doc.exists()) {
          const data = { id: doc.id, ...doc.data() };
          callbacks.onUpdate?.(data);
        } else {
          callbacks.onDelete?.();
        }
      },
      (error) => {
        console.error('Erreur écoute conversation:', error);
        callbacks.onError?.(error);
        this.handleReconnect('conversation', conversationId, () => 
          this.subscribeToConversation(conversationId, callbacks)
        );
      }
    );

    this.addListener(`conversation-${conversationId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Écouter les messages d'une conversation
   */
  subscribeToMessages(conversationId, callbacks, options = {}) {
    const { limit: msgLimit = 50 } = options;
    
    let q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('deleted', '==', false),
      orderBy('timestamp', 'desc'),
      limit(msgLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      {
        includeMetadataChanges: false
      },
      (snapshot) => {
        const messages = [];
        const changes = {
          added: [],
          modified: [],
          removed: []
        };

        snapshot.docChanges().forEach(change => {
          const message = {
            id: change.doc.id,
            ...change.doc.data()
          };

          if (change.type === 'added') {
            changes.added.push(message);
          } else if (change.type === 'modified') {
            changes.modified.push(message);
          } else if (change.type === 'removed') {
            changes.removed.push(message);
          }
        });

        snapshot.forEach(doc => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Messages triés par ordre chronologique
        messages.reverse();

        callbacks.onUpdate?.({
          messages,
          changes
        });
      },
      (error) => {
        console.error('Erreur écoute messages:', error);
        callbacks.onError?.(error);
        this.handleReconnect('messages', conversationId, () => 
          this.subscribeToMessages(conversationId, callbacks, options)
        );
      }
    );

    this.addListener(`messages-${conversationId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Écouter les conversations de l'utilisateur
   */
  subscribeToUserConversations(userId, callbacks) {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      {
        includeMetadataChanges: false
      },
      (snapshot) => {
        const conversations = [];
        const changes = {
          added: [],
          modified: [],
          removed: []
        };

        snapshot.docChanges().forEach(change => {
          const conversation = {
            id: change.doc.id,
            ...change.doc.data()
          };

          if (change.type === 'added') {
            changes.added.push(conversation);
          } else if (change.type === 'modified') {
            changes.modified.push(conversation);
          } else if (change.type === 'removed') {
            changes.removed.push(conversation);
          }
        });

        snapshot.forEach(doc => {
          conversations.push({
            id: doc.id,
            ...doc.data()
          });
        });

        callbacks.onUpdate?.({
          conversations,
          changes
        });
      },
      (error) => {
        console.error('Erreur écoute conversations:', error);
        callbacks.onError?.(error);
        this.handleReconnect('conversations', userId, () => 
          this.subscribeToUserConversations(userId, callbacks)
        );
      }
    );

    this.addListener(`conversations-${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Écouter le statut de lecture d'une conversation
   */
  subscribeToReadStatus(conversationId, userId, callbacks) {
    const unsubscribe = onSnapshot(
      doc(db, 'conversations', conversationId, 'reads', userId),
      (doc) => {
        if (doc.exists()) {
          callbacks.onUpdate?.(doc.data());
        } else {
          callbacks.onUpdate?.({ unreadCount: 0, lastRead: null });
        }
      },
      (error) => {
        console.error('Erreur écoute statut lecture:', error);
        callbacks.onError?.(error);
      }
    );

    this.addListener(`read-status-${conversationId}-${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Écouter les notifications de l'utilisateur
   */
  subscribeToNotifications(userId, callbacks) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = [];
        
        snapshot.forEach(doc => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          });
        });

        callbacks.onUpdate?.(notifications);
      },
      (error) => {
        console.error('Erreur écoute notifications:', error);
        callbacks.onError?.(error);
      }
    );

    this.addListener(`notifications-${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Écouter le statut en ligne d'un utilisateur
   */
  subscribeToUserPresence(userId, callbacks) {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      {
        includeMetadataChanges: false
      },
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callbacks.onUpdate?.({
            isOnline: data.isOnline,
            lastSeen: data.lastSeen
          });
        }
      },
      (error) => {
        console.error('Erreur écoute présence:', error);
        callbacks.onError?.(error);
      }
    );

    this.addListener(`presence-${userId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Écouter les indicateurs de frappe
   */
  subscribeToTyping(conversationId, callbacks) {
    const typingRef = doc(db, 'conversations', conversationId, 'metadata', 'typing');
    
    const unsubscribe = onSnapshot(
      typingRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const typingUsers = [];
          
          // Filtrer les utilisateurs qui tapent actuellement
          const now = Date.now();
          Object.entries(data).forEach(([userId, timestamp]) => {
            // Considérer qu'un utilisateur tape s'il a été actif dans les 3 dernières secondes
            if (timestamp && (now - timestamp.toMillis()) < 3000) {
              typingUsers.push(userId);
            }
          });
          
          callbacks.onUpdate?.(typingUsers);
        } else {
          callbacks.onUpdate?.([]);
        }
      },
      (error) => {
        console.error('Erreur écoute frappe:', error);
        callbacks.onError?.(error);
      }
    );

    this.addListener(`typing-${conversationId}`, unsubscribe);
    return unsubscribe;
  }

  /**
   * Mettre à jour l'indicateur de frappe
   */
  async updateTypingStatus(conversationId, userId, isTyping = true) {
    try {
      const typingRef = doc(db, 'conversations', conversationId, 'metadata', 'typing');
      
      if (isTyping) {
        await updateDoc(typingRef, {
          [userId]: serverTimestamp()
        });
      } else {
        await updateDoc(typingRef, {
          [userId]: null
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour frappe:', error);
    }
  }

  /**
   * Mettre à jour le statut en ligne
   */
  async updateOnlineStatus(userId, isOnline = true) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur mise à jour présence:', error);
    }
  }

  /**
   * Marquer des messages comme lus
   */
  async markMessagesAsRead(conversationId, userId, messageIds) {
    try {
      const batch = [];
      
      // Mettre à jour le statut de lecture
      batch.push(
        updateDoc(
          doc(db, 'conversations', conversationId, 'reads', userId),
          {
            unreadCount: 0,
            lastRead: serverTimestamp()
          }
        )
      );
      
      // Marquer chaque message comme lu
      messageIds.forEach(messageId => {
        batch.push(
          updateDoc(
            doc(db, 'messages', messageId),
            {
              [`readBy.${userId}`]: serverTimestamp()
            }
          )
        );
      });
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Erreur marquage messages lus:', error);
    }
  }

  /**
   * Ajouter un listener
   */
  addListener(key, unsubscribe) {
    // Nettoyer l'ancien listener s'il existe
    this.removeListener(key);
    this.listeners.set(key, unsubscribe);
  }

  /**
   * Retirer un listener
   */
  removeListener(key) {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
    
    // Annuler la reconnexion si elle existe
    const timeout = this.reconnectTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(key);
    }
  }

  /**
   * Retirer tous les listeners
   */
  removeAllListeners() {
    this.listeners.forEach((unsubscribe, key) => {
      unsubscribe();
    });
    this.listeners.clear();
    
    this.reconnectTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.reconnectTimeouts.clear();
  }

  /**
   * Gérer la reconnexion après une erreur
   */
  handleReconnect(type, id, reconnectFn) {
    const key = `${type}-${id}`;
    
    // Annuler la reconnexion précédente
    const existingTimeout = this.reconnectTimeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Planifier une reconnexion
    const timeout = setTimeout(() => {
      console.log(`Tentative de reconnexion pour ${key}`);
      this.reconnectTimeouts.delete(key);
      reconnectFn();
    }, 5000); // Reconnexion après 5 secondes
    
    this.reconnectTimeouts.set(key, timeout);
  }
}

// Instance singleton
export const realtimeService = new RealtimeService();