'use client';

import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';

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
  // Nouvelles actions pour les statuts
  SET_STATUSES: 'SET_STATUSES',
  ADD_STATUS: 'ADD_STATUS',
  UPDATE_STATUS: 'UPDATE_STATUS',
  DELETE_STATUS: 'DELETE_STATUS',
  MARK_STATUS_VIEWED: 'MARK_STATUS_VIEWED'
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
  viewedStatuses: [] // Nouvelle propriété pour stocker les statuts déjà vus
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
          [chatId]: newMessages
        }
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
          [updateChatId]: updatedMessages
        }
      };
    
    case ACTIONS.DELETE_MESSAGE:
      const { chatId: deleteChatId, messageId: deleteMessageId } = action.payload;
      const messagesToFilter = state.messages[deleteChatId] || [];
      const filteredMessages = messagesToFilter.filter(msg => msg.id !== deleteMessageId);
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [deleteChatId]: filteredMessages
        }
      };
    
    case ACTIONS.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ACTIONS.UPDATE_USER_STATUS:
      const { userId, status } = action.payload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === userId ? { ...user, status } : user
        )
      };
    
    case ACTIONS.UPDATE_LAST_MESSAGE:
      const { chatId: lastMsgChatId, lastMessage } = action.payload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === lastMsgChatId 
            ? { ...user, lastMessage, lastMessageTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }
            : user
        )
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
          [readChatId]: markedMessages
        },
        users: state.users.map(user =>
          user.id === readChatId ? { ...user, unreadCount: 0 } : user
        )
      };
    
    case ACTIONS.ADD_REACTION:
      const { chatId: reactionChatId, messageId: reactionMessageId, reaction } = action.payload;
      const messagesForReaction = state.messages[reactionChatId] || [];
      const messagesWithReaction = messagesForReaction.map(msg => {
        if (msg.id === reactionMessageId) {
          const currentReactions = msg.reactions || [];
          return {
            ...msg,
            reactions: [...currentReactions, reaction]
          };
        }
        return msg;
      });
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [reactionChatId]: messagesWithReaction
        }
      };
    
    case ACTIONS.REMOVE_REACTION:
      const { chatId: removeReactionChatId, messageId: removeReactionMessageId, reaction: reactionToRemove } = action.payload;
      const messagesForRemoveReaction = state.messages[removeReactionChatId] || [];
      const messagesWithoutReaction = messagesForRemoveReaction.map(msg => {
        if (msg.id === removeReactionMessageId) {
          const currentReactions = msg.reactions || [];
          return {
            ...msg,
            reactions: currentReactions.filter(r => r !== reactionToRemove)
          };
        }
        return msg;
      });
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [removeReactionChatId]: messagesWithoutReaction
        }
      };
    
    case ACTIONS.SET_REPLY_TO:
      return {
        ...state,
        replyTo: action.payload
      };
    
    case ACTIONS.CLEAR_REPLY_TO:
      return {
        ...state,
        replyTo: null
      };
    
    case ACTIONS.TOGGLE_MESSAGE_STAR:
      const { chatId: starChatId, messageId: starMessageId } = action.payload;
      const messagesForStar = state.messages[starChatId] || [];
      const messagesWithStarToggle = messagesForStar.map(msg => {
        if (msg.id === starMessageId) {
          return {
            ...msg,
            isStarred: !msg.isStarred
          };
        }
        return msg;
      });
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [starChatId]: messagesWithStarToggle
        }
      };
    
    case ACTIONS.TOGGLE_CHAT_PIN:
      const { chatId: pinChatId } = action.payload;
      return {
        ...state,
        users: state.users.map(user =>
          user.id === pinChatId ? { ...user, isPinned: !user.isPinned } : user
        )
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
          status.id === action.payload.id ? { ...status, ...action.payload.updates } : status
        )
      };
    case ACTIONS.DELETE_STATUS:
      return {
        ...state,
        statuses: state.statuses.filter(status => status.id !== action.payload)
      };
    case ACTIONS.MARK_STATUS_VIEWED:
      return {
        ...state,
        viewedStatuses: [...state.viewedStatuses, action.payload]
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

  // Actions optimisées avec useCallback
  const actions = useMemo(() => ({
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setUsers: (users) => dispatch({ type: ACTIONS.SET_USERS, payload: users }),
    setSelectedChat: (chat) => dispatch({ type: ACTIONS.SET_SELECTED_CHAT, payload: chat }),
    addMessage: (chatId, message) => dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } }),
    updateMessage: (chatId, messageId, updates) => dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { chatId, messageId, updates } }),
    deleteMessage: (chatId, messageId) => dispatch({ type: ACTIONS.DELETE_MESSAGE, payload: { chatId, messageId } }),
    setMessages: (messages) => dispatch({ type: ACTIONS.SET_MESSAGES, payload: messages }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    updateUserStatus: (userId, status) => dispatch({ type: ACTIONS.UPDATE_USER_STATUS, payload: { userId, status } }),
    updateLastMessage: (chatId, lastMessage) => dispatch({ type: ACTIONS.UPDATE_LAST_MESSAGE, payload: { chatId, lastMessage } }),
    setSearchQuery: (query) => dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),
    setActiveTab: (tab) => dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab }),
    markMessagesRead: (chatId) => dispatch({ type: ACTIONS.MARK_MESSAGES_READ, payload: { chatId } }),
    addReaction: (chatId, messageId, reaction) => dispatch({ type: ACTIONS.ADD_REACTION, payload: { chatId, messageId, reaction } }),
    removeReaction: (chatId, messageId, reaction) => dispatch({ type: ACTIONS.REMOVE_REACTION, payload: { chatId, messageId, reaction } }),
    setReplyTo: (replyTo) => dispatch({ type: ACTIONS.SET_REPLY_TO, payload: replyTo }),
    clearReplyTo: () => dispatch({ type: ACTIONS.CLEAR_REPLY_TO }),
    toggleMessageStar: (chatId, messageId) => dispatch({ type: ACTIONS.TOGGLE_MESSAGE_STAR, payload: { chatId, messageId } }),
    toggleChatPin: (chatId) => dispatch({ type: ACTIONS.TOGGLE_CHAT_PIN, payload: { chatId } }),
    // Nouvelles actions pour les statuts
    setStatuses: (statuses) => dispatch({ type: ACTIONS.SET_STATUSES, payload: statuses }),
    addStatus: (status) => dispatch({ type: ACTIONS.ADD_STATUS, payload: status }),
    updateStatus: (id, updates) => dispatch({ type: ACTIONS.UPDATE_STATUS, payload: { id, updates } }),
    deleteStatus: (id) => dispatch({ type: ACTIONS.DELETE_STATUS, payload: id }),
    markStatusViewed: (id) => dispatch({ type: ACTIONS.MARK_STATUS_VIEWED, payload: id })
  }), []);

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
    const isMe = sender === 'me';
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
      ...options
    };
  }, [generateMessageId]);

  const createMediaMessage = useCallback((chatId, sender, media, options = {}) => {
    const isMe = sender === 'me';
    return {
      id: generateMessageId(chatId, 'media'),
      sender,
      senderName: options.senderName,
      media,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('fr-FR'),
      read: isMe ? false : undefined,
      reactions: options.reactions || [],
      ...options
    };
  }, [generateMessageId]);

  // Génération de messages initiaux intelligente
  const generateInitialMessages = useCallback((user) => {
    const messages = [];
    const messageCount = Math.floor(Math.random() * 15) + 10;
    const now = new Date();
    
    // Ajouter un message de date système
    messages.push(createSystemMessage(user.id, 'date', now.toLocaleDateString('fr-FR')));
    
    for (let i = 0; i < messageCount; i++) {
      const isFromUser = Math.random() > 0.5;
      const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
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
            time: timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: timestamp.toLocaleDateString('fr-FR'),
            read: isFromUser ? (Math.random() > 0.3) : undefined,
            reactions: Math.random() > 0.8 ? getRandomReactions() : []
          }
        );
      } else if (messageType < 0.85) {
        // Message média
        const mediaType = Math.random();
        let media;
        
        if (mediaType < 0.4) {
          media = [{ type: 'image', url: `https://picsum.photos/seed/${user.id}${i}/400/300` }];
        } else if (mediaType < 0.7) {
          media = [{ type: 'audio', duration: `${Math.floor(Math.random() * 3) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` }];
        } else {
          media = [{ type: 'video', url: `https://picsum.photos/seed/video${user.id}${i}/400/300`, duration: `${Math.floor(Math.random() * 2) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}` }];
        }
        
        message = createMediaMessage(
          user.id,
          isFromUser ? 'me' : 'other',
          media,
          {
            senderName: isFromUser ? undefined : user.name,
            time: timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: timestamp.toLocaleDateString('fr-FR'),
            read: isFromUser ? (Math.random() > 0.3) : undefined
          }
        );
      } else {
        // Message système (appel)
        const callTypes = ['call', 'video'];
        const callStatuses = ['missed', 'incoming', 'outgoing'];
        
        message = createSystemMessage(
          user.id,
          callTypes[Math.floor(Math.random() * callTypes.length)],
          `${callStatuses[Math.floor(Math.random() * callStatuses.length)]} ${callTypes[Math.floor(Math.random() * callTypes.length)]} call`,
          {
            callStatus: callStatuses[Math.floor(Math.random() * callStatuses.length)],
            time: timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: timestamp.toLocaleDateString('fr-FR')
          }
        );
      }
      
      messages.push(message);
    }
    
    return messages.sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [createSystemMessage, createTextMessage, createMediaMessage]);

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

  const getRandomReactions = useCallback(() => {
    const reactions = ['👍', '❤️', '😊', '😮', '😢', '🙏', '😂', '😍', '🤔', '👏'];
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

  // Méthodes métier optimisées
  const sendMessage = useCallback(async (chatId, text, replyTo = null) => {
    if (!text.trim()) return;

    const message = createTextMessage(chatId, 'me', text.trim(), {
      replyTo: replyTo
    });
    actions.addMessage(chatId, message);

    // Mettre à jour le dernier message de l'utilisateur
    actions.updateLastMessage(chatId, {
      text: text.trim(),
      type: 'text'
    });

    // Simuler une réponse après un délai
    setTimeout(() => {
      const reply = createTextMessage(
        chatId,
        'other',
        getRandomMessageText(),
        {
          senderName: state.users.find(u => u.id === chatId)?.name
        }
      );
      actions.addMessage(chatId, reply);
      
      // Mettre à jour le dernier message
      actions.updateLastMessage(chatId, {
        text: reply.text,
        type: 'text'
      });
    }, 1000 + Math.random() * 2000);
  }, [createTextMessage, getRandomMessageText, actions, state.users]);

  const selectChat = useCallback((chat) => {
    actions.setSelectedChat(chat);
  }, [actions]);

  const addReactionToMessage = useCallback((chatId, messageId, reaction) => {
    actions.addReaction(chatId, messageId, reaction);
  }, [actions]);

  const removeReactionFromMessage = useCallback((chatId, messageId, reaction) => {
    actions.removeReaction(chatId, messageId, reaction);
  }, [actions]);

  const deleteMessage = useCallback((chatId, messageId) => {
    actions.deleteMessage(chatId, messageId);
  }, [actions]);

  const toggleMessageStar = useCallback((chatId, messageId) => {
    actions.toggleMessageStar(chatId, messageId);
  }, [actions]);

  const toggleChatPin = useCallback((chatId) => {
    actions.toggleChatPin(chatId);
  }, [actions]);

  // Nouvelles fonctions pour gérer les statuts
  const getUserStatuses = useCallback((userId) => {
    return state.statuses.filter(status => status.userId === userId);
  }, [state.statuses]);

  const getUserStatusCircles = useCallback((userId) => {
    const user = state.users.find(u => u.id === userId);
    return user?.statusCircles || null;
  }, [state.users]);

  const markStatusAsViewed = useCallback((statusId) => {
    actions.markStatusViewed(statusId);
    // Mettre à jour le statut dans la liste
    actions.updateStatus(statusId, { isViewed: true });
  }, [actions]);

  const addUserStatus = useCallback((userId, statusData) => {
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
      reactions: {}
    };

    actions.addStatus(newStatus);
  }, [actions, state.users]);

  // Filtrage intelligent des utilisateurs
  const filteredUsers = useMemo(() => {
    return state.users.filter(user =>
      user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      user.lastMessage?.text?.toLowerCase().includes(state.searchQuery.toLowerCase())
    );
  }, [state.users, state.searchQuery]);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    async function fetchUsers() {
      try {
        actions.setLoading(true);
        actions.setError(null);
        
        const response = await fetch('https://randomuser.me/api/?results=20&nat=fr,us,gb,ca,au');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }
      
        // Transformer les données pour correspondre à notre structure
        const transformedUsers = data.results.map((user, index) => {
          const userName = Math.random() > 0.95 ? '+'+user.phone : `${user.name.first} ${user.name.last}`;
          const userStatuses = generateUserStatuses(user.login.uuid, userName);
          
          return {
            id: user.login.uuid,
            name: userName,
            avatar: user.picture.medium,
            status: getRandomStatus(),
            lastMessage: getRandomLastMessage(),
            lastMessageTime: getRandomTime(),
            unreadCount: Math.floor(Math.random() * 5),
            online: Math.random() > 0.7,
            phone: user.phone,
            email: user.email,
            isMuted: Math.random() > 0.7,
            isPinned: Math.random() > 0.9,
            isArchived: Math.random() > 0.5,
            isStarred: Math.random() > 0.5,
            isUnread: Math.random() > 0.5,
            isTyping: Math.random() > 0.8,
            isRead: Math.random() > 0.5,
            // Nouvelles propriétés pour les statuts
            statuses: userStatuses,
            statusCircles: generateStatusCircles(userStatuses)
          };
        });

        actions.setUsers(transformedUsers);
        
        // Générer des messages initiaux pour chaque utilisateur
        const initialMessages = {};
        transformedUsers.forEach(user => {
          initialMessages[user.id] = generateInitialMessages(user);
        });
        actions.setMessages(initialMessages);
        
        // Stocker tous les statuts dans le contexte
        const allStatuses = transformedUsers.flatMap(user => user.statuses);
        actions.setStatuses(allStatuses);
        
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    }

    fetchUsers();
  }, []); // Exécuter seulement au montage

  // Fonctions utilitaires pour les données initiales
