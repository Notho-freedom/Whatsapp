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
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

class FirebaseServerService {
  constructor() {
    this.db = db;
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
        custom_settings = {}
      } = conversationData;

      // Créer la conversation dans Firestore
      const conversationRef = await addDoc(collection(this.db, 'conversations'), {
        type: 'individual',
        name,
        description,
        created_by,
        avatar_url,
        custom_settings,
        is_temporary,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Ajouter le créateur comme participant
      await addDoc(collection(this.db, 'conversation_participants'), {
        conversation_id: conversationRef.id,
        user_id: created_by,
        role: 'member',
        is_active: true,
        notification_settings: {
          muted: false,
          sound: true,
          vibration: true
        },
        joined_at: serverTimestamp()
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
            vibration: true
          },
          joined_at: serverTimestamp(),
          is_virtual_contact: true
        });
      }

      console.log(`✅ Conversation temporaire créée dans Firestore avec l'ID: ${conversationRef.id}`);
      
      return {
        id: conversationRef.id,
        name,
        avatar_url,
        custom_settings,
        is_temporary: true,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation temporaire:', error);
      throw error;
    }
  }

  async getTempConversations() {
    try {
      // DÉSACTIVÉ: Requête complexe qui nécessite un index Firebase
      // Utiliser une requête simple pour éviter les erreurs
      const q = query(
        collection(this.db, 'conversations')
        // where('is_temporary', '==', true), // DÉSACTIVÉ
        // orderBy('updated_at', 'desc') // DÉSACTIVÉ
      );

      const querySnapshot = await getDocs(q);
      const conversations = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrer côté client pour éviter les erreurs d'index
        if (data.is_temporary === true) {
          conversations.push({
            id: doc.id,
            name: data.name || 'Conversation temporaire',
            avatar_url: data.avatar_url || '/default-avatar.png',
            custom_settings: data.custom_settings || {},
            created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            is_temporary: data.is_temporary,
            contact: data.custom_settings?.contact || null
          });
        }
      });

      // Trier côté client
      conversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      console.log(`✅ ${conversations.length} conversations temporaires récupérées depuis Firestore`);
      return conversations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations temporaires:', error);
      return [];
    }
  }

  async cleanupOldTempConversations() {
    try {
      // DÉSACTIVÉ: Ne plus supprimer automatiquement les conversations
      console.log('⚠️ Nettoyage automatique des conversations temporaires désactivé');
      return 0;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des conversations temporaires:', error);
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
      const participantDeletePromises = participantsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(participantDeletePromises);

      // Supprimer les messages
      const messagesQuery = query(
        collection(this.db, 'messages'),
        where('conversation_id', '==', conversationId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const messageDeletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(messageDeletePromises);

      // Supprimer la conversation
      const conversationRef = doc(this.db, 'conversations', conversationId);
      await deleteDoc(conversationRef);

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la conversation temporaire:', error);
      throw error;
    }
  }

  // ===== GESTION DES MESSAGES =====

  async saveMessage(conversationId, messageData) {
    try {
      const {
        text,
        sender,
        type = 'text',
        media = null,
        replyTo = null,
        reactions = [],
        isStarred = false,
        isRead = false,
        metadata = {}
      } = messageData;

      // Créer le message dans Firestore avec la structure compatible
      const messageRef = await addDoc(collection(this.db, 'messages'), {
        conversation_id: conversationId,
        text,
        sender,
        type,
        media, // Ajout du champ media pour les messages média
        reply_to: replyTo,
        reactions,
        is_starred: isStarred,
        is_read: isRead,
        metadata,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('fr-FR'),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Mettre à jour la conversation avec le dernier message
      const conversationRef = doc(this.db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        last_message: {
          text: text || (media ? `📎 ${media[0]?.type || 'fichier'}` : ''),
          type,
          sender,
          timestamp: serverTimestamp()
        },
        updated_at: serverTimestamp()
      });

      console.log(`✅ Message sauvegardé dans Firestore avec l'ID: ${messageRef.id}`);
      
      // Retourner la structure compatible avec l'interface existante
      return {
        id: messageRef.id,
        conversation_id: conversationId,
        sender,
        text,
        type,
        media,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('fr-FR'),
        read: isRead,
        reactions,
        reply_to: replyTo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du message:', error);
      throw error;
    }
  }

  async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      // Récupérer tous les messages de la conversation sans tri
      const q = query(
        collection(this.db, 'messages'),
        where('conversation_id', '==', conversationId)
      );

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          conversation_id: data.conversation_id,
          sender: data.sender,
          text: data.text,
          type: data.type || 'text',
          media: data.media || null, // Ajout du champ media
          time: data.time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          date: data.date || new Date().toLocaleDateString('fr-FR'),
          read: data.is_read || false,
          reactions: data.reactions || [],
          reply_to: data.reply_to,
          created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });

      // Trier par date de création côté client (plus récent en premier)
      messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Appliquer la pagination
      const paginatedMessages = messages.slice(offset, offset + limit);

      console.log(`✅ ${paginatedMessages.length} messages récupérés pour la conversation ${conversationId}`);
      return paginatedMessages;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  async updateMessage(messageId, updates) {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await updateDoc(messageRef, {
        ...updates,
        updated_at: serverTimestamp()
      });

      console.log(`✅ Message ${messageId} mis à jour dans Firestore`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId) {
    try {
      const messageRef = doc(this.db, 'messages', messageId);
      await deleteDoc(messageRef);

      console.log(`✅ Message ${messageId} supprimé de Firestore`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
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
        custom_settings = {}
      } = conversationData;

      const conversationRef = await addDoc(collection(this.db, 'conversations'), {
        type,
        name,
        description,
        created_by,
        avatar_url,
        custom_settings,
        is_temporary: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return {
        id: conversationRef.id,
        ...conversationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      
      const conversationIds = participantsSnapshot.docs.map(doc => doc.data().conversation_id);

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
            created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
            updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
          });
        }
      }

      // Trier par date de mise à jour et appliquer la pagination
      conversations.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      return conversations.slice(offset, offset + limitCount);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  async searchConversations(userId, query, filters = {}) {
    try {
      const conversations = await this.getConversationsByUserId(userId);
      
      return conversations.filter(conv => 
        conv.name && conv.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('❌ Erreur lors de la recherche dans conversations:', error);
      return [];
    }
  }

  async getConversationStats(userId) {
    try {
      const conversations = await this.getConversationsByUserId(userId);
      
      return {
        total: conversations.length,
        unread: conversations.filter(c => c.unread_count > 0).length,
        pinned: conversations.filter(c => c.is_pinned).length
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
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
          vibration: true
        },
        joined_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du participant:', error);
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

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        participants.push({
          id: doc.id,
          ...data,
          joined_at: data.joined_at?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });

      return participants;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des participants:', error);
      return [];
    }
  }
}

export default new FirebaseServerService();
