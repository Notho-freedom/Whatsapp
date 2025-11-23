"use client"

// MessageProvider.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppReducer } from './AppReducerContext';
import cachedFirebaseService from '@/utils/cachedFirebaseService';



const MessagesContext = React.createContext();

export function useMessages() {
  return React.useContext(MessagesContext);
}

export function MessageProvider({ children }) {
  const { state, actions } = useAppReducer();
  const [currentUserId, setCurrentUserId] = useState("default-user");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setCurrentUserId(JSON.parse(storedUser).id);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
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
    console.log(`✅ Messages chargés : ${JSON.stringify(state, null, 2)}`);

  }, [actions]);

// MessageProvider.js - Mise à jour de la fonction sendMessage
const sendMessage = useCallback(async (chatId, messageData, replyTo = null) => {
  try {
    let message;
    let firebaseData;
    let actualChatId = chatId;
    let isNewConversation = false;

    // Vérifier si c'est une conversation temporaire ou nouvelle
    const isTemporaryChat = chatId.startsWith('temp-');
    
    // Si c'est une conversation temporaire, créer une vraie conversation d'abord
    if (isTemporaryChat) {
      const chat = state.users.find(u => u.id === chatId);
      if (chat && chat.contact) {
        try {
          // Créer la conversation côté serveur
          const token = localStorage.getItem('accessToken');
          const response = await fetch(API_ENDPOINTS.CONVERSATIONS, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              type: 'individual',
              name: chat.name,
              avatar_url: chat.avatar,
              description: `Conversation avec ${chat.name}`,
              created_by: currentUserId,
              participants: [currentUserId, chat.contact.id],
              custom_settings: JSON.stringify({
                contact: chat.contact,
                isTemporary: false
              })
            }),
          });

          if (response.ok) {
            const { conversation } = await response.json();
            actualChatId = conversation.id;
            isNewConversation = true;
            
            // Mettre à jour l'état local avec la nouvelle conversation
            const newChat = {
              ...chat,
              id: actualChatId,
              isTemporary: false
            };
            
            actions.updateUser(chatId, newChat);
            actions.setSelectedChat(newChat);
            
            console.log('✅ Nouvelle conversation créée:', actualChatId);
          } else {
            throw new Error('Erreur lors de la création de la conversation');
          }
        } catch (error) {
          console.error('❌ Erreur lors de la création de la conversation:', error);
          // Continuer avec la conversation temporaire en cas d'erreur
        }
      }
    }

    // Créer le message selon le type
    if (messageData.type === 'media') {
      message = createMediaMessage(actualChatId, currentUserId, messageData.media, { replyTo });
      
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
      
      message = createTextMessage(actualChatId, currentUserId, messageData.text.trim(), { replyTo });
      
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

    // PHASE 1 : Ajout immédiat au cache local
    try {
      const localCacheService = require('@/utils/localCacheService').default;
      localCacheService.addMessage(actualChatId, message);
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'ajout au cache local:', error);
    }

    // PHASE 2 : Synchronisation avec Firebase
    try {
      const smartCacheService = require('@/utils/smartCacheService').default;
      await smartCacheService.addMessage(actualChatId, firebaseData);
      
      // Si c'est une nouvelle conversation, envoyer une notification
      if (isNewConversation) {
        await sendNewConversationNotification(actualChatId, firebaseData);
      } else {
        // Sinon, envoyer une notification de message normal
        await sendMessageNotification(actualChatId, firebaseData);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec Firebase:', error);
      try {
        await cachedFirebaseService.saveMessage(actualChatId, firebaseData);
      } catch (fallbackError) {
        console.error('❌ Échec du fallback Firebase:', fallbackError);
      }
    }

    // Ajouter le message à l'état local
    actions.addMessage(actualChatId, message);

    // Mettre à jour le dernier message
    let lastMessageText = '';
    if (messageData.text?.trim()) {
      lastMessageText = messageData.text.trim();
    } else if (messageData.media && messageData.media.length > 0) {
      lastMessageText = `📎 ${messageData.media[0]?.fileName || 'fichier'}`;
    }
    
    actions.updateLastMessage(actualChatId, {
      text: lastMessageText,
      type: messageData.type || 'text'
    });

    // Simuler une réponse après un délai (optionnel)
    if (!isNewConversation) {
      setTimeout(async () => {
        await simulateReply(actualChatId, state.users);
      }, 1000 + Math.random() * 2000);
    }

  } catch (error) {
    console.error('❌ Erreur générale lors de l\'envoi du message:', error);
  }
}, [createTextMessage, createMediaMessage, actions, state.users]);

