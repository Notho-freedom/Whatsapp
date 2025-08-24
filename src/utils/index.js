// Utilitaires et fonctions helper
export { default as audioUtils } from './audioUtils';
export { default as electronUtils } from './electronUtils';
export { default as eventManager } from './eventManager';
export { default as googleContactsService } from './googleContactsService';

// Fonctions de média nommées
export { 
  downloadMedia, 
  viewMedia, 
  shareMedia,
  showContextMenu,
  executeContextMenuAction,
  createMessageMenuItems,
  getAppVersion,
  getPlatform,
  debugLog
} from './electronUtils';

// Fonctions de notification nommées
export { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning,
  showNativeNotification,
  showNotification,
  showMessageNotification,
  showCallNotification,
  showMediaNotification,
  showStatusNotification,
  isNativeNotificationAvailable,
  requestNotificationPermission
} from './nativeNotificationUtils';

export { default as nativeNotificationUtils } from './nativeNotificationUtils';
export { default as notificationUtils } from './notificationUtils';
