import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const createSettingsSlice = (set, get) => ({
  // Paramètres de l'application
  settings: {
    // Paramètres d'interface
    interface: {
      theme: 'light', // 'light', 'dark', 'auto'
      language: 'fr',
      fontSize: 'medium', // 'small', 'medium', 'large'
      compactMode: false,
      showAvatars: true,
      showOnlineStatus: true,
      showTypingIndicator: true,
      showReadReceipts: true,
      showMessageTime: true,
      showMessageDate: true
    },
    
    // Paramètres de chat
    chat: {
      enterToSend: true,
      mediaAutoDownload: true,
      mediaCompression: 'medium', // 'low', 'medium', 'high'
      maxMediaSize: 50, // MB
      saveMediaToGallery: false,
      showLinkPreview: true,
      showEmojiPicker: true,
      showAttachmentMenu: true,
      maxMessageLength: 1000,
      allowEditing: true,
      allowDeleting: true,
      allowForwarding: true,
      allowReplying: true
    },
    
    // Paramètres de notification
    notifications: {
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
      emailNotifications: false
    },
    
    // Paramètres de confidentialité
    privacy: {
      lastSeen: 'everyone', // 'everyone', 'contacts', 'nobody'
      profilePhoto: 'everyone',
      status: 'everyone',
      readReceipts: true,
      typingIndicator: true,
      onlineStatus: true,
      locationSharing: false,
      contactSharing: false,
      messageBackup: true,
      dataAnalytics: false
    },
    
    // Paramètres de sécurité
    security: {
      twoFactorAuth: false,
      biometricAuth: false,
      appLock: false,
      appLockTimeout: 0, // 0 = immédiat, 1 = 1 minute, 5 = 5 minutes
      encryptionEnabled: true,
      backupEncryption: true,
      autoLogout: false,
      autoLogoutTimeout: 30, // minutes
      sessionTimeout: 24 * 60 // minutes (24 heures)
    },
    
    // Paramètres de stockage
    storage: {
      autoCleanup: true,
      cleanupInterval: 30, // jours
      maxStorageSize: 1024, // MB
      compressOldMessages: true,
      deleteOldMedia: false,
      oldMediaThreshold: 90, // jours
      backupFrequency: 'weekly', // 'daily', 'weekly', 'monthly'
      cloudBackup: false,
      localBackup: true
    },
    
    // Paramètres de performance
    performance: {
      lazyLoading: true,
      virtualScrolling: true,
      imageOptimization: true,
      cacheEnabled: true,
      cacheSize: 100, // MB
      backgroundSync: true,
      offlineMode: true,
      dataSaver: false
    },
    
    // Paramètres d'accessibilité
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true,
      colorBlindMode: false,
      motionReduction: false,
      focusIndicator: true
    }
  },
  
  // État de chargement
  isLoading: false,
  error: null,
  
  // Actions de mise à jour des paramètres
  updateSetting: (path, value) => {
    set((state) => {
      const newSettings = { ...state.settings };
      const keys = path.split('.');
      let current = newSettings;
      
      // Naviguer vers le bon niveau
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      // Mettre à jour la valeur
      current[keys[keys.length - 1]] = value;
      
      return { settings: newSettings };
    });
  },
  
  // Mettre à jour plusieurs paramètres à la fois
  updateMultipleSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.settings };
      
      Object.entries(updates).forEach(([path, value]) => {
        const keys = path.split('.');
        let current = newSettings;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
      });
      
      return { settings: newSettings };
    });
  },
  
  // Actions spécifiques pour les thèmes
  setTheme: (theme) => {
    set((state) => ({
      settings: {
        ...state.settings,
        interface: {
          ...state.settings.interface,
          theme
        }
      }
    }));
  },
  
  // Actions spécifiques pour la langue
  setLanguage: (language) => {
    set((state) => ({
      settings: {
        ...state.settings,
        interface: {
          ...state.settings.interface,
          language
        }
      }
    }));
  },
  
  // Actions spécifiques pour la taille de police
  setFontSize: (fontSize) => {
    set((state) => ({
      settings: {
        ...state.settings,
        interface: {
          ...state.settings.interface,
          fontSize
        }
      }
    }));
  },
  
  // Actions spécifiques pour les notifications
  updateNotificationSettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: {
          ...state.settings.notifications,
          ...settings
        }
      }
    }));
  },
  
  // Actions spécifiques pour la confidentialité
  updatePrivacySettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        privacy: {
          ...state.settings.privacy,
          ...settings
        }
      }
    }));
  },
  
  // Actions spécifiques pour la sécurité
  updateSecuritySettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        security: {
          ...state.settings.security,
          ...settings
        }
      }
    }));
  },
  
  // Actions spécifiques pour le stockage
  updateStorageSettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        storage: {
          ...state.settings.storage,
          ...settings
        }
      }
    }));
  },
  
  // Actions spécifiques pour la performance
  updatePerformanceSettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        performance: {
          ...state.settings.performance,
          ...settings
        }
      }
    }));
  },
  
  // Actions spécifiques pour l'accessibilité
  updateAccessibilitySettings: (settings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        accessibility: {
          ...state.settings.accessibility,
          ...settings
        }
      }
    }));
  },
  
  // Réinitialiser les paramètres aux valeurs par défaut
  resetToDefaults: () => {
    set({
      settings: {
        interface: {
          theme: 'light',
          language: 'fr',
          fontSize: 'medium',
          compactMode: false,
          showAvatars: true,
          showOnlineStatus: true,
          showTypingIndicator: true,
          showReadReceipts: true,
          showMessageTime: true,
          showMessageDate: true
        },
        chat: {
          enterToSend: true,
          mediaAutoDownload: true,
          mediaCompression: 'medium',
          maxMediaSize: 50,
          saveMediaToGallery: false,
          showLinkPreview: true,
          showEmojiPicker: true,
          showAttachmentMenu: true,
          maxMessageLength: 1000,
          allowEditing: true,
          allowDeleting: true,
          allowForwarding: true,
          allowReplying: true
        },
        notifications: {
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
          emailNotifications: false
        },
        privacy: {
          lastSeen: 'everyone',
          profilePhoto: 'everyone',
          status: 'everyone',
          readReceipts: true,
          typingIndicator: true,
          onlineStatus: true,
          locationSharing: false,
          contactSharing: false,
          messageBackup: true,
          dataAnalytics: false
        },
        security: {
          twoFactorAuth: false,
          biometricAuth: false,
          appLock: false,
          appLockTimeout: 0,
          encryptionEnabled: true,
          backupEncryption: true,
          autoLogout: false,
          autoLogoutTimeout: 30,
          sessionTimeout: 24 * 60
        },
        storage: {
          autoCleanup: true,
          cleanupInterval: 30,
          maxStorageSize: 1024,
          compressOldMessages: true,
          deleteOldMedia: false,
          oldMediaThreshold: 90,
          backupFrequency: 'weekly',
          cloudBackup: false,
          localBackup: true
        },
        performance: {
          lazyLoading: true,
          virtualScrolling: true,
          imageOptimization: true,
          cacheEnabled: true,
          cacheSize: 100,
          backgroundSync: true,
          offlineMode: true,
          dataSaver: false
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          screenReader: false,
          keyboardNavigation: true,
          colorBlindMode: false,
          motionReduction: false,
          focusIndicator: true
        }
      }
    });
  },
  
  // Sauvegarder les paramètres sur le serveur
  saveSettings: async () => {
    const { settings } = get();
    
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      
      if (!response.ok) {
        throw new Error('Échec de la sauvegarde des paramètres');
      }
      
      return await response.json();
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
  
  // Charger les paramètres depuis le serveur
  loadSettings: async () => {
    set({ isLoading: true });
    
    try {
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('Échec du chargement des paramètres');
      }
      
      const data = await response.json();
      
      set({
        settings: data.settings || get().settings,
        isLoading: false
      });
      
      return data.settings;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
  
  // Exporter les paramètres
  exportSettings: () => {
    const { settings } = get();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      settings
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },
  
  // Importer les paramètres
  importSettings: async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.settings) {
        throw new Error('Format de fichier invalide');
      }
      
      set({ settings: data.settings });
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des paramètres:', error);
      throw error;
    }
  },
  
  // Réinitialiser l'erreur
  clearError: () => set({ error: null }),
  
  // Réinitialiser l'état
  reset: () => {
    get().resetToDefaults();
    set({ isLoading: false, error: null });
  }
});

