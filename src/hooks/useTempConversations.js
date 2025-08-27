"use client";

import { useEffect, useState } from 'react';
import { useAppContext } from '@/context';
import { API_ENDPOINTS } from '@/utils/config';

/**
 * Hook pour gérer les conversations temporaires
 * Charge les conversations temporaires depuis la base de données au démarrage
 */
export const useTempConversations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addUser } = useAppContext();

  /**
   * Charger les conversations temporaires depuis la base de données
   */
  const loadTempConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Chargement des conversations temporaires...');
      
                                                 const response = await fetch(`${API_ENDPOINTS.CONVERSATIONS}?is_temporary=true`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des conversations temporaires');
      }
      
      const data = await response.json();
      const tempConversations = data.conversations || [];
      
      // Transformer les conversations pour l'interface
      const transformedConversations = tempConversations.map(conv => ({
        id: conv.id,
        name: conv.name,
        avatar: conv.avatar,
        lastMessage: {
          text: 'Conversation temporaire',
          type: 'text',
          time: new Date(conv.updated_at).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        },
        lastMessageTime: new Date(conv.updated_at).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isTyping: false,
        contact: conv.contact,
        isNewConversation: false,
        isTemporary: true,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }));

      // Ajouter chaque conversation à la liste des chats
      transformedConversations.forEach(conversation => {
        addUser(conversation);
      });

      console.log(`✅ ${transformedConversations.length} conversations temporaires chargées`);
      
      return transformedConversations;
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conversations temporaires:', error);
      setError(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Nettoyer les anciennes conversations temporaires
   */
  const cleanupOldConversations = async () => {
    try {
                                                 const response = await fetch(`${API_ENDPOINTS.CONVERSATIONS}?is_temporary=true`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du nettoyage des conversations temporaires');
      }
      
      const data = await response.json();
      const deletedCount = data.deletedCount || 0;
      
      if (deletedCount > 0) {
        console.log(`🧹 ${deletedCount} anciennes conversations temporaires supprimées`);
      }
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des conversations temporaires:', error);
      return 0;
    }
  };

  /**
   * Convertir une conversation temporaire en permanente
   */
  const convertToPermanent = async (conversationId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_temporary: false })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la conversion de la conversation');
      }
      
      console.log(`✅ Conversation ${conversationId} convertie en permanente`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la conversion de la conversation:', error);
      return false;
    }
  };

  /**
   * Supprimer une conversation temporaire
   */
  const deleteTempConversation = async (conversationId) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.CONVERSATIONS}/${conversationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la conversation temporaire');
      }
      
      console.log(`🗑️ Conversation temporaire ${conversationId} supprimée`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la conversation temporaire:', error);
      return false;
    }
  };

  return {
    loadTempConversations,
    cleanupOldConversations,
    convertToPermanent,
    deleteTempConversation,
    isLoading,
    error
  };
};
