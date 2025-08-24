import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const createUserSlice = (set, get) => ({
  // Profil utilisateur actuel
  currentUser: null,
  
  // Contacts et utilisateurs
  contacts: [],
  users: [],
  
  // Préférences utilisateur
  preferences: {
    theme: 'light', // 'light', 'dark', 'auto'
    language: 'fr',
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      showPreview: true
    },
    privacy: {
      lastSeen: 'everyone', // 'everyone', 'contacts', 'nobody'
      profilePhoto: 'everyone',
      status: 'everyone',
      readReceipts: true
    },
    chat: {
      enterToSend: true,
      mediaAutoDownload: true,
      fontSize: 'medium' // 'small', 'medium', 'large'
    }
  },
  
  // État de chargement
  isLoading: false,
  error: null,
  
  // Actions de profil
  updateProfile: (updates) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null
    }));
  },
  
  // Mettre à jour la photo de profil
  updateProfilePhoto: (photoUrl) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, profilePhoto: photoUrl } : null
    }));
  },
  
  // Mettre à jour le statut
  updateStatus: (status) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, status } : null
    }));
  },
  
  // Actions de contacts
  addContact: (contact) => {
    const newContact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...contact,
      addedAt: new Date().toISOString(),
      isFavorite: false,
      isBlocked: false,
      notes: '',
      labels: []
    };
    
    set((state) => ({
      contacts: [...state.contacts, newContact]
    }));
    
    return newContact;
  },
  
  // Mettre à jour un contact
  updateContact: (contactId, updates) => {
    set((state) => ({
      contacts: state.contacts.map(contact =>
        contact.id === contactId ? { ...contact, ...updates } : contact
      )
    }));
  },
  
  // Supprimer un contact
  removeContact: (contactId) => {
    set((state) => ({
      contacts: state.contacts.filter(contact => contact.id !== contactId)
    }));
  },
  
  // Marquer un contact comme favori
  toggleFavoriteContact: (contactId) => {
    set((state) => ({
      contacts: state.contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, isFavorite: !contact.isFavorite }
          : contact
      )
    }));
  },
  
  // Bloquer/débloquer un contact
  toggleBlockContact: (contactId) => {
    set((state) => ({
      contacts: state.contacts.map(contact =>
        contact.id === contactId
          ? { ...contact, isBlocked: !contact.isBlocked }
          : contact
      )
    }));
  },
  
  // Rechercher des contacts
  searchContacts: (query) => {
    const { contacts } = get();
    return contacts.filter(contact =>
      contact.name?.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone?.includes(query) ||
      contact.email?.toLowerCase().includes(query.toLowerCase())
    );
  },
  
  // Obtenir les contacts favoris
  getFavoriteContacts: () => {
    const { contacts } = get();
    return contacts.filter(contact => contact.isFavorite);
  },
  
  // Obtenir les contacts bloqués
  getBlockedContacts: () => {
    const { contacts } = get();
    return contacts.filter(contact => contact.isBlocked);
  },
  
  // Actions de préférences
  updatePreferences: (path, value) => {
    set((state) => {
      const newPreferences = { ...state.preferences };
      const keys = path.split('.');
      let current = newPreferences;
      
      // Naviguer vers le bon niveau
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      // Mettre à jour la valeur
      current[keys[keys.length - 1]] = value;
      
      return { preferences: newPreferences };
    });
  },
  
  // Changer le thème
  setTheme: (theme) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        theme
      }
    }));
  },
  
  // Changer la langue
  setLanguage: (language) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        language
      }
    }));
  },
  
  // Mettre à jour les paramètres de notification
  updateNotificationSettings: (settings) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        notifications: {
          ...state.preferences.notifications,
          ...settings
        }
      }
    }));
  },
  
  // Mettre à jour les paramètres de confidentialité
  updatePrivacySettings: (settings) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        privacy: {
          ...state.preferences.privacy,
          ...settings
        }
      }
    }));
  },
  
  // Mettre à jour les paramètres de chat
  updateChatSettings: (settings) => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        chat: {
          ...state.preferences.chat,
          ...settings
        }
      }
    }));
  },
  
  // Actions de synchronisation
  syncContacts: async () => {
    set({ isLoading: true });
    
    try {
      // Simulation d'une API de synchronisation
      // Plus tard, remplacez par votre vraie API
      const response = await fetch('/api/contacts/sync');
      
      if (!response.ok) {
        throw new Error('Échec de la synchronisation des contacts');
      }
      
      const data = await response.json();
      
      set({
        contacts: data.contacts || [],
        isLoading: false
      });
      
      return data.contacts;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Charger les contacts depuis le serveur
  loadContacts: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/contacts');
      
      if (!response.ok) {
        throw new Error('Échec du chargement des contacts');
      }
      
      const data = await response.json();
      
      set({
        contacts: data.contacts || [],
        isLoading: false
      });
      
      return data.contacts;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Sauvegarder les contacts sur le serveur
  saveContacts: async () => {
    const { contacts } = get();
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts })
      });
      
      if (!response.ok) {
        throw new Error('Échec de la sauvegarde des contacts');
      }
      
      return await response.json();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Réinitialiser l'erreur
  clearError: () => set({ error: null }),
  
  // Réinitialiser l'état
  reset: () => set({
    currentUser: null,
    contacts: [],
    users: [],
    preferences: {
      theme: 'light',
      language: 'fr',
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        showPreview: true
      },
      privacy: {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        status: 'everyone',
        readReceipts: true
      },
      chat: {
        enterToSend: true,
        mediaAutoDownload: true,
        fontSize: 'medium'
      }
    },
    isLoading: false,
    error: null
  })
});

// Store utilisateur avec persistance
export const useUserStore = create(
  persist(
    createUserSlice,
    {
      name: 'whatsapp-user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        contacts: state.contacts,
        preferences: state.preferences
      })
    }
  )
);
