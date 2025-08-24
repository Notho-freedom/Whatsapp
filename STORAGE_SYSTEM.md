# 🗄️ Système de Stockage Centralisé WhatsApp

## 📋 Vue d'ensemble

Ce système de stockage utilise **Zustand** pour gérer l'état global de l'application WhatsApp avec persistance locale. Il est conçu pour être facilement migrable vers un service cloud plus tard.

## 🏗️ Architecture

### Stores Principaux

1. **`useAuthStore`** - Authentification et gestion des utilisateurs
2. **`useChatStore`** - Conversations et messages
3. **`useUserStore`** - Profils et contacts
4. **`useSettingsStore`** - Paramètres de l'application
5. **`useMediaStore`** - Gestion des fichiers et médias
6. **`useNotificationStore`** - Notifications push et système
7. **`useMainStore`** - Store principal combinant tous les autres

## 🚀 Installation et Configuration

### Dépendances

```bash
npm install zustand
```

### Import des Stores

```javascript
// Import individuel
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';

// Import centralisé
import { 
  useAuthStore, 
  useChatStore, 
  useUserStore,
  useMainStore 
} from '@/stores';
```

## 📱 Utilisation des Stores

### 1. Store d'Authentification (`useAuthStore`)

```javascript
import { useAuthStore } from '@/stores';

function LoginComponent() {
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout, 
    isLoading 
  } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Connecté en tant que: {user?.name}</p>
          <button onClick={logout}>Déconnexion</button>
        </div>
      ) : (
        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>
      )}
    </div>
  );
}
```

### 2. Store de Chat (`useChatStore`)

```javascript
import { useChatStore } from '@/stores';

function ChatComponent() {
  const { 
    conversations, 
    selectedConversation, 
    messages, 
    sendMessage,
    createConversation 
  } = useChatStore();

  const handleSendMessage = async (content) => {
    if (selectedConversation) {
      await sendMessage(selectedConversation, content, 'text');
    }
  };

  const handleNewConversation = () => {
    const participants = [{ id: 'user1', name: 'Utilisateur 1' }];
    createConversation(participants, 'individual');
  };

  return (
    <div>
      <button onClick={handleNewConversation}>Nouvelle conversation</button>
      
      {conversations.map(conv => (
        <div key={conv.id} onClick={() => selectConversation(conv.id)}>
          <h3>{conv.participants.map(p => p.name).join(', ')}</h3>
          <p>{conv.lastMessage?.content || 'Aucun message'}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Store Utilisateur (`useUserStore`)

```javascript
import { useUserStore } from '@/stores';

