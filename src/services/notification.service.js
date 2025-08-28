import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

export class NotificationService {
  /**
   * Créer une notification
   */
  static async createNotification(userId, notificationData) {
    try {
      const notificationRef = adminDb.collection('notifications').doc();
      
      const notification = {
        id: notificationRef.id,
        userId,
        type: notificationData.type,
        title: notificationData.title,
        body: notificationData.body,
        data: notificationData.data || {},
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: notificationData.expiresAt || null,
        priority: notificationData.priority || 'normal',
        category: notificationData.category || 'general'
      };
      
      await notificationRef.set(notification);
      
      // Envoyer une notification push si l'utilisateur a des tokens FCM
      await this.sendPushNotification(userId, notification);
      
      return notification;
    } catch (error) {
      console.error('Erreur création notification:', error);
      throw error;
    }
  }

  /**
   * Obtenir les notifications d'un utilisateur
   */
  static async getUserNotifications(userId, limit = 50, lastDoc = null) {
    try {
      let query = adminDb
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return {
        notifications,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limit
      };
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      throw error;
    }
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(notificationId, userId) {
    try {
      const notificationRef = adminDb.collection('notifications').doc(notificationId);
      const doc = await notificationRef.get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        throw new Error('Notification non trouvée');
      }
      
      await notificationRef.update({
        read: true,
        readAt: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      throw error;
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  static async markAllAsRead(userId) {
    try {
      const batch = adminDb.batch();
      
      const snapshot = await adminDb
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();
      
      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      
      return {
        success: true,
        count: snapshot.size
      };
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      throw error;
    }
  }

  /**
   * Supprimer une notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const notificationRef = adminDb.collection('notifications').doc(notificationId);
      const doc = await notificationRef.get();
      
      if (!doc.exists || doc.data().userId !== userId) {
        throw new Error('Notification non trouvée');
      }
      
      await notificationRef.delete();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les notifications expirées
   */
  static async cleanupExpiredNotifications() {
    try {
      const batch = adminDb.batch();
      const now = new Date();
      
      const snapshot = await adminDb
        .collection('notifications')
        .where('expiresAt', '<=', now)
        .limit(500) // Limiter pour éviter les timeouts
        .get();
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      return {
        success: true,
        deleted: snapshot.size
      };
    } catch (error) {
      console.error('Erreur nettoyage notifications:', error);
      throw error;
    }
  }

  /**
   * Envoyer une notification push via FCM
   */
  static async sendPushNotification(userId, notification) {
    try {
      // Récupérer les tokens FCM de l'utilisateur
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return;
      }
      
      const userData = userDoc.data();
      const fcmTokens = userData.fcmTokens || [];
      
      if (fcmTokens.length === 0) {
        return;
      }
      
      // Construire le message FCM
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          ...notification.data
        },
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          notification: {
            channelId: notification.category,
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              sound: 'default',
              badge: 1
            }
          }
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png'
          }
        }
      };
      
      // Envoyer à tous les tokens
      const sendPromises = fcmTokens.map(token => 
        admin.messaging().send({ ...message, token })
          .catch(error => {
            console.error(`Erreur envoi FCM au token ${token}:`, error);
            // Si le token est invalide, le retirer
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              return this.removeFCMToken(userId, token);
            }
          })
      );
      
      await Promise.all(sendPromises);
    } catch (error) {
      console.error('Erreur envoi notification push:', error);
      // Ne pas propager l'erreur pour ne pas bloquer le processus
    }
  }

  /**
   * Enregistrer un token FCM
   */
  static async registerFCMToken(userId, token) {
    try {
      await adminDb.collection('users').doc(userId).update({
        fcmTokens: FieldValue.arrayUnion(token),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur enregistrement token FCM:', error);
      throw error;
    }
  }

  /**
   * Retirer un token FCM
   */
  static async removeFCMToken(userId, token) {
    try {
      await adminDb.collection('users').doc(userId).update({
        fcmTokens: FieldValue.arrayRemove(token)
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression token FCM:', error);
      throw error;
    }
  }

  /**
   * Créer des notifications pour un nouveau message
   */
  static async createMessageNotifications(message, conversation, sender) {
    try {
      const notifications = [];
      
      // Créer une notification pour chaque participant (sauf l'expéditeur)
      const otherParticipants = conversation.participantIds.filter(id => id !== sender.uid);
      
      for (const participantId of otherParticipants) {
        // Vérifier si l'utilisateur a désactivé les notifications pour cette conversation
        const isMuted = conversation.settings?.muted?.[participantId] || false;
        
        if (!isMuted) {
          // Vérifier si l'utilisateur n'a pas bloqué l'expéditeur
          const participantDoc = await adminDb.collection('users').doc(participantId).get();
          const blockedUsers = participantDoc.data()?.blockedUsers || [];
          
          if (!blockedUsers.includes(sender.uid)) {
            const notification = await this.createNotification(participantId, {
              type: 'message',
              category: 'messages',
              title: conversation.type === 'group' ? conversation.name : sender.displayName,
              body: this.getMessagePreview(message),
              priority: 'high',
              data: {
                conversationId: conversation.id,
                messageId: message.id,
                senderId: sender.uid
              }
            });
            
            notifications.push(notification);
          }
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Erreur création notifications message:', error);
      throw error;
    }
  }

  /**
   * Obtenir un aperçu du message pour la notification
   */
  static getMessagePreview(message) {
    switch (message.type) {
      case 'text':
        return message.content.substring(0, 100);
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Vidéo';
      case 'audio':
        return '🎵 Message vocal';
      case 'document':
        return `📄 ${message.media?.fileName || 'Document'}`;
      case 'location':
        return '📍 Position';
      default:
        return 'Nouveau message';
    }
  }

  /**
   * Obtenir les paramètres de notification d'un utilisateur
   */
  static async getUserNotificationSettings(userId) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      
      return userData.settings?.notifications || {
        enabled: true,
        sound: true,
        showPreview: true,
        categories: {
          messages: true,
          calls: true,
          status: true,
          system: true
        }
      };
    } catch (error) {
      console.error('Erreur récupération paramètres notifications:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les paramètres de notification
   */
  static async updateNotificationSettings(userId, settings) {
    try {
      await adminDb.collection('users').doc(userId).update({
        'settings.notifications': settings,
        updatedAt: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour paramètres notifications:', error);
      throw error;
    }
  }
}