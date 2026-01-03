'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  React,
  useState,
} from 'react';
import cachedFirebaseService from '@/utils/cachedFirebaseService';
import localStorageService from '@/utils/localStorageService';
import localCacheService from '@/utils/localCacheService';
import firebaseService from '@/utils/firebaseService';
import { useRealtime, useAuth } from '@/hooks';
import {
  generateConversationId,
  createConversationData,
  transformConversationForDisplay,
  getOtherParticipantId,
} from '@/utils/conversationHelper';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';

// Types d'actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USERS: 'SET_USERS',
  SET_SELECTED_CHAT: 'SET_SELECTED_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER_STATUS: 'UPDATE_USER_STATUS',
  UPDATE_LAST_MESSAGE: 'UPDATE_LAST_MESSAGE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  MARK_MESSAGES_READ: 'MARK_MESSAGES_READ',
  ADD_REACTION: 'ADD_REACTION',
  REMOVE_REACTION: 'REMOVE_REACTION',
  SET_REPLY_TO: 'SET_REPLY_TO',
  CLEAR_REPLY_TO: 'CLEAR_REPLY_TO',
  TOGGLE_MESSAGE_STAR: 'TOGGLE_MESSAGE_STAR',
  TOGGLE_CHAT_PIN: 'TOGGLE_CHAT_PIN',
  ADD_USER: 'ADD_USER',
  // Nouvelles actions pour les statuts
  SET_STATUSES: 'SET_STATUSES',
  ADD_STATUS: 'ADD_STATUS',
  UPDATE_STATUS: 'UPDATE_STATUS',
  DELETE_STATUS: 'DELETE_STATUS',
  MARK_STATUS_VIEWED: 'MARK_STATUS_VIEWED',
};

// État initial
const initialState = {
  loading: false,
  error: null,
  users: [],
  selectedChat: null,
  messages: {},
  searchQuery: '',
  sidebarOpen: true,
  activeTab: 'chats',
  replyTo: null, // État pour le message auquel on répond
  statuses: [], // Nouvelle propriété pour stocker les statuts
  viewedStatuses: [], // Nouvelle propriété pour stocker les statuts déjà vus
};

// Reducer pour gérer les actions
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_USERS:
      return { ...state, users: action.payload };

    case ACTIONS.SET_SELECTED_CHAT:
      return { ...state, selectedChat: action.payload };

    case ACTIONS.ADD_MESSAGE:
      const { chatId, message } = action.payload;
      const existingMessages = state.messages[chatId] || [];
      const newMessages = [...existingMessages, message];

      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: newMessages,
        },
      };

    case ACTIONS.UPDATE_MESSAGE:
      const { chatId: updateChatId, messageId, updates } = action.payload;
      const messagesToUpdate = state.messages[updateChatId] || [];
      const updatedMessages = messagesToUpdate.map(msg =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );

      return {
        ...state,
        messages: {
          ...state.messages,
          [updateChatId]: updatedMessages,
        },
      };

    case ACTIONS.DELETE_MESSAGE:
      const { chatId: deleteChatId, messageId: deleteMessageId } =
        action.payload;
      const messagesToFilter = state.messages[deleteChatId] || [];
      const filteredMessages = messagesToFilter.filter(
        msg => msg.id !== deleteMessageId
      );

      return {
        ...state,
        messages: {
          ...state.messages,
          [deleteChatId]: filteredMessages,
        },
      };

    case ACTIONS.SET_MESSAGES:
      const { chatId: setMessagesChatId, messages: messagesToSet } =
        action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [setMessagesChatId]: messagesToSet,
        },
      };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.UPDATE_USER_STATUS:
      const { userId, status } = action.payload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === userId ? { ...user, status } : user
        ),
      };

    case ACTIONS.UPDATE_LAST_MESSAGE:
      const { chatId: lastMsgChatId, lastMessage } = action.payload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === lastMsgChatId
            ? {
                ...user,
                lastMessage,
                lastMessageTime: new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              }
            : user
        ),
      };

    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };

    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };

    case ACTIONS.MARK_MESSAGES_READ:
      const { chatId: readChatId } = action.payload;
      const messagesToMark = state.messages[readChatId] || [];
      const markedMessages = messagesToMark.map(msg =>
        msg.sender === 'other' ? { ...msg, read: true } : msg
      );

      return {
        ...state,
        messages: {
          ...state.messages,
          [readChatId]: markedMessages,
        },
        users: state.users.map(user =>
          user.id === readChatId ? { ...user, unreadCount: 0 } : user
        ),
      };

    case ACTIONS.ADD_REACTION:
      const {
        chatId: reactionChatId,
        messageId: reactionMessageId,
        reaction,
      } = action.payload;
      const messagesForReaction = state.messages[reactionChatId] || [];
      const messagesWithReaction = messagesForReaction.map(msg => {
        if (msg.id === reactionMessageId) {
          const currentReactions = msg.reactions || [];
          return {
            ...msg,
            reactions: [...currentReactions, reaction],
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [reactionChatId]: messagesWithReaction,
        },
      };

    case ACTIONS.REMOVE_REACTION:
      const {
        chatId: removeReactionChatId,
        messageId: removeReactionMessageId,
        reaction: reactionToRemove,
      } = action.payload;
      const messagesForRemoveReaction =
        state.messages[removeReactionChatId] || [];
      const messagesWithoutReaction = messagesForRemoveReaction.map(msg => {
        if (msg.id === removeReactionMessageId) {
          const currentReactions = msg.reactions || [];
          return {
            ...msg,
            reactions: currentReactions.filter(r => r !== reactionToRemove),
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [removeReactionChatId]: messagesWithoutReaction,
        },
      };

    case ACTIONS.SET_REPLY_TO:
      return {
        ...state,
        replyTo: action.payload,
      };

    case ACTIONS.CLEAR_REPLY_TO:
      return {
        ...state,
        replyTo: null,
      };

    case ACTIONS.TOGGLE_MESSAGE_STAR:
      const { chatId: starChatId, messageId: starMessageId } = action.payload;
      const messagesForStar = state.messages[starChatId] || [];
      const messagesWithStarToggle = messagesForStar.map(msg => {
        if (msg.id === starMessageId) {
          return {
            ...msg,
            isStarred: !msg.isStarred,
          };
        }
        return msg;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [starChatId]: messagesWithStarToggle,
        },
      };

    case ACTIONS.TOGGLE_CHAT_PIN:
      const { chatId: pinChatId } = action.payload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === pinChatId ? { ...user, isPinned: !user.isPinned } : user
        ),
      };

    case ACTIONS.ADD_USER:
      return {
        ...state,
        users: [action.payload, ...state.users],
      };

    // Nouvelles actions pour les statuts
    case ACTIONS.SET_STATUSES:
      return { ...state, statuses: action.payload };
    case ACTIONS.ADD_STATUS:
      return { ...state, statuses: [...state.statuses, action.payload] };
    case ACTIONS.UPDATE_STATUS:
      return {
        ...state,
        statuses: state.statuses.map(status =>
          status.id === action.payload.id
            ? { ...status, ...action.payload.updates }
            : status
        ),
      };
    case ACTIONS.DELETE_STATUS:
      return {
        ...state,
        statuses: state.statuses.filter(status => status.id !== action.payload),
      };
    case ACTIONS.MARK_STATUS_VIEWED:
      return {
        ...state,
        viewedStatuses: [...state.viewedStatuses, action.payload],
      };

    default:
      return state;
  }
}

