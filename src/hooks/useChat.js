"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { auth } from '@/config/firebase';
import firebaseService from '@/utils/firebaseService';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesByConv, setMessagesByConv] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = auth?.currentUser?.uid || null;

  const loadConversations = useCallback(async () => {
    if (!currentUserId) return [];
    setIsLoading(true);
    setError(null);
    try {
      const convs = await firebaseService.getConversationsByUserId(currentUserId, 50, 0);
      setConversations(convs);
      setIsLoading(false);
      return convs;
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return [];
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadMessageHistory = useCallback(async (conversationId, limit = 50, offset = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      const msgs = await firebaseService.getMessages(conversationId, limit, offset);
      setMessagesByConv(prev => ({ ...prev, [conversationId]: msgs }));
      setIsLoading(false);
      return msgs;
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return [];
    }
  }, []);

  const createConversation = useCallback(async (data) => {
    try {
      const conv = await firebaseService.createConversation({ ...data, created_by: currentUserId });
      setConversations(prev => [conv, ...prev]);
      return { success: true, conversation: conv };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [currentUserId]);

  const selectConversation = useCallback((conversationId) => {
    setSelectedConversation(conversationId);
    return { success: true };
  }, []);

  const sendMessage = useCallback(async (conversationId, content, type = 'text', metadata = {}) => {
    setIsSending(true);
    setError(null);
    try {
      const messageData = {
        sender_id: currentUserId,
        message_type: type,
        content,
        metadata
      };
      const sent = await firebaseService.addMessage(conversationId, messageData);
      setMessagesByConv(prev => ({
        ...prev,
        [conversationId]: [sent, ...(prev[conversationId] || [])]
      }));
      setIsSending(false);
      return sent;
    } catch (e) {
      setIsSending(false);
      setError(e.message);
      throw e;
    }
  }, [currentUserId]);

  const deleteMessage = useCallback(async (conversationId, messageId) => {
    try {
      await firebaseService.deleteMessage(conversationId, messageId);
      setMessagesByConv(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).filter(m => m.id !== messageId)
      }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const value = useMemo(() => ({
    conversations,
    selectedConversation,
    messages: messagesByConv,
    isLoading,
    isSending,
    error
  }), [conversations, selectedConversation, messagesByConv, isLoading, isSending, error]);

  return {
    ...value,
    loadConversations,
    loadMessageHistory,
    createConversation,
    selectConversation,
    sendMessage,
    deleteMessage
  };
};
