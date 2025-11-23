// AppContext.js
'use client';

import { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import cachedFirebaseService from '@/utils/cachedFirebaseService';
import { useAppReducer } from './AppReducerContext';

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
  const { state, actions } = useAppReducer();
  const [currentUserId, setCurrentUserId] = useState("default-user");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setCurrentUserId(JSON.parse(storedUser).id);
    }
  }, []);
  // Nouvelles fonctions pour gérer les statuts
  const getUserStatuses = useCallback((userId) => {
    return state.statuses.filter(status => status.userId === userId);
  }, [state.statuses]);

  const getUserStatusCircles = useCallback((userId) => {
    const statuses = getUserStatuses(userId);
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
  }, [getUserStatuses]);

  const markStatusAsViewed = useCallback((statusId) => {
    actions.markStatusViewed(statusId);
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
      !user.isContact && (
        user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        user.lastMessage?.text?.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    );
  }, [state.users, state.searchQuery]);

  // Contacts pour la liste des contacts
  const contacts = useMemo(() => {
    return state.users.filter(user => user.isContact);
  }, [state.users]);

  // Fonctions utilitaires pour les données initiales
  const getRandomStatus = useCallback(() => {
    const statuses = [
      'Online',
      'Last seen 2 minutes ago',
      'Last seen 1 hour ago',
      'Last seen today at 2:30 PM',
      'Last seen yesterday at 6:45 PM',
      'Last seen 2 days ago'
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }, []);

  const generateUserStatuses = useCallback((userId, userName) => {
    const statusTypes = [
      { type: 'image', content: 'Photo de vacances à la plage', preview: '🏖️', time: 'Just now' },
      { type: 'video', content: 'Vidéo de mon chat qui dort', preview: '🐱', time: 'Today, 2:28 PM' },
      { type: 'text', content: 'Super journée aujourd\'hui ! ☀️', preview: '☀️', time: '8 minutes ago' },
      { type: 'image', content: 'Nouveau restaurant testé hier soir', preview: '🍽️', time: 'Today, 1:15 PM' },
      { type: 'audio', content: 'Message vocal - 0:23', preview: '🎵', time: 'Today, 12:30 PM' },
      { type: 'text', content: 'En route pour le travail 🚗', preview: '🚗', time: 'Today, 11:45 AM' },
      { type: 'image', content: 'Mon nouveau bureau installé', preview: '💻', time: 'Today, 10:20 AM' },
      { type: 'text', content: 'Bon matin tout le monde ! 🌅', preview: '🌅', time: 'Today, 9:15 AM' },
      { type: 'video', content: 'Tutoriel de cuisine - 2:15', preview: '👨‍🍳', time: 'Today, 8:30 AM' }
    ];

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
        isViewed: Math.random() > 0.7
      };
      userStatuses.push(status);
    }

    return userStatuses;
  }, []);

  const generateRandomReactions = useCallback(() => {
    const possibleReactions = ['👍', '❤️', '😊', '😮', '😢', '🙏', '😂', '😍', '🤔', '👏'];
    const count = Math.floor(Math.random() * 4) + 1;
    const reactions = {};
    
    for (let i = 0; i < count; i++) {
      const reaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
      reactions[reaction] = Math.floor(Math.random() * 10) + 1;
    }
    
    return reactions;
  }, []);

  const generateStatusCircles = useCallback((statuses) => {
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
  }, []);

