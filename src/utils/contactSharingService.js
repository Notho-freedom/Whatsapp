import { db } from '@/config/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

class ContactSharingService {
  constructor() {
    this.sharedContactsCollection = 'shared_contacts';
    this.contactRequestsCollection = 'contact_requests';
  }

  // Partager un contact
  async shareContact(contactData, conversationId, senderId) {
    try {
      const sharedContact = {
        ...contactData,
        conversation_id: conversationId,
        sender_id: senderId,
        shared_at: serverTimestamp(),
        is_active: true,
        status: 'shared'
      };

      const docRef = await addDoc(collection(db, this.sharedContactsCollection), sharedContact);
      
      return {
        id: docRef.id,
        ...sharedContact
      };
    } catch (error) {
      console.error('Erreur lors du partage du contact:', error);
      throw new Error('Impossible de partager le contact');
    }
  }

  // Récupérer un contact partagé par ID
  async getSharedContactById(sharedContactId) {
    try {
      const contactDoc = await getDoc(doc(db, this.sharedContactsCollection, sharedContactId));
      
      if (!contactDoc.exists()) {
        throw new Error('Contact partagé non trouvé');
      }

      return {
        id: contactDoc.id,
        ...contactDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du contact partagé:', error);
      throw error;
    }
  }

  // Récupérer les contacts partagés dans une conversation
  async getSharedContactsByConversation(conversationId, limit = 50) {
    try {
      const contactsQuery = query(
        collection(db, this.sharedContactsCollection),
        where('conversation_id', '==', conversationId),
        where('is_active', '==', true),
        orderBy('shared_at', 'desc')
      );

      const querySnapshot = await getDocs(contactsQuery);
      const contacts = [];

      querySnapshot.forEach((doc) => {
        contacts.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return contacts.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts partagés:', error);
      throw new Error('Impossible de récupérer les contacts partagés');
    }
  }

  // Accepter un contact partagé
  async acceptSharedContact(sharedContactId, userId) {
    try {
      const sharedContact = await this.getSharedContactById(sharedContactId);
      
      // Mettre à jour le statut
      await updateDoc(doc(db, this.sharedContactsCollection, sharedContactId), {
        status: 'accepted',
        accepted_by: userId,
        accepted_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Créer une demande de contact
      await this.createContactRequest(sharedContact, userId);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'acceptation du contact:', error);
      throw error;
    }
  }

  // Refuser un contact partagé
  async declineSharedContact(sharedContactId, userId) {
    try {
      await updateDoc(doc(db, this.sharedContactsCollection, sharedContactId), {
        status: 'declined',
        declined_by: userId,
        declined_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors du refus du contact:', error);
      throw error;
    }
  }

  // Créer une demande de contact
  async createContactRequest(sharedContact, userId) {
    try {
      const contactRequest = {
        user_id: userId,
        contact_data: {
          first_name: sharedContact.first_name,
          last_name: sharedContact.last_name,
          phone_number: sharedContact.phone_number,
          email: sharedContact.email,
          profile_picture_url: sharedContact.profile_picture_url,
          status_message: sharedContact.status_message
        },
        source: 'shared_contact',
        source_id: sharedContact.id,
        conversation_id: sharedContact.conversation_id,
        sender_id: sharedContact.sender_id,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.contactRequestsCollection), contactRequest);
      
      return {
        id: docRef.id,
        ...contactRequest
      };
    } catch (error) {
      console.error('Erreur lors de la création de la demande de contact:', error);
      throw new Error('Impossible de créer la demande de contact');
    }
  }

  // Récupérer les demandes de contact d'un utilisateur
  async getContactRequestsByUser(userId, status = null, limit = 20) {
    try {
      let requestsQuery = query(
        collection(db, this.contactRequestsCollection),
        where('user_id', '==', userId)
      );

      if (status) {
        requestsQuery = query(requestsQuery, where('status', '==', status));
      }

      requestsQuery = query(requestsQuery, orderBy('created_at', 'desc'));

      const querySnapshot = await getDocs(requestsQuery);
      const requests = [];

      querySnapshot.forEach((doc) => {
        requests.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return requests.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de contact:', error);
      throw new Error('Impossible de récupérer les demandes de contact');
    }
  }

  // Approuver une demande de contact
  async approveContactRequest(requestId, userId) {
    try {
      const request = await this.getContactRequestById(requestId);
      
      if (request.user_id !== userId) {
        throw new Error('Accès non autorisé');
      }

      await updateDoc(doc(db, this.contactRequestsCollection, requestId), {
        status: 'approved',
        approved_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la demande:', error);
      throw error;
    }
  }

  // Rejeter une demande de contact
  async rejectContactRequest(requestId, userId) {
    try {
      const request = await this.getContactRequestById(requestId);
      
      if (request.user_id !== userId) {
        throw new Error('Accès non autorisé');
      }

      await updateDoc(doc(db, this.contactRequestsCollection, requestId), {
        status: 'rejected',
        rejected_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      throw error;
    }
  }

  // Récupérer une demande de contact par ID
  async getContactRequestById(requestId) {
    try {
      const requestDoc = await getDoc(doc(db, this.contactRequestsCollection, requestId));
      
      if (!requestDoc.exists()) {
        throw new Error('Demande de contact non trouvée');
      }

      return {
        id: requestDoc.id,
        ...requestDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la demande:', error);
      throw error;
    }
  }

  // Supprimer un contact partagé
  async deleteSharedContact(sharedContactId, userId) {
    try {
      const sharedContact = await this.getSharedContactById(sharedContactId);
      
      if (sharedContact.sender_id !== userId) {
        throw new Error('Seul l\'expéditeur peut supprimer le contact partagé');
      }

      await updateDoc(doc(db, this.sharedContactsCollection, sharedContactId), {
        is_active: false,
        deleted_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du contact partagé:', error);
      throw error;
    }
  }

  // Récupérer les statistiques de partage de contacts
  async getContactSharingStats(userId = null, conversationId = null) {
    try {
      let contactsQuery = collection(db, this.sharedContactsCollection);
      let requestsQuery = collection(db, this.contactRequestsCollection);

      if (userId) {
        contactsQuery = query(contactsQuery, where('sender_id', '==', userId));
        requestsQuery = query(requestsQuery, where('user_id', '==', userId));
      }

      if (conversationId) {
        contactsQuery = query(contactsQuery, where('conversation_id', '==', conversationId));
        requestsQuery = query(requestsQuery, where('conversation_id', '==', conversationId));
      }

      const [contactsSnapshot, requestsSnapshot] = await Promise.all([
        getDocs(contactsQuery),
        getDocs(requestsQuery)
      ]);

      const stats = {
        total_shared: 0,
        total_accepted: 0,
        total_declined: 0,
        total_pending: 0,
        total_approved: 0,
        total_rejected: 0,
        acceptance_rate: 0
      };

      contactsSnapshot.forEach((doc) => {
        const contact = doc.data();
        stats.total_shared++;
        
        if (contact.status === 'accepted') {
          stats.total_accepted++;
        } else if (contact.status === 'declined') {
          stats.total_declined++;
        }
      });

      requestsSnapshot.forEach((doc) => {
        const request = doc.data();
        
        if (request.status === 'pending') {
          stats.total_pending++;
        } else if (request.status === 'approved') {
          stats.total_approved++;
        } else if (request.status === 'rejected') {
          stats.total_rejected++;
        }
      });

      if (stats.total_shared > 0) {
        stats.acceptance_rate = (stats.total_accepted / stats.total_shared) * 100;
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // Rechercher des contacts partagés
  async searchSharedContacts(query, conversationId = null, limit = 20) {
    try {
      let contactsQuery = query(
        collection(db, this.sharedContactsCollection),
        where('is_active', '==', true)
      );

      if (conversationId) {
        contactsQuery = query(contactsQuery, where('conversation_id', '==', conversationId));
      }

      const querySnapshot = await getDocs(contactsQuery);
      const contacts = [];

      querySnapshot.forEach((doc) => {
        const contact = doc.data();
        
        // Recherche dans le nom, prénom, email et numéro de téléphone
        const searchFields = [
          contact.first_name,
          contact.last_name,
          contact.email,
          contact.phone_number
        ].filter(Boolean);

        if (searchFields.some(field => 
          field.toLowerCase().includes(query.toLowerCase())
        )) {
          contacts.push({ id: doc.id, ...contact });
        }
      });

      // Trier par date de partage
      contacts.sort((a, b) => b.shared_at - a.shared_at);

      return contacts.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche de contacts partagés:', error);
      throw new Error('Impossible de rechercher les contacts partagés');
    }
  }
}

export default new ContactSharingService();
