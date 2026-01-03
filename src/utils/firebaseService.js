import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

class FirebaseService {
  constructor() {
    this.db = db;
  }

  // ===== GESTION DES MESSAGES =====

  async addMessage(conversationId, messageData, customMessageId = null) {
    try {
      const messagesRef = collection(this.db, 'messages');
      const messageWithTimestamp = {
        ...messageData,
        conversation_id: conversationId,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      let docRef;

      if (customMessageId) {
        // Utiliser un ID déterministe pour éviter les doublons client/serveur
        docRef = doc(messagesRef, customMessageId);
        await setDoc(docRef, messageWithTimestamp);
      } else {
        docRef = await addDoc(messagesRef, messageWithTimestamp);
      }

      console.log(`✅ Message ajouté dans Firebase: ${docRef.id}`);

      return {
        id: docRef.id,
        ...messageData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du message:", error);
      throw error;
    }
  }

  async updateMessage(conversationId, messageId, updates) {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await updateDoc(messageRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });

      console.log(`✅ Message ${messageId} mis à jour dans Firebase`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  async deleteMessage(conversationId, messageId) {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await deleteDoc(messageRef);

      console.log(`✅ Message ${messageId} supprimé de Firebase`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  // ===== GESTION DES CONVERSATIONS TEMPORAIRES =====

  async createTempConversation(conversationData) {
    try {
      const {
        name,
        avatar_url,
        description,
        created_by = 1,
        is_temporary = true,
        custom_settings = {},
      } = conversationData;

      // Créer la conversation dans Firestore
      const conversationRef = await addDoc(
        collection(this.db, 'conversations'),
        {
          type: 'individual',
          name,
          description,
          created_by,
          avatar_url,
          custom_settings,
          is_temporary,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
      );

      // Ajouter le créateur comme participant
      await addDoc(collection(this.db, 'conversation_participants'), {
        conversation_id: conversationRef.id,
        user_id: created_by,
        role: 'member',
        is_active: true,
        notification_settings: {
          muted: false,
          sound: true,
          vibration: true,
        },
        joined_at: serverTimestamp(),
      });

      // Si un contact est fourni dans custom_settings, l'ajouter comme participant virtuel
      if (custom_settings.contact) {
        await addDoc(collection(this.db, 'conversation_participants'), {
          conversation_id: conversationRef.id,
          user_id: `virtual_${custom_settings.contact.id || Date.now()}`,
          role: 'member',
          is_active: true,
          notification_settings: {
            muted: false,
            sound: true,
            vibration: true,
          },
          joined_at: serverTimestamp(),
          is_virtual_contact: true,
        });
      }

      console.log(
        `✅ Conversation temporaire créée dans Firestore avec l'ID: ${conversationRef.id}`
      );

      return {
        id: conversationRef.id,
        name,
        avatar_url,
        custom_settings,
        is_temporary: true,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la création de la conversation temporaire:',
        error
      );
      // Retourner une conversation de fallback en cas d'erreur
      return {
        id: `temp-${Date.now()}`,
        name: conversationData.name || 'Conversation temporaire',
        avatar_url: conversationData.avatar_url || '/default-avatar.png',
        custom_settings: conversationData.custom_settings || {},
        is_temporary: true,
        created_at: new Date().toISOString(),
      };
    }
  }

  async getTempConversations() {
    try {
      const q = query(
        collection(this.db, 'conversations'),
        where('is_temporary', '==', true),
        orderBy('updated_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const conversations = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          name: data.name || 'Conversation temporaire',
          avatar_url: data.avatar_url || '/default-avatar.png',
          custom_settings: data.custom_settings || {},
          created_at:
            data.created_at?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          updated_at:
            data.updated_at?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          is_temporary: data.is_temporary,
          contact: data.custom_settings?.contact || null,
        });
      });

      console.log(
        `✅ ${conversations.length} conversations temporaires récupérées depuis Firestore`
      );
      return conversations;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des conversations temporaires:',
        error
      );
      // Retourner un tableau vide en cas d'erreur
      return [];
    }
  }

  async cleanupOldTempConversations() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const q = query(
        collection(this.db, 'conversations'),
        where('is_temporary', '==', true),
        where('updated_at', '<', Timestamp.fromDate(sevenDaysAgo))
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = [];

      querySnapshot.forEach(doc => {
        deletePromises.push(this.deleteTempConversation(doc.id));
      });

      await Promise.all(deletePromises);

      console.log(
        `🧹 Nettoyage: ${deletePromises.length} conversations temporaires supprimées`
      );
      return deletePromises.length;
    } catch (error) {
      console.error(
        '❌ Erreur lors du nettoyage des conversations temporaires:',
        error
      );
      return 0;
    }
  }

  async deleteTempConversation(conversationId) {
    try {
      // Supprimer les participants
      const participantsQuery = query(
        collection(this.db, 'conversation_participants'),
        where('conversation_id', '==', conversationId)
      );
      const participantsSnapshot = await getDocs(participantsQuery);
      const participantDeletePromises = participantsSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(participantDeletePromises);

      // Supprimer les messages
      const messagesQuery = query(
        collection(this.db, 'messages'),
        where('conversation_id', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messageDeletePromises = messagesSnapshot.docs.map(doc =>
        deleteDoc(doc.ref)
      );
      await Promise.all(messageDeletePromises);

      // Supprimer la conversation
      const conversationRef = doc(this.db, 'conversations', conversationId);
      await deleteDoc(conversationRef);

      return true;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la suppression de la conversation temporaire:',
        error
      );
      throw error;
    }
  }

  // ===== GESTION DES CONVERSATIONS NORMALES =====

  async createConversation(conversationData) {
    try {
      const {
        type = 'individual',
        name,
        description,
        created_by,
        avatar_url,
        custom_settings = {},
      } = conversationData;

      const conversationRef = await addDoc(
        collection(this.db, 'conversations'),
        {
          type,
          name,
          description,
          created_by,
          avatar_url,
          custom_settings,
          is_temporary: false,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
      );

      return {
        id: conversationRef.id,
        ...conversationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  async getConversationsByUserId(userId, limitCount = 50, offset = 0) {
    try {
      // D'abord récupérer les IDs des conversations où l'utilisateur est participant
      const participantsQuery = query(
        collection(this.db, 'conversation_participants'),
        where('user_id', '==', userId)
      );
      const participantsSnapshot = await getDocs(participantsQuery);

      const conversationIds = participantsSnapshot.docs.map(
        doc => doc.data().conversation_id
      );

      if (conversationIds.length === 0) {
        return [];
      }

      // Récupérer les conversations
      const conversations = [];
      for (const convId of conversationIds) {
        const conversationRef = doc(this.db, 'conversations', convId);
        const conversationSnap = await getDoc(conversationRef);

        if (conversationSnap.exists()) {
          const data = conversationSnap.data();
          conversations.push({
            id: conversationSnap.id,
            ...data,
            created_at:
              data.created_at?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
            updated_at:
              data.updated_at?.toDate?.()?.toISOString() ||
              new Date().toISOString(),
          });
        }
      }

      // Trier par date de mise à jour et appliquer la pagination
      conversations.sort(
        (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
      );
      return conversations.slice(offset, offset + limitCount);
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des conversations:',
        error
      );
      return [];
    }
  }

  async searchConversations(userId, query, filters = {}) {
    try {
      const conversations = await this.getConversationsByUserId(userId);

      return conversations.filter(
        conv =>
          conv.name && conv.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error(
        '❌ Erreur lors de la recherche dans conversations:',
        error
      );
      return [];
    }
  }

  async getConversationStats(userId) {
    try {
      const conversations = await this.getConversationsByUserId(userId);

      return {
        total: conversations.length,
        unread: conversations.filter(c => c.unread_count > 0).length,
        pinned: conversations.filter(c => c.is_pinned).length,
      };
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des statistiques:',
        error
      );
      return { total: 0, unread: 0, pinned: 0 };
    }
  }

  async addParticipant(conversationId, userId, participantData = {}) {
    try {
      await addDoc(collection(this.db, 'conversation_participants'), {
        conversation_id: conversationId,
        user_id: userId,
        role: participantData.role || 'participant',
        is_active: true,
        is_admin: participantData.is_admin || false,
        notification_settings: participantData.notification_settings || {
          muted: false,
          sound: true,
          vibration: true,
        },
        joined_at: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("❌ Erreur lors de l'ajout du participant:", error);
      throw error;
    }
  }

  async getParticipants(conversationId) {
    try {
      const q = query(
        collection(this.db, 'conversation_participants'),
        where('conversation_id', '==', conversationId)
      );

      const querySnapshot = await getDocs(q);
      const participants = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        participants.push({
          id: doc.id,
          ...data,
          joined_at:
            data.joined_at?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
        });
      });

      return participants;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des participants:',
        error
      );
      return [];
    }
  }

  // Méthodes pour la gestion des utilisateurs
  async createUser(userData) {
    try {
      const userRef = doc(this.db, 'users', userData.id);
      const userDoc = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        loginCount: 1,
      };

      await setDoc(userRef, userDoc);
      console.log('✅ Utilisateur créé avec succès:', userData.id);
      return userDoc;
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  async getUserByGoogleId(googleId) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('googleId', '==', googleId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche par Google ID:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche par email:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);
      console.log('✅ Utilisateur mis à jour avec succès:', userId);
      return true;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  async updateUserLastSeen(userId, isOnline = false) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const updateData = {
        isOnline,
        lastSeen: isOnline ? null : new Date(),
        lastSeenTimestamp: isOnline ? null : Date.now(),
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  async updateUserLoginInfo(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentData = userSnap.data();
        const updateData = {
          lastLoginAt: new Date(),
          loginCount: (currentData.loginCount || 0) + 1,
          isOnline: true,
          lastSeen: null,
          lastSeenTimestamp: null,
          updatedAt: new Date(),
        };

        await updateDoc(userRef, updateData);
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la mise à jour des infos de connexion:',
        error
      );
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await deleteDoc(userRef);
      console.log('✅ Utilisateur supprimé avec succès:', userId);
      return true;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  async searchUsers(query, limit = 20) {
    try {
      const usersRef = collection(this.db, 'users');
      const q = query(
        usersRef,
        where('displayName', '>=', query),
        where('displayName', '<=', query + '\uf8ff'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const users = [];

      querySnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      return users;
    } catch (error) {
      console.error("❌ Erreur lors de la recherche d'utilisateurs:", error);
      throw error;
    }
  }

  async getUsersByIds(userIds) {
    try {
      if (!userIds || userIds.length === 0) return [];

      const users = [];
      const batchSize = 10; // Firestore limite les requêtes "in" à 10 éléments

      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        const usersRef = collection(this.db, 'users');
        const q = query(usersRef, where('__name__', 'in', batch));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });
      }

      return users;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des utilisateurs par IDs:',
        error
      );
      throw error;
    }
  }

  // ===== MÉTHODES DE COMPATIBILITÉ POUR SMART CACHE =====

  async getConversations(userId, limit = 50, offset = 0) {
    try {
      return await this.getConversationsByUserId(userId, limit, offset);
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des conversations:',
        error
      );
      throw error;
    }
  }

  async getMessages(conversationId, limitCount = 50, offset = 0) {
    try {
      // Créer une référence à la collection messages
      const messagesRef = collection(this.db, 'messages');

      // TEMPORAIRE : Utiliser une requête simple sans orderBy pour éviter l'erreur d'index
      // TODO: Créer l'index Firebase et remettre orderBy('created_at', 'desc')
      let q = query(
        messagesRef,
        where('conversation_id', '==', conversationId)
      );

      // Appliquer la limite si spécifiée
      if (limitCount && limitCount > 0) {
        q = query(q, limit(limitCount));
      }

      // Appliquer l'offset si spécifié (pour la pagination)
      if (offset && offset > 0) {
        // Pour startAfter, nous devons d'abord récupérer le document de référence
        const offsetQuery = query(
          messagesRef,
          where('conversation_id', '==', conversationId),
          limit(offset)
        );
        const offsetSnapshot = await getDocs(offsetQuery);

        if (offsetSnapshot.docs.length > 0) {
          const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
          q = query(q, startAfter(lastDoc));
        }
      }

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.() || data.created_at,
          updated_at: data.updated_at?.toDate?.() || data.updated_at,
        });
      });

      // Tri côté client en attendant l'index Firebase
      messages.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA; // Tri décroissant (plus récent en premier)
      });

      console.log(
        `✅ ${messages.length} messages récupérés pour la conversation ${conversationId} (tri côté client)`
      );
      return messages;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  // ===== LISTENERS EN TEMPS RÉEL =====

  /**
   * Écoute les nouveaux messages d'une conversation en temps réel
   * @param {string} conversationId - ID de la conversation
   * @param {function} callback - Fonction appelée quand un nouveau message arrive
   * @param {number} limitCount - Nombre maximum de messages à écouter (défaut: 50)
   * @returns {function} - Fonction unsubscribe pour arrêter l'écoute
   */
  listenToMessages(conversationId, callback, limitCount = 50) {
    try {
      if (!conversationId) {
        console.warn('⚠️ conversationId manquant pour listenToMessages');
        return () => {};
      }

      const messagesRef = collection(this.db, 'messages');

      // Query pour écouter les messages de la conversation
      // On n'utilise pas orderBy pour éviter le problème d'index Firebase
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversationId),
        limit(limitCount)
      );

      console.log(
        `🔊 Écoute des messages pour la conversation ${conversationId}`
      );

      // Créer le listener en temps réel
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const changes = [];

          snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const message = {
              id: change.doc.id,
              ...data,
              created_at: data.created_at?.toDate?.() || data.created_at,
              updated_at: data.updated_at?.toDate?.() || data.updated_at,
            };

            if (change.type === 'added') {
              changes.push({ type: 'added', message });
            } else if (change.type === 'modified') {
              changes.push({ type: 'modified', message });
            } else if (change.type === 'removed') {
              changes.push({ type: 'removed', message });
            }
          });

          // Trier les messages par date
          const allMessages = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            allMessages.push({
              id: doc.id,
              ...data,
              created_at: data.created_at?.toDate?.() || data.created_at,
              updated_at: data.updated_at?.toDate?.() || data.updated_at,
            });
          });

          allMessages.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateA - dateB; // Tri croissant (plus ancien en premier)
          });

          if (changes.length > 0) {
            console.log(
              `📩 ${changes.length} changement(s) de message détecté(s) pour ${conversationId}`
            );
            callback({ changes, allMessages });
          }
        },
        error => {
          console.error('❌ Erreur listener messages:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erreur lors de la création du listener:', error);
      return () => {};
    }
  }

  /**
   * Écoute les changements d'une conversation en temps réel
   * @param {string} conversationId - ID de la conversation
   * @param {function} callback - Fonction appelée quand la conversation change
   * @returns {function} - Fonction unsubscribe
   */
  listenToConversation(conversationId, callback) {
    try {
      if (!conversationId) {
        console.warn('⚠️ conversationId manquant pour listenToConversation');
        return () => {};
      }

      const conversationRef = doc(this.db, 'conversations', conversationId);

      console.log(`🔊 Écoute de la conversation ${conversationId}`);

      const unsubscribe = onSnapshot(
        conversationRef,
        docSnapshot => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const conversation = {
              id: docSnapshot.id,
              ...data,
              created_at: data.created_at?.toDate?.() || data.created_at,
              updated_at: data.updated_at?.toDate?.() || data.updated_at,
            };
            callback(conversation);
          }
        },
        error => {
          console.error('❌ Erreur listener conversation:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la création du listener conversation:',
        error
      );
      return () => {};
    }
  }

  /**
   * Écoute les conversations d'un utilisateur en temps réel
   * @param {string} userId - ID de l'utilisateur
   * @param {function} callback - Fonction appelée quand une conversation change
   * @returns {function} - Fonction unsubscribe pour arrêter l'écoute
   */
  listenToConversations(userId, callback) {
    try {
      if (!userId) {
        console.warn('⚠️ userId manquant pour listenToConversations');
        return () => {};
      }

      const conversationsRef = collection(this.db, 'conversations');

      // Query pour écouter les conversations où l'utilisateur est participant
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );

      console.log(`🔊 Écoute des conversations pour l'utilisateur ${userId}`);

      // Créer le listener en temps réel
      const unsubscribe = onSnapshot(
        q,
        snapshot => {
          const changes = [];

          snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const conversation = {
              id: change.doc.id,
              ...data,
              created_at: data.created_at?.toDate?.() || data.created_at,
              updated_at: data.updated_at?.toDate?.() || data.updated_at,
            };

            if (change.type === 'added') {
              console.log('➕ Nouvelle conversation:', conversation.id);
              changes.push({ type: 'added', conversation });
            } else if (change.type === 'modified') {
              console.log('✏️ Conversation modifiée:', conversation.id);
              changes.push({ type: 'modified', conversation });
            } else if (change.type === 'removed') {
              console.log('🗑️ Conversation supprimée:', conversation.id);
              changes.push({ type: 'removed', conversation });
            }
          });

          // Récupérer toutes les conversations
          const allConversations = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at:
              doc.data().created_at?.toDate?.() || doc.data().created_at,
            updated_at:
              doc.data().updated_at?.toDate?.() || doc.data().updated_at,
          }));

          // Appeler le callback avec les changements et toutes les conversations
          if (callback) {
            callback({ changes, allConversations });
          }
        },
        error => {
          console.error('❌ Erreur dans le listener conversations:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la création du listener conversations:',
        error
      );
      return () => {};
    }
  }

  /**
   * Ajoute une nouvelle conversation dans Firebase
   * @param {object} conversationData - Données de la conversation
   * @returns {Promise<object>} - Conversation créée avec son ID
   */
  async addConversation(conversationData) {
    try {
      const docId = conversationData.id;
      let conversationRef;

      if (docId) {
        // ID déterministe (conv-userA_userB)
        conversationRef = doc(this.db, 'conversations', docId);
        await setDoc(conversationRef, {
          ...conversationData,
          id: docId,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      } else {
        conversationRef = await addDoc(collection(this.db, 'conversations'), {
          ...conversationData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      }

      console.log(`✅ Conversation créée: ${conversationRef.id}`);

      return {
        id: conversationRef.id,
        ...conversationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }
}

// ===== EXPORTER L'INSTANCE SINGLETON =====

export default new FirebaseService();