// AppContext.js - Ajouter ces fonctions
const createTemporaryConversation = useCallback((contact) => {
  const temporaryId = `temp-${Date.now()}`;
  
  const newChat = {
    id: temporaryId,
    name: contact.displayName || contact.name,
    avatar: contact.photos?.[0]?.url || contact.avatar,
    lastMessage: {
      text: 'Nouvelle conversation',
      type: 'text',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
    lastMessageTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isTyping: false,
    contact: contact,
    isNewConversation: true,
    isTemporary: true,
    participants: [currentUserId, contact.id]
  };

  actions.addUser(newChat);
  return newChat;
}, [actions, currentUserId]);

const convertTemporaryToPermanentConversation = useCallback(async (temporaryChatId, permanentChatData) => {
  // Mettre à jour le chat temporaire avec les données permanentes
  const updatedChat = {
    ...permanentChatData,
    isTemporary: false
  };

  actions.updateUser(temporaryChatId, updatedChat);
  
  // Si le chat sélectionné est celui qui a été mis à jour, mettre à jour la sélection
  if (state.selectedChat?.id === temporaryChatId) {
    actions.setSelectedChat(updatedChat);
  }
}, [actions, state.selectedChat]);

  // Charger les utilisateurs et conversations avec cache
  useEffect(() => {
    async function fetchUsersAndConversations() {
      try {
        actions.setLoading(true);
        actions.setError(null);
        
        // Charger les contacts depuis l'API externe
        const response = await fetch('https://randomuser.me/api/?results=20&nat=fr,us,gb,ca,au');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des utilisateurs');
        }
      
        // Transformer les données pour correspondre à notre structure
        const transformedContacts = data.results.map((user) => {
          const userName = Math.random() > 0.95 ? '+'+user.phone : `${user.name.first} ${user.name.last}`;
          const hasStatuses = Math.random() > 0.7;
          const userStatuses = hasStatuses ? generateUserStatuses(user.login.uuid, userName) : [];
          
          return {
            id: user.login.uuid,
            name: userName,
            avatar: user.picture.medium,
            status: getRandomStatus(),
            phone: user.phone,
            email: user.email,
            statuses: userStatuses,
            statusCircles: generateStatusCircles(userStatuses),
            isContact: true,
            isConversation: false
          };
        });

        // Charger les conversations depuis le service de cache
        const currentUserId = 'default-user';
        const conversations = await cachedFirebaseService.getConversations(currentUserId, 50, 0);
        
        // Transformer les conversations en utilisateurs pour la compatibilité
        const transformedConversations = conversations.map(conv => ({
          id: conv.id,
          name: conv.name || 'Conversation',
          avatar: conv.avatar || `https://ui-avatars.com/api/?name=${conv.name || 'C'}&background=6a7175&color=fff&size=40`,
          status: conv.status || 'en ligne',
          lastMessage: conv.last_message,
          lastMessageTime: conv.last_message_time,
          unreadCount: conv.unread_count || 0,
          isPinned: conv.is_pinned || false,
          isContact: false,
          isConversation: true
        }));

        // Combiner contacts et conversations
        const allUsers = [...transformedContacts, ...transformedConversations];
        actions.setUsers(allUsers);
        
        // Stocker tous les statuts dans le contexte
        const allStatuses = transformedContacts.flatMap(user => user.statuses);
        actions.setStatuses(allStatuses);

        // Précharger les données fréquemment utilisées
        await cachedFirebaseService.preloadData(currentUserId);
        
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs et conversations:', error);
        actions.setError(error.message);
      } finally {
        actions.setLoading(false);
      }
    }

    fetchUsersAndConversations();
  }, [actions, generateUserStatuses, generateStatusCircles, getRandomStatus]);

  const value = useMemo(() => ({
    // État
    ...state,
    
    // Actions de base
    setLoading: (isLoading) => actions.setLoading(isLoading),
    setError: (error) => actions.setError(error),
    setSearchQuery: (query) => actions.setSearchQuery(query),
    setSelectedChat: (chat) => actions.setSelectedChat(chat),
    setActiveTab: (tab) => actions.setActiveTab(tab),
    setReplyTo: (replyTo) => actions.setReplyTo(replyTo),
    clearReplyTo: () => actions.setReplyTo(null),
    updateChatLastMessage: (chatId, message) => actions.updateChatLastMessage(chatId, message),
    updateUser: (userId, userData) => actions.updateUser(userId, userData),
    addUser: (user) => actions.addUser(user),
    
    // Méthodes pour les statuts
    getCacheStats: () => cachedFirebaseService.getCacheStats(),
    getUserStatuses,
    getUserStatusCircles,
    markStatusAsViewed,
    addUserStatus,
    // Méthodes pour les conversations temporaires
    createTemporaryConversation,
    convertTemporaryToPermanentConversation,
    
    // Données calculées
    filteredUsers,
    contacts
  }), [
    state,
    actions,
    getUserStatuses,
    getUserStatusCircles,
    markStatusAsViewed,
    addUserStatus,
    filteredUsers,
    contacts
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}