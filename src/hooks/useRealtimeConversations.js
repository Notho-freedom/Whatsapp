import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '@/services/realtime.service';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';
import { showInfo } from '@/utils/notificationUtils';

export function useRealtimeConversations() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  
  const { user } = useAuthStore();
  const {
    conversations,
    selectedConversation,
    messages,
    setConversations,
    updateConversation,
    addMessage,
    updateMessage,
    deleteMessage,
    setUnreadCount,
    setTypingUsers
  } = useChatStore();

  // S'abonner aux conversations de l'utilisateur
  useEffect(() => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    
    const unsubscribe = realtimeService.subscribeToUserConversations(
      user.uid,
      {
        onUpdate: ({ conversations: updatedConversations, changes }) => {
          setConversations(updatedConversations);
          
          // Notifier les nouvelles conversations
          changes.added.forEach(conv => {
            if (conv.lastMessage && conv.lastMessage.sender.uid !== user.uid) {
              showInfo(
                'Nouvelle conversation',
                `${conv.name || conv.participants.find(p => p.uid !== user.uid)?.displayName || 'Inconnu'}`
              );
            }
          });
          
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('Erreur conversations temps réel:', error);
          setError(error.message);
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      realtimeService.removeListener(`conversations-${user.uid}`);
    };
  }, [user?.uid, setConversations]);

  // S'abonner aux messages de la conversation sélectionnée
  useEffect(() => {
    if (!selectedConversation || !user?.uid) return;
    
    const unsubscribe = realtimeService.subscribeToMessages(
      selectedConversation,
      {
        onUpdate: ({ messages: updatedMessages, changes }) => {
          // Mettre à jour tous les messages
          useChatStore.getState().setMessages(selectedConversation, updatedMessages);
          
          // Marquer automatiquement comme lus
          const unreadMessages = changes.added.filter(
            msg => msg.sender.uid !== user.uid && !msg.readBy?.[user.uid]
          );
          
          if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(msg => msg.id);
            realtimeService.markMessagesAsRead(selectedConversation, user.uid, messageIds);
          }
        },
        onError: (error) => {
          console.error('Erreur messages temps réel:', error);
          setError(error.message);
        }
      }
    );
    
    return () => {
      realtimeService.removeListener(`messages-${selectedConversation}`);
    };
  }, [selectedConversation, user?.uid]);

  // S'abonner au statut de lecture
  useEffect(() => {
    if (!selectedConversation || !user?.uid) return;
    
    const unsubscribe = realtimeService.subscribeToReadStatus(
      selectedConversation,
      user.uid,
      {
        onUpdate: (readStatus) => {
          setUnreadCount(selectedConversation, readStatus.unreadCount || 0);
        },
        onError: (error) => {
          console.error('Erreur statut lecture:', error);
        }
      }
    );
    
    return () => {
      realtimeService.removeListener(`read-status-${selectedConversation}-${user.uid}`);
    };
  }, [selectedConversation, user?.uid, setUnreadCount]);

  // S'abonner aux indicateurs de frappe
  useEffect(() => {
    if (!selectedConversation || !user?.uid) return;
    
    const unsubscribe = realtimeService.subscribeToTyping(
      selectedConversation,
      {
        onUpdate: (typingUserIds) => {
          // Filtrer pour ne pas inclure l'utilisateur actuel
          const otherTypingUsers = typingUserIds.filter(id => id !== user.uid);
          setTypingUsers(selectedConversation, otherTypingUsers);
        },
        onError: (error) => {
          console.error('Erreur indicateur frappe:', error);
        }
      }
    );
    
    return () => {
      realtimeService.removeListener(`typing-${selectedConversation}`);
    };
  }, [selectedConversation, user?.uid, setTypingUsers]);

  // Gérer la présence en ligne
  useEffect(() => {
    if (!user?.uid) return;
    
    // Marquer comme en ligne
    realtimeService.updateOnlineStatus(user.uid, true);
    
    // Gérer la déconnexion
    const handleVisibilityChange = () => {
      if (document.hidden) {
        realtimeService.updateOnlineStatus(user.uid, false);
      } else {
        realtimeService.updateOnlineStatus(user.uid, true);
      }
    };
    
    const handleBeforeUnload = () => {
      realtimeService.updateOnlineStatus(user.uid, false);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      realtimeService.updateOnlineStatus(user.uid, false);
    };
  }, [user?.uid]);

  // Envoyer un message
  const sendMessage = useCallback(async (content, type = 'text', metadata = {}) => {
    if (!selectedConversation || !user?.uid || !user?.idToken) {
      return { success: false, error: 'Non authentifié' };
    }
    
    try {
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`
        },
        body: JSON.stringify({
          content,
          type,
          ...metadata
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur envoi message');
      }
      
      const { message } = await response.json();
      
      // Arrêter l'indicateur de frappe
      setIsTyping(false);
      await realtimeService.updateTypingStatus(selectedConversation, user.uid, false);
      
      return { success: true, message };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return { success: false, error: error.message };
    }
  }, [selectedConversation, user]);

  // Gérer l'indicateur de frappe
  const handleTyping = useCallback(() => {
    if (!selectedConversation || !user?.uid) return;
    
    // Mettre à jour l'état de frappe
    if (!isTyping) {
      setIsTyping(true);
      realtimeService.updateTypingStatus(selectedConversation, user.uid, true);
    }
    
    // Réinitialiser le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Arrêter la frappe après 2 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      realtimeService.updateTypingStatus(selectedConversation, user.uid, false);
    }, 2000);
  }, [selectedConversation, user?.uid, isTyping]);

  // Marquer la conversation comme lue
  const markAsRead = useCallback(async () => {
    if (!selectedConversation || !user?.uid) return;
    
    const conversationMessages = messages[selectedConversation] || [];
    const unreadMessages = conversationMessages.filter(
      msg => msg.sender.uid !== user.uid && !msg.readBy?.[user.uid]
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id);
      await realtimeService.markMessagesAsRead(selectedConversation, user.uid, messageIds);
    }
  }, [selectedConversation, user?.uid, messages]);

  // Nettoyer les listeners au démontage
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      realtimeService.removeAllListeners();
    };
  }, []);

  return {
    conversations,
    messages: messages[selectedConversation] || [],
    isLoading,
    error,
    isTyping,
    sendMessage,
    handleTyping,
    markAsRead,
    typingUsers: useChatStore.getState().typingUsers[selectedConversation] || []
  };
}