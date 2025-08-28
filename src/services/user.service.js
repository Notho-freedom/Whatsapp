import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export class UserService {
  /**
   * Rechercher des utilisateurs
   */
  static async searchUsers(query, currentUserId, limit = 20) {
    try {
      const searchQuery = query.toLowerCase().trim();
      
      if (searchQuery.length < 2) {
        return { users: [], total: 0 };
      }
      
      // Recherche par nom d'affichage
      // Note: Pour une vraie recherche full-text, utiliser Algolia ou ElasticSearch
      const snapshot = await adminDb
        .collection('users')
        .where('displayName', '>=', searchQuery)
        .where('displayName', '<=', searchQuery + '\uf8ff')
        .limit(limit)
        .get();
      
      const users = [];
      
      snapshot.forEach(doc => {
        if (doc.id !== currentUserId) {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        }
      });
      
      // Recherche additionnelle par email si c'est un email
      if (searchQuery.includes('@')) {
        const emailSnapshot = await adminDb
          .collection('users')
          .where('email', '==', searchQuery)
          .limit(1)
          .get();
        
        emailSnapshot.forEach(doc => {
          if (doc.id !== currentUserId && !users.find(u => u.id === doc.id)) {
            users.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
      }
      
      return {
        users,
        total: users.length
      };
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Obtenir un utilisateur par ID
   */
  static async getUserById(userId) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      throw error;
    }
  }

  /**
   * Obtenir plusieurs utilisateurs par IDs
   */
  static async getUsersByIds(userIds) {
    try {
      if (userIds.length === 0) {
        return [];
      }
      
      // Firestore limite à 10 éléments pour 'in'
      const chunks = [];
      for (let i = 0; i < userIds.length; i += 10) {
        chunks.push(userIds.slice(i, i + 10));
      }
      
      const users = [];
      
      for (const chunk of chunks) {
        const snapshot = await adminDb
          .collection('users')
          .where(adminDb.FieldPath.documentId(), 'in', chunk)
          .get();
        
        snapshot.forEach(doc => {
          users.push({
            id: doc.id,
            ...doc.data()
          });
        });
      }
      
      return users;
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  /**
   * Obtenir les contacts d'un utilisateur
   */
  static async getUserContacts(userId, limit = 50, lastDoc = null) {
    try {
      let query = adminDb
        .collection('users')
        .doc(userId)
        .collection('contacts')
        .orderBy('displayName')
        .limit(limit);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      const snapshot = await query.get();
      
      const contactIds = snapshot.docs.map(doc => doc.id);
      const contacts = await this.getUsersByIds(contactIds);
      
      // Enrichir avec les métadonnées de contact
      const enrichedContacts = contacts.map(contact => {
        const contactDoc = snapshot.docs.find(doc => doc.id === contact.id);
        const contactData = contactDoc?.data() || {};
        
        return {
          ...contact,
          isFavorite: contactData.isFavorite || false,
          isBlocked: contactData.isBlocked || false,
          addedAt: contactData.addedAt,
          customName: contactData.customName || null,
          labels: contactData.labels || []
        };
      });
      
      return {
        contacts: enrichedContacts,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        hasMore: snapshot.docs.length === limit
      };
    } catch (error) {
      console.error('Erreur récupération contacts:', error);
      throw error;
    }
  }

  /**
   * Ajouter un contact
   */
  static async addContact(userId, contactId, metadata = {}) {
    try {
      // Vérifier que le contact existe
      const contactDoc = await adminDb.collection('users').doc(contactId).get();
      
      if (!contactDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (userId === contactId) {
        throw new Error('Impossible de s\'ajouter soi-même comme contact');
      }
      
      const contactData = contactDoc.data();
      
      // Ajouter le contact
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('contacts')
        .doc(contactId)
        .set({
          displayName: contactData.displayName,
          addedAt: FieldValue.serverTimestamp(),
          isFavorite: metadata.isFavorite || false,
          isBlocked: metadata.isBlocked || false,
          customName: metadata.customName || null,
          labels: metadata.labels || []
        });
      
      return {
        success: true,
        contact: {
          id: contactId,
          ...contactData,
          ...metadata
        }
      };
    } catch (error) {
      console.error('Erreur ajout contact:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un contact
   */
  static async updateContact(userId, contactId, updates) {
    try {
      const allowedUpdates = ['isFavorite', 'isBlocked', 'customName', 'labels'];
      const filteredUpdates = {};
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = value;
        }
      }
      
      if (Object.keys(filteredUpdates).length > 0) {
        await adminDb
          .collection('users')
          .doc(userId)
          .collection('contacts')
          .doc(contactId)
          .update(filteredUpdates);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour contact:', error);
      throw error;
    }
  }

  /**
   * Supprimer un contact
   */
  static async removeContact(userId, contactId) {
    try {
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('contacts')
        .doc(contactId)
        .delete();
      
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression contact:', error);
      throw error;
    }
  }

  /**
   * Bloquer/débloquer un utilisateur
   */
  static async toggleBlockUser(userId, targetUserId, block = true) {
    try {
      // Mettre à jour dans les contacts
      const contactRef = adminDb
        .collection('users')
        .doc(userId)
        .collection('contacts')
        .doc(targetUserId);
      
      const contactDoc = await contactRef.get();
      
      if (contactDoc.exists) {
        await contactRef.update({ isBlocked: block });
      } else {
        // Créer le contact s'il n'existe pas
        const targetUser = await this.getUserById(targetUserId);
        await contactRef.set({
          displayName: targetUser.displayName,
          addedAt: FieldValue.serverTimestamp(),
          isBlocked: block
        });
      }
      
      // Ajouter/retirer de la liste des bloqués
      const userRef = adminDb.collection('users').doc(userId);
      
      if (block) {
        await userRef.update({
          blockedUsers: FieldValue.arrayUnion(targetUserId)
        });
      } else {
        await userRef.update({
          blockedUsers: FieldValue.arrayRemove(targetUserId)
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur blocage utilisateur:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'un utilisateur
   */
  static async getUserStats(userId) {
    try {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      
      const userData = userDoc.data();
      
      // Compter les conversations
      const conversationsSnapshot = await adminDb
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .count()
        .get();
      
      // Compter les contacts
      const contactsSnapshot = await adminDb
        .collection('users')
        .doc(userId)
        .collection('contacts')
        .count()
        .get();
      
      return {
        messagesSent: userData.stats?.messagesSent || 0,
        conversationsCount: conversationsSnapshot.data().count,
        contactsCount: contactsSnapshot.data().count,
        mediaShared: userData.stats?.mediaShared || 0,
        memberSince: userData.createdAt
      };
    } catch (error) {
      console.error('Erreur récupération stats utilisateur:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut en ligne
   */
  static async updateOnlineStatus(userId, isOnline = true) {
    try {
      await adminDb.collection('users').doc(userId).update({
        isOnline,
        lastSeen: FieldValue.serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour statut en ligne:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les paramètres utilisateur
   */
  static async updateUserSettings(userId, settings) {
    try {
      const allowedSettings = [
        'theme',
        'language',
        'notifications',
        'privacy',
        'chat'
      ];
      
      const updates = {};
      
      for (const [key, value] of Object.entries(settings)) {
        if (allowedSettings.includes(key)) {
          updates[`settings.${key}`] = value;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        await adminDb.collection('users').doc(userId).update(updates);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour paramètres:', error);
      throw error;
    }
  }
}