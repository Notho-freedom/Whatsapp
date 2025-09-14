# 🏗️ Architecture - WhatsApp Clone Electron

## 📋 Vue d'ensemble

L'application utilise une architecture moderne avec **React Context API** pour la gestion d'état centralisée, **Next.js 15** pour le frontend, et **Electron** pour l'application desktop.

## 🎯 Architecture Context API

### 📁 Structure des fichiers

```
src/
├── context/
│   └── AppContext.jsx          # Contexte principal de l'application
├── components/
│   ├── WhatsApp.jsx           # Composant principal
│   ├── Titlebar.jsx           # Barre de titre Electron
│   ├── Sidebar.jsx            # Barre latérale
│   ├── ChatList.jsx           # Liste des conversations
│   ├── ChatHeader.jsx         # En-tête de chat
│   ├── ChatBody.jsx           # Corps du chat
│   ├── ChatFooter.jsx         # Pied de chat
│   └── Message.jsx            # Composant de message
└── app/
    ├── layout.js              # Layout principal avec AppProvider
    └── page.js                # Page d'accueil
```

### 🔄 Flux de données

```
AppProvider (Context)
    ↓
WhatsApp (Composant principal)
    ↓
Composants enfants (ChatList, ChatBody, etc.)
    ↓
Actions → Reducer → État global
```

## 🎛️ Gestion d'état avec Context API

### 📊 État global

```javascript
const initialState = {
  loading: false,           // État de chargement
  error: null,             // Erreurs
  users: [],               // Liste des utilisateurs
  selectedChat: null,      // Chat sélectionné
  messages: {},            // Messages par chat
  searchQuery: '',         // Requête de recherche
  sidebarOpen: true,       // État de la sidebar
  activeTab: 'chats'       // Onglet actif
};
```

### ⚡ Actions disponibles

```javascript
// Actions de base
setLoading(loading)
setUsers(users)
setSelectedChat(chat)
addMessage(chatId, message)
setMessages(messages)
setError(error)

// Actions métier
sendMessage(chatId, text)      // Envoyer un message
selectChat(chat)               // Sélectionner un chat
updateUserStatus(userId, status)
setSearchQuery(query)
toggleSidebar()
setActiveTab(tab)
```

### 🔄 Reducer Pattern

```javascript
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.ADD_MESSAGE:
      // Logique pour ajouter un message
    // ... autres actions
  }
}
```

## 🌐 Intégration API

### 📡 Random User API

L'application utilise l'API **Random User** pour générer des données de test :

```javascript
// Endpoint
https://randomuser.me/api/?results=20&nat=fr,us,gb,ca,au

// Transformation des données
const transformedUsers = data.results.map(user => ({
  id: user.login.uuid,
  name: `${user.name.first} ${user.name.last}`,
  avatar: user.picture.medium,
  status: getRandomStatus(),
  lastMessage: getRandomLastMessage(),
  lastMessageTime: getRandomTime(),
  unreadCount: Math.floor(Math.random() * 5),
  online: Math.random() > 0.7,
  phone: user.phone,
  email: user.email
}));
```

### 🔄 Gestion des erreurs

```javascript
try {
  actions.setLoading(true);
  actions.setError(null);
  
  const response = await fetch('https://randomuser.me/api/?results=20');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des utilisateurs');
  }
  
  // Traitement des données...
  
} catch (error) {
  actions.setError(error.message);
} finally {
  actions.setLoading(false);
}
```

## 🎨 Composants et UI

### 🧩 Composants réutilisables

Chaque composant est conçu pour être :
- **Indépendant** : Peut fonctionner seul
- **Réutilisable** : Peut être utilisé ailleurs
- **Testable** : Facile à tester
- **Maintenable** : Code clair et documenté

### 🎯 Props et événements

```javascript
// Exemple de composant
<ChatList
  onChatSelect={handleChatSelect}    // Callback
  selectedChatId={selectedChat?.id}  // Props
/>

<ChatFooter
  selectedChat={selectedChat}        // Props
  onSendMessage={handleSendMessage}  // Callback
/>
```

## 🔌 Intégration Electron

### 🖥️ Processus principal

```javascript
// electron/main.js
const { app, BrowserWindow, Menu } = require('electron');

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
}
```

### 🔄 Communication IPC

```javascript
// Preload script
contextBridge.exposeInMainWorld('electronAPI', {
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // ... autres APIs
});
```

## 🚀 Avantages de cette architecture

### ✅ **Centralisation**
- Un seul point de vérité pour l'état
- Actions centralisées et réutilisables
- Gestion d'erreurs unifiée

### ✅ **Évolutivité**
- Facile d'ajouter de nouvelles fonctionnalités
- Structure modulaire
- Séparation claire des responsabilités

### ✅ **Maintenabilité**
- Code organisé et documenté
- Composants réutilisables
- Tests faciles à écrire

### ✅ **Performance**
- Re-renders optimisés
- État local quand nécessaire
- Chargement asynchrone

## 🔮 Intégration Backend Future

### 📡 Points d'intégration

1. **API Service Layer**
   ```javascript
   // services/api.js
   export const apiService = {
     getUsers: () => fetch('/api/users'),
     sendMessage: (chatId, message) => fetch('/api/messages', {
       method: 'POST',
       body: JSON.stringify({ chatId, message })
     }),
     // ...
   };
   ```

2. **WebSocket Integration**
   ```javascript
   // services/websocket.js
   export const wsService = {
     connect: () => new WebSocket('ws://localhost:3001'),
     sendMessage: (message) => socket.send(JSON.stringify(message)),
     // ...
   };
   ```

3. **Real-time Updates**
   ```javascript
   // Dans AppContext
   useEffect(() => {
     const socket = wsService.connect();
     socket.onmessage = (event) => {
       const data = JSON.parse(event.data);
       if (data.type === 'NEW_MESSAGE') {
         actions.addMessage(data.chatId, data.message);
       }
     };
   }, []);
   ```

## 🧪 Tests

### 📋 Tests unitaires

```javascript
// __tests__/AppContext.test.js
import { renderHook, act } from '@testing-library/react';
import { useAppContext, AppProvider } from '../context/AppContext';

test('should send message', () => {
  const { result } = renderHook(() => useAppContext(), {
    wrapper: AppProvider
  });
  
  act(() => {
    result.current.sendMessage('chat-1', 'Hello');
  });
  
  expect(result.current.messages['chat-1']).toHaveLength(1);
});
```

### 🔄 Tests d'intégration

```javascript
// __tests__/ChatFlow.test.js
test('should complete chat flow', async () => {
  // 1. Charger les utilisateurs
  // 2. Sélectionner un chat
  // 3. Envoyer un message
  // 4. Vérifier la réponse
});
```

## 📚 Ressources

- [React Context API](https://react.dev/reference/react/createContext)
- [Next.js 15](https://nextjs.org/docs)
- [Electron](https://www.electronjs.org/docs)
- [Random User API](https://randomuser.me/api/)

## 🎯 Prochaines étapes

1. **Backend Integration** : Remplacer l'API Random User par un vrai backend
2. **WebSocket** : Ajouter la communication en temps réel
3. **Persistence** : Sauvegarder les messages localement
4. **Notifications** : Notifications push Electron
5. **Tests** : Couverture de tests complète
