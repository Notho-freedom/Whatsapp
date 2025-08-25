// Service de gestion des notifications
class NotificationService {
  constructor() {
    this.baseURL = '/api';
  }

  // Gestion des notifications
  async getNotifications(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.unread) params.append('unread', 'true');
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const response = await fetch(`${this.baseURL}/notifications?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération des notifications');
    }

    return response.json();
  }

  async getNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération de la notification');
    }

    return response.json();
  }

  async createNotification(notificationData) {
    const response = await fetch(`${this.baseURL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de la notification');
    }

    return response.json();
  }

  async updateNotification(notificationId, updates) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour de la notification');
    }

    return response.json();
  }

  async deleteNotification(notificationId) {
    const response = await fetch(`${this.baseURL}/notifications/${notificationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la suppression de la notification');
    }

    return response.json();
  }

  // Gestion des paramètres
  async getSettings() {
    const response = await fetch(`${this.baseURL}/notifications/settings`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération des paramètres');
    }

    return response.json();
  }

  async updateSettings(updates) {
    const response = await fetch(`${this.baseURL}/notifications/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour des paramètres');
    }

    return response.json();
  }

  async updateSettingsPartial(updates) {
    const response = await fetch(`${this.baseURL}/notifications/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour des paramètres');
    }

    return response.json();
  }

  // Synchronisation
  async syncNotifications() {
    const response = await fetch(`${this.baseURL}/notifications/sync`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la synchronisation');
    }

    return response.json();
  }

  // Utilitaires
  // Validation des données de notification
  validateNotification(notificationData) {
    const errors = [];

    if (!notificationData.title || notificationData.title.trim().length === 0) {
      errors.push('Le titre est requis');
    }

    if (notificationData.priority && !['low', 'normal', 'high', 'urgent'].includes(notificationData.priority)) {
      errors.push('La priorité doit être low, normal, high ou urgent');
    }

    if (notificationData.category && !['messages', 'calls', 'status', 'media', 'system'].includes(notificationData.category)) {
      errors.push('La catégorie doit être messages, calls, status, media ou system');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validation des paramètres
  validateSettings(settingsData) {
    const errors = [];

    if (settingsData.quietHours && settingsData.quietHours.enabled) {
      if (!settingsData.quietHours.start || !settingsData.quietHours.end) {
        errors.push('Les heures de début et de fin sont requises pour les heures silencieuses');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Génération d'ID unique
  generateId(prefix = 'notif') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Formatage des données de notification
  formatNotification(notificationData) {
    return {
      id: notificationData.id || this.generateId(),
      title: notificationData.title || '',
      content: notificationData.content || '',
      category: notificationData.category || 'system',
      priority: notificationData.priority || 'normal',
      timestamp: notificationData.timestamp || new Date().toISOString(),
      isRead: notificationData.isRead || false,
      isDismissed: notificationData.isDismissed || false,
      icon: notificationData.icon || '/favicon.ico',
      actions: notificationData.actions || [],
      metadata: notificationData.metadata || {}
    };
  }

  // Formatage des paramètres
  formatSettings(settingsData) {
    return {
      enabled: settingsData.enabled !== undefined ? settingsData.enabled : true,
      sound: settingsData.sound !== undefined ? settingsData.sound : true,
      vibration: settingsData.vibration !== undefined ? settingsData.vibration : true,
      showPreview: settingsData.showPreview !== undefined ? settingsData.showPreview : true,
      showSenderName: settingsData.showSenderName !== undefined ? settingsData.showSenderName : true,
      showMessageContent: settingsData.showMessageContent !== undefined ? settingsData.showMessageContent : true,
      quietHours: {
        enabled: settingsData.quietHours?.enabled || false,
        start: settingsData.quietHours?.start || '22:00',
        end: settingsData.quietHours?.end || '08:00'
      },
      desktopNotifications: settingsData.desktopNotifications !== undefined ? settingsData.desktopNotifications : true,
      mobileNotifications: settingsData.mobileNotifications !== undefined ? settingsData.mobileNotifications : true,
      emailNotifications: settingsData.emailNotifications !== undefined ? settingsData.emailNotifications : false,
      categories: {
        messages: settingsData.categories?.messages !== undefined ? settingsData.categories.messages : true,
        calls: settingsData.categories?.calls !== undefined ? settingsData.categories.calls : true,
        status: settingsData.categories?.status !== undefined ? settingsData.categories.status : true,
        media: settingsData.categories?.media !== undefined ? settingsData.categories.media : true,
        system: settingsData.categories?.system !== undefined ? settingsData.categories.system : true
      }
    };
  }

  // Recherche dans les notifications
  searchNotifications(notifications, query) {
    if (!query) return notifications;
    
    return notifications.filter(notification =>
      notification.title?.toLowerCase().includes(query.toLowerCase()) ||
      notification.content?.toLowerCase().includes(query.toLowerCase()) ||
      notification.category?.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Filtrage des notifications
  filterNotifications(notifications, filters = {}) {
    let filtered = notifications;

    if (filters.category) {
      filtered = filtered.filter(n => n.category === filters.category);
    }

    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.unread) {
      filtered = filtered.filter(n => !n.isRead);
    }

    if (filters.dismissed !== undefined) {
      filtered = filtered.filter(n => n.isDismissed === filters.dismissed);
    }

    return filtered;
  }

  // Statistiques des notifications
  getNotificationStats(notifications) {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const dismissed = notifications.filter(n => n.isDismissed).length;
    
    const byCategory = notifications.reduce((acc, n) => {
      acc[n.category] = (acc[n.category] || 0) + 1;
      return acc;
    }, {});
    
    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total,
      unread,
      dismissed,
      byCategory,
      byPriority
    };
  }

  // Création de notifications prédéfinies
  createMessageNotification(senderName, messagePreview, conversationId, messageId) {
    return this.formatNotification({
      title: 'Nouveau message',
      content: `${senderName}: ${messagePreview}`,
      category: 'messages',
      priority: 'normal',
      icon: '/icons/message.svg',
      actions: [
        {
          id: 'reply',
          title: 'Répondre',
          icon: '/icons/reply.svg'
        },
        {
          id: 'view',
          title: 'Voir',
          icon: '/icons/view.svg'
        }
      ],
      metadata: {
        conversationId,
        messageId,
        senderName
      }
    });
  }

  createCallNotification(callerName, callType, callId) {
    return this.formatNotification({
      title: callType === 'missed' ? 'Appel manqué' : 'Appel entrant',
      content: `${callerName} ${callType === 'missed' ? 'a essayé de vous appeler' : 'vous appelle'}`,
      category: 'calls',
      priority: callType === 'missed' ? 'high' : 'urgent',
      icon: '/icons/call.svg',
      actions: [
        {
          id: 'call_back',
          title: 'Rappeler',
          icon: '/icons/call.svg'
        }
      ],
      metadata: {
        callerName,
        callType,
        callId
      }
    });
  }

  createStatusNotification(userName, statusType, statusId) {
    return this.formatNotification({
      title: 'Nouveau statut',
      content: `${userName} a mis à jour son statut`,
      category: 'status',
      priority: 'low',
      icon: '/icons/status.svg',
      actions: [
        {
          id: 'view_status',
          title: 'Voir le statut',
          icon: '/icons/status.svg'
        }
      ],
      metadata: {
        userName,
        statusType,
        statusId
      }
    });
  }

  createMediaNotification(senderName, mediaType, conversationId, mediaId) {
    return this.formatNotification({
      title: 'Média reçu',
      content: `${senderName} vous a envoyé ${mediaType === 'image' ? 'une image' : mediaType === 'video' ? 'une vidéo' : 'un fichier'}`,
      category: 'media',
      priority: 'normal',
      icon: '/icons/media.svg',
      actions: [
        {
          id: 'view_media',
          title: 'Voir',
          icon: '/icons/media.svg'
        },
        {
          id: 'download',
          title: 'Télécharger',
          icon: '/icons/download.svg'
        }
      ],
      metadata: {
        senderName,
        mediaType,
        conversationId,
        mediaId
      }
    });
  }
}

// Instance singleton du service
export const notificationService = new NotificationService();
export default notificationService;
