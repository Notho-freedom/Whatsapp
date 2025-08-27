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
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

class FirebaseService {
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
      // Retourner une conversation de fallback en cas d'erreur
      return {
        id: `temp-${Date.now()}`,
        name: conversationData.name || 'Conversation temporaire',
        avatar_url: conversationData.avatar_url || '/default-avatar.png',
        custom_settings: conversationData.custom_settings || {},
        is_temporary: true,
        created_at: new Date().toISOString()
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

      querySnapshot.forEach((doc) => {
        const data = doc.data();
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
      });

      console.log(`✅ ${conversations.length} conversations temporaires récupérées depuis Firestore`);
      return conversations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations temporaires:', error);
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

      querySnapshot.forEach((doc) => {
        deletePromises.push(this.deleteTempConversation(doc.id));
      });

      await Promise.all(deletePromises);

      console.log(`🧹 Nettoyage: ${deletePromises.length} conversations temporaires supprimées`);
      return deletePromises.length;
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

export default new FirebaseService();
