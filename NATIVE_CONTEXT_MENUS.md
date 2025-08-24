# 🖱️ Menus Contextuels Natifs - WhatsApp Clone

## 🎯 Vue d'ensemble

Les **menus contextuels natifs** d'Electron offrent une expérience utilisateur native et performante, avec des menus qui s'adaptent automatiquement à la plateforme (Windows, macOS, Linux). Cette implémentation remplace les menus contextuels HTML par des menus natifs du système d'exploitation.

## 🚀 Fonctionnalités

### ✅ **Menus Natifs du Système**
- **Windows** : Style Windows 11/10 natif
- **macOS** : Style macOS natif avec raccourcis
- **Linux** : Style GTK/KDE natif
- **Adaptation automatique** selon la plateforme

### ✅ **Types de Menus Disponibles**
- **Message** : Actions sur les messages (répondre, transférer, copier, etc.)
- **Chat** : Actions sur les conversations (nouveau message, recherche, etc.)
- **Média** : Actions sur les fichiers (ouvrir, télécharger, partager, etc.)
- **Utilisateur** : Actions sur les profils (profil, message, appel, etc.)
- **Général** : Actions communes (couper, copier, coller, etc.)

### ✅ **Raccourcis Clavier Globaux**
- **Ctrl+N** : Nouveau chat
- **Ctrl+F** : Recherche
- **Ctrl+R** : Répondre
- **Ctrl+S** : Sauvegarder
- **Et bien d'autres...**

## 🛠️ Architecture Technique

### **Processus Principal (Electron)**
```javascript
// Définitions des menus contextuels
const contextMenus = {
  message: [
    { label: 'Répondre', id: 'reply', accelerator: 'CmdOrCtrl+R' },
    { label: 'Transférer', id: 'forward', accelerator: 'CmdOrCtrl+Shift+F' },
    // ... autres actions
  ]
};

// Création et affichage des menus
function createContextMenu(menuType, customItems = []) {
  const menu = Menu.buildFromTemplate(template);
  return menu;
}
```

### **Processus de Rendu (React)**
```javascript
// Hook pour les menus contextuels
const { handleContextMenu, executeAction } = useMessageContextMenu(onAction);

// Utilisation dans un composant
<button onContextMenu={(e) => handleContextMenu(e, { messageId: '123' })}>
  Clic droit pour menu
</button>
```

## 📱 Utilisation dans les Composants

### **1. Menu Contextuel de Message**
```javascript
import { useMessageContextMenu } from '@/hooks/useNativeContextMenu';

function MessageBubble({ message }) {
  const handleAction = (actionId, data) => {
    switch (actionId) {
      case 'reply':
        // Logique de réponse
        break;
      case 'forward':
        // Logique de transfert
        break;
      case 'copy':
        // Logique de copie
        break;
    }
  };

  const messageMenu = useMessageContextMenu(handleAction);

  return (
    <div onContextMenu={(e) => messageMenu.handleContextMenu(e, { 
      messageId: message.id, 
      text: message.text 
    })}>
      {message.text}
    </div>
  );
}
```

### **2. Menu Contextuel de Chat**
```javascript
import { useChatContextMenu } from '@/hooks/useNativeContextMenu';

function ChatItem({ chat }) {
  const handleAction = (actionId, data) => {
    switch (actionId) {
      case 'newMessage':
        // Créer un nouveau message
        break;
      case 'pinChat':
        // Épingler la conversation
        break;
      case 'archive':
        // Archiver la conversation
        break;
    }
  };

  const chatMenu = useChatContextMenu(handleAction);

  return (
    <div onContextMenu={(e) => chatMenu.handleContextMenu(e, { 
      chatId: chat.id, 
      name: chat.name 
    })}>
      {chat.name}
    </div>
  );
}
```

### **3. Menu Contextuel de Média**
```javascript
import { useMediaContextMenu } from '@/hooks/useNativeContextMenu';

function MediaItem({ media }) {
  const handleAction = (actionId, data) => {
    switch (actionId) {
      case 'download':
        // Télécharger le média
        break;
      case 'share':
        // Partager le média
        break;
      case 'open':
        // Ouvrir le média
        break;
    }
  };

  const mediaMenu = useMediaContextMenu(handleAction);

  return (
    <div onContextMenu={(e) => mediaMenu.handleContextMenu(e, { 
      mediaId: media.id, 
      url: media.url,
      type: media.type 
    })}>
      <img src={media.url} alt={media.name} />
    </div>
  );
}
```

## 🎨 Personnalisation des Menus

### **Ajouter des Éléments Personnalisés**
```javascript
const customItems = [
  {
    label: 'Action personnalisée',
    id: 'customAction',
    icon: '⭐'
  },
  { type: 'separator' },
  {
    label: 'Autre action',
    id: 'otherAction',
    icon: '🔧'
  }
];

const menu = useNativeContextMenu('message', customItems, handleAction);
```

### **Créer un Menu Complètement Personnalisé**
```javascript
const customMenu = useNativeContextMenu('general', [
  { label: 'Mon action', id: 'myAction' },
  { label: 'Mon autre action', id: 'myOtherAction' }
], handleAction);
```

## ⌨️ Raccourcis Clavier

### **Raccourcis Prédéfinis**
```javascript
// Raccourcis globaux automatiques
Ctrl+N    → Nouveau chat
Ctrl+F    → Recherche
Ctrl+R    → Répondre
Ctrl+S    → Sauvegarder
Ctrl+C    → Copier
Ctrl+V    → Coller
Ctrl+X    → Couper
Ctrl+A    → Sélectionner tout
Ctrl+Z    → Annuler
Ctrl+Shift+Z → Rétablir
```

