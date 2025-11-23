import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useChatStore } from './chatStore';
import { useUserStore } from './userStore';

// Store principal qui combine tous les autres stores
const createMainSlice = (set, get) => ({
  // État global de l'application
  appState: {
    isInitialized: false,
    isOnline: navigator.onLine,
    currentRoute: '/',
    sidebarCollapsed: false,
    activeTab: 'chats', // 'chats', 'status', 'calls', 'contacts'
    searchQuery: '',
    filters: {
      showArchived: false,
      showMuted: false,
      showBlocked: false
    }
  },
  
  // État de synchronisation
  syncState: {
    lastSync: null,
    isSyncing: false,
    syncProgress: 0,
    pendingChanges: [],
    conflicts: []
  },
  
  // État des erreurs globales
  globalErrors: [],
  
  // Actions d'état de l'application
  initializeApp: async () => {
    set({ 'appState.isInitialized': false });
    
    try {
      // Vérifier l'état d'authentification
      const authStore = useAuthStore.getState();
      await authStore.checkAuthStatus();
      
      // Charger les contacts si authentifié
      if (authStore.isAuthenticated) {
        const userStore = useUserStore.getState();
        await userStore.loadContacts();
      }
      
      // Charger les conversations récentes
      const chatStore = useChatStore.getState();
      // Ici vous pouvez charger les conversations récentes
      
      set({ 'appState.isInitialized': true });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'application:', error);
      set({ 'appState.isInitialized': true }); // Continuer malgré l'erreur
    }
  },
  
  // Mettre à jour l'état de l'application
  updateAppState: (updates) => {
    set((state) => ({
      appState: { ...state.appState, ...updates }
    }));
  },
  
  // Changer d'onglet actif
  setActiveTab: (tab) => {
    set({ 'appState.activeTab': tab });
  },
  
  // Basculer la barre latérale
  toggleSidebar: () => {
    set((state) => ({
      'appState.sidebarCollapsed': !state.appState.sidebarCollapsed
    }));
  },
  
  // Mettre à jour la requête de recherche
  setSearchQuery: (query) => {
    set({ 'appState.searchQuery': query });
  },
  
  // Mettre à jour les filtres
  updateFilters: (filters) => {
    set((state) => ({
      'appState.filters': { ...state.appState.filters, ...filters }
    }));
  },
  
  // Actions de synchronisation
  startSync: async () => {
    set({ 'syncState.isSyncing': true, 'syncState.syncProgress': 0 });
    
    try {
      const authStore = useAuthStore.getState();
      const userStore = useUserStore.getState();
      const chatStore = useChatStore.getState();
      
      // Synchroniser les contacts
      set({ 'syncState.syncProgress': 25 });
      await userStore.syncContacts();
      
      // Synchroniser les conversations
      set({ 'syncState.syncProgress': 50 });
      // Ici vous pouvez synchroniser les conversations
      
      // Synchroniser les messages
      set({ 'syncState.syncProgress': 75 });
      // Ici vous pouvez synchroniser les messages
      
      // Finaliser la synchronisation
      set({ 'syncState.syncProgress': 100 });
      
      set({
        'syncState.lastSync': new Date().toISOString(),
        'syncState.isSyncing': false,
        'syncState.syncProgress': 0
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      set({
        'syncState.isSyncing': false,
        'syncState.syncProgress': 0
      });
      throw error;
    }
  },
  
  // Ajouter un changement en attente
  addPendingChange: (change) => {
    set((state) => ({
      syncState: {
        ...state.syncState,
        pendingChanges: [...state.syncState.pendingChanges, change]
      }
    }));
  },
  
  // Appliquer les changements en attente
  applyPendingChanges: async () => {
    const { pendingChanges } = get().syncState;
    
    if (pendingChanges.length === 0) return;
    
    try {
      // Appliquer chaque changement
      for (const change of pendingChanges) {
        await applyChange(change);
      }
      
      // Vider la liste des changements en attente
      set({ 'syncState.pendingChanges': [] });
    } catch (error) {
      console.error('Erreur lors de l\'application des changements:', error);
      throw error;
    }
  },
  
  // Gestion des erreurs globales
  addGlobalError: (error) => {
    const errorObj = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message || error,
      timestamp: new Date().toISOString(),
      type: 'error',
      isDismissed: false
    };
    
    set((state) => ({
      globalErrors: [...state.globalErrors, errorObj]
    }));
    
    return errorObj.id;
  },
  
  // Ajouter un avertissement global
  addGlobalWarning: (warning) => {
    const warningObj = {
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: warning.message || warning,
      timestamp: new Date().toISOString(),
      type: 'warning',
      isDismissed: false
    };
    
    set((state) => ({
      globalErrors: [...state.globalErrors, warningObj]
    }));
    
    return warningObj.id;
  },
  
  // Marquer une erreur comme fermée
  dismissError: (errorId) => {
    set((state) => ({
      globalErrors: state.globalErrors.map(error =>
        error.id === errorId ? { ...error, isDismissed: true } : error
      )
    }));
  },
  
  // Supprimer une erreur
  removeError: (errorId) => {
    set((state) => ({
      globalErrors: state.globalErrors.filter(error => error.id !== errorId)
    }));
  },
  
  // Vider toutes les erreurs
  clearAllErrors: () => {
    set({ globalErrors: [] });
  },
  
  // Gestion de la connectivité
  updateOnlineStatus: (isOnline) => {
    set({ 'appState.isOnline': isOnline });
    
    if (isOnline) {
      // Tentative de synchronisation automatique
      get().startSync();
    }
  },
  
  // Actions de réinitialisation
  resetApp: () => {
    // Réinitialiser tous les stores
    useAuthStore.getState().reset();
    useChatStore.getState().reset();
    useUserStore.getState().reset();
    
    // Réinitialiser le store principal
    set({
      appState: {
        isInitialized: false,
        isOnline: navigator.onLine,
        currentRoute: '/',
        sidebarCollapsed: false,
        activeTab: 'chats',
        searchQuery: '',
        filters: {
          showArchived: false,
          showMuted: false,
          showBlocked: false
        }
      },
      syncState: {
        lastSync: null,
        isSyncing: false,
        syncProgress: 0,
        pendingChanges: [],
        conflicts: []
      },
      globalErrors: []
    });
  },
  
  // Actions d'export/import
  exportData: () => {
    const authStore = useAuthStore.getState();
    const userStore = useUserStore.getState();
    const chatStore = useChatStore.getState();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      auth: {
        user: authStore.user,
        preferences: authStore.preferences
      },
      user: {
        contacts: userStore.contacts,
        preferences: userStore.preferences
      },
      chat: {
        conversations: userStore.conversations,
        messages: userStore.messages
      }
    };
    
    // Créer un fichier de téléchargement
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },
  
  // Import de données
  importData: async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Valider la structure des données
      if (!data.version || !data.timestamp) {
        throw new Error('Format de fichier invalide');
      }
      
      // Importer les données dans les stores appropriés
      if (data.user?.contacts) {
        const userStore = useUserStore.getState();
        userStore.contacts = data.user.contacts;
      }
      
      if (data.user?.preferences) {
        const userStore = useUserStore.getState();
        userStore.preferences = { ...userStore.preferences, ...data.user.preferences };
      }
      
      if (data.chat?.conversations) {
        const chatStore = useChatStore.getState();
        chatStore.conversations = data.chat.conversations;
      }
      
      if (data.chat?.messages) {
        const chatStore = useChatStore.getState();
        chatStore.messages = data.chat.messages;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      throw error;
    }
  }
});

