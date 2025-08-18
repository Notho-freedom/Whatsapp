# Utilitaires Electron - Guide d'Utilisation

## Vue d'ensemble

Le fichier `src/utils/electronUtils.js` fournit une couche d'abstraction pour l'intégration Electron avec des fallbacks pour le navigateur web. Cela permet d'utiliser les mêmes fonctions dans les deux environnements.

## Fonctions Disponibles

### 🔍 **Détection d'Environnement**

```javascript
import { isElectron, isElectronAPI } from '@/utils/electronUtils';

// Vérifier si nous sommes dans Electron
const isElectronEnv = isElectron(); // true/false

// Vérifier si une API spécifique est disponible
const hasContextMenu = isElectronAPI('showContextMenu'); // true/false
```

### 🎯 **Menus Contextuels**

```javascript
import { showContextMenu, createMessageMenuItems } from '@/utils/electronUtils';

// Afficher un menu contextuel
const menuItems = [
  { label: 'Action 1', click: () => console.log('Action 1') },
  { type: 'separator' },
  { label: 'Action 2', click: () => console.log('Action 2') }
];

await showContextMenu(menuItems, x, y);

// Créer des items de menu pour les messages
const handlers = {
  handleReplyMessage: (message) => console.log('Reply', message),
  handleForwardMessage: (message) => console.log('Forward', message),
  handleCopyMessage: (text) => navigator.clipboard.writeText(text),
  handleViewMedia: (media) => console.log('View', media),
  handleSaveMedia: (media) => console.log('Save', media),
  handleShareMedia: (media) => console.log('Share', media),
  handleStarMessage: (message) => console.log('Star', message),
  handlePinMessage: (message) => console.log('Pin', message),
  handleDeleteMessage: (message) => console.log('Delete', message)
};

const menuItems = createMessageMenuItems(message, handlers, isMe);
```

### 📁 **Gestion des Médias**

```javascript
import { downloadMedia, viewMedia, shareMedia } from '@/utils/electronUtils';

// Télécharger un média
const media = { url: 'https://example.com/image.jpg', type: 'image' };
const result = await downloadMedia(media);

if (result.success) {
  console.log('Média téléchargé:', result.path);
} else {
  console.error('Erreur:', result.error);
}

// Voir un média
const viewResult = await viewMedia(media);

// Partager un média
const shareResult = await shareMedia(media);
```

### 🔔 **Notifications**

```javascript
import { showNotification } from '@/utils/electronUtils';

// Afficher une notification
await showNotification('Titre', 'Message de la notification');
```

### ℹ️ **Informations Système**

```javascript
import { getAppVersion, getPlatform } from '@/utils/electronUtils';

// Obtenir la version de l'application
const version = await getAppVersion(); // "1.0.0" ou "Web Browser"

// Obtenir la plateforme
const platform = await getPlatform(); // "win32", "darwin", "linux" ou "web"
```

## Utilisation dans les Composants

### Exemple avec MessageBubble

```javascript
import { showContextMenu, createMessageMenuItems } from '@/utils/electronUtils';

const MessageBubble = ({ message, isMe }) => {
  // Gestionnaires d'actions
  const handlers = {
    handleReplyMessage: (message) => console.log('Reply', message),
    handleForwardMessage: (message) => console.log('Forward', message),
    handleCopyMessage: (text) => navigator.clipboard.writeText(text),
    handleViewMedia: async (media) => {
      const result = await viewMedia(media);
      if (result.success) {
        console.log('Média affiché');
      }
    },
    handleSaveMedia: async (media) => {
      const result = await downloadMedia(media);
      if (result.success) {
        console.log('Média sauvegardé:', result.path);
      }
    },
    handleShareMedia: async (media) => {
      const result = await shareMedia(media);
      if (result.success) {
        console.log('Média partagé');
      }
    },
    handleStarMessage: (message) => console.log('Star', message),
    handlePinMessage: (message) => console.log('Pin', message),
    handleDeleteMessage: (message) => console.log('Delete', message)
  };

  // Fonction pour afficher le menu contextuel
  const showMenu = async (e) => {
    e.preventDefault();
    
    const menuItems = createMessageMenuItems(message, handlers, isMe);
    await showContextMenu(menuItems, e.clientX, e.clientY);
  };

  return (
    <div onContextMenu={showMenu}>
      {/* Contenu du message */}
    </div>
  );
};
```

