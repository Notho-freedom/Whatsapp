# Système de Menus Contextuels Complet

## 🎯 Vue d'ensemble

Le système de menus contextuels a été entièrement refactorisé pour offrir une expérience native dans Electron et un fallback robuste dans le navigateur. Il gère toutes les actions possibles sur les messages WhatsApp avec des notifications intégrées.

## 🏗️ Architecture

### **1. Couche Electron (`electron/main.js`)**
```javascript
// Gestionnaire principal du menu contextuel
ipcMain.handle('show-context-menu', async (event, menuItems, x, y) => {
  // Création et affichage du menu natif
  const menu = Menu.buildFromTemplate(menuItems);
  return new Promise((resolve) => {
    menu.popup({ x, y }, () => resolve({ success: true }));
  });
});

// Gestionnaire des actions
ipcMain.handle('execute-context-menu-action', async (event, actionId, actionData) => {
  // Logique pour chaque action (reply, forward, copy, etc.)
});
```

### **2. Couche Preload (`electron/preload.js`)**
```javascript
// Exposition sécurisée des APIs
contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: (menuItems, x, y) => ipcRenderer.invoke('show-context-menu', menuItems, x, y),
  executeContextMenuAction: (actionId, actionData) => ipcRenderer.invoke('execute-context-menu-action', actionId, actionData),
  // ... autres APIs
});
```

### **3. Couche Utilitaires (`src/utils/electronUtils.js`)**
```javascript
// Fonctions principales
export const showContextMenu = async (menuItems, x, y) => {
  // Détection automatique Electron/Navigateur
  // Sérialisation intelligente
  // Fallback CSS pour le navigateur
};

export const createMessageMenuItems = (message, handlers, isMe) => {
  // Création dynamique des items selon le type de message
};
```

## 🎨 Fonctionnalités

### **Actions Disponibles**

#### **Actions de Base (Tous les Messages)**
- **Reply** : Répondre au message
- **Forward** : Transférer le message
- **Star** : Marquer comme favori
- **Pin** : Épingler le message

#### **Actions Spécifiques Texte**
- **Copy** : Copier le texte dans le presse-papiers

#### **Actions Spécifiques Médias**
- **View Media** : Afficher le média
- **Save Media** : Télécharger le média
- **Share Media** : Partager le média