// Store des paramètres avec persistance
export const useSettingsStore = create(
  persist(
    createSettingsSlice,
    {
      name: 'whatsapp-settings-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings
      }),
      // Fonction de migration pour gérer les changements de structure
      migrate: (persistedState, version) => {
        if (persistedState) {
          console.log('🔄 Migration de l\'état des paramètres...');
          return {
            settings: persistedState.settings || {
              interface: {
                theme: 'light',
                language: 'fr',
                fontSize: 'medium',
                compactMode: false,
                showAvatars: true,
                showTimestamps: true
              },
              chat: {
                enterToSend: true,
                mediaAutoDownload: true,
                showReadReceipts: true,
                showTypingIndicator: true,
                messagePreview: true
              },
              notifications: {
                enabled: true,
                sound: true,
                vibration: true,
                showPreview: true,
                quietHours: {
                  enabled: false,
                  start: '22:00',
                  end: '08:00'
                }
              },
              privacy: {
                lastSeen: 'everyone',
                profilePhoto: 'everyone',
                status: 'everyone',
                readReceipts: true,
                typingIndicator: true
              },
              security: {
                twoFactorAuth: false,
                biometricAuth: false,
                autoLock: false,
                lockTimeout: 5
              },
              storage: {
                autoCleanup: true,
                maxStorageSize: 1024,
                compressImages: true,
                compressVideos: true
              },
              performance: {
                lowDataMode: false,
                backgroundSync: true,
                cacheSize: 100
              },
              accessibility: {
                highContrast: false,
                reduceMotion: false,
                screenReader: false
              }
            }
          };
        }
        return persistedState;
      },
      version: 1 // Version pour la migration
    }
  )
);