## Fallbacks pour le Navigateur

### Comportement par Défaut

Quand les fonctions Electron ne sont pas disponibles :

- **Menus contextuels** : Log dans la console
- **Téléchargement de médias** : Ouverture dans un nouvel onglet
- **Affichage de médias** : Ouverture dans un nouvel onglet
- **Partage de médias** : Copie de l'URL dans le presse-papiers
- **Notifications** : Utilisation de l'API Notifications du navigateur

### Exemple de Fallback

```javascript
// Dans le navigateur
const result = await downloadMedia({ url: 'https://example.com/image.jpg' });
// Résultat: { success: true, message: 'Ouvert dans un nouvel onglet' }

// Dans Electron
const result = await downloadMedia({ url: 'https://example.com/image.jpg' });
// Résultat: { success: true, path: '/path/to/downloaded/file.jpg' }
```

## Gestion d'Erreurs

### Try-Catch avec Fallback

```javascript
import { showContextMenu, isElectron } from '@/utils/electronUtils';

const handleContextMenu = async (e) => {
  try {
    if (isElectron()) {
      // Utiliser le menu contextuel natif
      await showContextMenu(menuItems, e.clientX, e.clientY);
    } else {
      // Fallback pour le navigateur
      console.log('Menu contextuel non disponible');
    }
  } catch (error) {
    console.error('Erreur lors de l\'affichage du menu:', error);
    // Gérer l'erreur de manière appropriée
  }
};
```

## Débogage

### Logs de Développement

```javascript
import { debugLog } from '@/utils/electronUtils';

// Logger des informations de débogage (seulement en développement)
debugLog('Menu contextuel affiché', { x: 100, y: 200 });
```

### Vérification des APIs

```javascript
import { isElectronAPI } from '@/utils/electronUtils';

// Vérifier les APIs disponibles
const availableAPIs = [
  'showContextMenu',
  'downloadMedia',
  'viewMedia',
  'shareMedia',
  'showNotification'
].filter(api => isElectronAPI(api));

console.log('APIs disponibles:', availableAPIs);
```

## Bonnes Pratiques

### 1. **Toujours utiliser les fonctions utilitaires**

❌ **Incorrect**
```javascript
if (window.electronAPI) {
  window.electronAPI.showContextMenu(menuItems, x, y);
}
```

✅ **Correct**
```javascript
import { showContextMenu } from '@/utils/electronUtils';
await showContextMenu(menuItems, x, y);
```

### 2. **Gérer les erreurs**

```javascript
const handleAction = async () => {
  try {
    const result = await downloadMedia(media);
    if (result.success) {
      console.log('Succès:', result.message);
    } else {
      console.error('Erreur:', result.error);
    }
  } catch (error) {
    console.error('Erreur inattendue:', error);
  }
};
```

### 3. **Utiliser les types appropriés**

```javascript
// Pour les médias
const media = {
  url: 'https://example.com/image.jpg',
  type: 'image',
  filename: 'image.jpg',
  size: 1024
};

// Pour les items de menu
const menuItem = {
  label: 'Action',
  click: () => console.log('Action'),
  type: 'separator' // optionnel
};
```

## Intégration avec TypeScript

Si vous utilisez TypeScript, vous pouvez ajouter des types :

```typescript
interface Media {
  url: string;
  type: 'image' | 'video' | 'audio';
  filename?: string;
  size?: number;
}

interface MenuItem {
  label: string;
  click: () => void;
  type?: 'separator';
}

interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  path?: string;
}
```

Cette approche garantit une intégration Electron robuste avec des fallbacks appropriés pour le navigateur web.
