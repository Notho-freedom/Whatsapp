'use client';

// AppReducerContext.js
import React, { useReducer, useMemo } from 'react';

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
      const { chatId: setMessagesChatId, messages: messagesToSet } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [setMessagesChatId]: messagesToSet
        }
      };
    
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
    
    case ACTIONS.ADD_USER:
      return {
        ...state,
        users: [action.payload, ...state.users]
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
export const AppReducerContext = React.createContext();

export function useAppReducer() {
  return React.useContext(AppReducerContext);
}

export function AppReducerProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions optimisées avec useMemo
  const actions = useMemo(() => ({
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setUsers: (users) => dispatch({ type: ACTIONS.SET_USERS, payload: users }),
    setSelectedChat: (chat) => dispatch({ type: ACTIONS.SET_SELECTED_CHAT, payload: chat }),
    addMessage: (chatId, message) => dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } }),
    updateMessage: (chatId, messageId, updates) => dispatch({ type: ACTIONS.UPDATE_MESSAGE, payload: { chatId, messageId, updates } }),
    deleteMessage: (chatId, messageId) => dispatch({ type: ACTIONS.DELETE_MESSAGE, payload: { chatId, messageId } }),
    setMessages: (chatId, messages) => dispatch({ type: ACTIONS.SET_MESSAGES, payload: { chatId, messages } }),
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
    addUser: (user) => dispatch({ type: ACTIONS.ADD_USER, payload: user }),
    // Actions pour les statuts
    setStatuses: (statuses) => dispatch({ type: ACTIONS.SET_STATUSES, payload: statuses }),
    addStatus: (status) => dispatch({ type: ACTIONS.ADD_STATUS, payload: status }),
    updateStatus: (id, updates) => dispatch({ type: ACTIONS.UPDATE_STATUS, payload: { id, updates } }),
    deleteStatus: (id) => dispatch({ type: ACTIONS.DELETE_STATUS, payload: id }),
    markStatusViewed: (id) => dispatch({ type: ACTIONS.MARK_STATUS_VIEWED, payload: id })
  }), []);

  const value = useMemo(() => ({
    state,
    actions
  }), [state, actions]);

  return (
    <AppReducerContext.Provider value={value}>
      {children}
    </AppReducerContext.Provider>
  );
}