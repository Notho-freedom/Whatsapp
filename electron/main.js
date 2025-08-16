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
