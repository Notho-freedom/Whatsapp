import { adminDb, runTransaction } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class ConversationService {
  /**
   * Créer une nouvelle conversation
   */
  static async createConversation(creatorId, participants, type = 'individual', metadata = {}) {
    try {
      return await runTransaction(async (transaction) => {
        // Vérifier que tous les participants existent
        const participantRefs = participants.map(id => adminDb.collection('users').doc(id));
        const participantDocs = await Promise.all(
          participantRefs.map(ref => transaction.get(ref))
        );
        
        const validParticipants = [];
        participantDocs.forEach((doc, index) => {
          if (doc.exists) {
            validParticipants.push({
              uid: participants[index],
              displayName: doc.data().displayName,
              photoURL: doc.data().photoURL
            });
          }
        });
        
        if (validParticipants.length < 2) {
          throw new Error('Au moins 2 participants valides requis');
        }
        
        // Pour les conversations individuelles, vérifier qu'elle n'existe pas déjà
        if (type === 'individual' && participants.length === 2) {
          const existingQuery = await adminDb
            .collection('conversations')
            .where('type', '==', 'individual')
            .where('participantIds', 'array-contains', participants[0])
            .get();
          
          for (const doc of existingQuery.docs) {
            const data = doc.data();
            if (data.participantIds.includes(participants[1])) {
              // Conversation existe déjà
              return { id: doc.id, ...data, isExisting: true };
            }
          }
        }
        
        // Créer la nouvelle conversation
        const conversationRef = adminDb.collection('conversations').doc();
        const conversationData = {
          id: conversationRef.id,
          type,
          name: metadata.name || null,
          description: metadata.description || null,
          photoURL: metadata.photoURL || null,
          createdBy: creatorId,
          participantIds: participants,
          participants: validParticipants,
          lastMessage: null,
          lastMessageTime: null,
          messageCount: 0,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          settings: {
            muted: {},
            archived: {},
            pinned: {},
            notifications: metadata.notifications || true
          },
          metadata: metadata.customData || {}
        };
        
        transaction.set(conversationRef, conversationData);
        
        // Mettre à jour les stats des utilisateurs
        participants.forEach(uid => {
          const userRef = adminDb.collection('users').doc(uid);
          transaction.update(userRef, {
            'stats.conversationsStarted': FieldValue.increment(1)
          });
        });
        
        return conversationData;
      });
    } catch (error) {
      console.error('Erreur création conversation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les conversations d'un utilisateur
   */
  static async getUserConversations(userId, limit = 50, lastDoc = null) {
    try {
      let query = adminDb
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .orderBy('lastMessageTime', 'desc')
        .limit(limit);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      const conversations = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Récupérer les infos de lecture
          const readStatus = await this.getReadStatus(doc.id, userId);
          
          return {
            id: doc.id,
            ...data,
            unreadCount: readStatus.unreadCount,
            lastRead: readStatus.lastRead,
            isPinned: data.settings?.pinned?.[userId] || false,
            isMuted: data.settings?.muted?.[userId] || false,
            isArchived: data.settings?.archived?.[userId] || false
          };
        })
      );
      
      return {
        conversations,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limit
      };
    } catch (error) {
      console.error('Erreur récupération conversations:', error);
      throw error;
    }
  }

  /**
   * Récupérer une conversation spécifique
   */
  static async getConversation(conversationId, userId) {
    try {
      const doc = await adminDb.collection('conversations').doc(conversationId).get();
      
      if (!doc.exists) {
        throw new Error('Conversation non trouvée');
      }
      
      const data = doc.data();
      
      // Vérifier que l'utilisateur est participant
      if (!data.participantIds.includes(userId)) {
        throw new Error('Accès non autorisé');
      }
      
      // Récupérer les infos de lecture
      const readStatus = await this.getReadStatus(conversationId, userId);
      
      return {
        id: doc.id,
        ...data,
        unreadCount: readStatus.unreadCount,
        lastRead: readStatus.lastRead,
        isPinned: data.settings?.pinned?.[userId] || false,
        isMuted: data.settings?.muted?.[userId] || false,
        isArchived: data.settings?.archived?.[userId] || false
      };
    } catch (error) {
      console.error('Erreur récupération conversation:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une conversation
   */
  static async updateConversation(conversationId, userId, updates) {
    try {
      const conversationRef = adminDb.collection('conversations').doc(conversationId);
      const doc = await conversationRef.get();
      
      if (!doc.exists) {
        throw new Error('Conversation non trouvée');
      }
      
      const data = doc.data();
      
      // Vérifier les permissions
      if (!data.participantIds.includes(userId)) {
        throw new Error('Accès non autorisé');
      }
      
      // Pour les groupes, seul le créateur peut modifier certains champs
      if (data.type === 'group' && ['name', 'description', 'photoURL'].some(field => field in updates)) {
        if (data.createdBy !== userId) {
          throw new Error('Seul le créateur peut modifier ces informations');
        }
      }
      
      const allowedUpdates = ['name', 'description', 'photoURL'];
      const filteredUpdates = {};
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = value;
        }
      }
      
      if (Object.keys(filteredUpdates).length > 0) {
        filteredUpdates.updatedAt = FieldValue.serverTimestamp();
        await conversationRef.update(filteredUpdates);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour conversation:', error);
      throw error;
    }
  }

  /**
   * Gérer les paramètres utilisateur d'une conversation
   */
  static async updateUserSettings(conversationId, userId, settings) {
    try {
      const updates = {};
      
      if ('pinned' in settings) {
        updates[`settings.pinned.${userId}`] = settings.pinned;
      }
      
      if ('muted' in settings) {
        updates[`settings.muted.${userId}`] = settings.muted;
      }
      
      if ('archived' in settings) {
        updates[`settings.archived.${userId}`] = settings.archived;
      }
      
      if (Object.keys(updates).length > 0) {
        await adminDb.collection('conversations').doc(conversationId).update(updates);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      throw error;
    }
  }

  /**
   * Ajouter un participant à une conversation de groupe
   */
  static async addParticipant(conversationId, addedBy, newParticipantId) {
    try {
      return await runTransaction(async (transaction) => {
        const conversationRef = adminDb.collection('conversations').doc(conversationId);
        const userRef = adminDb.collection('users').doc(newParticipantId);
        
        const [conversationDoc, userDoc] = await Promise.all([
          transaction.get(conversationRef),
          transaction.get(userRef)
        ]);
        
        if (!conversationDoc.exists) {
          throw new Error('Conversation non trouvée');
        }
        
        if (!userDoc.exists) {
          throw new Error('Utilisateur non trouvé');
        }
        
        const conversationData = conversationDoc.data();
        
        // Vérifications
        if (conversationData.type !== 'group') {
          throw new Error('Seuls les groupes peuvent ajouter des participants');
        }
        
        if (!conversationData.participantIds.includes(addedBy)) {
          throw new Error('Accès non autorisé');
        }
        
        if (conversationData.participantIds.includes(newParticipantId)) {
          throw new Error('Utilisateur déjà participant');
        }
        
        const userData = userDoc.data();
        const newParticipant = {
          uid: newParticipantId,
          displayName: userData.displayName,
          photoURL: userData.photoURL
        };
        
        // Mettre à jour la conversation
        transaction.update(conversationRef, {
          participantIds: FieldValue.arrayUnion(newParticipantId),
          participants: FieldValue.arrayUnion(newParticipant),
          updatedAt: FieldValue.serverTimestamp()
        });
        
        // Créer un message système
        const messageRef = adminDb.collection('messages').doc();
        transaction.set(messageRef, {
          id: messageRef.id,
          conversationId,
          type: 'system',
          content: `${userData.displayName} a été ajouté au groupe`,
          sender: null,
          timestamp: FieldValue.serverTimestamp(),
          metadata: {
            action: 'participant_added',
            addedBy,
            addedUser: newParticipantId
          }
        });
        
        return { success: true };
      });
    } catch (error) {
      console.error('Erreur ajout participant:', error);
      throw error;
    }
  }

  /**
   * Retirer un participant d'une conversation de groupe
   */
  static async removeParticipant(conversationId, removedBy, participantId) {
    try {
      return await runTransaction(async (transaction) => {
        const conversationRef = adminDb.collection('conversations').doc(conversationId);
        const conversationDoc = await transaction.get(conversationRef);
        
        if (!conversationDoc.exists) {
          throw new Error('Conversation non trouvée');
        }
        
        const conversationData = conversationDoc.data();
        
        // Vérifications
        if (conversationData.type !== 'group') {
          throw new Error('Seuls les groupes peuvent retirer des participants');
        }
        
        if (!conversationData.participantIds.includes(removedBy)) {
          throw new Error('Accès non autorisé');
        }
        
        if (!conversationData.participantIds.includes(participantId)) {
          throw new Error('Utilisateur non participant');
        }
        
        // Ne pas permettre de retirer le créateur
        if (participantId === conversationData.createdBy && removedBy !== participantId) {
          throw new Error('Impossible de retirer le créateur du groupe');
        }
        
        // Retirer le participant
        const updatedParticipants = conversationData.participants.filter(
          p => p.uid !== participantId
        );
        
        transaction.update(conversationRef, {
          participantIds: FieldValue.arrayRemove(participantId),
          participants: updatedParticipants,
          updatedAt: FieldValue.serverTimestamp()
        });
        
        // Créer un message système
        const messageRef = adminDb.collection('messages').doc();
        const isLeaving = removedBy === participantId;
        
        transaction.set(messageRef, {
          id: messageRef.id,
          conversationId,
          type: 'system',
          content: isLeaving 
            ? `${conversationData.participants.find(p => p.uid === participantId)?.displayName} a quitté le groupe`
            : `${conversationData.participants.find(p => p.uid === participantId)?.displayName} a été retiré du groupe`,
          sender: null,
          timestamp: FieldValue.serverTimestamp(),
          metadata: {
            action: isLeaving ? 'participant_left' : 'participant_removed',
            removedBy,
            removedUser: participantId
          }
        });
        
        return { success: true };
      });
    } catch (error) {
      console.error('Erreur retrait participant:', error);
      throw error;
    }
  }

  /**
   * Obtenir le statut de lecture d'une conversation
   */
  static async getReadStatus(conversationId, userId) {
    try {
      const readDoc = await adminDb
        .collection('conversations')
        .doc(conversationId)
        .collection('reads')
        .doc(userId)
        .get();
      
      if (!readDoc.exists) {
        return { unreadCount: 0, lastRead: null };
      }
      
      const data = readDoc.data();
      return {
        unreadCount: data.unreadCount || 0,
        lastRead: data.lastRead
      };
    } catch (error) {
      console.error('Erreur récupération statut lecture:', error);
      return { unreadCount: 0, lastRead: null };
    }
  }

  /**
   * Marquer une conversation comme lue
   */
  static async markAsRead(conversationId, userId) {
    try {
      await adminDb
        .collection('conversations')
        .doc(conversationId)
        .collection('reads')
        .doc(userId)
        .set({
          unreadCount: 0,
          lastRead: FieldValue.serverTimestamp()
        }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur marquage comme lu:', error);
      throw error;
    }
  }

  /**
   * Supprimer une conversation
   */
  static async deleteConversation(conversationId, userId) {
    try {
      const conversationRef = adminDb.collection('conversations').doc(conversationId);
      const doc = await conversationRef.get();
      
      if (!doc.exists) {
        throw new Error('Conversation non trouvée');
      }
      
      const data = doc.data();
      
      // Seul le créateur peut supprimer un groupe
      if (data.type === 'group' && data.createdBy !== userId) {
        throw new Error('Seul le créateur peut supprimer le groupe');
      }
      
      // Pour les conversations individuelles, on archive seulement
      if (data.type === 'individual') {
        await this.updateUserSettings(conversationId, userId, { archived: true });
        return { success: true, archived: true };
      }
      
      // Supprimer complètement le groupe
      const batch = adminDb.batch();
      
      // Supprimer la conversation
      batch.delete(conversationRef);
      
      // Supprimer tous les messages
      const messagesSnapshot = await adminDb
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .get();
      
      messagesSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      return { success: true, deleted: true };
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
      throw error;
    }
  }
}