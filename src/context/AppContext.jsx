'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Types d'actions
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USERS: 'SET_USERS',
  SET_SELECTED_CHAT: 'SET_SELECTED_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_MESSAGES: 'SET_MESSAGES',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER_STATUS: 'UPDATE_USER_STATUS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB'
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
  activeTab: 'chats'
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
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, message]
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
    
    case ACTIONS.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    case ACTIONS.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload };
    
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

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setUsers: (users) => dispatch({ type: ACTIONS.SET_USERS, payload: users }),
    setSelectedChat: (chat) => dispatch({ type: ACTIONS.SET_SELECTED_CHAT, payload: chat }),
    addMessage: (chatId, message) => dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } }),
    setMessages: (messages) => dispatch({ type: ACTIONS.SET_MESSAGES, payload: messages }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    updateUserStatus: (userId, status) => dispatch({ type: ACTIONS.UPDATE_USER_STATUS, payload: { userId, status } }),
    setSearchQuery: (query) => dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query }),
    toggleSidebar: () => dispatch({ type: ACTIONS.TOGGLE_SIDEBAR }),
    setActiveTab: (tab) => dispatch({ type: ACTIONS.SET_ACTIVE_TAB, payload: tab })
  };

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
        const transformedUsers = data.results.map((user, index) => ({
          id: user.login.uuid,
          name: Math.random() > 0.95 ? '+'+user.phone : `${user.name.first} ${user.name.last}`,
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
        }));

        actions.setUsers(transformedUsers);
        
        // Générer des messages initiaux pour chaque utilisateur
        const initialMessages = {};
        transformedUsers.forEach(user => {
          initialMessages[user.id] = generateInitialMessages(user);
        });
        actions.setMessages(initialMessages);
        
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    }

    fetchUsers();
  }, []);

// Utility functions
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

function getRandomLastMessage() {
  const messages = [
    'reacted to your status',
    '~Beguel: Hey, how are you? long message to test the chat list',
    'Thank you very much!',
    'Perfect, see you tomorrow',
    'long message to test the chat list',
    'I agree',
    'Noted',
    'Great idea!',
    'See you soon!',
    'No problem'
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

  function generateInitialMessages(user) {
    const messages = [];
    const messageCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < messageCount; i++) {
      const isFromUser = Math.random() > 0.5;
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      messages.push({
        id: `${user.id}-${i}`,
        text: getRandomMessageText(),
        timestamp: timestamp.toISOString(),
        isFromUser,
        status: isFromUser ? (Math.random() > 0.3 ? 'read' : 'sent') : null
      });
    }
    
    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  function getRandomMessageText() {
    const texts = [
      'Salut !',
      'Comment ça va ?',
      'Ça va bien, merci !',
      'Tu fais quoi ?',
      'Pas grand chose',
      'Ok, à plus tard !',
      'Merci beaucoup !',
      'Parfait',
      'Super !',
      'D\'accord',
      'Pas de problème',
      'À bientôt !',
      'C\'est noté',
      'Je suis d\'accord',
      'Tu as raison',
      'Exactement',
      'Bien sûr',
      'Évidemment',
      'C\'est ça',
      'Parfaitement'
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  // Méthodes métier
  const sendMessage = async (chatId, text) => {
    if (!text.trim()) return;

    const message = {
      id: `${chatId}-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isFromUser: true,
      status: 'sent'
    };

    actions.addMessage(chatId, message);

    // Simuler une réponse après un délai
    setTimeout(() => {
      const reply = {
        id: `${chatId}-reply-${Date.now()}`,
        text: getRandomMessageText(),
        timestamp: new Date().toISOString(),
        isFromUser: false,
        status: null
      };
      actions.addMessage(chatId, reply);
    }, 1000 + Math.random() * 2000);
  };

  const selectChat = (chat) => {
    actions.setSelectedChat(chat);
  };

  const filteredUsers = state.users.filter(user =>
    user.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const value = {
    ...state,
    ...actions,
    sendMessage,
    selectChat,
    filteredUsers
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
