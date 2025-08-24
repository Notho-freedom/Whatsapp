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
  
  // API pour les menus contextuels natifs
  showContextMenu: (menuType, customItems = [], x, y) => 
    ipcRenderer.invoke('show-context-menu', menuType, customItems, x, y),
  
  // API pour exécuter des actions de menu contextuel
  executeContextMenuAction: (actionId, actionData) => 
    ipcRenderer.invoke('execute-context-menu-action', actionId, actionData),
  
  // API pour écouter les actions de menu contextuel
  onContextMenuAction: (callback) => ipcRenderer.on('context-menu-action', callback),
  
  // API pour les médias
  downloadMedia: (media) => ipcRenderer.invoke('download-media', media),
  viewMedia: (media) => ipcRenderer.invoke('view-media', media),
  shareMedia: (media) => ipcRenderer.invoke('share-media', media),
  
  // API pour le presse-papiers
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  readFromClipboard: () => ipcRenderer.invoke('read-from-clipboard'),
  
  // API pour les raccourcis clavier personnalisés
  registerGlobalShortcut: (accelerator, callback) => {
    const id = `shortcut-${Date.now()}`;
    ipcRenderer.on(id, callback);
    return ipcRenderer.invoke('register-global-shortcut', accelerator, id);
  },
  
  unregisterGlobalShortcut: (id) => ipcRenderer.invoke('unregister-global-shortcut', id),
  
  // API pour les menus contextuels personnalisés
  createCustomContextMenu: (menuItems) => ipcRenderer.invoke('create-custom-context-menu', menuItems),
  
  // API pour les actions de menu contextuel
  handleContextMenuAction: (actionId, data) => ipcRenderer.invoke('handle-context-menu-action', actionId, data)
});

// Exposer les informations de l'environnement
contextBridge.exposeInMainWorld('electronEnv', {
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});

// Exposer les types de menus contextuels
contextBridge.exposeInMainWorld('contextMenuTypes', {
  MESSAGE: 'message',
  CHAT: 'chat',
  MEDIA: 'media',
  USER: 'user',
  GENERAL: 'general'
});

// Exposer les actions de menu contextuel prédéfinies
contextBridge.exposeInMainWorld('contextMenuActions', {
  // Actions de message
  REPLY: 'reply',
  FORWARD: 'forward',
  COPY: 'copy',
  SELECT_ALL: 'selectAll',
  PIN: 'pin',
  MARK_IMPORTANT: 'markImportant',
  DELETE: 'delete',
  
  // Actions de chat
  NEW_MESSAGE: 'newMessage',
  SEARCH: 'search',
  PIN_CHAT: 'pinChat',
  MARK_UNREAD: 'markUnread',
  ARCHIVE: 'archive',
  DELETE_CHAT: 'deleteChat',
  BLOCK: 'block',
  
  // Actions de média
  OPEN: 'open',
  DOWNLOAD: 'download',
  SHARE: 'share',
  COPY_LINK: 'copyLink',
  OPEN_IN_BROWSER: 'openInBrowser',
  DELETE_MEDIA: 'deleteMedia',
  
  // Actions d'utilisateur
  VIEW_PROFILE: 'viewProfile',
  SEND_MESSAGE: 'sendMessage',
  CALL: 'call',
  VIDEO_CALL: 'videoCall',
  ADD_TO_CONTACTS: 'addToContacts',
  BLOCK_USER: 'blockUser',
  
  // Actions générales
  CUT: 'cut',
  PASTE: 'paste',
  UNDO: 'undo',
  REDO: 'redo'
});

// Exposer les raccourcis clavier
contextBridge.exposeInMainWorld('keyboardShortcuts', {
  NEW_CHAT: 'CmdOrCtrl+N',
  SEARCH: 'CmdOrCtrl+F',
  REPLY: 'CmdOrCtrl+R',
  FORWARD: 'CmdOrCtrl+Shift+F',
  COPY: 'CmdOrCtrl+C',
  PASTE: 'CmdOrCtrl+V',
  CUT: 'CmdOrCtrl+X',
  SELECT_ALL: 'CmdOrCtrl+A',
  UNDO: 'CmdOrCtrl+Z',
  REDO: 'CmdOrCtrl+Shift+Z',
  SAVE: 'CmdOrCtrl+S',
  DELETE: 'Delete'
});
