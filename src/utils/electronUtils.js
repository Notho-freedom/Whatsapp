/**
 * Utilitaires pour l'intégration Electron
 * Gère les fonctions Electron de manière centralisée avec fallback pour le navigateur
 */

// Vérifier si nous sommes dans un environnement Electron
export const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

// Vérifier si l'API Electron est disponible
export const isElectronAPI = (apiName) => {
  return isElectron() && typeof window.electronAPI[apiName] === 'function';
};

/**
 * Créer des items de menu pour les messages avec gestion des actions
 * @param {Object} message - Message pour lequel créer le menu
 * @param {Object} handlers - Gestionnaires d'actions
 * @param {boolean} isMe - Si le message est de l'utilisateur
 * @returns {Array} Items du menu
 */
export const createMessageMenuItems = (message, handlers, isMe = false) => {
  const menuItems = [];
  
  // Options de base pour tous les messages
  menuItems.push(
    { 
      label: 'Reply', 
      id: 'reply',
      click: () => handlers.handleReplyMessage(message) 
    },
    { 
      label: 'Forward', 
      id: 'forward',
      click: () => handlers.handleForwardMessage(message) 
    },
    { type: 'separator' }
  );
  
  // Options spécifiques pour les messages texte
  if (message.text) {
    menuItems.push(
      { 
        label: 'Copy', 
        id: 'copy',
        click: () => handlers.handleCopyMessage(message.text) 
      },
      { type: 'separator' }
    );
  }
  
  // Options spécifiques pour les médias
  if (message.media && message.media.length > 0) {
    menuItems.push(
      { 
        label: 'View Media', 
        id: 'view-media',
        click: () => handlers.handleViewMedia(message.media) 
      },
      { 
        label: 'Save Media', 
        id: 'save-media',
        click: () => handlers.handleSaveMedia(message.media) 
      },
      { 
        label: 'Share Media', 
        id: 'share-media',
        click: () => handlers.handleShareMedia(message.media) 
      },
      { type: 'separator' }
    );
  }
  
  // Options supplémentaires
  menuItems.push(
    { 
      label: 'Star Message', 
      id: 'star',
      click: () => handlers.handleStarMessage(message) 
    },
    { 
      label: 'Pin Message', 
      id: 'pin',
      click: () => handlers.handlePinMessage(message) 
    }
  );
  
  // Option de suppression pour les messages de l'utilisateur
  if (isMe) {
    menuItems.push(
      { type: 'separator' },
      { 
        label: 'Delete for me', 
        id: 'delete',
        click: () => handlers.handleDeleteMessage(message) 
      }
    );
  }
  
  return menuItems;
};

/**
 * Afficher un menu contextuel natif avec gestion complète des actions
 * @param {Array} menuItems - Items du menu
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @returns {Promise}
 */
export const showContextMenu = async (menuItems, x, y) => {
  // Pour l'instant, utiliser directement le menu CSS pour éviter les problèmes Electron
  console.log('Utilisation du menu CSS pour éviter les problèmes Electron');
  
  return createCSSContextMenu(menuItems, x, y);
};

/**
 * Créer un menu contextuel CSS pour le navigateur
 * @param {Array} menuItems - Items du menu
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @returns {Promise}
 */
const createCSSContextMenu = async (menuItems, x, y) => {
  return new Promise((resolve) => {
    // Variables pour gérer l'état du menu
    let isMenuClosed = false;
    let menuElement = null;
    let styleElement = null;
    
    // Fonction pour fermer le menu de manière sécurisée
    const closeMenu = () => {
      if (isMenuClosed) return;
      isMenuClosed = true;
      
      try {
        if (menuElement && menuElement.parentNode) {
          menuElement.parentNode.removeChild(menuElement);
        }
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      } catch (error) {
        console.warn('Erreur lors de la fermeture du menu:', error);
      }
      
      // Nettoyer les écouteurs d'événements
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
    
    // Gestionnaire pour clic à l'extérieur
    const handleOutsideClick = (e) => {
      if (menuElement && !menuElement.contains(e.target)) {
        closeMenu();
        resolve({ success: false, action: 'cancelled' });
      }
    };
    
    // Gestionnaire pour touche Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeMenu();
        resolve({ success: false, action: 'cancelled' });
      }
    };
    
    // Créer le menu
    menuElement = document.createElement('div');
    menuElement.style.cssText = `
      position: fixed;
      top: ${y}px;
      left: ${x}px;
      background: #233138;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 8px 0;
      z-index: 10000;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      user-select: none;
      animation: menuFadeIn 0.15s ease-out;
    `;
    
    // Créer et ajouter l'animation CSS
    styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes menuFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-5px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Ajouter les items au menu
    menuItems.forEach(item => {
      if (item.type === 'separator') {
        const separator = document.createElement('div');
        separator.style.cssText = `
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin: 4px 0;
        `;
        menuElement.appendChild(separator);
      } else {
        const button = document.createElement('button');
        button.textContent = item.label;
        button.style.cssText = `
          display: block;
          width: 100%;
          padding: 8px 16px;
          background: none;
          border: none;
          color: #d1d7db;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.15s ease;
          outline: none;
        `;
        
        // Hover effects
        button.addEventListener('mouseenter', () => {
          button.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.backgroundColor = 'transparent';
        });
        
        // Click handler
        button.addEventListener('click', async () => {
          try {
            if (item.click) {
              await item.click();
            }
            closeMenu();
            resolve({ success: true, action: item.id });
          } catch (error) {
            console.error('Erreur lors de l\'exécution de l\'action:', error);
            closeMenu();
            resolve({ success: false, error: error.message });
          }
        });
        
        // Support clavier
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
          }
        });
        
        menuElement.appendChild(button);
      }
    });
    
    // Ajouter le menu au DOM
    document.body.appendChild(menuElement);
    
    // Ajouter les écouteurs d'événements avec délai
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }, 100);
    
    // Focus sur le premier bouton pour l'accessibilité
    const firstButton = menuElement.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  });
};