// Fonction utilitaire pour appliquer un changement
const applyChange = async (change) => {
  const { type, data, store } = change;
  
  switch (store) {
    case 'auth':
      const authStore = useAuthStore.getState();
      if (type === 'update') {
        authStore.updateProfile(data);
      }
      break;
      
    case 'user':
      const userStore = useUserStore.getState();
      if (type === 'add') {
        userStore.addContact(data);
      } else if (type === 'update') {
        userStore.updateContact(data.id, data.updates);
      } else if (type === 'delete') {
        userStore.removeContact(data.id);
      }
      break;
      
    case 'chat':
      const chatStore = useChatStore.getState();
      if (type === 'add') {
        chatStore.addMessage(data.conversationId, data.message);
      } else if (type === 'update') {
        chatStore.updateMessageStatus(data.conversationId, data.messageId, data.status);
      }
      break;
      
    default:
      console.warn('Type de changement inconnu:', type);
  }
};

// Store principal avec persistance
export const useMainStore = create(
  persist(
    createMainSlice,
    {
      name: 'whatsapp-main-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        appState: state.appState,
        syncState: {
          lastSync: state.syncState.lastSync,
          pendingChanges: state.syncState.pendingChanges
        }
      }),
      // Fonction de migration pour gérer les changements de structure
      migrate: (persistedState, version) => {
        if (persistedState) {
          console.log('🔄 Migration de l\'état principal...');
          return {
            appState: persistedState.appState || {
              isInitialized: false,
              currentView: 'chat',
              sidebarOpen: true,
              theme: 'light',
              language: 'fr'
            },
            syncState: {
              lastSync: persistedState.syncState?.lastSync || null,
              pendingChanges: persistedState.syncState?.pendingChanges || [],
              isSyncing: false,
              syncProgress: 0
            },
            globalErrors: persistedState.globalErrors || []
          };
        }
        return persistedState;
      },
      version: 1 // Version pour la migration
    }
  )
);
