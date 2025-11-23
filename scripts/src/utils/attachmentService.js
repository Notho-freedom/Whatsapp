import pollService from './pollService';
import drawingService from './drawingService';
import contactSharingService from './contactSharingService';
import documentService from './documentService';
import cameraService from './cameraService';
import firebaseServerService from './firebaseServerService';

class AttachmentService {
  constructor() {
    this.services = {
      poll: pollService,
      drawing: drawingService,
      contact: contactSharingService,
      document: documentService,
      camera: cameraService
    };
  }

  // Gérer la sélection d'une option d'attachement
  async handleAttachmentAction(action, data, conversationId, userId) {
    try {
      switch (action) {
        case 'select-media':
          return await this.handleMediaSelection(data, conversationId, userId);
        
        case 'open-camera':
          return await this.handleCameraAction(data, conversationId, userId);
        
        case 'select-document':
          return await this.handleDocumentSelection(data, conversationId, userId);
        
        case 'select-contact':
          return await this.handleContactSelection(data, conversationId, userId);
        
        case 'create-poll':
          return await this.handlePollCreation(data, conversationId, userId);
        
        case 'open-drawing':
          return await this.handleDrawingCreation(data, conversationId, userId);
        
        default:
          throw new Error(`Action d'attachement non reconnue: ${action}`);
      }
    } catch (error) {
      console.error('Erreur lors du traitement de l\'action d\'attachement:', error);
      throw error;
    }
  }

