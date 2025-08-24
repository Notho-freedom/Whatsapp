const { app, BrowserWindow, Menu, shell, ipcMain, dialog, Notification, protocol, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = true;

// Log pour déboguer
console.log('🔧 Mode de développement:', isDev);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

let mainWindow;

// Types de menus contextuels disponibles
const CONTEXT_MENU_TYPES = {
  MESSAGE: 'message',
  CHAT: 'chat',
  MEDIA: 'media',
  USER: 'user',
  GENERAL: 'general'
};

// Définitions des menus contextuels
const contextMenus = {
  [CONTEXT_MENU_TYPES.MESSAGE]: [
    {
      label: 'Répondre',
      id: 'reply',
      accelerator: 'CmdOrCtrl+R',
      icon: '💬'
    },
    {
      label: 'Transférer',
      id: 'forward',
      accelerator: 'CmdOrCtrl+Shift+F',
      icon: '↗️'
    },
    { type: 'separator' },
    {
      label: 'Copier',
      id: 'copy',
      accelerator: 'CmdOrCtrl+C',
      icon: '📋'
    },
    {
      label: 'Sélectionner tout',
      id: 'selectAll',
      accelerator: 'CmdOrCtrl+A',
      icon: '☑️'
    },
    { type: 'separator' },
    {
      label: 'Épingler',
      id: 'pin',
      icon: '📌'
    },
    {
      label: 'Marquer comme important',
      id: 'markImportant',
      icon: '⭐'
    },
    { type: 'separator' },
    {
      label: 'Supprimer',
      id: 'delete',
      accelerator: 'Delete',
      icon: '🗑️'
    }
  ],

  [CONTEXT_MENU_TYPES.CHAT]: [
    {
      label: 'Nouveau message',
      id: 'newMessage',
      accelerator: 'CmdOrCtrl+N',
      icon: '✏️'
    },
    {
      label: 'Rechercher',
      id: 'search',
      accelerator: 'CmdOrCtrl+F',
      icon: '🔍'
    },
    { type: 'separator' },
    {
      label: 'Épingler la conversation',
      id: 'pinChat',
      icon: '📌'
    },
    {
      label: 'Marquer comme non lu',
      id: 'markUnread',
      icon: '🔴'
    },
    {
      label: 'Archiver',
      id: 'archive',
      icon: '📁'
    },
    { type: 'separator' },
    {
      label: 'Supprimer la conversation',
      id: 'deleteChat',
      icon: '🗑️'
    },
    {
      label: 'Bloquer',
      id: 'block',
      icon: '🚫'
    }
  ],

  [CONTEXT_MENU_TYPES.MEDIA]: [
    {
      label: 'Ouvrir',
      id: 'open',
      accelerator: 'Enter',
      icon: '👁️'
    },
    {
      label: 'Télécharger',
      id: 'download',
      accelerator: 'CmdOrCtrl+S',
      icon: '💾'
    },
    {
      label: 'Partager',
      id: 'share',
      icon: '📤'
    },
    { type: 'separator' },
    {
      label: 'Copier le lien',
      id: 'copyLink',
      icon: '🔗'
    },
    {
      label: 'Ouvrir dans le navigateur',
      id: 'openInBrowser',
      icon: '🌐'
    },
    { type: 'separator' },
    {
      label: 'Supprimer',
      id: 'deleteMedia',
      icon: '🗑️'
    }
  ],

  [CONTEXT_MENU_TYPES.USER]: [
    {
      label: 'Voir le profil',
      id: 'viewProfile',
      icon: '👤'
    },
    {
      label: 'Envoyer un message',
      id: 'sendMessage',
      icon: '💬'
    },
    {
      label: 'Appeler',
      id: 'call',
      icon: '📞'
    },
    {
      label: 'Appel vidéo',
      id: 'videoCall',
      icon: '📹'
    },
    { type: 'separator' },
    {
      label: 'Ajouter aux contacts',
      id: 'addToContacts',
      icon: '➕'
    },
    {
      label: 'Bloquer',
      id: 'blockUser',
      icon: '🚫'
    }
  ],

  [CONTEXT_MENU_TYPES.GENERAL]: [
    {
      label: 'Couper',
      id: 'cut',
      accelerator: 'CmdOrCtrl+X',
      icon: '✂️'
    },
    {
      label: 'Copier',
      id: 'copy',
      accelerator: 'CmdOrCtrl+C',
      icon: '📋'
    },
    {
      label: 'Coller',
      id: 'paste',
      accelerator: 'CmdOrCtrl+V',
      icon: '📋'
    },
    { type: 'separator' },
    {
      label: 'Sélectionner tout',
      id: 'selectAll',
      accelerator: 'CmdOrCtrl+A',
      icon: '☑️'
    },
    {
      label: 'Annuler',
      id: 'undo',
      accelerator: 'CmdOrCtrl+Z',
      icon: '↶'
    },
    {
      label: 'Rétablir',
      id: 'redo',
      accelerator: 'CmdOrCtrl+Shift+Z',
      icon: '↷'
    }
  ]
};

// Créer un menu contextuel natif
function createContextMenu(menuType, customItems = []) {
  const menuTemplate = contextMenus[menuType] || [];
  
  // Ajouter les éléments personnalisés
  const fullTemplate = [...menuTemplate, ...customItems];
  
  // Convertir le template en menu Electron
  const menu = Menu.buildFromTemplate(fullTemplate.map(item => {
    if (item.type === 'separator') {
      return { type: 'separator' };
    }
    
    return {
      label: item.label,
      id: item.id,
      accelerator: item.accelerator,
      click: () => {
        // Émettre l'action vers le processus de rendu
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('context-menu-action', {
            actionId: item.id,
            menuType: menuType,
            timestamp: Date.now()
          });
        }
      }
    };
  }));
  
  return menu;
}

