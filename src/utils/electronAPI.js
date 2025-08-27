/**
 * Configuration sécurisée de l'API Electron
 * Fournit des fonctions de fallback quand l'API native n'est pas disponible
 */

// Vérifier si nous sommes dans un environnement Electron
const isElectron = typeof window !== 'undefined' && window.electronAPI;

// Fonctions de fallback sécurisées
const fallbackFunctions = {
  showContextMenu: () => {
    console.warn('⚠️ Menu contextuel natif non disponible - utilisation du fallback');
    return Promise.resolve({ success: false, error: 'API non disponible' });
  },
  
  executeContextMenuAction: () => {
    console.warn('⚠️ Action de menu contextuel non disponible - utilisation du fallback');
    return Promise.resolve({ success: false, error: 'API non disponible' });
  },
  
  onContextMenuAction: (callback) => {
    console.warn('⚠️ Écouteur de menu contextuel non disponible - utilisation du fallback');
    // Simuler un événement après un délai
    setTimeout(() => {
      callback(null, { actionId: 'fallback', data: {} });
    }, 100);
    return true;
  },
  
  removeContextMenuAction: (callback) => {
    console.warn('⚠️ Suppression d\'écouteur de menu contextuel non disponible');
    return true;
  },
  
  onKeyboardShortcut: (callback) => {
    console.warn('⚠️ Écouteur de raccourci clavier non disponible - utilisation du fallback');
    return true;
  },
  
  removeKeyboardShortcut: (callback) => {
    console.warn('⚠️ Suppression d\'écouteur de raccourci clavier non disponible');
    return true;
  },
  
  registerGlobalShortcut: (accelerator, callback) => {
    console.warn('⚠️ Enregistrement de raccourci global non disponible');
    return Promise.resolve('fallback-id');
  },
  
  unregisterGlobalShortcut: (id) => {
    console.warn('⚠️ Désenregistrement de raccourci global non disponible');
    return Promise.resolve(true);
  }
};

// API Electron sécurisée
export const electronAPI = isElectron ? {
  // Utiliser l'API native si disponible
  showContextMenu: window.electronAPI.showContextMenu || fallbackFunctions.showContextMenu,
  executeContextMenuAction: window.electronAPI.executeContextMenuAction || fallbackFunctions.executeContextMenuAction,
  onContextMenuAction: window.electronAPI.onContextMenuAction || fallbackFunctions.onContextMenuAction,
  removeContextMenuAction: window.electronAPI.removeContextMenuAction || fallbackFunctions.removeContextMenuAction,
  onKeyboardShortcut: window.electronAPI.onKeyboardShortcut || fallbackFunctions.onKeyboardShortcut,
  removeKeyboardShortcut: window.electronAPI.removeKeyboardShortcut || fallbackFunctions.removeKeyboardShortcut,
  registerGlobalShortcut: window.electronAPI.registerGlobalShortcut || fallbackFunctions.registerGlobalShortcut,
  unregisterGlobalShortcut: window.electronAPI.unregisterGlobalShortcut || fallbackFunctions.unregisterGlobalShortcut,
} : fallbackFunctions;

// Fonction utilitaire pour vérifier la disponibilité d'une fonction
export const hasElectronFunction = (functionName) => {
  return isElectron && window.electronAPI && typeof window.electronAPI[functionName] === 'function';
};

// Fonction utilitaire pour exécuter une fonction Electron de manière sécurisée
export const safeElectronCall = async (functionName, ...args) => {
  try {
    if (hasElectronFunction(functionName)) {
      return await window.electronAPI[functionName](...args);
    } else {
      console.warn(`⚠️ Fonction Electron '${functionName}' non disponible`);
      return { success: false, error: 'Fonction non disponible' };
    }
  } catch (error) {
    console.error(`❌ Erreur lors de l'appel à '${functionName}':`, error);
    return { success: false, error: error.message };
  }
};

export default electronAPI;
