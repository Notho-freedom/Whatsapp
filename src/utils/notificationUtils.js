/**
 * Système de notifications amélioré pour le navigateur
 * Fournit des notifications toast avec style WhatsApp
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.container = null;
    this.init();
  }

  init() {
    // Créer le conteneur de notifications
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  /**
   * Afficher une notification toast
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   * @param {string} type - Type de notification (success, error, info, warning)
   * @param {number} duration - Durée d'affichage en ms
   */
  show(title, message, type = 'info', duration = 3000) {
    const notification = this.createNotification(title, message, type);
    
    // Ajouter au conteneur
    this.container.appendChild(notification);
    this.notifications.push(notification);

    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    }, 10);

    // Auto-suppression
    setTimeout(() => {
      this.remove(notification);
    }, duration);

    return notification;
  }

  /**
   * Créer un élément de notification
   */
  createNotification(title, message, type) {
    const notification = document.createElement('div');
    
    // Définir les couleurs selon le type
    const colors = {
      success: { bg: '#25D366', border: '#128C7E' },
      error: { bg: '#FF4444', border: '#CC0000' },
      warning: { bg: '#FFA500', border: '#FF8C00' },
      info: { bg: '#34B7F1', border: '#1E88E5' }
    };

    const color = colors[type] || colors.info;

    notification.style.cssText = `
      background: ${color.bg};
      border: 1px solid ${color.border};
      border-radius: 8px;
      padding: 12px 16px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Contenu de la notification
    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: white; font-size: 14px; margin-bottom: 4px;">
            ${title}
          </div>
          <div style="color: rgba(255, 255, 255, 0.9); font-size: 13px; line-height: 1.4;">
            ${message}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          padding: 0;
          font-size: 18px;
          line-height: 1;
          margin-left: 8px;
        ">×</button>
      </div>
    `;

    // Ajouter un gestionnaire de clic pour fermer
    const closeButton = notification.querySelector('button');
    closeButton.addEventListener('click', () => {
      this.remove(notification);
    });

    return notification;
  }

  /**
   * Supprimer une notification
   */
  remove(notification) {
    if (!notification || !notification.parentNode) return;

    // Animation de sortie
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    }, 300);
  }

  /**
   * Supprimer toutes les notifications
   */
  clear() {
    this.notifications.forEach(notification => {
      this.remove(notification);
    });
  }

  /**
   * Méthodes utilitaires pour différents types de notifications
   */
  success(title, message, duration) {
    return this.show(title, message, 'success', duration);
  }

  error(title, message, duration) {
    return this.show(title, message, 'error', duration);
  }

  warning(title, message, duration) {
    return this.show(title, message, 'warning', duration);
  }

  info(title, message, duration) {
    return this.show(title, message, 'info', duration);
  }
}

// Instance singleton
let notificationManager = null;

/**
 * Obtenir l'instance du gestionnaire de notifications
 */
export const getNotificationManager = () => {
  if (!notificationManager) {
    notificationManager = new NotificationManager();
  }
  return notificationManager;
};

/**
 * Afficher une notification de succès
 */
export const showSuccess = (title, message, duration = 3000) => {
  return getNotificationManager().success(title, message, duration);
};

/**
 * Afficher une notification d'erreur
 */
export const showError = (title, message, duration = 4000) => {
  return getNotificationManager().error(title, message, duration);
};

/**
 * Afficher une notification d'avertissement
 */
export const showWarning = (title, message, duration = 3500) => {
  return getNotificationManager().warning(title, message, duration);
};

/**
 * Afficher une notification d'information
 */
export const showInfo = (title, message, duration = 3000) => {
  return getNotificationManager().info(title, message, duration);
};

/**
 * Afficher une notification générique
 */
export const showNotification = (title, message, type = 'info', duration) => {
  return getNotificationManager().show(title, message, type, duration);
};

/**
 * Supprimer toutes les notifications
 */
export const clearNotifications = () => {
  if (notificationManager) {
    notificationManager.clear();
  }
};

export default {
  getNotificationManager,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showNotification,
  clearNotifications
};