### **Raccourcis Personnalisés**
```javascript
import { useGlobalShortcuts } from '@/hooks/useNativeContextMenu';

function MyComponent() {
  const { registerShortcut, unregisterShortcut } = useGlobalShortcuts();

  useEffect(() => {
    // Enregistrer un raccourci personnalisé
    const shortcutId = await registerShortcut('Ctrl+Shift+M', () => {
      console.log('Mon raccourci personnalisé !');
    });

    return () => {
      // Nettoyer le raccourci
      unregisterShortcut(shortcutId);
    };
  }, []);

  return <div>Mon composant</div>;
}
```

## 🔧 API Electron Exposée

### **Fonctions Principales**
```javascript
// Afficher un menu contextuel
window.electronAPI.showContextMenu(menuType, customItems, x, y)

// Exécuter une action
window.electronAPI.executeContextMenuAction(actionId, actionData)

// Écouter les actions
window.electronAPI.onContextMenuAction(callback)

// Raccourcis clavier
window.electronAPI.onKeyboardShortcut(callback)
```

### **Types et Actions Exposés**
```javascript
// Types de menus
window.contextMenuTypes.MESSAGE
window.contextMenuTypes.CHAT
window.contextMenuTypes.MEDIA
window.contextMenuTypes.USER
window.contextMenuTypes.GENERAL

// Actions prédéfinies
window.contextMenuActions.REPLY
window.contextMenuActions.FORWARD
window.contextMenuActions.COPY
window.contextMenuActions.DELETE
// ... et bien d'autres
```

## 📱 Support Mobile et Tactile

### **Gestes Tactiles**
```javascript
// Support du clic long sur mobile
const { handleLongPress } = useMessageContextMenu(handleAction);

return (
  <div onTouchStart={(e) => handleLongPress(e, { messageId: '123' })}>
    Contenu du message
  </div>
);
```

### **Adaptation Automatique**
- **Desktop** : Clic droit pour menu contextuel
- **Mobile** : Clic long pour menu contextuel
- **Tablet** : Support des deux méthodes

## 🚀 Optimisations et Performance

### **Avantages des Menus Natifs**
- **Performance** : Rendu par le système d'exploitation
- **Mémoire** : Pas de DOM supplémentaire
- **Accessibilité** : Support natif des lecteurs d'écran
- **Cohérence** : Style identique aux autres applications

### **Gestion des Événements**
```javascript
// Événements optimisés
window.addEventListener('native-context-menu-action', (event) => {
  console.log('Action reçue:', event.detail);
});

window.addEventListener('global-keyboard-shortcut', (event) => {
  console.log('Raccourci reçu:', event.detail.shortcut);
});
```

## 🧪 Tests et Débogage

### **Vérification de l'Environnement**
```javascript
// Vérifier si Electron est disponible
const isElectron = typeof window !== 'undefined' && window.electronAPI;

if (isElectron) {
  console.log('Menus contextuels natifs disponibles');
} else {
  console.log('Mode navigateur - menus HTML');
}
```

### **Logs et Débogage**
```javascript
// Activer les logs détaillés
const menu = useMessageContextMenu((actionId, data) => {
  console.log('Action exécutée:', actionId, data);
});
```

## 🔮 Évolutions Futures

### **Fonctionnalités à venir**
- [ ] Menus contextuels hiérarchiques
- [ ] Support des icônes personnalisées
- [ ] Thèmes de menus adaptatifs
- [ ] Intégration avec les préférences système

### **Améliorations techniques**
- [ ] Cache des menus pour de meilleures performances
- [ ] Support des menus contextuels 3D (futur)
- [ ] Intégration avec les gestes avancés

## 📚 Exemples Complets

### **Composant de Message avec Menu Contextuel**
```javascript
import React from 'react';
import { useMessageContextMenu } from '@/hooks/useNativeContextMenu';

export default function MessageWithContextMenu({ message }) {
  const handleMessageAction = (actionId, data) => {
    switch (actionId) {
      case 'reply':
        // Ouvrir la zone de réponse
        setReplyTo(message);
        break;
      case 'forward':
        // Ouvrir le sélecteur de chat pour le transfert
        setForwardTo(message);
        break;
      case 'copy':
        // Copier le texte du message
        navigator.clipboard.writeText(message.text);
        break;
      case 'pin':
        // Épingler le message
        pinMessage(message.id);
        break;
      case 'delete':
        // Supprimer le message
        deleteMessage(message.id);
        break;
      default:
        console.log('Action non reconnue:', actionId);
    }
  };

  const messageMenu = useMessageContextMenu(handleMessageAction);

  return (
    <div 
      className="message-bubble"
      onContextMenu={(e) => messageMenu.handleContextMenu(e, {
        messageId: message.id,
        text: message.text,
        timestamp: message.timestamp,
        sender: message.sender
      })}
    >
      <div className="message-content">
        {message.text}
      </div>
      <div className="message-meta">
        {message.timestamp}
      </div>
    </div>
  );
}
```

---

## 🎊 **Conclusion**

Les **menus contextuels natifs** d'Electron offrent une expérience utilisateur professionnelle et native, avec :

- ✅ **Performance optimale** : Rendu par le système d'exploitation
- ✅ **Cohérence visuelle** : Style identique aux autres applications
- ✅ **Accessibilité native** : Support des lecteurs d'écran
- ✅ **Raccourcis clavier** : Intégration avec le système
- ✅ **Support multi-plateforme** : Windows, macOS, Linux
- ✅ **Facilité d'utilisation** : Hooks React simples et intuitifs

Cette implémentation transforme votre application WhatsApp Clone en une **application desktop native** avec une expérience utilisateur de niveau professionnel ! 🚀💻
