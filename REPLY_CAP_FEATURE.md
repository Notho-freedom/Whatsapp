# Fonctionnalité ReplyCap - Système de Réponse WhatsApp

## 🎯 Vue d'ensemble

La fonctionnalité **ReplyCap** permet aux utilisateurs de répondre à des messages spécifiques, créant une expérience de conversation plus organisée et contextuelle, identique à WhatsApp Desktop.

## 🏗️ Architecture

### **1. Composant ReplyCap (`src/components/chatBody/ReplyCap.jsx`)**
```javascript
const ReplyCap = memo(function ReplyCap({ replyTo, onCancelReply, isMobile }) {
  // Affiche la barre de réponse au-dessus du footer
});
```

### **2. État Global (`src/context/AppContext.jsx`)**
```javascript
// État pour le message auquel on répond
const initialState = {
  // ... autres états
  replyTo: null
};

// Actions pour gérer l'état de réponse
const ACTIONS = {
  SET_REPLY_TO: 'SET_REPLY_TO',
  CLEAR_REPLY_TO: 'CLEAR_REPLY_TO'
};
```

### **3. Intégration Footer (`src/components/ChatFooter.jsx`)**
```javascript
// Intégration de ReplyCap dans le footer
<ReplyCap 
  replyTo={replyTo}
  onCancelReply={handleCancelReply}
  isMobile={false}
/>
```

## 🎨 Interface Utilisateur

### **ReplyCap Design**
- **Position** : Au-dessus du footer de saisie
- **Style** : Barre horizontale avec ligne bleue verticale
- **Contenu** :
  - Icône de réponse (↩️)
  - Nom de l'expéditeur
  - Aperçu du message (texte tronqué)
  - Thumbnail pour les médias/liens
  - Bouton de fermeture (×)

### **Couleurs et Style**
```css
/* Ligne bleue verticale */
.reply-cap-line {
  background: #00a884;
}

/* Nom de l'expéditeur */
.reply-cap-sender {
  color: #00a884;
}

/* Aperçu du message */
.preview-text {
  color: #d1d7db;
}
```

## 🔄 Flux de Fonctionnement

### **1. Déclenchement**
```javascript
// Clic sur "Reply" dans le menu contextuel
const handleReplyMessage = useCallback(async (messageData) => {
  setReplyTo(messageData);
  showInfo('Reply', 'Réponse activée - tapez votre message');
}, [setReplyTo]);
```

### **2. Affichage de ReplyCap**
```javascript
// ReplyCap apparaît automatiquement quand replyTo n'est pas null
<ReplyCap 
  replyTo={replyTo}
  onCancelReply={handleCancelReply}
  isMobile={false}
/>
```

### **3. Saisie du Message**
```javascript
// Placeholder change pour indiquer qu'on répond
placeholder={replyTo ? "Reply to a message" : "Type a message"}
```

### **4. Envoi avec Réponse**
```javascript
const handleSubmit = (e) => {
  const messageData = {
    text: message,
    replyTo: replyTo
  };
  onSendMessage(messageData);
  clearReplyTo(); // Effacer l'état de réponse
};
```

### **5. Annulation**
```javascript
const handleCancelReply = () => {
  clearReplyTo();
};
```

## 📱 Fonctionnalités

### **Types de Messages Supportés**
- ✅ **Texte** : Aperçu du texte (tronqué à 50 caractères)
- ✅ **Images** : Thumbnail de l'image
- ✅ **Vidéos** : Icône 🎥 + aperçu
- ✅ **Audio** : Icône 🎵 + aperçu
- ✅ **Documents** : Icône 📄 + aperçu
- ✅ **Liens** : Thumbnail + aperçu du lien

### **Responsive Design**
- **Desktop** : Interface complète avec thumbnails
- **Mobile** : Interface adaptée avec tailles réduites
- **Tablet** : Adaptation automatique

### **Animations**
```css
@keyframes replyCapSlideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 🔧 Implémentation Technique

### **1. Gestion d'État**
```javascript
// Dans le contexte
const { replyTo, setReplyTo, clearReplyTo } = useAppContext();

