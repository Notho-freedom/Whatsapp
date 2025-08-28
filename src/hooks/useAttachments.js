"use client";

import { useState, useCallback } from 'react';
import attachmentService from '@/utils/attachmentService';

export const useAttachments = (conversationId, userId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attachments, setAttachments] = useState({});

  // Récupérer les attachements de la conversation
  const refreshAttachments = useCallback(async (filters = {}) => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await attachmentService.getConversationAttachments(conversationId, filters);
      setAttachments(results);
      return results;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération des attachements:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Gérer une action d'attachement
  const handleAttachmentAction = useCallback(async (action, data) => {
    if (!conversationId || !userId) {
      setError('Conversation ou utilisateur non défini');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await attachmentService.handleAttachmentAction(
        action,
        data,
        conversationId,
        userId
      );

      // Mettre à jour l'état local si nécessaire
      if (result.success) {
        await refreshAttachments();
      }

      return result;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du traitement de l\'attachement:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, userId, refreshAttachments]);

  // Sélectionner des médias
  const selectMedia = useCallback(async (files) => {
    return await handleAttachmentAction('select-media', files);
  }, [handleAttachmentAction]);

  // Capturer une photo
  const capturePhoto = useCallback(async (imageBlob, metadata = {}) => {
    return await handleAttachmentAction('open-camera', {
      type: 'photo',
      blob: imageBlob,
      metadata
    });
  }, [handleAttachmentAction]);

  // Enregistrer une vidéo
  const recordVideo = useCallback(async (videoBlob, metadata = {}) => {
    return await handleAttachmentAction('open-camera', {
      type: 'video',
      blob: videoBlob,
      metadata
    });
  }, [handleAttachmentAction]);

  // Sélectionner des documents
  const selectDocuments = useCallback(async (files) => {
    return await handleAttachmentAction('select-document', files);
  }, [handleAttachmentAction]);

  // Partager un contact
  const shareContact = useCallback(async (contactData) => {
    return await handleAttachmentAction('select-contact', contactData);
  }, [handleAttachmentAction]);

  // Créer un sondage
  const createPoll = useCallback(async (pollData) => {
    return await handleAttachmentAction('create-poll', pollData);
  }, [handleAttachmentAction]);

  // Créer un dessin
  const createDrawing = useCallback(async (drawingData) => {
    return await handleAttachmentAction('open-drawing', drawingData);
  }, [handleAttachmentAction]);

  // Rechercher dans les attachements
  const searchAttachments = useCallback(async (query, limit = 20) => {
    if (!query.trim()) return {};

    setIsLoading(true);
    setError(null);

    try {
      const results = await attachmentService.searchAttachments(query, conversationId, limit);
      return results;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la recherche d\'attachements:', err);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Récupérer les statistiques des attachements
  const getAttachmentStats = useCallback(async () => {
    if (!conversationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const stats = await attachmentService.getAttachmentStats(conversationId);
      return stats;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la récupération des statistiques:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Vérifier les permissions pour un type d'attachement
  const checkPermissions = useCallback(async (attachmentType) => {
    if (!conversationId || !userId) {
      return { allowed: false, reason: 'Conversation ou utilisateur non défini' };
    }

    try {
      const permissions = await attachmentService.checkAttachmentPermissions(
        userId,
        conversationId,
        attachmentType
      );
      return permissions;
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      return { allowed: false, reason: 'Erreur de vérification' };
    }
  }, [conversationId, userId]);

  // Nettoyer les anciens attachements
  const cleanupOldAttachments = useCallback(async (daysOld = 30) => {
    if (!conversationId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const results = await attachmentService.cleanupOldAttachments(daysOld, conversationId);
      
      // Rafraîchir les attachements après le nettoyage
      await refreshAttachments();
      
      return results;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du nettoyage des attachements:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, refreshAttachments]);

  // Supprimer un attachement spécifique
  const deleteAttachment = useCallback(async (attachmentType, attachmentId) => {
    if (!conversationId || !userId) {
      setError('Conversation ou utilisateur non défini');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      let success = false;

      switch (attachmentType) {
        case 'media':
          success = await attachmentService.services.camera.deleteMedia(attachmentId, userId);
          break;
        case 'document':
          success = await attachmentService.services.document.deleteDocument(attachmentId, userId);
          break;
        case 'drawing':
          success = await attachmentService.services.drawing.deleteDrawing(attachmentId, userId);
          break;
        case 'poll':
          success = await attachmentService.services.poll.deletePoll(attachmentId, userId);
          break;
        case 'contact':
          success = await attachmentService.services.contact.deleteSharedContact(attachmentId, userId);
          break;
        default:
          throw new Error('Type d\'attachement non supporté');
      }

      if (success) {
        // Rafraîchir les attachements après la suppression
        await refreshAttachments();
      }

      return success;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de la suppression de l\'attachement:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, userId, refreshAttachments]);

  // Voter pour une option de sondage
  const voteForPoll = useCallback(async (pollId, optionId) => {
    if (!userId) {
      setError('Utilisateur non défini');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await attachmentService.services.poll.voteForOption(pollId, optionId, userId);
      
      if (success) {
        // Rafraîchir les attachements pour mettre à jour les statistiques
        await refreshAttachments();
      }

      return success;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du vote:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshAttachments]);

  // Accepter un contact partagé
  const acceptSharedContact = useCallback(async (sharedContactId) => {
    if (!userId) {
      setError('Utilisateur non défini');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await attachmentService.services.contact.acceptSharedContact(sharedContactId, userId);
      
      if (success) {
        // Rafraîchir les attachements
        await refreshAttachments();
      }

      return success;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors de l\'acceptation du contact:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshAttachments]);

  // Refuser un contact partagé
  const declineSharedContact = useCallback(async (sharedContactId) => {
    if (!userId) {
      setError('Utilisateur non défini');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await attachmentService.services.contact.declineSharedContact(sharedContactId, userId);
      
      if (success) {
        // Rafraîchir les attachements
        await refreshAttachments();
      }

      return success;
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du refus du contact:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshAttachments]);

  // Réinitialiser l'état d'erreur
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // État
    isLoading,
    error,
    attachments,

    // Actions principales
    handleAttachmentAction,
    selectMedia,
    capturePhoto,
    recordVideo,
    selectDocuments,
    shareContact,
    createPoll,
    createDrawing,

    // Gestion des attachements
    refreshAttachments,
    searchAttachments,
    getAttachmentStats,
    checkPermissions,
    cleanupOldAttachments,
    deleteAttachment,

    // Actions spécifiques
    voteForPoll,
    acceptSharedContact,
    declineSharedContact,

    // Utilitaires
    clearError
  };
};
