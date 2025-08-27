/**
 * Service Firebase avec cache local pour optimiser les performances
 * Combine Firebase avec le stockage local pour réduire les requêtes
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Import conditionnel du service de cache seulement côté client
let localStorageService = null;
if (typeof window !== 'undefined') {
  localStorageService = require('./localStorageService').default;
}

class CachedFirebaseService {
  constructor() {
    this.db = db;
    this.cache = localStorageService;
    this.requestQueue = new Map(); // Éviter les requêtes en double
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Exécuter une requête avec cache
   */
  async executeWithCache(cacheKey, firebaseQuery, ttl = 5 * 60 * 1000) {
    // Vérifier le cache d'abord seulement côté client
    if (this.isClient && this.cache) {
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        console.log(`📦 Données récupérées du cache: ${cacheKey}`);
        return cachedData;
      }
    }

    // Éviter les requêtes en double
    if (this.requestQueue.has(cacheKey)) {
      console.log(`⏳ Requête en cours pour: ${cacheKey}`);
      return this.requestQueue.get(cacheKey);
    }

    // Exécuter la requête Firebase
    const promise = firebaseQuery().then(data => {
      // Mettre en cache le résultat seulement côté client
      if (this.isClient && this.cache) {
        this.cache.set(cacheKey, data, ttl);
        console.log(`🔥 Données récupérées de Firebase et mises en cache: ${cacheKey}`);
      } else {
        console.log(`🔥 Données récupérées de Firebase (sans cache): ${cacheKey}`);
      }
      return data;
    }).catch(error => {
      console.error(`❌ Erreur Firebase pour ${cacheKey}:`, error);
      throw error;
    }).finally(() => {
      // Nettoyer la queue
      this.requestQueue.delete(cacheKey);
    });

    this.requestQueue.set(cacheKey, promise);
    return promise;
  }

  /**
   * Récupérer les conversations avec cache
   */
  async getConversations(userId, limitCount = 50, offset = 0) {
    const cacheKey = `conversations:${userId}:${limitCount}:${offset}`;
    
    return this.executeWithCache(cacheKey, async () => {
      const conversationsRef = collection(this.db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const conversations = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        conversations.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString(),
          last_message_time: data.last_message_time?.toDate?.()?.toISOString()
        });
      });

      // Trier côté client pour éviter l'index composite
      conversations.sort((a, b) => {
        const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
        const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
        return timeB - timeA; // Plus récent en premier
      });

      return conversations;
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Récupérer une conversation spécifique avec cache
   */
  async getConversation(conversationId) {
    const cacheKey = `conversation:${conversationId}`;
    
    return this.executeWithCache(cacheKey, async () => {
      const conversationRef = doc(this.db, 'conversations', conversationId);
      const snapshot = await getDoc(conversationRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString(),
        last_message_time: data.last_message_time?.toDate?.()?.toISOString()
      };
    }, 10 * 60 * 1000); // 10 minutes
  }

  /**
   * Récupérer les messages avec cache
   */
  async getMessages(conversationId, limitCount = 50, offset = 0) {
    const cacheKey = `messages:${conversationId}:${limitCount}:${offset}`;
    
    return this.executeWithCache(cacheKey, async () => {
      const messagesRef = collection(this.db, 'messages');
      const q = query(
        messagesRef,
        where('conversation_id', '==', conversationId),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const messages = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString()
        });
      });

      // Trier par date de création côté client (plus ancien en premier)
      messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      return messages;
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Sauvegarder un message avec invalidation du cache
   */
  async saveMessage(conversationId, messageData) {
    try {
      const messagesRef = collection(this.db, 'messages');
      const messageWithTimestamp = {
        ...messageData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(messagesRef, messageWithTimestamp);
      
      // Invalider le cache des messages pour cette conversation seulement côté client
      if (this.isClient && this.cache) {
        this.cache.invalidateConversation(conversationId);
      }
      
      console.log(`✅ Message sauvegardé dans Firebase: ${docRef.id}`);
      
      return {
        message: {
          id: docRef.id,
          ...messageData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        success: true
      };
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du message:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un message avec invalidation du cache
   */
  async updateMessage(messageId, updates) {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await updateDoc(messageRef, {
        ...updates,
        updated_at: serverTimestamp()
      });

      // Invalider le cache des messages seulement côté client
      if (this.isClient && this.cache) {
        this.cache.invalidateAllMessages();
      }
      
      console.log(`✅ Message ${messageId} mis à jour dans Firebase`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  /**
   * Supprimer un message avec invalidation du cache
   */
  async deleteMessage(messageId) {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await deleteDoc(messageRef);

      // Invalider le cache des messages seulement côté client
      if (this.isClient && this.cache) {
        this.cache.invalidateAllMessages();
      }
      
      console.log(`✅ Message ${messageId} supprimé de Firebase`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  /**
   * Créer une conversation avec invalidation du cache
   */
  async createConversation(conversationData) {
    try {
      const conversationsRef = collection(this.db, 'conversations');
      const conversationWithTimestamp = {
        ...conversationData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        last_message_time: serverTimestamp()
      };

      const docRef = await addDoc(conversationsRef, conversationWithTimestamp);
      
      // Invalider le cache des conversations seulement côté client
      if (this.isClient && this.cache) {
        this.cache.invalidateAllConversations();
      }
      
      console.log(`✅ Conversation créée dans Firebase: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...conversationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_time: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une conversation avec invalidation du cache
   */
  async updateConversation(conversationId, updates) {
    try {
      const conversationRef = doc(this.db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        ...updates,
        updated_at: serverTimestamp()
      });

      // Invalider le cache de cette conversation seulement côté client
      if (this.isClient && this.cache) {
        this.cache.invalidateConversation(conversationId);
      }
      
      console.log(`✅ Conversation ${conversationId} mise à jour dans Firebase`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  }

  /**
   * Rechercher des conversations avec cache
   */
  async searchConversations(userId, query, filters = {}) {
    const cacheKey = `search_conversations:${userId}:${query}:${JSON.stringify(filters)}`;
    
    return this.executeWithCache(cacheKey, async () => {
      const conversationsRef = collection(this.db, 'conversations');
      let q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      );

      // Ajouter des filtres si spécifiés
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      const snapshot = await getDocs(q);
      const conversations = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const conversation = {
          id: doc.id,
          ...data,
          created_at: data.created_at?.toDate?.()?.toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString(),
          last_message_time: data.last_message_time?.toDate?.()?.toISOString()
        };

        // Filtrer par recherche textuelle côté client
        if (query && !conversation.name?.toLowerCase().includes(query.toLowerCase())) {
          return;
        }

        conversations.push(conversation);
      });

      return conversations;
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Obtenir les statistiques du cache
   */
  getCacheStats() {
    if (this.isClient && this.cache) {
      return this.cache.getStats();
    }
    return { size: 0, maxSize: 0, hitRate: 0, memoryUsage: 0 };
  }

  /**
   * Vider le cache
   */
  clearCache() {
    if (this.isClient && this.cache) {
      this.cache.clear();
      console.log('🗑️ Cache vidé');
    }
  }

  /**
   * Précharger les données fréquemment utilisées
   */
  async preloadData(userId) {
    try {
      console.log('🚀 Préchargement des données...');
      
      // Précharger les conversations
      await this.getConversations(userId, 20, 0);
      
      // Précharger les conversations récentes
      const conversations = await this.getConversations(userId, 5, 0);
      
      // Précharger les messages pour les conversations récentes
      for (const conversation of conversations) {
        await this.getMessages(conversation.id, 20, 0);
      }
      
      console.log('✅ Préchargement terminé');
    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
    }
  }
}

// Instance singleton
const cachedFirebaseService = new CachedFirebaseService();

export default cachedFirebaseService;
