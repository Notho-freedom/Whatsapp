'use client';

import { useChatStore } from '../stores/chatStore';
import { useEffect } from 'react';

export const useChat = () => {
  const {
    conversations,
    selectedConversation,
    messages,
    unreadCounts,
    isLoading,
    isSending,
    error,
    createConversation,
    selectConversation,
    addMessage,
    updateMessageStatus,
    editMessage,
    deleteMessage,
    addReaction,
    addReply,
    markConversationAsRead,
    togglePinConversation,
    toggleArchiveConversation,
    toggleMuteConversation,
    searchMessages,
    loadMessageHistory,
    sendMessage,
    clearError,
    reset
  } = useChatStore();

  // Chargement automatique des conversations au montage du composant
  useEffect(() => {
    if (conversations.length === 0) {
      // Charger les conversations depuis le serveur
      loadConversations();
    }
  }, [conversations.length]);

  // Chargement automatique des messages pour la conversation sélectionnée
  useEffect(() => {
    if (selectedConversation && (!messages[selectedConversation] || messages[selectedConversation].length === 0)) {
      loadMessageHistory(selectedConversation);
    }
  }, [selectedConversation, messages]);

  // Fonction de chargement des conversations
  const loadConversations = async () => {
    try {
      // Cette fonction sera implémentée avec le service
      console.log('Chargement des conversations...');
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  };

  // Fonction de création de conversation simplifiée
  const handleCreateConversation = async (participants, type = 'individual', customName = null) => {
    try {
      const newConversation = createConversation(participants, type);
      return { success: true, conversation: newConversation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de sélection de conversation simplifiée
  const handleSelectConversation = (conversationId) => {
    selectConversation(conversationId);
    return { success: true };
  };

  // Fonction d'envoi de message simplifiée
  const handleSendMessage = async (conversationId, content, type = 'text', metadata = {}) => {
    try {
      const result = await sendMessage(conversationId, content, type, metadata);
      return { success: true, message: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction d'ajout de message simplifiée
  const handleAddMessage = (conversationId, message) => {
    try {
      const newMessage = addMessage(conversationId, message);
      return { success: true, message: newMessage };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de modification de message simplifiée
  const handleEditMessage = (conversationId, messageId, newContent) => {
    try {
      editMessage(conversationId, messageId, newContent);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de suppression de message simplifiée
  const handleDeleteMessage = (conversationId, messageId) => {
    try {
      deleteMessage(conversationId, messageId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction d'ajout de réaction simplifiée
  const handleAddReaction = (conversationId, messageId, reaction, userId) => {
    try {
      addReaction(conversationId, messageId, reaction, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de marquage comme lu simplifiée
  const handleMarkAsRead = (conversationId) => {
    try {
      markConversationAsRead(conversationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de recherche de messages simplifiée
  const handleSearchMessages = (query, conversationId = null) => {
    try {
      const results = searchMessages(query, conversationId);
      return { success: true, results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de gestion des conversations simplifiée
  const handleTogglePin = (conversationId) => {
    try {
      togglePinConversation(conversationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleToggleArchive = (conversationId) => {
    try {
      toggleArchiveConversation(conversationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleToggleMute = (conversationId) => {
    try {
      toggleMuteConversation(conversationId);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Utilitaires
  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === selectedConversation);
  };

  const getCurrentMessages = () => {
    return messages[selectedConversation] || [];
  };

  const getUnreadCount = (conversationId) => {
    return unreadCounts[conversationId] || 0;
  };

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  };

  const getPinnedConversations = () => {
    return conversations.filter(conv => conv.isPinned);
  };

  const getArchivedConversations = () => {
    return conversations.filter(conv => conv.isArchived);
  };

  const getActiveConversations = () => {
    return conversations.filter(conv => !conv.isArchived);
  };

  return {
    // État
    conversations,
    selectedConversation,
    messages,
    unreadCounts,
    isLoading,
    isSending,
    error,
    
    // Actions de conversation
    createConversation: handleCreateConversation,
    selectConversation: handleSelectConversation,
    togglePinConversation: handleTogglePin,
    toggleArchiveConversation: handleToggleArchive,
    toggleMuteConversation: handleToggleMute,
    markConversationAsRead: handleMarkAsRead,
    
    // Actions de messages
    addMessage: handleAddMessage,
    sendMessage: handleSendMessage,
    editMessage: handleEditMessage,
    deleteMessage: handleDeleteMessage,
    updateMessageStatus,
    addReaction: handleAddReaction,
    addReply,
    
    // Actions de recherche et chargement
    searchMessages: handleSearchMessages,
    loadMessageHistory,
    
    // Utilitaires
    getCurrentConversation,
    getCurrentMessages,
    getUnreadCount,
    getTotalUnreadCount,
    getPinnedConversations,
    getArchivedConversations,
    getActiveConversations,
    
    // Utilitaires
    clearError,
    reset
  };
};
