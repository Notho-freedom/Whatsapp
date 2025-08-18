const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs sécurisées au processus de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // API pour les événements de chat
  onNewChat: (callback) => ipcRenderer.on('new-chat', callback),
  removeNewChatListener: () => ipcRenderer.removeAllListeners('new-chat'),
  
  // API pour les notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', title, body),
  
  // API pour les raccourcis clavier
  onKeyboardShortcut: (callback) => ipcRenderer.on('keyboard-shortcut', callback),
  
  // API pour les informations système
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // API pour les préférences
  getPreferences: () => ipcRenderer.invoke('get-preferences'),
  setPreferences: (preferences) => ipcRenderer.invoke('set-preferences', preferences),
  
  // API pour les fichiers
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: (data) => ipcRenderer.invoke('save-file-dialog', data),
  
  // API pour les fenêtres
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // API pour les liens externes
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Nouvelles API pour les menus contextuels et médias
  showContextMenu: (menuItems, x, y) => ipcRenderer.invoke('show-context-menu', menuItems, x, y),
  downloadMedia: (media) => ipcRenderer.invoke('download-media', media),
  viewMedia: (media) => ipcRenderer.invoke('view-media', media),
  shareMedia: (media) => ipcRenderer.invoke('share-media', media),
  executeContextMenuAction: (actionId, actionData) => ipcRenderer.invoke('execute-context-menu-action', actionId, actionData)
});

// Exposer les informations de l'environnement
contextBridge.exposeInMainWorld('electronEnv', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});
