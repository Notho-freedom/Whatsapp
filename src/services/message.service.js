import { adminDb, runTransaction } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class MessageService {
  /**
   * Envoyer un message
   */
  static async sendMessage(conversationId, senderId, messageData) {
    try {
      return await runTransaction(async (transaction) => {
        const conversationRef = adminDb.collection('conversations').doc(conversationId);
        const senderRef = adminDb.collection('users').doc(senderId);
        
        const [conversationDoc, senderDoc] = await Promise.all([
          transaction.get(conversationRef),
          transaction.get(senderRef)
        ]);
        
        if (!conversationDoc.exists) {
          throw new Error('Conversation non trouvée');
        }
        
        if (!senderDoc.exists) {
          throw new Error('Expéditeur non trouvé');
        }
        
        const conversationData = conversationDoc.data();
        const senderData = senderDoc.data();
        
        // Vérifier que l'expéditeur est participant
        if (!conversationData.participantIds.includes(senderId)) {
          throw new Error('Accès non autorisé');
        }
        
        // Créer le message
        const messageRef = adminDb.collection('messages').doc();
        const message = {
          id: messageRef.id,
          conversationId,
          type: messageData.type || 'text',
          content: messageData.content || '',
          sender: {
            uid: senderId,
            displayName: senderData.displayName,
            photoURL: senderData.photoURL
          },
          timestamp: FieldValue.serverTimestamp(),
          edited: false,
          deleted: false,
          reactions: {},
          readBy: {
            [senderId]: FieldValue.serverTimestamp()
          },
          replyTo: messageData.replyTo || null,
          media: messageData.media || null,
          metadata: messageData.metadata || {}
        };
        
        // Valider le message selon son type
        this.validateMessage(message);
        
        // Sauvegarder le message
        transaction.set(messageRef, message);
        
        // Mettre à jour la conversation
        const lastMessagePreview = this.generateMessagePreview(message);
        transaction.update(conversationRef, {
          lastMessage: lastMessagePreview,
          lastMessageTime: FieldValue.serverTimestamp(),
          messageCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp()
        });
        
        // Mettre à jour les compteurs de non-lus pour les autres participants
        const otherParticipants = conversationData.participantIds.filter(id => id !== senderId);
        const readUpdatePromises = otherParticipants.map(participantId => {
          const readRef = conversationRef.collection('reads').doc(participantId);
          return transaction.update(readRef, {
            unreadCount: FieldValue.increment(1)
          });
        });
        
        // Mettre à jour les stats de l'expéditeur
        transaction.update(senderRef, {
          'stats.messagesSent': FieldValue.increment(1),
          lastActivity: FieldValue.serverTimestamp()
        });
        
        return message;
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }

  /**
   * Récupérer les messages d'une conversation
   */
  static async getMessages(conversationId, userId, limit = 50, lastDoc = null) {
    try {
      // Vérifier l'accès
      const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get();
      if (!conversationDoc.exists || !conversationDoc.data().participantIds.includes(userId)) {
        throw new Error('Accès non autorisé');
      }
      
      let query = adminDb
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .where('deleted', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(limit);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isRead: doc.data().readBy?.[userId] ? true : false
      }));
      
      return {
        messages: messages.reverse(), // Ordre chronologique
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limit
      };
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      throw error;
    }
  }

  /**
   * Modifier un message
   */
  static async editMessage(messageId, userId, newContent) {
    try {
      const messageRef = adminDb.collection('messages').doc(messageId);
      const messageDoc = await messageRef.get();
      
      if (!messageDoc.exists) {
        throw new Error('Message non trouvé');
      }
      
      const messageData = messageDoc.data();
      
      // Vérifier que l'utilisateur est l'auteur
      if (messageData.sender.uid !== userId) {
        throw new Error('Seul l\'auteur peut modifier le message');
      }
      
      // Vérifier que le message n'est pas trop ancien (24h)
      const messageTime = messageData.timestamp.toMillis();
      const now = Date.now();
      const hoursSinceMessage = (now - messageTime) / (1000 * 60 * 60);
      
      if (hoursSinceMessage > 24) {
        throw new Error('Message trop ancien pour être modifié');
      }
      
      // Mettre à jour le message
      await messageRef.update({
        content: newContent,
        edited: true,
        editedAt: FieldValue.serverTimestamp(),
        editHistory: FieldValue.arrayUnion({
          content: messageData.content,
          editedAt: new Date()
        })
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur modification message:', error);
      throw error;
    }
  }

  /**
   * Supprimer un message
   */
  static async deleteMessage(messageId, userId) {
    try {
      return await runTransaction(async (transaction) => {
        const messageRef = adminDb.collection('messages').doc(messageId);
        const messageDoc = await transaction.get(messageRef);
        
        if (!messageDoc.exists) {
          throw new Error('Message non trouvé');
        }
        
        const messageData = messageDoc.data();
        
        // Vérifier que l'utilisateur est l'auteur ou admin du groupe
        const conversationDoc = await transaction.get(
          adminDb.collection('conversations').doc(messageData.conversationId)
        );
        
        const conversationData = conversationDoc.data();
        const isAuthor = messageData.sender.uid === userId;
        const isGroupAdmin = conversationData.type === 'group' && conversationData.createdBy === userId;
        
        if (!isAuthor && !isGroupAdmin) {
          throw new Error('Permission refusée');
        }
        
        // Marquer comme supprimé (soft delete)
        transaction.update(messageRef, {
          deleted: true,
          deletedAt: FieldValue.serverTimestamp(),
          deletedBy: userId,
          content: '[Message supprimé]'
        });
        
        // Si c'était le dernier message, mettre à jour la conversation
        if (conversationData.lastMessage?.id === messageId) {
          // Récupérer l'avant-dernier message
          const previousMessageQuery = await adminDb
            .collection('messages')
            .where('conversationId', '==', messageData.conversationId)
            .where('deleted', '==', false)
            .orderBy('timestamp', 'desc')
            .limit(2)
            .get();
          
          if (previousMessageQuery.docs.length > 1) {
            const previousMessage = previousMessageQuery.docs[1].data();
            const preview = this.generateMessagePreview(previousMessage);
            
            transaction.update(conversationDoc.ref, {
              lastMessage: preview,
              lastMessageTime: previousMessage.timestamp
            });
          } else {
            transaction.update(conversationDoc.ref, {
              lastMessage: null,
              lastMessageTime: null
            });
          }
        }
        
        return { success: true };
      });
    } catch (error) {
      console.error('Erreur suppression message:', error);
      throw error;
    }
  }

  /**
   * Ajouter une réaction à un message
   */
  static async addReaction(messageId, userId, reaction) {
    try {
      const messageRef = adminDb.collection('messages').doc(messageId);
      const messageDoc = await messageRef.get();
      
      if (!messageDoc.exists) {
        throw new Error('Message non trouvé');
      }
      
      // Mettre à jour les réactions
      await messageRef.update({
        [`reactions.${reaction}.${userId}`]: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur ajout réaction:', error);
      throw error;
    }
  }

  /**
   * Retirer une réaction d'un message
   */
  static async removeReaction(messageId, userId, reaction) {
    try {
      const messageRef = adminDb.collection('messages').doc(messageId);
      const messageDoc = await messageRef.get();
      
      if (!messageDoc.exists) {
        throw new Error('Message non trouvé');
      }
      
      // Retirer la réaction
      await messageRef.update({
        [`reactions.${reaction}.${userId}`]: FieldValue.delete()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur retrait réaction:', error);
      throw error;
    }
  }

  /**
   * Marquer un message comme lu
   */
  static async markAsRead(messageId, userId) {
    try {
      await adminDb.collection('messages').doc(messageId).update({
        [`readBy.${userId}`]: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur marquage comme lu:', error);
      throw error;
    }
  }

  /**
   * Marquer plusieurs messages comme lus
   */
  static async markMultipleAsRead(messageIds, userId) {
    try {
      const batch = adminDb.batch();
      
      messageIds.forEach(messageId => {
        const messageRef = adminDb.collection('messages').doc(messageId);
        batch.update(messageRef, {
          [`readBy.${userId}`]: FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur marquage multiple comme lu:', error);
      throw error;
    }
  }

  /**
   * Rechercher des messages
   */
  static async searchMessages(userId, query, conversationId = null) {
    try {
      // Construire la requête de base
      let searchQuery = adminDb.collection('messages')
        .where('deleted', '==', false)
        .orderBy('timestamp', 'desc')
        .limit(50);
      
      if (conversationId) {
        // Recherche dans une conversation spécifique
        const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get();
        if (!conversationDoc.exists || !conversationDoc.data().participantIds.includes(userId)) {
          throw new Error('Accès non autorisé');
        }
        
        searchQuery = searchQuery.where('conversationId', '==', conversationId);
      } else {
        // Recherche dans toutes les conversations de l'utilisateur
        const userConversations = await adminDb
          .collection('conversations')
          .where('participantIds', 'array-contains', userId)
          .get();
        
        const conversationIds = userConversations.docs.map(doc => doc.id);
        
        if (conversationIds.length === 0) {
          return { messages: [], total: 0 };
        }
        
        searchQuery = searchQuery.where('conversationId', 'in', conversationIds);
      }
      
      // Note: Pour une vraie recherche full-text, il faudrait utiliser Algolia ou ElasticSearch
      // Ici on fait une recherche basique côté client
      const snapshot = await searchQuery.get();
      
      const messages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(message => {
          const searchLower = query.toLowerCase();
          const contentLower = (message.content || '').toLowerCase();
          const senderName = (message.sender?.displayName || '').toLowerCase();
          
          return contentLower.includes(searchLower) || senderName.includes(searchLower);
        });
      
      return {
        messages,
        total: messages.length
      };
    } catch (error) {
      console.error('Erreur recherche messages:', error);
      throw error;
    }
  }

  /**
   * Obtenir les messages épinglés d'une conversation
   */
  static async getPinnedMessages(conversationId, userId) {
    try {
      // Vérifier l'accès
      const conversationDoc = await adminDb.collection('conversations').doc(conversationId).get();
      if (!conversationDoc.exists || !conversationDoc.data().participantIds.includes(userId)) {
        throw new Error('Accès non autorisé');
      }
      
      const snapshot = await adminDb
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .where('deleted', '==', false)
        .where('pinned', '==', true)
        .orderBy('pinnedAt', 'desc')
        .get();
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return messages;
    } catch (error) {
      console.error('Erreur récupération messages épinglés:', error);
      throw error;
    }
  }

  /**
   * Valider un message selon son type
   */
  static validateMessage(message) {
    switch (message.type) {
      case 'text':
        if (!message.content || message.content.trim().length === 0) {
          throw new Error('Le contenu du message ne peut pas être vide');
        }
        if (message.content.length > 5000) {
          throw new Error('Le message est trop long (max 5000 caractères)');
        }
        break;
        
      case 'image':
      case 'video':
      case 'audio':
      case 'document':
        if (!message.media || !message.media.url) {
          throw new Error('URL du média requise');
        }
        break;
        
      case 'location':
        if (!message.metadata?.latitude || !message.metadata?.longitude) {
          throw new Error('Coordonnées GPS requises');
        }
        break;
        
      case 'system':
        if (!message.metadata?.action) {
          throw new Error('Action système requise');
        }
        break;
        
      default:
        throw new Error(`Type de message non supporté: ${message.type}`);
    }
  }

  /**
   * Générer un aperçu du message pour la conversation
   */
  static generateMessagePreview(message) {
    let preview = {
      id: message.id,
      type: message.type,
      sender: message.sender,
      timestamp: message.timestamp
    };
    
    switch (message.type) {
      case 'text':
        preview.text = message.content.substring(0, 100);
        break;
      case 'image':
        preview.text = '📷 Photo';
        break;
      case 'video':
        preview.text = '🎥 Vidéo';
        break;
      case 'audio':
        preview.text = '🎵 Audio';
        break;
      case 'document':
        preview.text = `📄 ${message.media?.fileName || 'Document'}`;
        break;
      case 'location':
        preview.text = '📍 Position';
        break;
      case 'system':
        preview.text = message.content;
        break;
      default:
        preview.text = 'Message';
    }
    
    return preview;
  }
}