function ProfileComponent() {
  const { 
    currentUser, 
    contacts, 
    preferences, 
    updateProfile,
    setTheme 
  } = useUserStore();

  const handleThemeChange = (theme) => {
    setTheme(theme);
  };

  const handleProfileUpdate = (updates) => {
    updateProfile(updates);
  };

  return (
    <div>
      <h2>Profil: {currentUser?.name}</h2>
      
      <div>
        <label>Thème:</label>
        <select 
          value={preferences.interface.theme} 
          onChange={(e) => handleThemeChange(e.target.value)}
        >
          <option value="light">Clair</option>
          <option value="dark">Sombre</option>
          <option value="auto">Automatique</option>
        </select>
      </div>

      <div>
        <h3>Contacts ({contacts.length})</h3>
        {contacts.map(contact => (
          <div key={contact.id}>
            <span>{contact.name}</span>
            <span>{contact.phone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Store des Paramètres (`useSettingsStore`)

```javascript
import { useSettingsStore } from '@/stores';

function SettingsComponent() {
  const { 
    settings, 
    updateSetting, 
    updateMultipleSettings,
    resetToDefaults 
  } = useSettingsStore();

  const handleNotificationToggle = (enabled) => {
    updateSetting('notifications.enabled', enabled);
  };

  const handleMultipleUpdates = () => {
    updateMultipleSettings({
      'interface.theme': 'dark',
      'notifications.sound': false,
      'privacy.lastSeen': 'contacts'
    });
  };

  return (
    <div>
      <h2>Paramètres</h2>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.enabled}
            onChange={(e) => handleNotificationToggle(e.target.checked)}
          />
          Activer les notifications
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={settings.notifications.sound}
            onChange={(e) => updateSetting('notifications.sound', e.target.checked)}
          />
          Son des notifications
        </label>
      </div>

      <button onClick={handleMultipleUpdates}>
        Appliquer le thème sombre
      </button>
      
      <button onClick={resetToDefaults}>
        Réinitialiser aux valeurs par défaut
      </button>
    </div>
  );
}
```

### 5. Store des Médias (`useMediaStore`)

```javascript
import { useMediaStore } from '@/stores';

function MediaComponent() {
  const { 
    media, 
    uploadMedia, 
    downloadMedia, 
    isUploading,
    uploadProgress 
  } = useMediaStore();

  const handleFileUpload = async (file) => {
    try {
      const mediaItem = await uploadMedia(file, {
        compress: true,
        quality: 'medium'
      });
      console.log('Média uploadé:', mediaItem);
    } catch (error) {
      console.error('Erreur upload:', error);
    }
  };

  const handleDownload = async (mediaId) => {
    try {
      await downloadMedia(mediaId);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        disabled={isUploading}
      />

      {isUploading && (
        <div>
          <p>Upload en cours: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100" />
        </div>
      )}

      <div>
        <h3>Images ({media.images.length})</h3>
        {media.images.map(img => (
          <div key={img.id}>
            <img src={img.url} alt={img.filename} style={{ width: 100 }} />
            <button onClick={() => handleDownload(img.id)}>
              Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Store des Notifications (`useNotificationStore`)

```javascript
import { useNotificationStore } from '@/stores';

function NotificationComponent() {
  const { 
    notifications, 
    addNotification, 
    markAsRead,
    requestPermission,
    testNotification 
  } = useNotificationStore();

  const handleTestNotification = () => {
    addNotification({
      title: 'Test',
      content: 'Ceci est une notification de test',
      category: 'system',
      priority: 'normal'
    });
  };

  const handlePermissionRequest = async () => {
    const granted = await requestPermission();
    if (granted) {
      console.log('Permission accordée pour les notifications');
    }
  };

  return (
    <div>
      <button onClick={handlePermissionRequest}>
        Demander la permission
      </button>
      
      <button onClick={handleTestNotification}>
        Tester une notification
      </button>

      <div>
        <h3>Notifications ({notifications.length})</h3>
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => markAsRead(notif.id)}
            style={{ 
              opacity: notif.isRead ? 0.5 : 1,
              cursor: 'pointer'
            }}
          >
            <h4>{notif.title}</h4>
            <p>{notif.content}</p>
            <small>{new Date(notif.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7. Store Principal (`useMainStore`)

```javascript
import { useMainStore } from '@/stores';

function AppComponent() {
  const { 
    appState, 
    syncState, 
    initializeApp, 
    startSync,
    exportData,
    importData 
  } = useMainStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const handleSync = async () => {
    try {
      await startSync();
    } catch (error) {
      console.error('Erreur synchronisation:', error);
    }
  };

  const handleExport = () => {
    exportData();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await importData(file);
        console.log('Données importées avec succès');
      } catch (error) {
        console.error('Erreur import:', error);
      }
    }
  };

  return (
    <div>
      <div>
        <p>État: {appState.isInitialized ? 'Initialisé' : 'Initialisation...'}</p>
        <p>Connecté: {appState.isOnline ? 'Oui' : 'Non'}</p>
        <p>Onglet actif: {appState.activeTab}</p>
      </div>

      <div>
        <button onClick={handleSync} disabled={syncState.isSyncing}>
          {syncState.isSyncing ? 'Synchronisation...' : 'Synchroniser'}
        </button>
        
        {syncState.isSyncing && (
          <progress value={syncState.syncProgress} max="100" />
        )}
      </div>

      <div>
        <button onClick={handleExport}>Exporter les données</button>
        <input
          type="file"
          accept=".json"
          onChange={handleImport}
        />
      </div>
    </div>
  );
}
```

## 🔄 Persistance et Synchronisation

### Persistance Locale

Tous les stores utilisent le middleware `persist` de Zustand pour sauvegarder automatiquement les données dans le localStorage.

```javascript
// Configuration de persistance
export const useAuthStore = create(
  persist(
    createAuthSlice,
    {
      name: 'whatsapp-auth-storage', // Clé dans localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Seules ces propriétés seront persistées
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken
      })
    }
  )
);
```

### Synchronisation avec le Serveur

```javascript
// Exemple de synchronisation
const syncWithServer = async () => {
  try {
    // Synchroniser l'authentification
    await useAuthStore.getState().checkAuthStatus();
    
    // Synchroniser les contacts
    await useUserStore.getState().syncContacts();
    
    // Synchroniser les conversations
    await useChatStore.getState().loadMessageHistory();
    
    console.log('Synchronisation terminée');
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
  }
};
```

## 🚀 Migration vers le Cloud

### Préparation

1. **API Endpoints** : Créer des endpoints REST pour chaque store
2. **Authentification** : Implémenter JWT ou OAuth
3. **Synchronisation** : Ajouter la logique de sync bidirectionnelle
4. **Gestion des conflits** : Implémenter la résolution de conflits

### Exemple de Migration

```javascript
// Avant (local uniquement)
const { addContact } = useUserStore();
addContact(contactData);

// Après (avec cloud)
const { addContact, syncContacts } = useUserStore();

const handleAddContact = async (contactData) => {
  try {
    // Ajouter localement
    const contact = addContact(contactData);
    
    // Synchroniser avec le serveur
    await syncContacts();
    
    return contact;
  } catch (error) {
    // Gérer l'erreur et potentiellement annuler l'ajout local
    console.error('Erreur lors de l\'ajout du contact:', error);
  }
};
```

## 📊 Gestion des Erreurs

```javascript
// Exemple de gestion d'erreur globale
import { useMainStore } from '@/stores';

function ErrorBoundary() {
  const { globalErrors, dismissError, removeError } = useMainStore();

  return (
    <div>
      {globalErrors.map(error => (
        <div key={error.id} className={`alert alert-${error.type}`}>
          <span>{error.message}</span>
          <button onClick={() => dismissError(error.id)}>
            Fermer
          </button>
          <button onClick={() => removeError(error.id)}>
            Supprimer
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🧪 Tests

### Test d'un Store

```javascript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/stores/authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
  });

  it('should login user', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

## 🔧 Configuration Avancée

### Middleware Personnalisé

```javascript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Middleware de logging
const logMiddleware = (config) => (set, get, api) => {
  const newSet = (...args) => {
    console.log('État précédent:', get());
    set(...args);
    console.log('Nouvel état:', get());
  };
  
  return config(newSet, get, api);
};

export const useCustomStore = create(
  logMiddleware(
    persist(
      createSlice,
      {
        name: 'custom-storage',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);
```

### DevTools

```javascript
import { devtools } from 'zustand/middleware';

export const useDevStore = create(
  devtools(
    persist(
      createSlice,
      { name: 'dev-storage' }
    ),
    { name: 'DevStore' }
  )
);
```

## 📝 Bonnes Pratiques

1. **Séparation des responsabilités** : Chaque store gère un domaine spécifique
2. **Actions atomiques** : Chaque action doit être indépendante et testable
3. **Gestion d'erreur** : Toujours gérer les erreurs et les états de chargement
4. **Persistance sélective** : Ne persister que les données nécessaires
5. **Performance** : Utiliser `partialize` pour éviter la persistance de données volumineuses
6. **Tests** : Tester chaque store individuellement

## 🔮 Évolutions Futures

- **IndexedDB** : Pour le stockage de gros volumes de données
- **Service Workers** : Pour la synchronisation en arrière-plan
- **WebRTC** : Pour la communication peer-to-peer
- **Chiffrement** : Pour la sécurité des données sensibles
- **Synchronisation temps réel** : Avec WebSockets ou Server-Sent Events

---

Ce système de stockage fournit une base solide et extensible pour votre application WhatsApp, avec une migration facile vers le cloud quand vous serez prêt ! 🚀
