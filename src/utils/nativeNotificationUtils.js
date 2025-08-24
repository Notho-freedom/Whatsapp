/**
 * Système de notifications natives Electron
 * Remplace les notifications d'application par des notifications natives du système
 */

/**
 * Vérifier si Electron est disponible
 */
const isElectron = typeof window !== 'undefined' && window.electronAPI;

/**
 * Afficher une notification native Electron
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps de la notification
 * @param {Object} options - Options supplémentaires
 */
export const showNativeNotification = async (title, body, options = {}) => {
  if (!isElectron) {
    console.warn('Notifications natives non disponibles (pas dans Electron)');
    return null;
  }

  try {
    const result = await window.electronAPI.showNotification(title, body, options);
    return result;
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la notification native:', error);
    return null;
  }
};

/**
 * Afficher une notification de succès
 */
export const showSuccess = async (title, message, duration = 3000) => {
  const notification = await showNativeNotification(title, message, {
    type: 'success',
    icon: '✅',
    silent: false,
    timeout: duration
  });
  
  // Log pour le débogage
  console.log('Notification de succès affichée:', { title, message, notification });
  
  return notification;
};

/**
 * Afficher une notification d'erreur
 */
export const showError = async (title, message, duration = 4000) => {
  const notification = await showNativeNotification(title, message, {
    type: 'error',
    icon: '❌',
    silent: false,
    timeout: duration
  });
  
  // Log pour le débogage
  console.log('Notification d\'erreur affichée:', { title, message, notification });
  
  return notification;
};

/**
 * Afficher une notification d'information
 */
export const showInfo = async (title, message, duration = 3000) => {
  const notification = await showNativeNotification(title, message, {
    type: 'info',
    icon: 'ℹ️',
    silent: false,
    timeout: duration
  });
  
  // Log pour le débogage
  console.log('Notification d\'information affichée:', { title, message, notification });
  
  return notification;
};

/**
 * Afficher une notification d'avertissement
 */
export const showWarning = async (title, message, duration = 3500) => {
  const notification = await showNativeNotification(title, message, {
    type: 'warning',
    icon: '⚠️',
    silent: false,
    timeout: duration
  });
  
  // Log pour le débogage
  console.log('Notification d\'avertissement affichée:', { title, message, notification });
  
  return notification;
};

/**
 * Afficher une notification personnalisée
 */
export const showNotification = async (title, message, type = 'info', duration = 3000) => {
  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const notification = await showNativeNotification(title, message, {
    type,
    icon: iconMap[type] || 'ℹ️',
    silent: false,
    timeout: duration
  });
  
  // Log pour le débogage
  console.log('Notification personnalisée affichée:', { title, message, type, notification });
  
  return notification;
};

/**
 * Afficher une notification de message
 */
export const showMessageNotification = async (senderName, message, duration = 3000) => {
  return showNativeNotification(
    `Nouveau message de ${senderName}`,
    message,
    {
      type: 'info',
      icon: '💬',
      silent: false,
      timeout: duration,
      actions: [
        { text: 'Répondre', action: 'reply' },
        { text: 'Marquer comme lu', action: 'mark-read' }
      ]
    }
  );
};

/**
 * Afficher une notification d'appel
 */
export const showCallNotification = async (callerName, callType = 'voice', duration = 5000) => {
  const icon = callType === 'video' ? '📹' : '📞';
  const typeText = callType === 'video' ? 'Appel vidéo' : 'Appel vocal';
  
  return showNativeNotification(
    `${typeText} de ${callerName}`,
    'Cliquez pour répondre ou ignorer',
    {
      type: 'info',
      icon,
      silent: false,
      timeout: duration,
      actions: [
        { text: 'Répondre', action: 'answer' },
        { text: 'Ignorer', action: 'ignore' }
      ]
    }
  );
};

/**
 * Afficher une notification de média
 */
export const showMediaNotification = async (action, fileName, duration = 3000) => {
  const actionMap = {
    download: { icon: '⬇️', text: 'Téléchargement' },
    upload: { icon: '⬆️', text: 'Envoi' },
    share: { icon: '📤', text: 'Partage' },
    view: { icon: '👁️', text: 'Affichage' }
  };

  const { icon, text } = actionMap[action] || { icon: '📁', text: 'Média' };

  return showNativeNotification(
    `${text} de média`,
    fileName,
    {
      type: 'info',
      icon,
      silent: false,
      timeout: duration
    }
  );
};

/**
 * Afficher une notification de statut
 */
export const showStatusNotification = async (userName, statusType, duration = 3000) => {
  const statusMap = {
    online: { icon: '🟢', text: 'en ligne' },
    offline: { icon: '🔴', text: 'hors ligne' },
    typing: { icon: '✍️', text: 'écrit...' },
    recording: { icon: '🎤', text: 'enregistre un message vocal' }
  };

  const { icon, text } = statusMap[statusType] || { icon: 'ℹ️', text: 'a changé de statut' };

  return showNativeNotification(
    `${userName} est ${text}`,
    '',
    {
      type: 'info',
      icon,
      silent: true,
      timeout: duration
    }
  );
};

/**
 * Vérifier si les notifications natives sont disponibles
 */
export const isNativeNotificationAvailable = () => {
  return isElectron;
};

/**
 * Demander la permission pour les notifications
 */
export const requestNotificationPermission = async () => {
  if (!isElectron) {
    console.warn('Notifications natives non disponibles (pas dans Electron)');
    return false;
  }

  try {
    // Dans Electron, les notifications sont généralement autorisées par défaut
    return true;
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
};

export default {
  showNativeNotification,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showNotification,
  showMessageNotification,
  showCallNotification,
  showMediaNotification,
  showStatusNotification,
  isNativeNotificationAvailable,
  requestNotificationPermission
};