#### **Actions Utilisateur**
- **Delete for me** : Supprimer le message (messages de l'utilisateur uniquement)

### **Notifications Intégrées**
```javascript
// Chaque action déclenche une notification
await showNotification('Copied', 'Message copié dans le presse-papiers');
await showNotification('Download', 'Média téléchargé');
await showNotification('Error', 'Erreur lors de l\'opération');
```

## 🔧 Utilisation

### **Dans MessageBubble.jsx**
```javascript
import { showContextMenu, createMessageMenuItems, showNotification } from '@/utils/electronUtils';

const MessageBubble = ({ message, isMe }) => {
  // Gestionnaires d'actions avec notifications
  const handleCopyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      await showNotification('Copied', 'Message copié dans le presse-papiers');
    } catch (error) {
      await showNotification('Error', 'Erreur lors de la copie');
    }
  }, []);

  // Affichage du menu contextuel
  const showNativeContextMenu = useCallback(async (e, messageData) => {
    e.preventDefault();
    
    const handlers = {
      handleReplyMessage,
      handleForwardMessage,
      handleCopyMessage,
      // ... autres handlers
    };
    
    const menuItems = createMessageMenuItems(messageData, handlers, isMe);
    const result = await showContextMenu(menuItems, e.clientX, e.clientY);
    
    if (result && result.success) {
      console.log('Menu contextuel affiché avec succès');
    }
  }, [isMe, handlers]);

  return (
    <div onContextMenu={(e) => showNativeContextMenu(e, message)}>
      {/* Contenu du message */}
    </div>
  );
};
```

## 🎨 Interface Utilisateur

### **Menu Electron Natif**
- **Apparence** : Menu système natif
- **Performance** : Optimale, pas de re-renders React
- **Accessibilité** : Support complet des raccourcis clavier

### **Menu CSS Fallback (Navigateur)**
```css
/* Style WhatsApp authentique */
background: #233138;
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 8px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
color: #d1d7db;
```

#### **Interactions**
- **Hover effects** : Changement de couleur au survol
- **Animations** : Transitions fluides
- **Fermeture** : Clic à l'extérieur ou sélection d'action
- **Positionnement** : Respect des coordonnées de clic

## 🔄 Flux de Fonctionnement

### **1. Déclenchement**
```javascript
// Clic droit ou long press sur mobile
onContextMenu={(e) => showNativeContextMenu(e, message)}
```

### **2. Création des Items**
```javascript
// Analyse du message et création dynamique
const menuItems = createMessageMenuItems(message, handlers, isMe);
```

### **3. Détection d'Environnement**
```javascript
// Vérification automatique Electron/Navigateur
if (isElectronAPI('showContextMenu')) {
  // Utilisation du menu natif
} else {
  // Création du menu CSS
}
```

### **4. Exécution des Actions**
```javascript
// Chaque action avec gestion d'erreur et notification
const result = await actionHandler(data);
await showNotification('Success', 'Action effectuée');
```

## 🛡️ Gestion d'Erreurs

### **Try-Catch Complet**
```javascript
try {
  const result = await showContextMenu(menuItems, x, y);
  if (result.success) {
    // Succès
  } else {
    // Erreur gérée
  }
} catch (error) {
  console.error('Erreur inattendue:', error);
  await showNotification('Error', 'Erreur système');
}
```

### **Fallbacks Robustes**
- **Electron indisponible** : Menu CSS automatique
- **API manquante** : Logs détaillés et fallback
- **Action échouée** : Notification d'erreur

## 📱 Support Mobile

### **Long Press Detection**
```javascript
const handleLongPressStart = useCallback(() => {
  longPressTimer.current = setTimeout(() => {
    showNativeContextMenu(event, message);
    if (navigator.vibrate) navigator.vibrate(50);
  }, 500);
}, []);
```

### **Touch Events**
- **Touch Start** : Démarrage du timer
- **Touch Move/Cancel** : Annulation du long press
- **Touch End** : Nettoyage du timer

## 🎯 Optimisations

### **Performance**
- **Memoization** : `useCallback` pour tous les handlers
- **Re-renders** : Optimisation avec `memo`
- **Memory** : Nettoyage automatique des timers

### **UX**
- **Feedback visuel** : Hover effects et animations
- **Feedback haptique** : Vibration sur mobile
- **Notifications** : Retour utilisateur immédiat

## 🔧 Configuration

### **Variables d'Environnement**
```javascript
// Développement
process.env.NODE_ENV === 'development' // Logs détaillés

// Production
process.env.NODE_ENV === 'production' // Logs minimaux
```

### **Personnalisation**
```javascript
// Ajout d'actions personnalisées
const customHandlers = {
  handleCustomAction: async (data) => {
    // Logique personnalisée
  }
};

const menuItems = createMessageMenuItems(message, { ...handlers, ...customHandlers }, isMe);
```

## 📊 Métriques

### **Logs de Débogage**
```javascript
// Développement uniquement
debugLog('Menu contextuel affiché', { x, y, items: menuItems.length });
debugLog('Action exécutée', { actionId, success: result.success });
```

### **Monitoring**
- **Succès/Échecs** : Tracking des actions
- **Performance** : Temps de réponse
- **Erreurs** : Détection et reporting

## 🚀 Avantages

### **Pour l'Utilisateur**
- **Expérience native** : Menus système dans Electron
- **Cohérence** : Même apparence dans tous les environnements
- **Feedback** : Notifications pour toutes les actions
- **Accessibilité** : Support complet des raccourcis

### **Pour le Développeur**
- **Maintenance** : Code centralisé et réutilisable
- **Débogage** : Logs détaillés et gestion d'erreurs
- **Extensibilité** : Ajout facile de nouvelles actions
- **Tests** : Fallbacks pour tous les environnements

Ce système offre une expérience utilisateur complète et professionnelle, identique à WhatsApp Desktop, avec une architecture robuste et maintenable.