// Définir le message auquel répondre
setReplyTo(messageData);

// Effacer l'état de réponse
clearReplyTo();
```

### **2. Création de Messages avec Réponse**
```javascript
const sendMessage = useCallback(async (chatId, text, replyTo = null) => {
  const message = createTextMessage(chatId, 'me', text.trim(), {
    replyTo: replyTo
  });
  actions.addMessage(chatId, message);
}, [createTextMessage, actions]);
```

### **3. Affichage des Messages avec Réponse**
```javascript
// Dans MessageBubble.jsx
{message.replyTo && (
  <div className="reply-preview">
    <div className="reply-sender">{getSenderName(message.replyTo)}</div>
    <div className="reply-text">{message.replyTo.text}</div>
  </div>
)}
```

## 🎯 Utilisation

### **Pour l'Utilisateur**
1. **Clic droit** sur un message
2. **Sélectionner "Reply"** dans le menu contextuel
3. **ReplyCap apparaît** au-dessus du footer
4. **Taper le message** de réponse
5. **Envoyer** - le message inclut la référence
6. **Annuler** en cliquant sur × si nécessaire

### **Pour le Développeur**
```javascript
// Importer les composants
import ReplyCap from './chatBody/ReplyCap';
import { useAppContext } from '@/context/AppContext';

// Utiliser dans un composant
const { replyTo, setReplyTo, clearReplyTo } = useAppContext();

// Définir une réponse
setReplyTo(messageData);

// Effacer une réponse
clearReplyTo();
```

## 🚀 Hot Reload Electron

### **Configuration**
```javascript
// Dans electron/main.js
if (isDev) {
  mainWindow.loadURL('http://localhost:3000');
  mainWindow.webContents.openDevTools();
  
  // Hot reload pour le développement
  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 1000);
  });
}
```

### **Scripts de Développement**
```json
{
  "scripts": {
    "dev": "next dev",
    "electron-dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "dev:electron": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\""
  }
}
```

### **Utilisation**
```bash
# Démarrer le développement avec hot reload
npm run electron-dev

# Ou
npm run dev:electron
```

## 🎯 Avantages

### **Pour l'Utilisateur**
- **Contexte clair** : Savoir à quel message on répond
- **Conversations organisées** : Réponses liées aux messages originaux
- **Interface intuitive** : Identique à WhatsApp Desktop
- **Feedback visuel** : ReplyCap avec aperçu du message

### **Pour le Développeur**
- **Code modulaire** : Composant ReplyCap réutilisable
- **État centralisé** : Gestion via AppContext
- **Hot reload** : Développement rapide avec Electron
- **Responsive** : Adaptation automatique aux écrans

## 📊 Tests

### **Tests Fonctionnels**
- ✅ **Affichage ReplyCap** : Apparaît quand on clique Reply
- ✅ **Aperçu message** : Texte tronqué correctement
- ✅ **Thumbnails médias** : Images, vidéos, audio
- ✅ **Annulation** : Bouton × fonctionne
- ✅ **Envoi avec réponse** : Message inclut la référence
- ✅ **Responsive** : Adaptation mobile/desktop

### **Tests de Performance**
- ✅ **Animation fluide** : Slide-in sans lag
- ✅ **Mémoire** : Pas de fuites lors de l'ouverture/fermeture
- ✅ **Re-renders** : Optimisation avec memo

## 🎯 Conclusion

La fonctionnalité **ReplyCap** offre une expérience de réponse complète et professionnelle, identique à WhatsApp Desktop, avec :

- ✅ **Interface parfaite** : Design et animations authentiques
- ✅ **Fonctionnalité complète** : Support de tous les types de messages
- ✅ **Hot reload** : Développement rapide avec Electron
- ✅ **Code maintenable** : Architecture modulaire et extensible
- ✅ **Performance optimisée** : Animations fluides et gestion mémoire

Le système est maintenant prêt pour la production avec une expérience utilisateur complète !
