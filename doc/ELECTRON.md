# WhatsApp Clone - Application Desktop avec Electron

## 🚀 Démarrage rapide

### Mode développement
```bash
# Démarrer l'application en mode développement
npm run electron-dev
```

### Mode production
```bash
# Construire l'application
npm run build

# Lancer l'application Electron
npm run electron
```

### Créer un exécutable
```bash
# Créer un installateur pour Windows
npm run dist
```

## 📁 Structure des fichiers

```
electron/
├── main.js          # Processus principal d'Electron
└── preload.js       # Script de préchargement sécurisé

public/
├── favicon.ico      # Icône de l'application
└── icon.ico         # Icône pour l'installateur
```

## 🎯 Fonctionnalités

### Interface native
- ✅ Menu d'application complet
- ✅ Raccourcis clavier
- ✅ Gestion des fenêtres
- ✅ Notifications système

### Sécurité
- ✅ Isolation du contexte
- ✅ Préchargement sécurisé
- ✅ Pas d'intégration Node.js dans le rendu
- ✅ Gestion sécurisée des liens externes

### APIs disponibles
- `electronAPI.showNotification()` - Afficher des notifications
- `electronAPI.openFileDialog()` - Ouvrir des fichiers
- `electronAPI.saveFileDialog()` - Sauvegarder des fichiers
- `electronAPI.minimizeWindow()` - Réduire la fenêtre
- `electronAPI.maximizeWindow()` - Maximiser la fenêtre
- `electronAPI.closeWindow()` - Fermer la fenêtre

## 🔧 Configuration

### Scripts disponibles
- `npm run electron-dev` - Développement avec hot reload
- `npm run electron` - Lancer l'application
- `npm run electron-pack` - Construire l'application
- `npm run dist` - Créer un installateur

### Variables d'environnement
- `NODE_ENV=development` - Mode développement
- `NODE_ENV=production` - Mode production

## 📦 Distribution

### Windows
- Installateur NSIS
- Raccourcis bureau et menu démarrer
- Désinstallation propre

### macOS
- Application .app
- Code signé (optionnel)
- Notarisation (optionnel)

### Linux
- AppImage
- Package .deb
- Support des distributions populaires

## 🛠️ Développement

### Ajouter des fonctionnalités natives
1. Modifier `electron/main.js` pour ajouter des gestionnaires IPC
2. Mettre à jour `electron/preload.js` pour exposer les APIs
3. Utiliser les APIs dans vos composants React

### Personnalisation
- Modifier `package.json` pour changer le nom et l'icône
- Ajuster les paramètres de build dans la section `build`
- Personnaliser le menu dans `createMenu()`

## 🐛 Dépannage

### Problèmes courants
- **Port 3000 occupé** : Arrêter le serveur Next.js et relancer
- **Erreurs de build** : Vérifier que Next.js est configuré pour l'export statique
- **Fenêtre blanche** : Vérifier les logs dans les outils de développement

### Logs
- Mode développement : Outils de développement automatiques
- Mode production : `Ctrl+Shift+I` pour ouvrir les outils

## 📝 Notes

- L'application utilise Next.js avec export statique
- Toutes les fonctionnalités web sont préservées
- Sécurité renforcée avec isolation du contexte
- Support complet des raccourcis clavier natifs
