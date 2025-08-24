import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const createNotificationSlice = (set, get) => ({
  // Notifications stockées
  notifications: [],
  
  // Paramètres de notification
  settings: {
    enabled: true,
    sound: true,
    vibration: true,
    showPreview: true,
    showSenderName: true,
    showMessageContent: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    desktopNotifications: true,
    mobileNotifications: true,
    emailNotifications: false,
    categories: {
      messages: true,
      calls: true,
      status: true,
      media: true,
      system: true
    }
  },
  
  // État de permission
  permission: 'default', // 'default', 'granted', 'denied'
  
  // État de chargement
  isLoading: false,
  error: null,
  
  // Actions de gestion des notifications
  addNotification: (notification) => {
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...notification,
      timestamp: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
      priority: notification.priority || 'normal', // 'low', 'normal', 'high', 'urgent'
      category: notification.category || 'system',
      actions: notification.actions || [],
      metadata: notification.metadata || {}
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications]
    }));
    
    // Afficher la notification système si activée
    if (get().settings.desktopNotifications && get().permission === 'granted') {
      get().showSystemNotification(newNotification);
    }
    
    // Jouer le son si activé
    if (get().settings.sound) {
      get().playNotificationSound(newNotification.category);
    }
    
    // Vibrer si activé
    if (get().settings.vibration && 'vibrate' in navigator) {
      get().vibrateDevice(newNotification.priority);
    }
    
    return newNotification;
  },
  
  // Supprimer une notification
  removeNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== notificationId)
    }));
  },
  
  // Marquer comme lue
  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    }));
  },
  
  // Marquer comme fermée
  dismissNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === notificationId ? { ...n, isDismissed: true } : n
      )
    }));
  },
  
  // Marquer toutes comme lues
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true }))
    }));
  },
  
  // Supprimer toutes les notifications
  clearAllNotifications: () => {
    set({ notifications: [] });
  },
  
  // Supprimer les notifications lues
  clearReadNotifications: () => {
    set((state) => ({
      notifications: state.notifications.filter(n => !n.isRead)
    }));
  },
  
  // Actions de notification système
  requestPermission: async () => {
    if (!('Notification' in window)) {
      set({ permission: 'unsupported' });
      return false;
    }
    
    try {
      const permission = await Notification.requestPermission();
      set({ permission });
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      return false;
    }
  },
  
  // Afficher une notification système
  showSystemNotification: (notification) => {
    if (get().permission !== 'granted') return;
    
    // Vérifier les heures silencieuses
    if (get().isInQuietHours()) return;
    
    const options = {
      body: get().settings.showMessageContent ? notification.content : '',
      icon: notification.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
      silent: !get().settings.sound,
      vibrate: get().settings.vibration ? get().getVibrationPattern(notification.priority) : undefined,
      data: notification.metadata,
      actions: notification.actions.map(action => ({
        action: action.id,
        title: action.title,
        icon: action.icon
      }))
    };
    
    const systemNotification = new Notification(notification.title, options);
    
    // Gérer les clics
    systemNotification.onclick = () => {
      get().markAsRead(notification.id);
      get().handleNotificationClick(notification);
      systemNotification.close();
    };
    
    // Gérer les actions
    systemNotification.onaction = (event) => {
      const action = notification.actions.find(a => a.id === event.action);
      if (action && action.handler) {
        action.handler(notification);
      }
    };
    
    // Auto-fermeture après 5 secondes (sauf urgentes)
    if (notification.priority !== 'urgent') {
      setTimeout(() => {
        systemNotification.close();
      }, 5000);
    }
    
    return systemNotification;
  },
  
  // Actions de son
  playNotificationSound: (category) => {
    try {
      const audio = new Audio();
      
      // Sons différents selon la catégorie
      const sounds = {
        messages: '/sounds/message.mp3',
        calls: '/sounds/call.mp3',
        status: '/sounds/status.mp3',
        media: '/sounds/media.mp3',
        system: '/sounds/system.mp3'
      };
      
      audio.src = sounds[category] || sounds.system;
      audio.volume = 0.5;
      audio.play().catch(error => {
        console.warn('Impossible de jouer le son de notification:', error);
      });
    } catch (error) {
      console.warn('Erreur lors de la lecture du son:', error);
    }
  },
  
  // Actions de vibration
  vibrateDevice: (priority) => {
    if (!('vibrate' in navigator)) return;
    
    const patterns = {
      low: [100],
      normal: [200],
      high: [300, 100, 300],
      urgent: [500, 100, 500, 100, 500]
    };
    
    const pattern = patterns[priority] || patterns.normal;
    navigator.vibrate(pattern);
  },
  
  // Obtenir le pattern de vibration
  getVibrationPattern: (priority) => {
    const patterns = {
      low: [100],
      normal: [200],
      high: [300, 100, 300],
      urgent: [500, 100, 500, 100, 500]
    };
    
    return patterns[priority] || patterns.normal;
  },
  
  // Actions de paramètres
  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates }
    }));
  },
  
  // Mettre à jour les paramètres de catégorie
  updateCategorySettings: (category, enabled) => {
    set((state) => ({
      settings: {
        ...state.settings,
        categories: {
          ...state.settings.categories,
          [category]: enabled
        }
      }
    }));
  },
  
  // Configurer les heures silencieuses
  setQuietHours: (enabled, start, end) => {
    set((state) => ({
      settings: {
        ...state.settings,
        quietHours: {
          enabled,
          start: start || state.settings.quietHours.start,
          end: end || state.settings.quietHours.end
        }
      }
    }));
  },
  
  // Vérifier si on est dans les heures silencieuses
  isInQuietHours: () => {
    const { quietHours } = get().settings;
    
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      // Même jour
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Sur deux jours (ex: 22:00 à 08:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  },
  
  // Actions de recherche et filtrage
  searchNotifications: (query) => {
    const { notifications } = get();
    return notifications.filter(notification =>
      notification.title?.toLowerCase().includes(query.toLowerCase()) ||
      notification.content?.toLowerCase().includes(query.toLowerCase()) ||
      notification.category?.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  // Filtrer par catégorie
  filterByCategory: (category) => {
    const { notifications } = get();
    return notifications.filter(notification => notification.category === category);
  },
  
  // Filtrer par priorité
  filterByPriority: (priority) => {
    const { notifications } = get();
    return notifications.filter(notification => notification.priority === priority);
  },
  
  // Obtenir les notifications non lues
  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(notification => !notification.isRead);
  },
  
  // Obtenir le nombre de notifications non lues
  getUnreadCount: () => {
    return get().getUnreadNotifications().length;
  },
  
  // Obtenir les statistiques
  getNotificationStats: () => {
    const { notifications } = get();
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
  },
  
  // Actions de gestion des clics
  handleNotificationClick: (notification) => {
    // Ici vous pouvez implémenter la logique de navigation
    // Par exemple, ouvrir la conversation correspondante
    console.log('Notification cliquée:', notification);
    
    // Exemple de navigation
    if (notification.metadata?.conversationId) {
      // Naviguer vers la conversation
      // router.push(`/chat/${notification.metadata.conversationId}`);
    }
  },
  
  // Actions de test
  testNotification: (category = 'system') => {
    const testNotification = {
      title: 'Test de notification',
      content: 'Ceci est une notification de test',
      category,
      priority: 'normal',
      icon: '/favicon.ico'
    };
    
    get().addNotification(testNotification);
  },
  
  // Actions de synchronisation
  syncNotifications: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/notifications/sync');
      
      if (!response.ok) {
        throw new Error('Échec de la synchronisation des notifications');
      }
      
      const data = await response.json();
      
      // Fusionner avec les notifications existantes
      set((state) => ({
        notifications: [...data.notifications, ...state.notifications],
        isLoading: false
      }));
      
      return data.notifications;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Réinitialiser l'erreur
  clearError: () => set({ error: null }),
  
  // Réinitialiser l'état
  reset: () => set({
    notifications: [],
    settings: {
      enabled: true,
      sound: true,
      vibration: true,
      showPreview: true,
      showSenderName: true,
      showMessageContent: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      desktopNotifications: true,
      mobileNotifications: true,
      emailNotifications: false,
      categories: {
        messages: true,
        calls: true,
        status: true,
        media: true,
        system: true
      }
    },
    permission: 'default',
    isLoading: false,
    error: null
  })
});

// Store des notifications avec persistance
export const useNotificationStore = create(
  persist(
    createNotificationSlice,
    {
      name: 'whatsapp-notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        settings: state.settings
      })
    }
  )
);
