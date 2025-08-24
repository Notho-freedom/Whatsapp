'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook pour utiliser les menus contextuels natifs d'Electron
 * @param {string} menuType - Type de menu (message, chat, media, user, general)
 * @param {Array} customItems - Éléments personnalisés à ajouter au menu
 * @param {Function} onAction - Callback appelé quand une action est sélectionnée
 * @returns {Object} - Fonctions et état du menu contextuel
 */
export function useNativeContextMenu(menuType, customItems = [], onAction = null) {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;
  const actionListenerRef = useRef(null);

  // Écouter les actions de menu contextuel
  useEffect(() => {
    if (!isElectron) return;

    // Écouter les actions de menu contextuel
    actionListenerRef.current = (event, data) => {
      console.log('Action de menu contextuel reçue:', data);
      
      if (onAction) {
        onAction(data.actionId, data);
      }
      
      // Émettre un événement personnalisé pour la compatibilité
      window.dispatchEvent(new CustomEvent('native-context-menu-action', {
        detail: data
      }));
    };

    // Ajouter l'écouteur
    window.electronAPI.onContextMenuAction(actionListenerRef.current);

    return () => {
      if (actionListenerRef.current) {
        // Nettoyer l'écouteur
        window.electronAPI.onContextMenuAction(actionListenerRef.current);
      }
    };
  }, [isElectron, onAction]);

  // Afficher le menu contextuel
  const showContextMenu = useCallback((event, additionalData = {}) => {
    if (!isElectron) {
      console.warn('Menus contextuels natifs non disponibles (pas dans Electron)');
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left;
    const y = event.clientY || rect.bottom;

    console.log(`Affichage du menu contextuel ${menuType} à (${x}, ${y})`);

    // Afficher le menu contextuel natif
    window.electronAPI.showContextMenu(menuType, customItems, x, y)
      .then(result => {
        if (result.success) {
          console.log('Menu contextuel affiché avec succès');
        } else {
          console.error('Erreur lors de l\'affichage du menu:', result.error);
        }
      })
      .catch(error => {
        console.error('Erreur lors de l\'affichage du menu contextuel:', error);
      });
  }, [isElectron, menuType, customItems]);

  // Exécuter une action de menu contextuel
  const executeAction = useCallback(async (actionId, actionData = {}) => {
    if (!isElectron) {
      console.warn('Actions de menu contextuel non disponibles (pas dans Electron)');
      return null;
    }

    try {
      const result = await window.electronAPI.executeContextMenuAction(actionId, actionData);
      return result;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error);
      return { success: false, error: error.message };
    }
  }, [isElectron]);

  // Créer un gestionnaire d'événements pour le clic droit
  const handleContextMenu = useCallback((event, additionalData = {}) => {
    showContextMenu(event, additionalData);
  }, [showContextMenu]);

  // Créer un gestionnaire d'événements pour le clic long (mobile)
  const handleLongPress = useCallback((event, additionalData = {}) => {
    if (isElectron) {
      showContextMenu(event, additionalData);
    }
  }, [isElectron, showContextMenu]);

  return {
    showContextMenu,
    executeAction,
    handleContextMenu,
    handleLongPress,
    isElectron,
    menuType
  };
}

/**
 * Hook spécialisé pour les menus contextuels de messages
 */
export function useMessageContextMenu(onAction = null) {
  const customItems = [
    {
      label: 'Réaction rapide',
      id: 'quickReaction',
      icon: '😀'
    },
    {
      label: 'Modifier',
      id: 'edit',
      icon: '✏️'
    },
    {
      label: 'Citer',
      id: 'quote',
      icon: '💬'
    }
  ];

  return useNativeContextMenu('message', customItems, onAction);
}

/**
 * Hook spécialisé pour les menus contextuels de chat
 */
export function useChatContextMenu(onAction = null) {
  const customItems = [
    {
      label: 'Marquer comme lu',
      id: 'markRead',
      icon: '✅'
    },
    {
      label: 'Notifications',
      id: 'notifications',
      icon: '🔔'
    },
    {
      label: 'Thème personnalisé',
      id: 'customTheme',
      icon: '🎨'
    }
  ];

  return useNativeContextMenu('chat', customItems, onAction);
}

/**
 * Hook spécialisé pour les menus contextuels de média
 */
export function useMediaContextMenu(onAction = null) {
  const customItems = [
    {
      label: 'Favoris',
      id: 'favorite',
      icon: '❤️'
    },
    {
      label: 'Renommer',
      id: 'rename',
      icon: '✏️'
    },
    {
      label: 'Propriétés',
      id: 'properties',
      icon: 'ℹ️'
    }
  ];

  return useNativeContextMenu('media', customItems, onAction);
}

/**
 * Hook spécialisé pour les menus contextuels d'utilisateur
 */
export function useUserContextMenu(onAction = null) {
  const customItems = [
    {
      label: 'Envoyer un message privé',
      id: 'sendPrivateMessage',
      icon: '🔒'
    },
    {
      label: 'Ajouter au groupe',
      id: 'addToGroup',
      icon: '👥'
    },
    {
      label: 'Partager le contact',
      id: 'shareContact',
      icon: '📤'
    }
  ];

  return useNativeContextMenu('user', customItems, onAction);
}

/**
 * Hook pour les raccourcis clavier globaux
 */
export function useGlobalShortcuts() {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  useEffect(() => {
    if (!isElectron) return;

    const handleKeyboardShortcut = (event, shortcut) => {
      console.log('Raccourci clavier global reçu:', shortcut);
      
      // Émettre un événement personnalisé
      window.dispatchEvent(new CustomEvent('global-keyboard-shortcut', {
        detail: { shortcut }
      }));
    };

    // Écouter les raccourcis clavier globaux
    window.electronAPI.onKeyboardShortcut(handleKeyboardShortcut);

    return () => {
      // Nettoyer l'écouteur
      window.electronAPI.onKeyboardShortcut(handleKeyboardShortcut);
    };
  }, [isElectron]);

  // Enregistrer un raccourci clavier personnalisé
  const registerShortcut = useCallback(async (accelerator, callback) => {
    if (!isElectron) return null;

    try {
      const id = await window.electronAPI.registerGlobalShortcut(accelerator, callback);
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du raccourci:', error);
      return null;
    }
  }, [isElectron]);

  // Désenregistrer un raccourci clavier
  const unregisterShortcut = useCallback(async (id) => {
    if (!isElectron) return;

    try {
      await window.electronAPI.unregisterGlobalShortcut(id);
    } catch (error) {
      console.error('Erreur lors de la désinscription du raccourci:', error);
    }
  }, [isElectron]);

  return {
    registerShortcut,
    unregisterShortcut,
    isElectron
  };
}