function getRandomStatus() {
  const statuses = [
    'Online',
    'Last seen 2 minutes ago',
    'Last seen 1 hour ago',
    'Last seen today at 2:30 PM',
    'Last seen yesterday at 6:45 PM',
    'Last seen 2 days ago'
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
      time: 'Just now'
    },
    {
      type: 'video',
      content: 'Vidéo de mon chat qui dort',
      preview: '🐱',
      time: 'Today, 2:28 PM'
    },
    {
      type: 'text',
      content: 'Super journée aujourd\'hui ! ☀️',
      preview: '☀️',
      time: '8 minutes ago'
    },
    {
      type: 'image',
      content: 'Nouveau restaurant testé hier soir',
      preview: '🍽️',
      time: 'Today, 1:15 PM'
    },
    {
      type: 'audio',
      content: 'Message vocal - 0:23',
      preview: '🎵',
      time: 'Today, 12:30 PM'
    },
    {
      type: 'text',
      content: 'En route pour le travail 🚗',
      preview: '🚗',
      time: 'Today, 11:45 AM'
    },
    {
      type: 'image',
      content: 'Mon nouveau bureau installé',
      preview: '💻',
      time: 'Today, 10:20 AM'
    },
    {
      type: 'text',
      content: 'Bon matin tout le monde ! 🌅',
      preview: '🌅',
      time: 'Today, 9:15 AM'
    },
    {
      type: 'video',
      content: 'Tutoriel de cuisine - 2:15',
      preview: '👨‍🍳',
      time: 'Today, 8:30 AM'
    }
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
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isPublic: Math.random() > 0.3,
      viewCount: Math.floor(Math.random() * 50) + 1,
      reactions: generateRandomReactions(),
      isViewed: Math.random() > 0.7 // 30% de chance d'être déjà vu
    };
    userStatuses.push(status);
  }

  return userStatuses;
}

function generateRandomReactions() {
  const possibleReactions = ['👍', '❤️', '😊', '😮', '😢', '🙏', '😂', '😍', '🤔', '👏'];
  const count = Math.floor(Math.random() * 4) + 1;
  const reactions = {};
  
  for (let i = 0; i < count; i++) {
    const reaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
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
    hasUnviewed: unviewedStatuses > 0
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
      { text: 'Sticker', type: 'sticker' }
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
      '~ 2 jours'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }

  const value = useMemo(() => ({
    // État
    ...state,
    
    // Actions
    setLoading: actions.setLoading,
    setUsers: actions.setUsers,
    setSelectedChat: actions.setSelectedChat,
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
    filteredUsers
  }), [
    state,
    actions,
    sendMessage,
    selectChat,
    addReactionToMessage,
    removeReactionFromMessage,
    deleteMessage,
    toggleMessageStar,
    toggleChatPin,
    filteredUsers,
    createTextMessage,
    createMediaMessage,
    createSystemMessage
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