function createWindow() {
  console.log('🚀 Création de la fenêtre Electron...');
  
  // Créer la fenêtre du navigateur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#121212',
    autoHideMenuBar: true,
    frame: false,
  });

  // Charger l'application
  if (isDev) {
    console.log('🌐 Mode développement: Chargement depuis http://localhost:3000');
    // En mode développement, charger depuis le serveur Next.js
    mainWindow.loadURL('http://localhost:3000');
    
    // Ouvrir les outils de développement
    mainWindow.webContents.openDevTools();
    
    // Hot reload pour le développement
    mainWindow.webContents.on('did-fail-load', () => {
      console.log('Page failed to load, retrying...');
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 1000);
    });
    
    // Recharger automatiquement quand le serveur de développement redémarre
    let reloadTimer = null;
    const checkDevServer = async () => {
      try {
        const response = await fetch('http://localhost:3000');
        if (response.ok) {
          // Le serveur est disponible, on peut arrêter de vérifier
          if (reloadTimer) {
            clearInterval(reloadTimer);
            reloadTimer = null;
          }
        }
      } catch (error) {
        // Le serveur n'est pas disponible, on continue de vérifier
        console.log('Dev server not ready, retrying...');
      }
    };
    
    // Vérifier le serveur toutes les 2 secondes
    reloadTimer = setInterval(checkDevServer, 2000);
    
    // Nettoyer le timer quand la fenêtre se ferme
    mainWindow.on('closed', () => {
      if (reloadTimer) {
        clearInterval(reloadTimer);
      }
    });
  } else {
    console.log('📦 Mode production: Chargement depuis les fichiers buildés');
    // En production, charger depuis les fichiers buildés
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }
  
  mainWindow.removeMenu();
  mainWindow.setMenuBarVisibility(false);
  mainWindow.setTitle('WhatsApp Clone');
  mainWindow.setResizable(true);
  mainWindow.setMovable(true);

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Fenêtre prête à être affichée');
    mainWindow.show();
    
    // Focus sur la fenêtre
    mainWindow.focus();
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Gérer les raccourcis clavier globaux
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Raccourcis clavier globaux
    if (input.control || input.meta) {
      switch (input.key.toLowerCase()) {
        case 'n':
          // Nouveau chat
          mainWindow.webContents.send('keyboard-shortcut', 'new-chat');
          break;
        case 'f':
          // Recherche
          mainWindow.webContents.send('keyboard-shortcut', 'search');
          break;
        case 'r':
          // Répondre
          mainWindow.webContents.send('keyboard-shortcut', 'reply');
          break;
        case 's':
          // Sauvegarder
          mainWindow.webContents.send('keyboard-shortcut', 'save');
          break;
      }
    }
  });
}

// Gérer l'affichage des menus contextuels
ipcMain.handle('show-context-menu', async (event, menuType, customItems = [], x, y) => {
  try {
    console.log(`Affichage du menu contextuel: ${menuType}`);
    
    const menu = createContextMenu(menuType, customItems);
    
    // Afficher le menu à la position spécifiée ou à la position du curseur
    if (x !== undefined && y !== undefined) {
      menu.popup({ x: Math.round(x), y: Math.round(y) });
  } else {
      menu.popup();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'affichage du menu contextuel:', error);
    return { success: false, error: error.message };
  }
});

// Gérer les actions des menus contextuels
ipcMain.handle('execute-context-menu-action', async (event, actionId, actionData) => {
  try {
    console.log(`Exécution de l'action: ${actionId}`, actionData);
    
    switch (actionId) {
      case 'copy':
        if (actionData.text) {
          clipboard.writeText(actionData.text);
          return { success: true, message: 'Texte copié' };
        }
        break;
        
      case 'copyLink':
        if (actionData.url) {
          clipboard.writeText(actionData.url);
          return { success: true, message: 'Lien copié' };
        }
        break;
        
      case 'download':
        if (actionData.media) {
          return await handleMediaDownload(actionData.media);
        }
        break;
        
      case 'open':
        if (actionData.media) {
          return await handleMediaView(actionData.media);
        }
        break;
        
      case 'share':
        if (actionData.media) {
          return await handleMediaShare(actionData.media);
        }
        break;
        
      case 'delete':
        // Logique de suppression
        return { success: true, message: 'Élément supprimé' };
        
      case 'pin':
        // Logique d'épinglage
        return { success: true, message: 'Élément épinglé' };
        
      default:
        // Action non reconnue, laisser le processus de rendu la gérer
        return { success: true, actionId, actionData };
    }
    
    return { success: false, message: 'Action non supportée' };
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error);
    return { success: false, error: error.message };
  }
});