  // Gérer la sélection de médias (photos/vidéos)
  async handleMediaSelection(files, conversationId, userId) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Aucun fichier sélectionné');
      }

      // Utiliser le service caméra pour traiter les médias
      const mediaResults = await cameraService.selectMedia(files, conversationId, {
        created_by: userId,
        source: 'gallery'
      });

      // Créer des messages pour chaque média
      const messages = [];
      for (const media of mediaResults) {
        const messageData = {
          type: 'media',
          media: [media],
          text: `📷 ${media.original_name || 'Média partagé'}`,
          sender: userId,
          conversation_id: conversationId,
          metadata: {
            attachment_type: 'media',
            media_count: 1,
            source: 'gallery'
          }
        };

        const message = await firebaseServerService.saveMessage(conversationId, messageData);
        messages.push(message);
      }

      return {
        success: true,
        media: mediaResults,
        messages: messages,
        count: mediaResults.length
      };
    } catch (error) {
      console.error('Erreur lors de la sélection de médias:', error);
      throw error;
    }
  }

  // Gérer les actions de caméra
  async handleCameraAction(actionData, conversationId, userId) {
    try {
      const { type, blob, metadata = {} } = actionData;

      let mediaResult;
      if (type === 'photo') {
        mediaResult = await cameraService.capturePhoto(blob, conversationId, {
          created_by: userId,
          source: 'camera',
          ...metadata
        });
      } else if (type === 'video') {
        mediaResult = await cameraService.recordVideo(blob, conversationId, {
          created_by: userId,
          source: 'camera',
          ...metadata
        });
      } else {
        throw new Error('Type de média non supporté');
      }

      // Créer un message pour le média capturé
      const messageData = {
        type: 'media',
        media: [mediaResult],
        text: `📸 ${type === 'photo' ? 'Photo' : 'Vidéo'} capturée`,
        sender: userId,
        conversation_id: conversationId,
        metadata: {
          attachment_type: 'camera',
          media_type: type,
          source: 'camera'
        }
      };

      const message = await firebaseServerService.saveMessage(conversationId, messageData);

      return {
        success: true,
        media: mediaResult,
        message: message
      };
    } catch (error) {
      console.error('Erreur lors de l\'action caméra:', error);
      throw error;
    }
  }

  // Gérer la sélection de documents
  async handleDocumentSelection(files, conversationId, userId) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Aucun document sélectionné');
      }

      const documentResults = [];
      const messages = [];

      for (const file of files) {
        // Upload du document
        const document = await documentService.uploadDocument(file, conversationId, {
          created_by: userId,
          source: 'selection'
        });

        documentResults.push(document);

        // Créer un message pour le document
        const messageData = {
          type: 'document',
          document: document,
          text: `📄 ${document.name}`,
          sender: userId,
          conversation_id: conversationId,
          metadata: {
            attachment_type: 'document',
            document_id: document.id,
            file_size: document.file_size,
            file_type: document.file_type
          }
        };

        const message = await firebaseServerService.saveMessage(conversationId, messageData);
        messages.push(message);
      }

      return {
        success: true,
        documents: documentResults,
        messages: messages,
        count: documentResults.length
      };
    } catch (error) {
      console.error('Erreur lors de la sélection de documents:', error);
      throw error;
    }
  }

  // Gérer la sélection de contacts
  async handleContactSelection(contactData, conversationId, userId) {
    try {
      if (!contactData) {
        throw new Error('Données de contact manquantes');
      }

      // Partager le contact
      const sharedContact = await contactSharingService.shareContact(
        contactData,
        conversationId,
        userId
      );

      // Créer un message pour le contact partagé
      const messageData = {
        type: 'contact',
        contact: sharedContact,
        text: `👤 Contact partagé: ${contactData.first_name} ${contactData.last_name}`,
        sender: userId,
        conversation_id: conversationId,
        metadata: {
          attachment_type: 'contact',
          contact_id: sharedContact.id,
          contact_name: `${contactData.first_name} ${contactData.last_name}`
        }
      };

      const message = await firebaseServerService.saveMessage(conversationId, messageData);

      return {
        success: true,
        contact: sharedContact,
        message: message
      };
    } catch (error) {
      console.error('Erreur lors de la sélection de contact:', error);
      throw error;
    }
  }

  // Gérer la création de sondage
  async handlePollCreation(pollData, conversationId, userId) {
    try {
      if (!pollData.question || !pollData.options || pollData.options.length < 2) {
        throw new Error('Données de sondage invalides');
      }

      // Créer le sondage
      const poll = await pollService.createPoll({
        ...pollData,
        conversation_id: conversationId,
        created_by: userId
      });

      // Créer un message pour le sondage
      const messageData = {
        type: 'poll',
        poll: poll,
        text: `📊 Sondage: ${poll.question}`,
        sender: userId,
        conversation_id: conversationId,
        metadata: {
          attachment_type: 'poll',
          poll_id: poll.id,
          question: poll.question,
          options_count: poll.options.length
        }
      };

      const message = await firebaseServerService.saveMessage(conversationId, messageData);

      return {
        success: true,
        poll: poll,
        message: message
      };
    } catch (error) {
      console.error('Erreur lors de la création du sondage:', error);
      throw error;
    }
  }

  // Gérer la création de dessin
  async handleDrawingCreation(drawingData, conversationId, userId) {
    try {
      if (!drawingData.imageBlob) {
        throw new Error('Données de dessin manquantes');
      }

      // Sauvegarder le dessin
      const drawing = await drawingService.saveDrawingWithImage(
        {
          ...drawingData,
          created_by: userId
        },
        drawingData.imageBlob,
        conversationId
      );

      // Créer un message pour le dessin
      const messageData = {
        type: 'drawing',
        drawing: drawing,
        text: `🎨 Dessin créé`,
        sender: userId,
        conversation_id: conversationId,
        metadata: {
          attachment_type: 'drawing',
          drawing_id: drawing.id,
          source: 'canvas'
        }
      };

      const message = await firebaseServerService.saveMessage(conversationId, messageData);

      return {
        success: true,
        drawing: drawing,
        message: message
      };
    } catch (error) {
      console.error('Erreur lors de la création du dessin:', error);
      throw error;
    }
  }

  // Récupérer tous les types d'attachements d'une conversation
  async getConversationAttachments(conversationId, filters = {}) {
    try {
      const results = {};

      // Récupérer les médias
      if (!filters.type || filters.type === 'media') {
        results.media = await cameraService.getMediaByConversation(conversationId, filters);
      }

      // Récupérer les documents
      if (!filters.type || filters.type === 'document') {
        results.documents = await documentService.getDocumentsByConversation(conversationId, filters);
      }

      // Récupérer les sondages
      if (!filters.type || filters.type === 'poll') {
        results.polls = await pollService.getPollsByConversation(conversationId);
      }

      // Récupérer les dessins
      if (!filters.type || filters.type === 'drawing') {
        results.drawings = await drawingService.getDrawingsByConversation(conversationId);
      }

      // Récupérer les contacts partagés
      if (!filters.type || filters.type === 'contact') {
        results.contacts = await contactSharingService.getSharedContactsByConversation(conversationId);
      }

      return results;
    } catch (error) {
      console.error('Erreur lors de la récupération des attachements:', error);
      throw error;
    }
  }

  // Rechercher dans tous les types d'attachements
  async searchAttachments(query, conversationId = null, limit = 20) {
    try {
      const results = {};

      // Rechercher dans les médias
      results.media = await cameraService.searchMedia(query, conversationId, limit);

      // Rechercher dans les documents
      results.documents = await documentService.searchDocuments(query, conversationId, limit);

      // Rechercher dans les dessins
      results.drawings = await drawingService.searchDrawings(query, conversationId, limit);

      // Rechercher dans les contacts partagés
      results.contacts = await contactSharingService.searchSharedContacts(query, conversationId, limit);

      return results;
    } catch (error) {
      console.error('Erreur lors de la recherche d\'attachements:', error);
      throw error;
    }
  }

  // Récupérer les statistiques de tous les attachements
  async getAttachmentStats(conversationId = null) {
    try {
      const stats = {};

      // Statistiques des médias
      stats.media = await cameraService.getMediaStats(conversationId);

      // Statistiques des documents
      stats.documents = await documentService.getDocumentStats(conversationId);

      // Statistiques des dessins
      stats.drawings = await drawingService.getDrawingStats(conversationId);

      // Statistiques des sondages
      stats.polls = await pollService.getPollStats(conversationId);

      // Statistiques des contacts partagés
      stats.contacts = await contactSharingService.getContactSharingStats(null, conversationId);

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Nettoyer les anciens attachements
  async cleanupOldAttachments(daysOld = 30, conversationId = null) {
    try {
      const results = {};

      // Nettoyer les médias
      results.media = await cameraService.cleanupOldMedia(daysOld, conversationId);

      // Nettoyer les documents
      results.documents = await documentService.cleanupOldDocuments(daysOld, conversationId);

      // Nettoyer les dessins
      results.drawings = await drawingService.cleanupOldDrawings(daysOld, conversationId);

      return results;
    } catch (error) {
      console.error('Erreur lors du nettoyage des attachements:', error);
      throw error;
    }
  }

  // Vérifier les permissions pour un type d'attachement
  async checkAttachmentPermissions(userId, conversationId, attachmentType) {
    try {
      // Vérifier que l'utilisateur est participant de la conversation
      const participants = await firebaseServerService.getParticipants(conversationId);
      const isParticipant = participants.some(p => p.user_id === userId);

      if (!isParticipant) {
        return { allowed: false, reason: 'Non participant de la conversation' };
      }

      // Vérifications spécifiques selon le type
      switch (attachmentType) {
        case 'poll':
          // Tout participant peut créer un sondage
          return { allowed: true };

        case 'drawing':
          // Tout participant peut créer un dessin
          return { allowed: true };

        case 'contact':
          // Tout participant peut partager un contact
          return { allowed: true };

        case 'document':
          // Vérifier la limite de taille pour les documents
          const storageUsage = await documentService.getStorageUsage(conversationId);
          const maxStorage = 100 * 1024 * 1024; // 100MB par conversation
          
          if (storageUsage.total_size > maxStorage) {
            return { allowed: false, reason: 'Limite de stockage atteinte' };
          }
          return { allowed: true };

        case 'media':
          // Vérifier la limite de taille pour les médias
          const mediaStats = await cameraService.getMediaStats(conversationId);
          const maxMediaStorage = 500 * 1024 * 1024; // 500MB par conversation
          
          if (mediaStats.total_size > maxMediaStorage) {
            return { allowed: false, reason: 'Limite de stockage média atteinte' };
          }
          return { allowed: true };

        default:
          return { allowed: false, reason: 'Type d\'attachement non reconnu' };
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return { allowed: false, reason: 'Erreur de vérification' };
    }
  }
}

export default new AttachmentService();
