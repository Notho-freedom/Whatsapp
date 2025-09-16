// MessageProvider.js
import React, { useCallback, useEffect, useMemo } from 'react';
import { useAppReducer } from './AppReducerContext';
import cachedFirebaseService from '@/utils/cachedFirebaseService';

const currentUser = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
const currentUserId = currentUser?.id || 'default-user';

const MessagesContext = React.createContext();

export function useMessages() {
  return React.useContext(MessagesContext);
}

export default function MessageProvider({ children }) {
  const { state, actions } = useAppReducer();

  // Fonctions utilitaires pour générer des messages
  const generateMessageId = useCallback((chatId, type = 'msg') => {
    return `${chatId}-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createSystemMessage = useCallback((chatId, systemType, text, options = {}) => {
    return {
      id: generateMessageId(chatId, 'system'),
      type: 'system',
      systemType,
      text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fr-FR'),
      ...options
    };
  }, [generateMessageId]);

  const createTextMessage = useCallback((chatId, sender, text, options = {}) => {
    const isMe = sender === currentUserId;
    return {
      id: generateMessageId(chatId, 'text'),
      sender,
      senderName: options.senderName,
      text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fr-FR'),
      read: isMe ? false : undefined,
      edited: options.edited || false,
      forwarded: options.forwarded || false,
      replyTo: options.replyTo,
      reactions: options.reactions || [],
      type: 'text',
      ...options
    };
  }, [generateMessageId]);

  const createMediaMessage = useCallback((chatId, sender, media, options = {}) => {
    const isMe = sender === currentUserId;
    return {
      id: generateMessageId(chatId, 'media'),
      sender,
      senderName: options.senderName,
      media,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fr-FR'),
      read: isMe ? false : undefined,
      reactions: options.reactions || [],
      type: 'media',
      ...options
    };
  }, [generateMessageId]);

  // Fonctions utilitaires
  const getRandomMessageText = useCallback(() => {
    const texts = [
      'Salut ! Comment ça va ?',
      'Ça va bien, merci ! Et toi ?',
      'Tu fais quoi aujourd\'hui ?',
      'Pas grand chose, je me repose',
      'Ok, à plus tard !',
      'Merci beaucoup !',
      'Parfait, c\'est noté',
      'Super ! Je suis content',
      'D\'accord, pas de problème',
      'À bientôt !',
      'C\'est noté, merci',
      'Je suis d\'accord avec toi',
      'Tu as raison, c\'est logique',
      'Exactement !',
      'Bien sûr, évidemment',
      'C\'est ça, parfaitement',
      'Je vois ce que tu veux dire',
      'C\'est une bonne idée',
      'Je pense que tu as raison',
      'C\'est intéressant'
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }, []);

  // Méthodes métier optimisées avec cache
  const loadMessages = useCallback(async (chatId) => {
    try {
      actions.setLoading(true);
      
      const messages = await cachedFirebaseService.getMessages(chatId, 50, 0);
      
      if (messages && messages.length > 0) {
        const transformedMessages = messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          senderName: msg.sender_name,
          text: msg.text,
          media: msg.media,
          time: msg.time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: msg.date || new Date().toLocaleDateString('fr-FR'),
          read: msg.is_read || false,
          reactions: msg.reactions || [],
          replyTo: msg.reply_to,
          type: msg.type || 'text',
          isStarred: msg.is_starred || false,
          edited: msg.edited || false,
          forwarded: msg.forwarded || false,
          link: msg.link
        }));
        
        actions.setMessages(chatId, transformedMessages);
      } else {
        actions.setMessages(chatId, []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      actions.setError(error.message);
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  const sendMessage = useCallback(async (chatId, messageData, replyTo = null) => {
    try {
      let message;
      let firebaseData;

      if (messageData.type === 'media') {
        message = createMediaMessage(chatId, currentUserId, messageData.media, { replyTo });
        
        firebaseData = {
          text: messageData.text || `📎 ${messageData.media[0]?.fileName || 'fichier'}`,
          sender: currentUserId,
          type: 'media',
          media: messageData.media,
          replyTo: replyTo,
          reactions: [],
          isStarred: false,
          isRead: false,
          metadata: {}
        };
      } else {
        if (!messageData.text?.trim()) return;
        
        message = createTextMessage(chatId, currentUserId, messageData.text.trim(), { replyTo });
        
        firebaseData = {
          text: messageData.text.trim(),
          sender: currentUserId,
          type: 'text',
          media: null,
          replyTo: replyTo,
          reactions: [],
          isStarred: false,
          isRead: false,
          metadata: {}
        };
      }

      // Ajout au cache local
      try {
        const localCacheService = require('@/utils/localCacheService').default;
        localCacheService.addMessage(chatId, message);
      } catch (error) {
        console.warn('⚠️ Erreur lors de l\'ajout au cache local:', error);
      }

      // Synchronisation avec Firebase
      try {
        const smartCacheService = require('@/utils/smartCacheService').default;
        await smartCacheService.addMessage(chatId, firebaseData);
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation avec Firebase:', error);
        try {
          await cachedFirebaseService.saveMessage(chatId, firebaseData);
        } catch (fallbackError) {
          console.error('❌ Échec du fallback Firebase:', fallbackError);
        }
      }

      actions.addMessage(chatId, message);

      let lastMessageText = '';
      if (messageData.text?.trim()) {
        lastMessageText = messageData.text.trim();
      } else if (messageData.media && messageData.media.length > 0) {
        lastMessageText = `📎 ${messageData.media[0]?.fileName || 'fichier'}`;
      }
      
      actions.updateLastMessage(chatId, {
        text: lastMessageText,
        type: messageData.type || 'text'
      });

      // Simuler une réponse après un délai
      setTimeout(async () => {
        const replyText = getRandomMessageText();
        const reply = createTextMessage(
          chatId,
          'other',
          replyText,
          { senderName: state.users.find(u => u.id === chatId)?.name }
        );

        try {
          const localCacheService = require('@/utils/localCacheService').default;
          localCacheService.addMessage(chatId, reply);
        } catch (error) {
          console.warn('⚠️ Erreur lors de l\'ajout de la réponse au cache local:', error);
        }

        try {
          const replyData = {
            text: replyText,
            sender: 'other',
            type: 'text',
            replyTo: null,
            reactions: [],
            isStarred: false,
            isRead: false,
            metadata: { senderName: state.users.find(u => u.id === chatId)?.name }
          };

          const smartCacheService = require('@/utils/smartCacheService').default;
          await smartCacheService.addMessage(chatId, replyData);
        } catch (error) {
          console.error('❌ Erreur lors de la synchronisation de la réponse:', error);
          try {
            await cachedFirebaseService.saveMessage(chatId, replyData);
          } catch (fallbackError) {
            console.error('❌ Échec du fallback Firebase pour la réponse:', fallbackError);
          }
        }

        actions.addMessage(chatId, reply);
        actions.updateLastMessage(chatId, { text: reply.text, type: 'text' });
      }, 1000 + Math.random() * 2000);

    } catch (error) {
      console.error('❌ Erreur générale lors de l\'envoi du message:', error);
    }
  }, [createTextMessage, createMediaMessage, getRandomMessageText, actions, state.users]);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (state.selectedChat?.id) {
      loadMessages(state.selectedChat.id);
    }
  }, [state.selectedChat?.id, loadMessages]);

  const selectChat = useCallback(async (chat) => {
    actions.setSelectedChat(chat);

    try {
      const response = await fetch(`/api/conversations/${chat.id}/messages?limit=50`);
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];

        const transformedMessages = messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          type: msg.type || 'text',
          media: msg.media || null,
          replyTo: msg.reply_to,
          reactions: msg.reactions || [],
          time: msg.time || new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: msg.date || new Date(msg.created_at).toLocaleDateString('fr-FR'),
          read: msg.read || false,
          timestamp: new Date(msg.created_at)
        }));

        if (transformedMessages.length > 0) {
          actions.setMessages(chat.id, transformedMessages);
        }
      } else {
        console.error('❌ Erreur lors du chargement des messages');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
    }
  }, [actions]);

  const addReactionToMessage = useCallback((chatId, messageId, reaction) => {
    actions.addReaction(chatId, messageId, reaction);
  }, [actions]);

  const removeReactionFromMessage = useCallback((chatId, messageId, reaction) => {
    actions.removeReaction(chatId, messageId, reaction);
  }, [actions]);

  const deleteMessageHandler = useCallback((chatId, messageId) => {
    actions.deleteMessage(chatId, messageId);
  }, [actions]);

  const toggleMessageStarHandler = useCallback((chatId, messageId) => {
    actions.toggleMessageStar(chatId, messageId);
  }, [actions]);

  const toggleChatPinHandler = useCallback((chatId) => {
    actions.toggleChatPin(chatId);
  }, [actions]);

  const value = useMemo(() => ({
    // Méthodes de messages
    loadMessages,
    sendMessage,
    selectChat,
    addReactionToMessage,
    removeReactionFromMessage,
    deleteMessage: deleteMessageHandler,
    toggleMessageStar: toggleMessageStarHandler,
    toggleChatPin: toggleChatPinHandler,
    
    // Fonctions utilitaires
    createTextMessage,
    createMediaMessage,
    createSystemMessage,
    
    // Actions du reducer (accessibles mais préférez utiliser les méthodes ci-dessus)
    actions
  }), [
    loadMessages, sendMessage, selectChat, addReactionToMessage, removeReactionFromMessage,
    deleteMessageHandler, toggleMessageStarHandler, toggleChatPinHandler,
    createTextMessage, createMediaMessage, createSystemMessage, actions
  ]);

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
}