// Gérer le téléchargement de médias
async function handleMediaDownload(media) {
  try {
    console.log('Téléchargement du média:', media);
    
    if (!media.url) {
      return { success: false, message: 'URL du média non disponible' };
    }
    
    // Ouvrir la boîte de dialogue de sauvegarde
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Sauvegarder le média',
      defaultPath: media.filename || 'media',
      filters: [
        { name: 'Tous les fichiers', extensions: ['*'] }
      ]
    });
    
    if (result.canceled) {
      return { success: false, message: 'Téléchargement annulé' };
    }
    
    // Ici vous pouvez implémenter la logique de téléchargement
    // Pour l'instant, on retourne un succès
    return { success: true, message: 'Média téléchargé', path: result.filePath };
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return { success: false, error: error.message };
  }
}

// Gérer l'affichage de médias
async function handleMediaView(media) {
  try {
    console.log('Affichage du média:', media);
    
    if (media.url) {
      await shell.openExternal(media.url);
      return { success: true, message: 'Média ouvert' };
    }
    
    return { success: false, message: 'URL du média non disponible' };
  } catch (error) {
    console.error('Erreur lors de l\'affichage:', error);
    return { success: false, error: error.message };
  }
}

// Gérer le partage de médias
async function handleMediaShare(media) {
  try {
    console.log('Partage du média:', media);
    
    if (media.url) {
      // Copier l'URL dans le presse-papiers
      clipboard.writeText(media.url);
      return { success: true, message: 'Lien copié dans le presse-papiers' };
    }
    
    return { success: false, message: 'URL du média non disponible' };
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    return { success: false, error: error.message };
  }
}

// Gestionnaires IPC pour la compatibilité
ipcMain.handle('show-notification', async (event, title, body, options = {}) => {
  try {
    // Créer une notification native avec options avancées
    const notification = new Notification({
      title,
      body,
      icon: options.icon || undefined,
      silent: options.silent || false,
      timeoutType: options.timeout ? 'default' : 'never',
      actions: options.actions || [],
      closeButtonText: 'Fermer',
      subtitle: options.subtitle || undefined,
      urgency: options.urgency || 'normal' // 'low', 'normal', 'critical'
    });

    // Gérer les clics sur les actions
    if (options.actions && options.actions.length > 0) {
      notification.on('action', (event, index) => {
        const action = options.actions[index];
        if (action && action.action) {
          // Émettre un événement pour informer le renderer
          mainWindow.webContents.send('notification-action-clicked', {
            action: action.action,
            data: action.data || {}
          });
        }
      });
    }

    // Gérer le clic sur la notification
    notification.on('click', () => {
      // Focus sur la fenêtre principale
      if (mainWindow) {
        mainWindow.focus();
      }
      
      // Émettre un événement pour informer le renderer
      mainWindow.webContents.send('notification-clicked', {
        title,
        body,
        action: 'clicked'
      });
    });

    // Gérer la fermeture de la notification
    notification.on('close', () => {
      // Émettre un événement pour informer le renderer
      mainWindow.webContents.send('notification-closed', {
        title,
        body,
        action: 'closed'
      });
    });

    // Afficher la notification
    notification.show();

    // Auto-fermeture si un timeout est spécifié
    if (options.timeout && typeof options.timeout === 'number') {
      setTimeout(() => {
        notification.close();
      }, options.timeout);
    }

    console.log('Notification native affichée:', { title, body, options });
    return { success: true, notificationId: Date.now() };
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la notification:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

ipcMain.handle('get-preferences', () => {
  // Retourner les préférences par défaut
  return {
    theme: 'dark',
    language: 'fr',
    notifications: true
  };
});

ipcMain.handle('set-preferences', async (event, preferences) => {
  try {
    // Ici vous pouvez sauvegarder les préférences
    console.log('Préférences mises à jour:', preferences);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file-dialog', async () => {
  try {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'Tous les fichiers', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du dialogue de fichier:', error);
    return null;
  }
});

ipcMain.handle('save-file-dialog', async (event, data) => {
  try {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Fichiers texte', extensions: ['txt'] },
      { name: 'Tous les fichiers', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled) {
    fs.writeFileSync(result.filePath, data);
    return result.filePath;
  }
  return null;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du fichier:', error);
    return null;
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du lien externe:', error);
    return { success: false, error: error.message };
  }
});

// Événements de l'application
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});
