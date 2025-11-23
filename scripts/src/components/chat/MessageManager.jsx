import React, { useCallback } from 'react';
import firebaseService from '@/utils/firebaseService';

export default function MessageManager() {
  // Ajouter un message
  const addMessage = useCallback(async (conversationId, messageData) => {
    return await firebaseService.addMessage(conversationId, messageData);
  }, []);

  // Supprimer un message
  const deleteMessage = useCallback(async (conversationId, messageId) => {
    return await firebaseService.deleteMessage(conversationId, messageId);
  }, []);

  // Mettre à jour un message
  const updateMessage = useCallback(async (conversationId, messageId, updates) => {
    return await firebaseService.updateMessage(conversationId, messageId, updates);
  }, []);

  // Récupérer les messages d'une conversation
  const getMessages = useCallback(async (conversationId, limit = 50, offset = 0) => {
    return await firebaseService.getMessages(conversationId, limit, offset);
  }, []);

  // Toutes les méthodes sont exposées
  return {
    addMessage,
    deleteMessage,
    updateMessage,
    getMessages,
  };
}