// Fonction pour envoyer une notification de nouveau message
const sendMessageNotification = useCallback(async (chatId, messageData) => {
  try {
    // Récupérer les participants de la conversation
    const chat = state.users.find(u => u.id === chatId);
    if (!chat) return;

    // Trouver le destinataire (exclure l'utilisateur courant)
    const participants = chat.participants || [];
    const recipientId = participants.find(id => id !== currentUserId);
    
    if (!recipientId) return;

    // Envoyer la notification via le service temps réel
    const realtimeService = require('@/utils/realtimeService').default;
    
    await realtimeService.sendNotification(recipientId, {
      type: 'new_message',
      title: `Nouveau message de ${currentUser?.name || "Quelqu'un"}`,
      body: messageData.text || '📎 Fichier',
      data: {
        chatId,
        messageId: messageData.id,
        senderId: currentUserId,
        type: messageData.type
      },
      priority: 'high',
      badge: 1
    });

    console.log('✅ Notification envoyée à', recipientId);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error);
  }
}, [state.users, currentUser]);

// Fonction pour envoyer une notification de nouvelle conversation
const sendNewConversationNotification = useCallback(async (chatId, messageData) => {
  try {
    const chat = state.users.find(u => u.id === chatId);
    if (!chat || !chat.contact) return;

    const recipientId = chat.contact.id;
    
    if (!recipientId) return;

    const realtimeService = require('@/utils/realtimeService').default;
    
    await realtimeService.sendNotification(recipientId, {
      type: 'new_conversation',
      title: `${currentUser?.name || "Quelqu'un"} a démarré une conversation avec vous`,
      body: messageData.text || '📎 Fichier',
      data: {
        chatId,
        messageId: messageData.id,
        senderId: currentUserId,
        conversationName: chat.name,
        type: 'new_conversation'
      },
      priority: 'high',
      badge: 1
    });

    console.log('✅ Notification de nouvelle conversation envoyée à', recipientId);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification de conversation:', error);
  }
}, [state.users, currentUser]);

// Fonction pour simuler une réponse
const simulateReply = useCallback(async (chatId, users) => {
  const replyText = getRandomMessageText();
  const chat = users.find(u => u.id === chatId);
  
  if (!chat) return;

  const reply = createTextMessage(
    chatId,
    'other',
    replyText,
    { senderName: chat.name }
  );

  // Ajouter la réponse au cache local
  try {
    const localCacheService = require('@/utils/localCacheService').default;
    localCacheService.addMessage(chatId, reply);
  } catch (error) {
    console.warn('⚠️ Erreur lors de l\'ajout de la réponse au cache local:', error);
  }

  // Synchroniser la réponse avec Firebase
  try {
    const replyData = {
      text: replyText,
      sender: 'other',
      type: 'text',
      replyTo: null,
      reactions: [],
      isStarred: false,
      isRead: false,
      metadata: { senderName: chat.name }
    };

    const smartCacheService = require('@/utils/smartCacheService').default;
    await smartCacheService.addMessage(chatId, replyData);
    
    // Envoyer une notification pour la réponse
    await sendMessageNotification(chatId, replyData);
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation de la réponse:', error);
    try {
      await cachedFirebaseService.saveMessage(chatId, replyData);
    } catch (fallbackError) {
      console.error('❌ Échec du fallback Firebase pour la réponse:', fallbackError);
    }
  }

  // Ajouter la réponse à l'état local
  actions.addMessage(chatId, reply);
  actions.updateLastMessage(chatId, { text: reply.text, type: 'text' });
}, [createTextMessage, getRandomMessageText, actions, sendMessageNotification]);

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