// Créer le contexte
const AppContext = createContext();

// Hook personnalisé pour utiliser le contexte
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext doit être utilisé dans un AppProvider');
  }
  return context;
}

// Provider principal
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Récupérer l'utilisateur connecté via le hook useAuth
  const { user: authUser } = useAuth();

  // État local pour l'utilisateur courant
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messageListenersRef = useRef(new Map());
  const conversationListenerRef = useRef(null);
  const latestMessagesRef = useRef({});

  // Hook temps réel pour les messages et conversations
  const { listenToMessages, listenToConversation, listenToConversations } =
    useRealtime(currentUserId);

  // Récupérer l'utilisateur courant au montage et quand authUser change
  useEffect(() => {
    try {
      // Priorité 1 : Utilisateur du hook useAuth
      if (authUser && authUser.id) {
        setCurrentUser(authUser);
        setCurrentUserId(authUser.id);
        // Sauvegarder dans localStorage pour persistance
        localStorage.setItem('userData', JSON.stringify(authUser));
        console.log(
          '✅ Utilisateur connecté:',
          authUser.name || authUser.displayName
        );
        return;
      }

      // Priorité 2 : Utilisateur depuis localStorage
      const storedUser =
        typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      if (storedUser && storedUser.trim() !== '') {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setCurrentUserId(parsedUser.id);
        console.log(
          '✅ Utilisateur chargé depuis localStorage:',
          parsedUser.name || parsedUser.displayName
        );
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération de userData:', error);
    }
  }, [authUser]);

  // Actions optimisées avec useCallback
  const actions = useMemo(
    () => ({
      setLoading: loading =>
        dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
      setUsers: users => dispatch({ type: ACTIONS.SET_USERS, payload: users }),
      setSelectedChat: chat =>
        dispatch({ type: ACTIONS.SET_SELECTED_CHAT, payload: chat }),
      addMessage: (chatId, message) =>
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } }),
      updateMessage: (chatId, messageId, updates) =>
        dispatch({
          type: ACTIONS.UPDATE_MESSAGE,
          payload: { chatId, messageId, updates },
        }),
      deleteMessage: (chatId, messageId) =>
        dispatch({
          type: ACTIONS.DELETE_MESSAGE,
          payload: { chatId, messageId },
        }),
      setMessages: (chatId, messages) =>
        dispatch({ type: ACTIONS.SET_MESSAGES, payload: { chatId, messages } }),
      setError: error => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
      updateUserStatus: (userId, status) =>
        dispatch({
          type: ACTIONS.UPDATE_USER_STATUS,
          payload: { userId, status },
        }),
      updateLastMessage: (chatId, lastMessage) =>
        dispatch({
          type: ACTIONS.UPDATE_LAST_MESSAGE,
          payload: { chatId, lastMessage },
        }),
      setSearchQuery: query =>
        dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
      toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),
      setActiveTab: tab =>
        dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab }),
      markMessagesRead: chatId =>
        dispatch({ type: ACTIONS.MARK_MESSAGES_READ, payload: { chatId } }),
      addReaction: (chatId, messageId, reaction) =>
        dispatch({
          type: ACTIONS.ADD_REACTION,
          payload: { chatId, messageId, reaction },
        }),
      removeReaction: (chatId, messageId, reaction) =>
        dispatch({
          type: ACTIONS.REMOVE_REACTION,
          payload: { chatId, messageId, reaction },
        }),
      setReplyTo: replyTo =>
        dispatch({ type: ACTIONS.SET_REPLY_TO, payload: replyTo }),
      clearReplyTo: () => dispatch({ type: ACTIONS.CLEAR_REPLY_TO }),
      toggleMessageStar: (chatId, messageId) =>
        dispatch({
          type: ACTIONS.TOGGLE_MESSAGE_STAR,
          payload: { chatId, messageId },
        }),
      toggleChatPin: chatId =>
        dispatch({ type: ACTIONS.TOGGLE_CHAT_PIN, payload: { chatId } }),
      addUser: user => dispatch({ type: ACTIONS.ADD_USER, payload: user }),
      // Nouvelles actions pour les statuts
      setStatuses: statuses =>
        dispatch({ type: ACTIONS.SET_STATUSES, payload: statuses }),
      addStatus: status =>
        dispatch({ type: ACTIONS.ADD_STATUS, payload: status }),
      updateStatus: (id, updates) =>
        dispatch({ type: ACTIONS.UPDATE_STATUS, payload: { id, updates } }),
      deleteStatus: id =>
        dispatch({ type: ACTIONS.DELETE_STATUS, payload: id }),
      markStatusViewed: id =>
        dispatch({ type: ACTIONS.MARK_STATUS_VIEWED, payload: id }),
    }),
    []
  );

  // Fonctions utilitaires pour générer des messages
  const generateMessageId = useCallback((chatId, type = 'msg') => {
    return `${chatId}-${type}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }, []);

  const createSystemMessage = useCallback(
    (chatId, systemType, text, options = {}) => {
      return {
        id: generateMessageId(chatId, 'system'),
        type: 'system',
        systemType,
        text,
        time: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: new Date().toLocaleDateString('fr-FR'),
        ...options,
      };
    },
    [generateMessageId]
  );

  const createTextMessage = useCallback(
    (chatId, sender, text, options = {}) => {
      const isMe = sender === 'me';
      return {
        id: generateMessageId(chatId, 'text'),
        sender,
        senderName: options.senderName,
        text,
        time: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: new Date().toLocaleDateString('fr-FR'),
        read: isMe ? false : undefined,
        edited: options.edited || false,
        forwarded: options.forwarded || false,
        replyTo: options.replyTo,
        reactions: options.reactions || [],
        type: 'text',
        ...options,
      };
    },
    [generateMessageId]
  );

  const createMediaMessage = useCallback(
    (chatId, sender, media, options = {}) => {
      const isMe = sender === 'me';
      return {
        id: generateMessageId(chatId, 'media'),
        sender,
        senderName: options.senderName,
        media,
        time: new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        date: new Date().toLocaleDateString('fr-FR'),
        read: isMe ? false : undefined,
        reactions: options.reactions || [],
        type: 'media',
        ...options,
      };
    },
    [generateMessageId]
  );

  // Génération de messages initiaux intelligente
  const generateInitialMessages = useCallback(
    user => {
      const messages = [];
      const messageCount = Math.floor(Math.random() * 15) + 10;
      const now = new Date();

      // Ajouter un message de date système
      messages.push(
        createSystemMessage(user.id, 'date', now.toLocaleDateString('fr-FR'))
      );

      for (let i = 0; i < messageCount; i++) {
        const isFromUser = Math.random() > 0.5;
        const timestamp = new Date(
          now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
        );
        const messageType = Math.random();

        let message;

        if (messageType < 0.7) {
          // Message texte
          message = createTextMessage(
            user.id,
            isFromUser ? 'me' : 'other',
            getRandomMessageText(),
            {
              senderName: isFromUser ? undefined : user.name,
              time: timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              date: timestamp.toLocaleDateString('fr-FR'),
              read: isFromUser ? Math.random() > 0.3 : undefined,
              reactions: Math.random() > 0.8 ? getRandomReactions() : [],
            }
          );
        } else if (messageType < 0.85) {
          // Message média
          const mediaType = Math.random();
          let media;

          if (mediaType < 0.4) {
            media = [
              {
                type: 'image',
                url: `https://picsum.photos/seed/${user.id}${i}/400/300`,
              },
            ];
          } else if (mediaType < 0.7) {
            // Message audio avec métadonnées complètes
            const durationMinutes = Math.floor(Math.random() * 3) + 1;
            const durationSeconds = Math.floor(Math.random() * 60);
            const duration = `${durationMinutes}:${String(
              durationSeconds
            ).padStart(2, '0')}`;

            media = [
              {
                type: 'audio',
                duration: duration,
                timestamp: timestamp.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                waveform: Array.from(
                  { length: 35 },
                  () => Math.random() * 0.7 + 0.3
                ), // Forme d'onde simulée
                size: `${Math.floor(Math.random() * 500) + 100} KB`,
                quality: '128 kbps',
              },
            ];
          } else {
            media = [
              {
                type: 'video',
                url: `https://picsum.photos/seed/video${user.id}${i}/400/300`,
                duration: `${Math.floor(Math.random() * 2) + 1}:${String(
                  Math.floor(Math.random() * 60)
                ).padStart(2, '0')}`,
              },
            ];
          }

          message = createMediaMessage(
            user.id,
            isFromUser ? 'me' : 'other',
            media,
            {
              senderName: isFromUser ? undefined : user.name,
              time: timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              date: timestamp.toLocaleDateString('fr-FR'),
              read: isFromUser ? Math.random() > 0.3 : undefined,
            }
          );
        } else {
          // Message système (appel)
          const callTypes = ['call', 'video'];
          const callStatuses = ['missed', 'incoming', 'outgoing'];

          message = createSystemMessage(
            user.id,
            callTypes[Math.floor(Math.random() * callTypes.length)],
            `${callStatuses[Math.floor(Math.random() * callStatuses.length)]} ${
              callTypes[Math.floor(Math.random() * callTypes.length)]
            } call`,
            {
              callStatus:
                callStatuses[Math.floor(Math.random() * callStatuses.length)],
              time: timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              date: timestamp.toLocaleDateString('fr-FR'),
            }
          );
        }

        messages.push(message);
      }

      return messages.sort((a, b) => new Date(a.time) - new Date(b.time));
    },
    [createSystemMessage, createTextMessage, createMediaMessage]
  );

  // Fonctions utilitaires
  const getRandomMessageText = useCallback(() => {
    const texts = [
      'Salut ! Comment ça va ?',
      'Ça va bien, merci ! Et toi ?',
      "Tu fais quoi aujourd'hui ?",
      'Pas grand chose, je me repose',
      'Ok, à plus tard !',
      'Merci beaucoup !',
      "Parfait, c'est noté",
      'Super ! Je suis content',
      "D'accord, pas de problème",
      'À bientôt !',
      "C'est noté, merci",
      "Je suis d'accord avec toi",
      "Tu as raison, c'est logique",
      'Exactement !',
      'Bien sûr, évidemment',
      "C'est ça, parfaitement",
      'Je vois ce que tu veux dire',
      "C'est une bonne idée",
      'Je pense que tu as raison',
      "C'est intéressant",
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }, []);

  const getRandomReactions = useCallback(() => {
    const reactions = [
      '👍',
      '❤️',
      '😊',
      '😮',
      '😢',
      '🙏',
      '😂',
      '😍',
      '🤔',
      '👏',
    ];
    const count = Math.floor(Math.random() * 4) + 1;
    const selected = [];

    for (let i = 0; i < count; i++) {
      const reaction = reactions[Math.floor(Math.random() * reactions.length)];
      if (!selected.includes(reaction)) {
        selected.push(reaction);
      }
    }

    return selected;
  }, []);

  // Méthodes métier optimisées avec cache
  const loadMessages = useCallback(
    async chatId => {
      try {
        actions.setLoading(true);

        // Charger les messages depuis le service de cache
        const messages = await cachedFirebaseService.getMessages(chatId, 50, 0);

        if (messages && messages.length > 0) {
          const transformedMessages = messages.map(msg => {
            const normalizedSender =
              msg.sender === currentUserId ? 'me' : 'other';

            return {
              id: msg.id,
              sender: normalizedSender,
              senderName:
                msg.sender_name ||
                (normalizedSender === 'me'
                  ? currentUser?.name || currentUser?.displayName || 'Me'
                  : undefined),
              text: msg.text,
              media: msg.media,
              time:
                msg.time ||
                new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              date: msg.date || new Date().toLocaleDateString('fr-FR'),
              read: msg.is_read || false,
              reactions: msg.reactions || [],
              replyTo: msg.reply_to,
              type: msg.type || 'text',
              isStarred: msg.is_starred || false,
              edited: msg.edited || false,
              forwarded: msg.forwarded || false,
              link: msg.link,
              timestamp: msg.created_at ? new Date(msg.created_at) : new Date(),
            };
          });

          actions.setMessages(chatId, transformedMessages);
          console.log(
            `✅ ${transformedMessages.length} messages chargés avec cache pour la conversation ${chatId}`
          );
        } else {
          // Si pas de messages, initialiser avec un tableau vide
          actions.setMessages(chatId, []);
          console.log(`📭 Aucun message trouvé pour la conversation ${chatId}`);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    },
    [actions, currentUserId, currentUser]
  );

  // Toujours garder une référence des messages à jour pour éviter les doublons en temps réel
  useEffect(() => {
    latestMessagesRef.current = state.messages;
  }, [state.messages]);

  const sendMessage = useCallback(
    async (recipientUserIdOrChatId, messageData, replyTo = null) => {
      try {
        if (!currentUser || !currentUser.id) {
          console.error('❌ Utilisateur courant non défini');
          return;
        }

        if (!messageData.text?.trim() && messageData.type !== 'media') {
          console.warn('⚠️ Message vide');
          return;
        }

        // Déterminer le conversationId et recipientId
        let conversationId;
        let recipientUserId;
        let selectedChat = state.selectedChat;

        // Si recipientUserIdOrChatId commence par "conv-", c'est un ID de conversation Firebase
        if (recipientUserIdOrChatId.startsWith('conv-')) {
          conversationId = recipientUserIdOrChatId;
          recipientUserId = getOtherParticipantId(
            conversationId,
            currentUser.id
          );
        }
        // Sinon, c'est un ID utilisateur Firebase direct (email)
        else {
          // Pour les utilisateurs Firebase, l'ID est directement l'email
          recipientUserId = recipientUserIdOrChatId;

          // Si c'est un chat temporaire, on peut aussi récupérer depuis recipientId
          if (selectedChat?.isTemporary && selectedChat?.recipientId) {
            recipientUserId = selectedChat.recipientId;
            console.log(
              '📧 Utilisation de recipientId du chat temporaire:',
              recipientUserId
            );
          }

          // Générer l'ID de conversation déterministe
          conversationId = generateConversationId(
            currentUser.id,
            recipientUserId
          );
        }

        if (!recipientUserId) {
          console.error('❌ Destinataire non défini');
          return;
        }

        console.log(
          `📨 Envoi du message à ${recipientUserId} via conversation ${conversationId}`
        );

        // Préparer les infos destinataire (utilisées pour création ou mise à jour)
        let recipientInfo;
        if (selectedChat?.isTemporary && selectedChat?.participants_info?.[recipientUserId]) {
          recipientInfo = selectedChat.participants_info[recipientUserId];
        } else {
          const foundUser = state.users.find(
            u => u.id === recipientUserId || u.email === recipientUserId
          );
          if (foundUser) {
            recipientInfo = {
              name:
                foundUser.displayName ||
                foundUser.name ||
                foundUser.email ||
                'Utilisateur',
              avatar:
                foundUser.photoURL ||
                foundUser.avatar ||
                '/default-avatar.png',
            };
          } else {
            recipientInfo = {
              name: recipientUserId,
              avatar: '/default-avatar.png',
            };
          }
        }

        // Vérifier si la conversation existe déjà
        let conversationExists = false;
        try {
          const conversationRef = doc(db, 'conversations', conversationId);
          const snap = await getDoc(conversationRef);
          conversationExists = snap.exists();

          // Si la conversation déterministe n'existe pas, essayer d'en retrouver une avec les mêmes participants
          if (!conversationExists) {
            const convQuery = query(
              collection(db, 'conversations'),
              where('participants', 'array-contains', currentUser.id)
            );
            const convSnap = await getDocs(convQuery);

            convSnap.forEach(docSnap => {
              const data = docSnap.data();
              if (
                Array.isArray(data.participants) &&
                data.participants.includes(recipientUserId)
              ) {
                conversationExists = true;
                conversationId = docSnap.id; // réutiliser la conversation existante
              }
            });
          }
        } catch (error) {
          console.warn(
            '⚠️ Erreur lors de la vérification de la conversation:',
            error
          );
        }

        // Si la conversation n'existe pas, la créer
        if (!conversationExists) {
          console.log(`📝 Création de la conversation ${conversationId}`);

          try {
            const conversationData = createConversationData(
              currentUser.id,
              recipientUserId,
              {
                name: currentUser.name || currentUser.displayName || 'Moi',
                avatar:
                  currentUser.avatar ||
                  currentUser.photoURL ||
                  '/default-avatar.png',
              },
              {
                name: recipientInfo.name || 'Contact',
                avatar: recipientInfo.avatar || '/default-avatar.png',
              }
            );

            // Créer la conversation dans Firebase
            await firebaseService.addConversation(conversationData);
            console.log('✅ Conversation créée dans Firebase');

            // Ajouter la conversation à l'état local
            const transformedConv = transformConversationForDisplay(
              conversationData,
              currentUser.id
            );
            actions.addUser(transformedConv);
          } catch (error) {
            console.error(
              '❌ Erreur lors de la création de la conversation:',
              error
            );
          }
        } else {
          // S'assurer que participants_info contient bien les deux utilisateurs
          try {
            await firebaseService.mergeParticipantsInfo(conversationId, {
              [currentUser.id]: {
                name: currentUser.name || currentUser.displayName || 'Moi',
                avatar:
                  currentUser.avatar ||
                  currentUser.photoURL ||
                  '/default-avatar.png',
              },
              [recipientUserId]: {
                name: recipientInfo?.name || 'Contact',
                avatar: recipientInfo?.avatar || '/default-avatar.png',
              },
            });
          } catch (error) {
            console.warn('⚠️ Impossible de mettre à jour participants_info:', error);
          }
        }

        // Créer le message
        let message;
        let firebaseData;

        if (messageData.type === 'media') {
          message = createMediaMessage(
            conversationId,
            'me',
            messageData.media,
            {
              replyTo: replyTo,
            }
          );

          firebaseData = {
            text:
              messageData.text ||
              `📎 ${messageData.media[0]?.fileName || 'fichier'}`,
            sender: currentUser.id,
            sender_name: currentUser.name || currentUser.displayName,
            type: 'media',
            media: messageData.media,
            conversation_id: conversationId,
            replyTo: replyTo,
            reactions: [],
            isStarred: false,
            isRead: false,
            metadata: {},
          };
        } else {
          message = createTextMessage(
            conversationId,
            'me',
            messageData.text.trim(),
            {
              replyTo: replyTo,
            }
          );

          firebaseData = {
            text: messageData.text.trim(),
            sender: currentUser.id,
            sender_name: currentUser.name || currentUser.displayName,
            type: 'text',
            media: null,
            conversation_id: conversationId,
            replyTo: replyTo,
            reactions: [],
            isStarred: false,
            isRead: false,
            metadata: {},
          };
        }

        // PHASE 1 : Ajout au cache local
        try {
          localCacheService.addMessage(conversationId, message);
          console.log('✅ Message ajouté au cache local');
        } catch (error) {
          console.warn("⚠️ Erreur lors de l'ajout au cache local:", error);
        }

        // PHASE 2 : Synchronisation avec Firebase
        try {
          await firebaseService.addMessage(
            conversationId,
            { ...firebaseData, tempId: message.id },
            message.id
          );
          console.log('✅ Message envoyé avec succès');
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du message:", error);
        }

        // Ajouter le message à l'état local
        actions.addMessage(conversationId, message);

        // Mettre à jour le dernier message
        let lastMessageText =
          messageData.text?.trim() ||
          `📎 ${messageData.media[0]?.fileName || 'fichier'}`;
        actions.updateLastMessage(conversationId, {
          text: lastMessageText,
          type: messageData.type || 'text',
        });

        // Mettre à jour la conversation dans Firestore pour les tuiles
        firebaseService.updateConversationLastMessage(conversationId, {
          text: lastMessageText,
          type: messageData.type || 'text',
          sender: currentUser.id,
          sender_name: currentUser.name || currentUser.displayName,
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("❌ Erreur générale lors de l'envoi du message:", error);
      }
    },
    [currentUser, state.users, actions, createTextMessage, createMediaMessage]
  );

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (state.selectedChat?.id) {
      loadMessages(state.selectedChat.id);
    }
  }, [state.selectedChat?.id, loadMessages]);

  const selectChat = useCallback(
    async chat => {
      actions.setSelectedChat(chat);

      // Nettoyer l'ancien listener si existant
      const oldListener = messageListenersRef.current.get(
        state.selectedChat?.id
      );
      if (oldListener && typeof oldListener === 'function') {
        oldListener();
        messageListenersRef.current.delete(state.selectedChat?.id);
      }

      // Charger les messages existants depuis Firebase
      try {
        const response = await fetch(
          `/api/conversations/${chat.id}/messages?limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          const messages = data.messages || [];

          // Transformer les messages pour l'interface
          const transformedMessages = messages.map(msg => {
            const normalizedSender =
              msg.sender === currentUserId ? 'me' : 'other';

            return {
              id: msg.id,
              text: msg.text,
              sender: normalizedSender,
              senderName:
                msg.sender_name ||
                (normalizedSender === 'me'
                  ? currentUser?.name || currentUser?.displayName || 'Me'
                  : undefined),
              type: msg.type || 'text',
              media: msg.media || null,
              replyTo: msg.reply_to,
              reactions: msg.reactions || [],
              time:
                msg.time ||
                new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              date:
                msg.date ||
                new Date(msg.created_at).toLocaleDateString('fr-FR'),
              read: msg.read || false,
              timestamp: new Date(msg.created_at),
            };
          });

          // Ajouter les messages à l'état local
          if (transformedMessages.length > 0) {
            actions.setMessages(chat.id, transformedMessages);
            console.log(
              `✅ ${transformedMessages.length} messages chargés pour la conversation ${chat.id}`
            );
          }
        } else {
          console.error('❌ Erreur lors du chargement des messages');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des messages:', error);
      }

      // ===== ACTIVER LE LISTENER EN TEMPS RÉEL =====
      if (listenToMessages && chat.id) {
        console.log(`🔊 Activation du listener temps réel pour ${chat.id}`);

        const unsubscribe = listenToMessages(
          chat.id,
          ({ changes, allMessages }) => {
            // Traiter les changements
            changes.forEach(({ type, message }) => {
              if (type === 'added') {
                // Vérifier si le message existe déjà (éviter doublons)
                const existingMessages =
                  latestMessagesRef.current[chat.id] || [];
                const alreadyExists = existingMessages.some(
                  m => m.id === message.id
                );

                if (!alreadyExists) {
                  console.log(
                    `📩 Nouveau message reçu:`,
                    message.text?.substring(0, 30)
                  );

                  // Transformer pour l'interface
                  const normalizedSender =
                    message.sender === currentUserId ? 'me' : 'other';

                  const transformedMessage = {
                    id: message.id,
                    text: message.text,
                    sender: normalizedSender,
                    senderName:
                      message.sender_name ||
                      (normalizedSender === 'me'
                        ? currentUser?.name || currentUser?.displayName || 'Me'
                        : undefined),
                    type: message.type || 'text',
                    media: message.media || null,
                    replyTo: message.reply_to,
                    reactions: message.reactions || [],
                    time:
                      message.time ||
                      new Date(
                        message.created_at || Date.now()
                      ).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    date:
                      message.date ||
                      new Date(
                        message.created_at || Date.now()
                      ).toLocaleDateString('fr-FR'),
                    read: message.read || false,
                    timestamp: new Date(message.created_at || Date.now()),
                  };

                  actions.addMessage(chat.id, transformedMessage);

                  // Mettre à jour le dernier message dans la liste
                  actions.updateLastMessage(chat.id, {
                    text: transformedMessage.text,
                    type: transformedMessage.type,
                  });
                }
              } else if (type === 'modified') {
                console.log(`✏️ Message modifié:`, message.id);
                actions.updateMessage(chat.id, message.id, message);
              } else if (type === 'removed') {
                console.log(`🗑️ Message supprimé:`, message.id);
                actions.deleteMessage(chat.id, message.id);
              }
            });
          }
        );

        // Stocker le listener pour le cleanup
        messageListenersRef.current.set(chat.id, unsubscribe);
      }
    },
    [
      actions,
      listenToMessages,
      state.selectedChat,
      state.messages,
      currentUserId,
      currentUser,
    ]
  );

  const addReactionToMessage = useCallback(
    (chatId, messageId, reaction) => {
      actions.addReaction(chatId, messageId, reaction);
    },
    [actions]
  );

  const removeReactionFromMessage = useCallback(
    (chatId, messageId, reaction) => {
      actions.removeReaction(chatId, messageId, reaction);
    },
    [actions]
  );

  const deleteMessage = useCallback(
    (chatId, messageId) => {
      actions.deleteMessage(chatId, messageId);
    },
    [actions]
  );

  const toggleMessageStar = useCallback(
    (chatId, messageId) => {
      actions.toggleMessageStar(chatId, messageId);
    },
    [actions]
  );

  const toggleChatPin = useCallback(
    chatId => {
      actions.toggleChatPin(chatId);
    },
    [actions]
  );

  // Nouvelles fonctions pour gérer les statuts
  const getUserStatuses = useCallback(
    userId => {
      return state.statuses.filter(status => status.userId === userId);
    },
    [state.statuses]
  );

  const getUserStatusCircles = useCallback(
    userId => {
      const user = state.users.find(u => u.id === userId);
      return user?.statusCircles || null;
    },
    [state.users]
  );

  const markStatusAsViewed = useCallback(
    statusId => {
      actions.markStatusViewed(statusId);
      // Mettre à jour le statut dans la liste
      actions.updateStatus(statusId, { isViewed: true });
    },
    [actions]
  );

  const addUserStatus = useCallback(
    (userId, statusData) => {
      const user = state.users.find(u => u.id === userId);
      if (!user) return;

      const newStatus = {
        id: `status_${userId}_${Date.now()}`,
        userId: userId,
        userName: user.name,
        ...statusData,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isViewed: false,
        viewCount: 0,
        reactions: {},
      };

      actions.addStatus(newStatus);
    },
    [actions, state.users]
  );

  // Filtrage intelligent des utilisateurs
  const filteredUsers = useMemo(() => {
    return state.users.filter(
      user =>
        // Ne montrer que les conversations (pas les contacts) dans la chatlist
        !user.isContact &&
        (user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          user.lastMessage?.text
            ?.toLowerCase()
            .includes(state.searchQuery.toLowerCase()))
    );
  }, [state.users, state.searchQuery]);

  // Contacts pour la liste des contacts
  const contacts = useMemo(() => {
    return state.users.filter(user => user.isContact);
  }, [state.users]);

  // Charger les utilisateurs et conversations avec cache
  useEffect(() => {
    async function fetchUsersAndConversations() {
      try {
        actions.setLoading(true);
        actions.setError(null);

        // Charger les contacts depuis l'API externe
        const response = await fetch(
          'https://randomuser.me/api/?results=20&nat=fr,us,gb,ca,au'
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }

        // Transformer les données pour correspondre à notre structure (seulement les contacts)
        const transformedContacts = data.results.map((user, index) => {
          const userName =
            Math.random() > 0.95
              ? '+' + user.phone
              : `${user.name.first} ${user.name.last}`;
          // Réduire la probabilité d'avoir des statuts (seulement 30% des utilisateurs)
          const hasStatuses = Math.random() > 0.7;
          const userStatuses = hasStatuses
            ? generateUserStatuses(user.login.uuid, userName)
            : [];

          return {
            id: user.login.uuid,
            name: userName,
            avatar: user.picture.medium,
            status: getRandomStatus(),
            phone: user.phone,
            email: user.email,
            // Nouvelles propriétés pour les statuts
            statuses: userStatuses,
            statusCircles: generateStatusCircles(userStatuses),
            // Marquer comme contact (pas comme conversation)
            isContact: true,
            isConversation: false,
          };
        });

        // Charger les conversations depuis le service de cache
        const currentUserId = currentUser?.id || 'default-user';
        const conversations = await cachedFirebaseService.getConversations(
          currentUserId,
          50,
          0
        );

        // Transformer les conversations en utilisateurs pour la compatibilité
        // IMPORTANT : Afficher l'AUTRE participant, pas soi-même
        const transformedConversations = conversations.map(conv => {
          // Trouver l'autre participant (pas l'utilisateur courant)
          const otherParticipantId = conv.participants?.find(
            p => p !== currentUserId
          );

          // Si c'est une conversation individuelle, afficher l'autre participant
          if (conv.type === 'individual' && otherParticipantId) {
            let otherParticipantName = 'Contact';
            let otherParticipantAvatar = '/default-avatar.png';

            // Essayer d'abord de récupérer depuis participants_info
            if (
              conv.participants_info &&
              conv.participants_info[otherParticipantId]
            ) {
              otherParticipantName =
                conv.participants_info[otherParticipantId].name;
              otherParticipantAvatar =
                conv.participants_info[otherParticipantId].avatar;
            } else {
              // Sinon chercher dans les contacts transformés
              const otherParticipant = transformedContacts.find(
                c => c.id === otherParticipantId
              );

              if (otherParticipant) {
                otherParticipantName = otherParticipant.name;
                otherParticipantAvatar = otherParticipant.avatar;
              } else {
                // Fallback : utiliser le nom de la conversation
                otherParticipantName = conv.name || 'Contact';
                otherParticipantAvatar =
                  conv.avatar_url ||
                  `https://ui-avatars.com/api/?name=${otherParticipantName}&background=6a7175&color=fff&size=40`;
              }
            }

            return {
              id: conv.id,
              name: otherParticipantName,
              avatar: otherParticipantAvatar,
              status: 'en ligne',
              lastMessage: conv.last_message,
              lastMessageTime: conv.last_message_time,
              unreadCount: conv.unread_count || 0,
              isPinned: conv.is_pinned || false,
              isContact: false,
              isConversation: true,
              participants: conv.participants,
              otherParticipantId,
            };
          }

          // Pour les groupes ou si participant non trouvé, utiliser les données de la conversation
          return {
            id: conv.id,
            name: conv.name || 'Conversation',
            avatar:
              conv.avatar_url ||
              `https://ui-avatars.com/api/?name=${
                conv.name || 'C'
              }&background=6a7175&color=fff&size=40`,
            status: conv.status || 'en ligne',
            lastMessage: conv.last_message,
            lastMessageTime: conv.last_message_time,
            unreadCount: conv.unread_count || 0,
            isPinned: conv.is_pinned || false,
            isContact: false,
            isConversation: true,
            participants: conv.participants,
          };
        });

        // Combiner contacts et conversations
        const allUsers = [...transformedContacts, ...transformedConversations];
        actions.setUsers(allUsers);

        // Stocker tous les statuts dans le contexte
        const allStatuses = transformedContacts.flatMap(user => user.statuses);
        actions.setStatuses(allStatuses);

        // Précharger les données fréquemment utilisées
        await cachedFirebaseService.preloadData(currentUserId);
      } catch (error) {
        console.error(
          'Erreur lors du chargement des utilisateurs et conversations:',
          error
        );
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    }

    fetchUsersAndConversations();
  }, []); // Exécuter seulement au montage

  // Fonctions utilitaires pour les données initiales
  function getRandomStatus() {
    const statuses = [
      'Online',
      'Last seen 2 minutes ago',
      'Last seen 1 hour ago',
      'Last seen today at 2:30 PM',
      'Last seen yesterday at 6:45 PM',
      'Last seen 2 days ago',
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  // Fonctions pour les statuts
  function generateUserStatuses(userId, userName) {
    const statusTypes = [
      {
        type: 'image',
        content: 'Photo de vacances à la plage',
        preview: '🏖️',
        time: 'Just now',
      },
      {
        type: 'video',
        content: 'Vidéo de mon chat qui dort',
        preview: '🐱',
        time: 'Today, 2:28 PM',
      },
      {
        type: 'text',
        content: "Super journée aujourd'hui ! ☀️",
        preview: '☀️',
        time: '8 minutes ago',
      },
      {
        type: 'image',
        content: 'Nouveau restaurant testé hier soir',
        preview: '🍽️',
        time: 'Today, 1:15 PM',
      },
      {
        type: 'audio',
        content: 'Message vocal - 0:23',
        preview: '🎵',
        time: 'Today, 12:30 PM',
      },
      {
        type: 'text',
        content: 'En route pour le travail 🚗',
        preview: '🚗',
        time: 'Today, 11:45 AM',
      },
      {
        type: 'image',
        content: 'Mon nouveau bureau installé',
        preview: '💻',
        time: 'Today, 10:20 AM',
      },
      {
        type: 'text',
        content: 'Bon matin tout le monde ! 🌅',
        preview: '🌅',
        time: 'Today, 9:15 AM',
      },
      {
        type: 'video',
        content: 'Tutoriel de cuisine - 2:15',
        preview: '👨‍🍳',
        time: 'Today, 8:30 AM',
      },
    ];

    // Générer entre 1 et 4 statuts par utilisateur
    const numberOfStatuses = Math.floor(Math.random() * 4) + 1;
    const userStatuses = [];

    for (let i = 0; i < numberOfStatuses; i++) {
      const statusData = statusTypes[i] || statusTypes[0];
      const status = {
        id: `status_${userId}_${i}_${Date.now()}`,
        userId: userId,
        userName: userName,
        type: statusData.type,
        content: statusData.content,
        preview: statusData.preview,
        time: statusData.time,
        createdAt: new Date(
          Date.now() - Math.random() * 24 * 60 * 60 * 1000
        ).toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isPublic: Math.random() > 0.3,
        viewCount: Math.floor(Math.random() * 50) + 1,
        reactions: generateRandomReactions(),
        isViewed: Math.random() > 0.7, // 30% de chance d'être déjà vu
      };
      userStatuses.push(status);
    }

    return userStatuses;
  }

  function generateRandomReactions() {
    const possibleReactions = [
      '👍',
      '❤️',
      '😊',
      '😮',
      '😢',
      '🙏',
      '😂',
      '😍',
      '🤔',
      '👏',
    ];
    const count = Math.floor(Math.random() * 4) + 1;
    const reactions = {};

    for (let i = 0; i < count; i++) {
      const reaction =
        possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
      reactions[reaction] = Math.floor(Math.random() * 10) + 1;
    }

    return reactions;
  }

  // Fonction pour générer les cercles avec segments
  function generateStatusCircles(statuses) {
    if (!statuses || statuses.length === 0) return null;

    const totalStatuses = statuses.length;
    const viewedStatuses = statuses.filter(s => s.isViewed).length;
    const unviewedStatuses = totalStatuses - viewedStatuses;

    return {
      total: totalStatuses,
      viewed: viewedStatuses,
      unviewed: unviewedStatuses,
      segments: totalStatuses,
      hasUnviewed: unviewedStatuses > 0,
    };
  }

  function getRandomLastMessage() {
    const messages = [
      { text: 'reacted 👍 to your status', type: 'reaction' },
      { text: 'Hey, how are you?', type: 'text' },
      { text: 'Thank you very much!', type: 'text' },
      { text: 'Perfect, see you tomorrow', type: 'text' },
      { text: 'Voice message', type: 'voice', duration: '0:23' },
      { text: 'Video message', type: 'video', duration: '1:45' },
      { text: 'Photo', type: 'image' },
      { text: 'Document.pdf', type: 'document', size: '2.4 MB' },
      { text: 'https://example.com', type: 'link' },
      { text: 'Great idea!', type: 'text' },
      { text: 'See you soon!', type: 'text' },
      { text: 'No problem', type: 'text' },
      { text: 'Audio file', type: 'audio', duration: '3:12' },
      { text: 'Location shared', type: 'location' },
      { text: 'Sticker', type: 'sticker' },
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  function getRandomTime() {
    const now = new Date();
    const times = [
      now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      `${now.getHours() - 1}:${String(now.getMinutes()).padStart(2, '0')}`,
      `${now.getHours() - 2}:${String(now.getMinutes()).padStart(2, '0')}`,
      'Hier',
      '~ 2 jours',
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  // Écouter les conversations en temps réel quand l'utilisateur est connecté
  useEffect(() => {
    if (!currentUserId || !listenToConversations) {
      return;
    }

    console.log('🔊 Activation du listener conversations pour:', currentUserId);

    // Nettoyer l'ancien listener
    if (conversationListenerRef.current) {
      conversationListenerRef.current();
      conversationListenerRef.current = null;
    }

    // Créer le nouveau listener
    const unsubscribe = listenToConversations(
      currentUserId,
      ({ changes, allConversations }) => {
        console.log(
          '📥 Conversations mises à jour:',
          changes.length,
          'changements'
        );

        // Transformer les conversations pour l'affichage
        const transformedConversations = allConversations.map(conv => {
          return transformConversationForDisplay(conv, currentUserId);
        });

        // Dédoublication: créer un Map pour éliminer les doublons par ID
        const uniqueConversations = new Map();
        transformedConversations.forEach(conv => {
          if (conv && conv.id) {
            uniqueConversations.set(conv.id, conv);
          }
        });

        // Convertir le Map en tableau
        const finalConversations = Array.from(uniqueConversations.values());

        console.log(`✅ ${finalConversations.length} conversations uniques`);

        // Mettre à jour la liste des conversations
        actions.setUsers(finalConversations);

        // Logger les changements
        changes.forEach(change => {
          if (change.type === 'added') {
            console.log(
              '➕ Nouvelle conversation ajoutée:',
              change.conversation.id
            );
          } else if (change.type === 'modified') {
            console.log('✏️ Conversation mise à jour:', change.conversation.id);
          }
        });
      }
    );

    conversationListenerRef.current = unsubscribe;

    // Nettoyer au démontage
    return () => {
      if (conversationListenerRef.current) {
        conversationListenerRef.current();
        conversationListenerRef.current = null;
      }
    };
  }, [currentUserId, listenToConversations, actions]);

  const value = useMemo(
    () => ({
      // État
      ...state,
      currentUser, // Ajouter l'utilisateur connecté au contexte
      currentUserId, // Ajouter l'ID pour accès rapide

      // Actions
      setLoading: actions.setLoading,
      setUsers: actions.setUsers,
      setSelectedChat: actions.setSelectedChat,
      loadMessages,
      getCacheStats: () => cachedFirebaseService.getCacheStats(),
      clearCache: () => cachedFirebaseService.clearCache(),
      addMessage: actions.addMessage,
      updateMessage: actions.updateMessage,
      deleteMessage: actions.deleteMessage,
      setMessages: actions.setMessages,
      setError: actions.setError,
      updateUserStatus: actions.updateUserStatus,
      updateLastMessage: actions.updateLastMessage,
      setSearchQuery: actions.setSearchQuery,
      toggleSidebar: actions.toggleSidebar,
      setActiveTab: actions.setActiveTab,
      markMessagesRead: actions.markMessagesRead,
      addReaction: actions.addReaction,
      removeReaction: actions.removeReaction,
      setReplyTo: actions.setReplyTo,
      clearReplyTo: actions.clearReplyTo,
      toggleMessageStar: actions.toggleMessageStar,
      toggleChatPin: actions.toggleChatPin,
      addUser: actions.addUser,
      // Nouvelles actions pour les statuts
      setStatuses: actions.setStatuses,
      addStatus: actions.addStatus,
      updateStatus: actions.updateStatus,
      deleteStatus: actions.deleteStatus,
      markStatusViewed: actions.markStatusViewed,

      // Méthodes métier
      sendMessage,
      selectChat,
      addReactionToMessage,
      removeReactionFromMessage,
      deleteMessage: deleteMessage,
      toggleMessageStar,
      toggleChatPin,
      // Nouvelles méthodes pour les statuts
      getUserStatuses,
      getUserStatusCircles,
      markStatusAsViewed,
      addUserStatus,

      // Données calculées
      filteredUsers,
      contacts,
    }),
    [
      state,
      currentUser,
      currentUserId,
      actions,
      sendMessage,
      selectChat,
      addReactionToMessage,
      removeReactionFromMessage,
      deleteMessage,
      toggleMessageStar,
      toggleChatPin,
      filteredUsers,
      contacts,
      createTextMessage,
      createMediaMessage,
      createSystemMessage,
    ]
  );

  // Cleanup des listeners au démontage
  useEffect(() => {
    return () => {
      messageListenersRef.current.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      messageListenersRef.current.clear();
    };
  }, []);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
