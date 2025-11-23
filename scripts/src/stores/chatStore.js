import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const createChatSlice = (set, get) => ({
  // État des conversations
  conversations: [],
  selectedConversation: null,
  
  // État des messages
  messages: {},
  unreadCounts: {},
  
  // État de chargement
  isLoading: false,
  isSending: false,
  error: null,
  
  // Actions de conversation
  createConversation: (participants, type = 'individual') => {
    const newConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants,
      type, // 'individual' ou 'group'
      createdAt: new Date().toISOString(),
      lastMessage: null,
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      theme: 'default',
      customName: null
    };
    
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      messages: {
        ...state.messages,
        [newConversation.id]: []
      },
      unreadCounts: {
        ...state.unreadCounts,
        [newConversation.id]: 0
      }
    }));
    
    return newConversation;
  },
  
  // Sélectionner une conversation
  selectConversation: (conversationId) => {
    set({ selectedConversation: conversationId });
    
    // Marquer les messages comme lus
    if (conversationId) {
      get().markConversationAsRead(conversationId);
    }
  },
  
  // Ajouter un message
  addMessage: (conversationId, message) => {
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...message,
      timestamp: new Date().toISOString(),
      status: 'sent', // 'sent', 'delivered', 'read', 'failed'
      isEdited: false,
      reactions: [],
      replies: []
    };
    
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          newMessage
        ]
      },
      conversations: state.conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: newMessage }
          : conv
      )
    }));
    
    return newMessage;
  },
  
  // Mettre à jour le statut d'un message
  updateMessageStatus: (conversationId, messageId, status) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        ) || []
      }
    }));
  },
  
  // Éditer un message
  editMessage: (conversationId, messageId, newContent) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map(msg =>
          msg.id === messageId 
            ? { ...msg, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
            : msg
        ) || []
      }
    }));
  },
  
  // Supprimer un message
  deleteMessage: (conversationId, messageId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.filter(msg =>
          msg.id !== messageId
        ) || []
      }
    }));
  },
  
  // Ajouter une réaction à un message
  addReaction: (conversationId, messageId, reaction, userId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map(msg =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: [
                  ...msg.reactions.filter(r => !(r.userId === userId && r.type === reaction)),
                  { userId, type: reaction, timestamp: new Date().toISOString() }
                ]
              }
            : msg
        ) || []
      }
    }));
  },
  
  // Répondre à un message
  addReply: (conversationId, messageId, replyMessage) => {
    const newReply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...replyMessage,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };
    
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map(msg =>
          msg.id === messageId
            ? { ...msg, replies: [...(msg.replies || []), newReply] }
            : msg
        ) || []
      }
    }));
    
    return newReply;
  },
  
  // Marquer une conversation comme lue
  markConversationAsRead: (conversationId) => {
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: 0
      },
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    }));
  },
  
  // Épingler/épingler une conversation
  togglePinConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, isPinned: !conv.isPinned }
          : conv
      )
    }));
  },
  
  // Archiver/désarchiver une conversation
  toggleArchiveConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, isArchived: !conv.isArchived }
          : conv
      )
    }));
  },
  
  // Muter/démuter une conversation
  toggleMuteConversation: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, isMuted: !conv.isMuted }
          : conv
      )
    }));
  },
  
  // Rechercher dans les messages
  searchMessages: (query, conversationId = null) => {
    const { messages } = get();
    const searchResults = [];
    
    const conversationsToSearch = conversationId 
      ? [conversationId] 
      : Object.keys(messages);
    
    conversationsToSearch.forEach(convId => {
      const convMessages = messages[convId] || [];
      const results = convMessages.filter(msg =>
        msg.content?.toLowerCase().includes(query.toLowerCase()) ||
        msg.sender?.name?.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length > 0) {
        searchResults.push({
          conversationId: convId,
          messages: results
        });
      }
    });
    
    return searchResults;
  },
  
  // Charger l'historique des messages
  loadMessageHistory: async (conversationId, limit = 50, offset = 0) => {
    set({ isLoading: true });
    
    try {
      // Simulation d'une API de chargement
      // Plus tard, remplacez par votre vraie API
      const response = await fetch(`/api/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error('Échec du chargement des messages');
      }
      
      const data = await response.json();
      
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(data.messages || []),
            ...(state.messages[conversationId] || [])
          ]
        },
        isLoading: false
      }));
      
      return data.messages;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Envoyer un message
  sendMessage: async (conversationId, content, type = 'text', metadata = {}) => {
    set({ isSending: true });
    
    try {
      const message = {
        content,
        type,
        sender: get().getCurrentUser(),
        metadata,
        conversationId
      };
      
      // Ajouter le message localement d'abord
      const newMessage = get().addMessage(conversationId, message);
      
      // Envoyer au serveur
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        throw new Error('Échec de l\'envoi du message');
      }
      
      const serverMessage = await response.json();
      
      // Mettre à jour avec l'ID du serveur
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(msg =>
            msg.id === newMessage.id
              ? { ...msg, id: serverMessage.id, status: 'delivered' }
              : msg
          ) || []
        },
        isSending: false
      }));
      
      return serverMessage;
    } catch (error) {
      set({ isSending: false, error: error.message });
      
      // Marquer le message comme échoué
      get().updateMessageStatus(conversationId, message.id, 'failed');
      
      throw error;
    }
  },
  
  // Obtenir l'utilisateur actuel (à implémenter avec le store d'auth)
  getCurrentUser: () => {
    // Cette fonction sera remplacée par l'intégration avec le store d'auth
    return { id: 'current_user', name: 'Utilisateur actuel' };
  },
  
  // Réinitialiser l'erreur
  clearError: () => set({ error: null }),
  
  // Réinitialiser l'état
  reset: () => set({
    conversations: [],
    selectedConversation: null,
    messages: {},
    unreadCounts: {},
    isLoading: false,
    isSending: false,
    error: null
  })
});

// Store de chat avec persistance
export const useChatStore = create(
  persist(
    createChatSlice,
    {
      name: 'whatsapp-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
        unreadCounts: state.unreadCounts
      }),
      // Fonction de migration pour gérer les changements de structure
      migrate: (persistedState, version) => {
        if (persistedState) {
          console.log('🔄 Migration de l\'état de chat...');
          return {
            conversations: persistedState.conversations || [],
            messages: persistedState.messages || {},
            unreadCounts: persistedState.unreadCounts || {}
          };
        }
        return persistedState;
      },
      version: 1 // Version pour la migration
    }
  )
);
