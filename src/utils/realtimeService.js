import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, off, push, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDot5qXzscWMlJbT46Iq-ZNQRTLhicFCmU",
  authDomain: "elite-5b171.firebaseapp.com",
  projectId: "elite-5b171",
  storageBucket: "elite-5b171.firebasestorage.app",
  messagingSenderId: "263142174492",
  appId: "1:263142174492:web:8d8abbe4bf5e831211d4d9",
  measurementId: "G-PDDCJR1CZ8",
  // Ajouter l'URL de Realtime Database
  databaseURL: "https://elite-5b171-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

class RealtimeService {
  constructor() {
    this.db = database;
    this.listeners = new Map();
  }

  // ===== GESTION DE LA PRÉSENCE =====

  async setUserPresence(userId, status = 'online') {
    try {
      const presenceRef = ref(this.db, `presence/${userId}`);
      await set(presenceRef, {
        status,
        lastSeen: new Date().toISOString(),
        timestamp: Date.now()
      });
      console.log(`✅ Présence mise à jour pour l'utilisateur ${userId}: ${status}`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la présence:', error);
    }
  }

  async getUserPresence(userId) {
    try {
      const presenceRef = ref(this.db, `presence/${userId}`);
      const snapshot = await get(presenceRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la présence:', error);
      return null;
    }
  }

  onUserPresenceChange(userId, callback) {
    const presenceRef = ref(this.db, `presence/${userId}`);
    const listener = onValue(presenceRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });

    this.listeners.set(`presence_${userId}`, listener);
    return () => this.removeListener(`presence_${userId}`);
  }

  // ===== INDICATEURS DE TYPING =====

  async setTypingStatus(conversationId, userId, isTyping = true) {
    try {
      const typingRef = ref(this.db, `typing/${conversationId}/${userId}`);
      if (isTyping) {
        await set(typingRef, {
          timestamp: Date.now(),
          userId
        });
      } else {
        await remove(typingRef);
      }
      console.log(`✅ Statut de frappe mis à jour: ${userId} ${isTyping ? 'écrit' : 'arrêté d\'écrire'}`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut de frappe:', error);
    }
  }

  onTypingStatusChange(conversationId, callback) {
    const typingRef = ref(this.db, `typing/${conversationId}`);
    const listener = onValue(typingRef, (snapshot) => {
      const typingUsers = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const data = childSnapshot.val();
          // Nettoyer les anciens statuts (plus de 10 secondes)
          if (Date.now() - data.timestamp < 10000) {
            typingUsers.push(data);
          }
        });
      }
      callback(typingUsers);
    });

    this.listeners.set(`typing_${conversationId}`, listener);
    return () => this.removeListener(`typing_${conversationId}`);
  }

  // ===== RECEIPTS DE LECTURE =====

  async setReadReceipt(conversationId, messageId, userId) {
    try {
      const receiptRef = ref(this.db, `readReceipts/${conversationId}/${messageId}/${userId}`);
      await set(receiptRef, {
        readAt: new Date().toISOString(),
        timestamp: Date.now()
      });
      console.log(`✅ Receipt de lecture ajouté pour le message ${messageId}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du receipt de lecture:', error);
    }
  }

  onReadReceiptsChange(conversationId, callback) {
    const receiptsRef = ref(this.db, `readReceipts/${conversationId}`);
    const listener = onValue(receiptsRef, (snapshot) => {
      const receipts = snapshot.exists() ? snapshot.val() : {};
      callback(receipts);
    });

    this.listeners.set(`receipts_${conversationId}`, listener);
    return () => this.removeListener(`receipts_${conversationId}`);
  }

  // ===== STATUTS DES MESSAGES =====

  async setMessageStatus(messageId, status = 'sent') {
    try {
      const statusRef = ref(this.db, `messageStatus/${messageId}`);
      await set(statusRef, {
        status,
        timestamp: Date.now(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Statut du message ${messageId} mis à jour: ${status}`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut du message:', error);
    }
  }

  onMessageStatusChange(messageId, callback) {
    const statusRef = ref(this.db, `messageStatus/${messageId}`);
    const listener = onValue(statusRef, (snapshot) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    });

    this.listeners.set(`messageStatus_${messageId}`, listener);
    return () => this.removeListener(`messageStatus_${messageId}`);
  }

  // ===== NOTIFICATIONS EN TEMPS RÉEL =====

  async sendNotification(userId, notification) {
    try {
      const notificationRef = ref(this.db, `notifications/${userId}`);
      const newNotificationRef = push(notificationRef);
      await set(newNotificationRef, {
        ...notification,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        read: false
      });
      console.log(`✅ Notification envoyée à ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error);
    }
  }

  onNotificationsChange(userId, callback) {
    const notificationsRef = ref(this.db, `notifications/${userId}`);
    const listener = onValue(notificationsRef, (snapshot) => {
      const notifications = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          notifications.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      callback(notifications);
    });

    this.listeners.set(`notifications_${userId}`, listener);
    return () => this.removeListener(`notifications_${userId}`);
  }

  // ===== STATUTS/STORIES EN TEMPS RÉEL =====

  async updateStatusView(statusId, userId) {
    try {
      const viewRef = ref(this.db, `statusViews/${statusId}/${userId}`);
      await set(viewRef, {
        viewedAt: new Date().toISOString(),
        timestamp: Date.now()
      });
      console.log(`✅ Vue de statut enregistrée pour ${userId}`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la vue de statut:', error);
    }
  }

  onStatusViewsChange(statusId, callback) {
    const viewsRef = ref(this.db, `statusViews/${statusId}`);
    const listener = onValue(viewsRef, (snapshot) => {
      const views = snapshot.exists() ? snapshot.val() : {};
      callback(views);
    });

    this.listeners.set(`statusViews_${statusId}`, listener);
    return () => this.removeListener(`statusViews_${statusId}`);
  }

  // ===== GESTION DES ÉCOUTEURS =====

  removeListener(key) {
    const listener = this.listeners.get(key);
    if (listener) {
      off(ref(this.db, key), listener);
      this.listeners.delete(key);
      console.log(`🔇 Écouteur supprimé: ${key}`);
    }
  }

  removeAllListeners() {
    this.listeners.forEach((listener, key) => {
      off(ref(this.db, key), listener);
    });
    this.listeners.clear();
    console.log('🔇 Tous les écouteurs supprimés');
  }

  // ===== UTILITAIRES =====

  async cleanupOldData() {
    try {
      const now = Date.now();
      const tenMinutesAgo = now - (10 * 60 * 1000);

      // Nettoyer les anciens statuts de frappe
      const typingRef = ref(this.db, 'typing');
      const typingSnapshot = await get(typingRef);
      if (typingSnapshot.exists()) {
        const updates = {};
        typingSnapshot.forEach((conversationSnapshot) => {
          conversationSnapshot.forEach((userSnapshot) => {
            const data = userSnapshot.val();
            if (data.timestamp < tenMinutesAgo) {
              updates[`typing/${conversationSnapshot.key}/${userSnapshot.key}`] = null;
            }
          });
        });
        if (Object.keys(updates).length > 0) {
          await update(ref(this.db), updates);
          console.log('🧹 Anciens statuts de frappe nettoyés');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des données:', error);
    }
  }
}

export default new RealtimeService();
