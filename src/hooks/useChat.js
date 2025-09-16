'use client';

import { useEffect, useState, useCallback } from 'react';
import firebaseService from '../utils/firebaseService';
import { getAuth } from 'firebase/auth';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  // Chargement automatique des conversations au montage du composant
  useEffect(() => {
    if (conversations.length === 0) {
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
      setIsLoading(true);
      const uid = getAuth().currentUser?.uid;
      if (!uid) return [];
      const list = await firebaseService.getConversations(uid, 50, 0);
      setConversations(list);
      return list;
    } catch (e) {
      setError(e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de création de conversation simplifiée
  const handleCreateConversation = async (participants, type = 'individual', customName = null) => {
    try {
      const created_by = getAuth().currentUser?.uid;
      const conv = await firebaseService.createConversation({ type, name: customName || '', created_by, custom_settings: { participants } });
      setConversations((prev) => [conv, ...prev]);
      return { success: true, conversation: conv };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de sélection de conversation simplifiée
  const handleSelectConversation = (conversationId) => {
    setSelectedConversation(conversationId);
    return { success: true };
  };

  // Fonction d'envoi de message simplifiée
  const handleSendMessage = async (conversationId, content, type = 'text', metadata = {}) => {
    try {
      setIsSending(true);
      const sender = getAuth().currentUser?.uid || 'unknown';
      const result = await firebaseService.addMessage(conversationId, { text: content, sender, type, metadata });
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [result, ...(prev[conversationId] || [])]
      }));
      return { success: true, message: result };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setIsSending(false);
    }
  };

  // Fonction d'ajout de message simplifiée
  const handleAddMessage = (conversationId, message) => {
    try {
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [message, ...(prev[conversationId] || [])]
      }));
      return { success: true, message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de modification de message simplifiée
  const handleEditMessage = async (conversationId, messageId, newContent) => {
    try {
      await firebaseService.updateMessage(conversationId, messageId, { text: newContent });
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(m => m.id === messageId ? { ...m, text: newContent } : m)
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de suppression de message simplifiée
  const handleDeleteMessage = async (conversationId, messageId) => {
    try {
      await firebaseService.deleteMessage(conversationId, messageId);
      setMessages((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(m => m.id !== messageId)
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction d'ajout de réaction simplifiée
  const handleAddReaction = async (conversationId, messageId, reaction, userId) => {
    try {
      await firebaseService.updateMessage(conversationId, messageId, { reactions: [{ reaction, userId, at: new Date() }] });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de marquage comme lu simplifiée
  const handleMarkAsRead = (conversationId) => {
    try {
      setUnreadCounts((prev) => ({ ...prev, [conversationId]: 0 }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de recherche de messages simplifiée
  const handleSearchMessages = (q, conversationId = null) => {
    try {
      const term = (q || '').toLowerCase();
      const pool = conversationId ? { [conversationId]: messages[conversationId] || [] } : messages;
      const results = Object.entries(pool).flatMap(([cid, msgs]) =>
        (msgs || []).filter(m => (m.text || '').toLowerCase().includes(term)).map(m => ({ ...m, conversation_id: cid }))
      );
      return { success: true, results };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de gestion des conversations simplifiée
  const handleTogglePin = async (conversationId) => {
    try {
      await firebaseService.updateMessage(conversationId, '__noop__', {});
      setConversations((prev) => prev.map(c => c.id === conversationId ? { ...c, is_pinned: !c.is_pinned } : c));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const handleToggleArchive = async (conversationId) => {
    try {
      setConversations((prev) => prev.map(c => c.id === conversationId ? { ...c, is_archived: !c.is_archived } : c));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const handleToggleMute = async (conversationId) => {
    try {
      setConversations((prev) => prev.map(c => c.id === conversationId ? { ...c, is_muted: !c.is_muted } : c));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
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
    return conversations.filter(conv => conv.isPinned || conv.is_pinned);
  };

  const getArchivedConversations = () => {
    return conversations.filter(conv => conv.isArchived || conv.is_archived);
  };

  const getActiveConversations = () => {
    return conversations.filter(conv => !(conv.isArchived || conv.is_archived));
  };

  const loadMessageHistory = useCallback(async (conversationId) => {
    const list = await firebaseService.getMessages(conversationId, 50, 0);
    setMessages((prev) => ({ ...prev, [conversationId]: list }));
    return list;
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setConversations([]);
    setSelectedConversation(null);
    setMessages({});
    setUnreadCounts({});
    setError(null);
  }, []);

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
    updateMessageStatus: async () => {},
    addReaction: handleAddReaction,
    addReply: async () => {},
    
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