/**
 * Exécuter une action du menu contextuel
 * @param {string} actionId - ID de l'action à exécuter
 * @param {Object} actionData - Données associées à l'action
 * @returns {Promise}
 */
export const executeContextMenuAction = async (actionId, actionData = {}) => {
  if (isElectronAPI('executeContextMenuAction')) {
    try {
      return await window.electronAPI.executeContextMenuAction(actionId, actionData);
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
      return { success: false, error: error.message };
    }
  } else {
    // Fallback pour le navigateur
    console.log('Exécution de l\'action dans le navigateur:', actionId, actionData);
    return { success: true, action: actionId };
  }
};

/**
 * Télécharger un média
 * @param {Object} media - Objet média à télécharger
 * @returns {Promise<Object>}
 */
export const downloadMedia = async (media) => {
  if (isElectronAPI('downloadMedia')) {
    try {
      // Sérialiser l'objet média
      const serializedMedia = {
        url: media.url,
        type: media.type,
        filename: media.filename,
        size: media.size
      };
      
      return await window.electronAPI.downloadMedia(serializedMedia);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log('Téléchargement de média non disponible dans le navigateur');
    console.log('Média:', media);
    
    // Fallback pour le navigateur - ouvrir dans un nouvel onglet
    if (media.url) {
      window.open(media.url, '_blank');
    }
    
    return { success: true, message: 'Ouvert dans un nouvel onglet' };
  }
};

/**
 * Voir un média
 * @param {Object} media - Objet média à afficher
 * @returns {Promise<Object>}
 */
export const viewMedia = async (media) => {
  if (isElectronAPI('viewMedia')) {
    try {
      // Sérialiser l'objet média
      const serializedMedia = {
        url: media.url,
        type: media.type,
        filename: media.filename
      };
      
      return await window.electronAPI.viewMedia(serializedMedia);
    } catch (error) {
      console.error('Erreur lors de l\'affichage du média:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log('Affichage de média non disponible dans le navigateur');
    console.log('Média:', media);
    
    // Fallback pour le navigateur - ouvrir dans un nouvel onglet
    if (media.url) {
      window.open(media.url, '_blank');
    }
    
    return { success: true, message: 'Ouvert dans un nouvel onglet' };
  }
};

/**
 * Partager un média
 * @param {Object} media - Objet média à partager
 * @returns {Promise<Object>}
 */
export const shareMedia = async (media) => {
  if (isElectronAPI('shareMedia')) {
    try {
      // Sérialiser l'objet média
      const serializedMedia = {
        url: media.url,
        type: media.type,
        filename: media.filename
      };
      
      return await window.electronAPI.shareMedia(serializedMedia);
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      return { success: false, error: error.message };
    }
  } else {
    console.log('Partage de média non disponible dans le navigateur');
    console.log('Média:', media);
    
    // Fallback pour le navigateur - copier l'URL
    if (media.url && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(media.url);
        return { success: true, message: 'URL copiée dans le presse-papiers' };
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
        return { success: false, error: error.message };
      }
    }
    
    return { success: false, message: 'Partage non supporté' };
  }
};

/**
 * Afficher une notification
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps de la notification
 * @returns {Promise}
 */
export const showNotification = async (title, body) => {
  if (isElectronAPI('showNotification')) {
    try {
      return await window.electronAPI.showNotification(title, body);
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la notification:', error);
      return false;
    }
  } else {
    console.log('Notification non disponible dans le navigateur');
    console.log('Notification:', { title, body });
    
    // Fallback pour le navigateur - utiliser l'API Notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
    
    return true;
  }
};

/**
 * Obtenir la version de l'application
 * @returns {Promise<string>}
 */
export const getAppVersion = async () => {
  if (isElectronAPI('getAppVersion')) {
    try {
      return await window.electronAPI.getAppVersion();
    } catch (error) {
      console.error('Erreur lors de la récupération de la version:', error);
      return 'Unknown';
    }
  } else {
    return 'Web Browser';
  }
};

/**
 * Obtenir la plateforme
 * @returns {Promise<string>}
 */
export const getPlatform = async () => {
  if (isElectronAPI('getPlatform')) {
    try {
      return await window.electronAPI.getPlatform();
    } catch (error) {
      console.error('Erreur lors de la récupération de la plateforme:', error);
      return 'unknown';
    }
  } else {
    return 'web';
  }
};

/**
 * Logger les informations de débogage
 * @param {string} message - Message à logger
 * @param {any} data - Données à logger
 */
export const debugLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Electron Utils] ${message}`, data);
  }
};

export default {
  isElectron,
  isElectronAPI,
  showContextMenu,
  executeContextMenuAction,
  createMessageMenuItems,
  downloadMedia,
  viewMedia,
  shareMedia,
  showNotification,
  getAppVersion,
  getPlatform,
  debugLog
};
