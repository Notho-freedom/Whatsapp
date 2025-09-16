# Intégration Electron pour les Menus Contextuels Natifs

## Vue d'ensemble

Le système de messages a été modifié pour utiliser des menus contextuels natifs d'Electron au lieu de dropdowns personnalisés. Cela offre une expérience plus native et des performances améliorées.

## Fonctionnalités

### Options de Base (Tous les Messages)
- **Reply** : Répondre au message
- **Forward** : Transférer le message
- **Star Message** : Marquer comme favori
- **Pin Message** : Épingler le message

### Options Spécifiques aux Messages Texte
- **Copy** : Copier le texte du message

### Options Spécifiques aux Médias
- **View Media** : Voir le média en plein écran
- **Save Media** : Télécharger le média
- **Share Media** : Partager le média

### Options de Suppression
- **Delete for me** : Supprimer le message (uniquement pour les messages de l'utilisateur)

## Intégration Electron

### Prérequis

Pour que les menus contextuels natifs fonctionnent, vous devez exposer l'API Electron dans le processus principal :

```javascript
// main.js
const { ipcMain, Menu } = require('electron');

// Exposer l'API pour les menus contextuels
ipcMain.handle('show-context-menu', async (event, menuItems, x, y) => {
  const menu = Menu.buildFromTemplate(menuItems);
  return new Promise((resolve) => {
    menu.popup({ x, y }, () => {
      resolve();
    });
  });
});

// Exposer l'API pour le téléchargement de médias
ipcMain.handle('download-media', async (event, media) => {
  // Implémenter la logique de téléchargement
  console.log('Downloading media:', media);
});
```

### Préchargement (preload.js)

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: (menuItems, x, y) => ipcRenderer.invoke('show-context-menu', menuItems, x, y),
  downloadMedia: (media) => ipcRenderer.invoke('download-media', media)
});
```

## Utilisation

### Déclenchement du Menu

Le menu contextuel peut être déclenché de deux façons :

1. **Clic droit** sur un message (desktop)
2. **Long press** sur un message (mobile)
3. **Clic sur le chevron** qui apparaît au survol (desktop)

### Structure des Données

```javascript
const menuItems = [
  { label: 'Reply', click: () => handleReply(message) },
  { label: 'Forward', click: () => handleForward(message) },
  { type: 'separator' },
  { label: 'Copy', click: () => handleCopy(message.text) },
  { type: 'separator' },
  { label: 'View Media', click: () => handleViewMedia(message.media) },
  { label: 'Save Media', click: () => handleSaveMedia(message.media) },
  { label: 'Share Media', click: () => handleShareMedia(message.media) },
  { type: 'separator' },
  { label: 'Star Message', click: () => handleStar(message) },
  { label: 'Pin Message', click: () => handlePin(message) },
  { type: 'separator' },
  { label: 'Delete for me', click: () => handleDelete(message) }
];
```

## Avantages

### Performance
- **Rendu natif** : Utilise les composants natifs du système d'exploitation
- **Pas de re-renders** : Évite les re-renders React inutiles
- **Mémoire optimisée** : Pas de composants DOM supplémentaires

### UX
- **Cohérence native** : Apparence et comportement identiques aux autres applications
- **Accessibilité** : Support natif des lecteurs d'écran et raccourcis clavier
- **Animations fluides** : Animations système optimisées

### Fonctionnalités
- **Options contextuelles** : Menu adapté au type de contenu
- **Actions natives** : Intégration avec le système de fichiers
- **Partage système** : Utilisation des APIs de partage natives

## Fallback

Si l'API Electron n'est pas disponible (navigateur web), le système affiche un message dans la console et continue de fonctionner normalement.

## Développement

Pour tester en mode développement :

1. **Avec Electron** : Les menus contextuels natifs fonctionnent
2. **Dans le navigateur** : Les actions sont loggées dans la console

## Personnalisation

Vous pouvez facilement ajouter de nouvelles options en modifiant la fonction `showNativeContextMenu` dans `MessageBubble.jsx`.
