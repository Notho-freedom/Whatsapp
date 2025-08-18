const { app, BrowserWindow, Menu, shell, ipcMain, dialog, Notification, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// Log pour déboguer
console.log('🔧 Mode de développement:', isDev);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

let mainWindow;

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
    console.log('🔒 Fenêtre fermée');
    mainWindow = null;
  });

  // Empêcher la navigation vers des URLs externes
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Gérer les nouvelles fenêtres
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Bloquer les requêtes 404 de manière plus efficace
  mainWindow.webContents.session.webRequest.onBeforeRequest(
    { urls: ['*://*/*'] },
    (details, callback) => {
      const url = details.url;
      
      // Bloquer les requêtes pour les images de drapeaux et socket.io
      if (url.includes('/assets/images/flags/') || url.includes('socket.io')) {
        console.log('🚫 Requête bloquée:', url);
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    }
  );

  // Gérer les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('❌ Erreur de chargement:', errorDescription, 'pour', validatedURL);
  });

  // Créer le menu contextuel
  const contextMenu = Menu.buildFromTemplate([
    { role: 'undo', label: 'Annuler' },
    { role: 'redo', label: 'Rétablir' },
    { type: 'separator' },
    { role: 'cut', label: 'Couper' },
    { role: 'copy', label: 'Copier' },
    { role: 'paste', label: 'Coller' },
    { type: 'separator' },
    { role: 'selectall', label: 'Tout sélectionner' }
  ]);

  // Appliquer le menu contextuel à la fenêtre
  mainWindow.webContents.on('context-menu', (event, params) => {
    contextMenu.popup({ window: mainWindow });
  });
}

// Créer le menu de l'application
function createMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('new-chat');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        { role: 'undo', label: 'Annuler' },
        { role: 'redo', label: 'Rétablir' },
        { type: 'separator' },
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        { role: 'selectall', label: 'Tout sélectionner' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Recharger' },
        { role: 'forceReload', label: 'Forcer le rechargement' },
        { role: 'toggleDevTools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom normal' },
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' }
      ]
    },
    {
      label: 'Fenêtre',
      submenu: [
        { role: 'minimize', label: 'Réduire' },
        { role: 'close', label: 'Fermer' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de WhatsApp Clone',
          click: () => {
            shell.openExternal('https://github.com/your-username/whatsapp-clone');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Gestionnaires IPC
ipcMain.handle('show-notification', async (event, title, body) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', async () => {
  return process.platform;
});

ipcMain.handle('minimize-window', async () => {
  mainWindow.minimize();
});

ipcMain.handle('maximize-window', async () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('close-window', async () => {
  mainWindow.close();
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Nouveaux gestionnaires pour les menus contextuels et médias
ipcMain.handle('show-context-menu', async (event, menuItems, x, y) => {
  try {
    console.log('Affichage du menu contextuel:', { menuItems, x, y });
    
    // Créer le menu avec les items sérialisés
    const menu = Menu.buildFromTemplate(menuItems);
    
    // Utiliser une promesse avec timeout pour éviter le blocage
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('Timeout du menu contextuel');
        resolve({ success: false, error: 'Timeout' });
      }, 5000); // 5 secondes de timeout
      
      menu.popup({ x, y }, () => {
        clearTimeout(timeout);
        console.log('Menu contextuel fermé');
        resolve({ success: true });
      });
      
      // Gestion d'erreur
      menu.on('menu-will-close', () => {
        clearTimeout(timeout);
        console.log('Menu contextuel fermé (will-close)');
        resolve({ success: true });
      });
    });
  } catch (error) {
    console.error('Erreur lors de l\'affichage du menu contextuel:', error);
    return { success: false, error: error.message };
  }
});

// Gestionnaire pour exécuter les actions du menu contextuel
ipcMain.handle('execute-context-menu-action', async (event, actionId, actionData) => {
  try {
    console.log('Exécution de l\'action:', actionId, actionData);
    
    switch (actionId) {
      case 'reply':
        // Logique pour répondre au message
        console.log('Action: Reply to message');
        return { success: true, action: 'reply' };
        
      case 'forward':
        // Logique pour transférer le message
        console.log('Action: Forward message');
        return { success: true, action: 'forward' };
        
      case 'copy':
        // Copier le texte dans le presse-papiers
        if (actionData && actionData.text) {
          require('electron').clipboard.writeText(actionData.text);
          console.log('Action: Copy text to clipboard');
        }
        return { success: true, action: 'copy' };
        
      case 'view-media':
        // Ouvrir le média avec l'application par défaut
        if (actionData && actionData.url) {
          await shell.openExternal(actionData.url);
          console.log('Action: View media');
        }
        return { success: true, action: 'view-media' };
        
      case 'save-media':
        // Télécharger le média
        console.log('Action: Save media');
        return { success: true, action: 'save-media' };
        
      case 'share-media':
        // Partager le média
        console.log('Action: Share media');
        return { success: true, action: 'share-media' };
        
      case 'star':
        // Marquer comme favori
        console.log('Action: Star message');
        return { success: true, action: 'star' };
        
      case 'pin':
        // Épingler le message
        console.log('Action: Pin message');
        return { success: true, action: 'pin' };
        
      case 'delete':
        // Supprimer le message
        console.log('Action: Delete message');
        return { success: true, action: 'delete' };
        
      default:
        console.log('Action inconnue:', actionId);
        return { success: false, error: 'Action inconnue' };
    }
  } catch (error) {
    console.error('Erreur lors de l\'exécution de l\'action:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-media', async (event, media) => {
  try {
    console.log('Téléchargement de média:', media);
    
    // Ouvrir une boîte de dialogue pour choisir l'emplacement
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Sauvegarder le média',
      defaultPath: `media_${Date.now()}`,
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
        { name: 'Vidéos', extensions: ['mp4', 'avi', 'mov', 'mkv'] },
        { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePath) {
      // Ici vous pouvez implémenter la logique de téléchargement
      // Pour l'instant, on simule le téléchargement
      console.log('Média sauvegardé à:', result.filePath);
      return { success: true, path: result.filePath };
    }
    
    return { success: false, message: 'Téléchargement annulé' };
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('view-media', async (event, media) => {
  try {
    console.log('Affichage du média:', media);
    
    // Ouvrir le média dans une nouvelle fenêtre ou avec l'application par défaut
    if (media.url) {
      await shell.openExternal(media.url);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'affichage du média:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('share-media', async (event, media) => {
  try {
    console.log('Partage du média:', media);
    
    // Ici vous pouvez implémenter la logique de partage
    // Par exemple, copier le lien dans le presse-papiers
    if (media.url) {
      // Copier l'URL dans le presse-papiers
      mainWindow.webContents.copy(media.url);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors du partage:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file-dialog', async () => {
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
});

ipcMain.handle('save-file-dialog', async (event, data) => {
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
});

// Événements de l'application
app.whenReady().then(() => {
  createWindow();
  createMenu();

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
