// Service de gestion des conversations et messages
class ChatService {
  constructor() {
    this.baseURL = '/api';
  }

  // Gestion des conversations
  async getConversations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.archived) params.append('archived', 'true');
    if (filters.pinned) params.append('pinned', 'true');
    
    const response = await fetch(`${this.baseURL}/conversations?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération des conversations');
    }

    return response.json();
  }

  async getConversation(conversationId) {
    const response = await fetch(`${this.baseURL}/conversations/${conversationId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération de la conversation');
    }

    return response.json();
  }

  async createConversation(participants, type = 'individual', customName = null) {
    const response = await fetch(`${this.baseURL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participants, type, customName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de la conversation');
    }

    return response.json();
  }

  async updateConversation(conversationId, updates) {
    const response = await fetch(`${this.baseURL}/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour de la conversation');
    }

    return response.json();
  }

  async deleteConversation(conversationId) {
    const response = await fetch(`${this.baseURL}/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression de la conversation');
    }

    return response.json();
  }

  // Gestion des messages
  async getMessages(conversationId, limit = 50, offset = 0) {
    const response = await fetch(
      `${this.baseURL}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération des messages');
    }

    return response.json();
  }

  async sendMessage(conversationId, content, type = 'text', metadata = {}) {
    const messageData = {
      content,
      type,
      sender: this.getCurrentUser(),
      metadata
    };

    const response = await fetch(`${this.baseURL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'envoi du message');
    }

    return response.json();
  }

  async getMessage(conversationId, messageId) {
    const response = await fetch(
      `${this.baseURL}/conversations/${conversationId}/messages/${messageId}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération du message');
    }

    return response.json();
  }

  async updateMessage(conversationId, messageId, updates) {
    const response = await fetch(
      `${this.baseURL}/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du message');
    }

    return response.json();
  }

  async deleteMessage(conversationId, messageId) {
    const response = await fetch(
      `${this.baseURL}/conversations/${conversationId}/messages/${messageId}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression du message');
    }

    return response.json();
  }

  // Utilitaires
  getCurrentUser() {
    // Cette fonction sera remplacée par l'intégration avec le store d'auth
    return { id: 'current_user', name: 'Utilisateur actuel' };
  }

  // Validation des données de message
  validateMessage(messageData) {
    const errors = [];

    if (!messageData.content || messageData.content.trim().length === 0) {
      errors.push('Le contenu du message est requis');
    }

    if (!messageData.sender || !messageData.sender.id) {
      errors.push('L\'expéditeur est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validation des données de conversation
  validateConversation(conversationData) {
    const errors = [];

    if (!conversationData.participants || !Array.isArray(conversationData.participants)) {
      errors.push('Les participants sont requis');
    }

    if (conversationData.participants && conversationData.participants.length === 0) {
      errors.push('Au moins un participant est requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Génération d'ID unique
  generateId(prefix = 'item') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Formatage des données de message
  formatMessage(messageData) {
    return {
      id: messageData.id || this.generateId('msg'),
      content: messageData.content || '',
      type: messageData.type || 'text',
      sender: messageData.sender || this.getCurrentUser(),
      timestamp: messageData.timestamp || new Date().toISOString(),
      status: messageData.status || 'sent',
      isEdited: messageData.isEdited || false,
      reactions: messageData.reactions || [],
      replies: messageData.replies || [],
      metadata: messageData.metadata || {}
    };
  }

  // Formatage des données de conversation
  formatConversation(conversationData) {
    return {
      id: conversationData.id || this.generateId('conv'),
      participants: conversationData.participants || [],
      type: conversationData.type || 'individual',
      createdAt: conversationData.createdAt || new Date().toISOString(),
      lastMessage: conversationData.lastMessage || null,
      unreadCount: conversationData.unreadCount || 0,
      isPinned: conversationData.isPinned || false,
      isArchived: conversationData.isArchived || false,
      isMuted: conversationData.isMuted || false,
      theme: conversationData.theme || 'default',
      customName: conversationData.customName || null
    };
  }

  // Recherche dans les messages
  searchMessages(messages, query) {
    if (!query) return messages;
    
    return messages.filter(message =>
      message.content?.toLowerCase().includes(query.toLowerCase()) ||
      message.sender?.name?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filtrage des conversations
  filterConversations(conversations, filters = {}) {
    let filtered = conversations;

    if (filters.archived !== undefined) {
      filtered = filtered.filter(conv => conv.isArchived === filters.archived);
    }

    if (filters.pinned !== undefined) {
      filtered = filtered.filter(conv => conv.isPinned === filters.pinned);
    }

    if (filters.muted !== undefined) {
      filtered = filtered.filter(conv => conv.isMuted === filters.muted);
    }

    if (filters.type) {
      filtered = filtered.filter(conv => conv.type === filters.type);
    }

    return filtered;
  }
}

// Instance singleton du service
export const chatService = new ChatService();
export default chatService;
