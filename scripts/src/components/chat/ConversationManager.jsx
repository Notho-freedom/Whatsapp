import React, { useCallback } from 'react';
import firebaseService from '@/utils/firebaseService';

export default function ConversationManager({ currentUser }) {
  // Créer une conversation
  const createConversation = useCallback(async (data) => {
    return await firebaseService.createConversation({
      ...data,
      created_by: currentUser.id,
    });
  }, [currentUser]);

  // Supprimer une conversation
  const deleteConversation = useCallback(async (conversationId) => {
    return await firebaseService.deleteTempConversation(conversationId);
  }, []);

  // Récupérer les conversations de l'utilisateur
  const getUserConversations = useCallback(async () => {
    return await firebaseService.getConversationsByUserId(currentUser.id);
  }, [currentUser]);

  // Rechercher des conversations
  const searchConversations = useCallback(async (query) => {
    return await firebaseService.searchConversations(currentUser.id, query);
  }, [currentUser]);

  // Ajouter un participant
  const addParticipant = useCallback(async (conversationId, userId, data = {}) => {
    return await firebaseService.addParticipant(conversationId, userId, data);
  }, []);

  // Récupérer les participants
  const getParticipants = useCallback(async (conversationId) => {
    return await firebaseService.getParticipants(conversationId);
  }, []);

  // Récupérer les stats
  const getStats = useCallback(async () => {
    return await firebaseService.getConversationStats(currentUser.id);
  }, [currentUser]);

  // Récupérer les conversations temporaires
  const getTempConversations = useCallback(async () => {
    return await firebaseService.getTempConversations();
  }, []);

  // Nettoyer les conversations temporaires
  const cleanupOldTempConversations = useCallback(async () => {
    return await firebaseService.cleanupOldTempConversations();
  }, []);

  // Toutes les méthodes sont exposées
  return {
    createConversation,
    deleteConversation,
    getUserConversations,
    searchConversations,
    addParticipant,
    getParticipants,
    getStats,
    getTempConversations,
    cleanupOldTempConversations,
  };
}