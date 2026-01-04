import { db, storage } from '@/config/firebase';
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
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';

class DocumentService {
  constructor() {
    this.documentsCollection = 'documents';
    this.storageFolder = 'documents';
  }

  // Uploader un document
  async uploadDocument(file, conversationId, metadata = {}) {
    try {
      // Validation du fichier
      if (!file) {
        throw new Error('Aucun fichier fourni');
      }

      // Vérifier la taille du fichier (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('Le fichier est trop volumineux (max 50MB)');
      }

      // Vérifier le type de fichier
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/rtf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non supporté');
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = file.name.split('.').pop();
      const fileName = `doc_${timestamp}_${randomId}.${fileExtension}`;

      // Créer la référence de stockage
      const storageRef = ref(
        storage,
        `${this.storageFolder}/${conversationId}/${fileName}`
      );

      // Upload du fichier
      const uploadResult = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Récupérer les métadonnées du fichier
      const fileMetadata = await getMetadata(uploadResult.ref);

      // Créer l'entrée dans Firestore
      const documentData = {
        name: file.name,
        original_name: file.name,
        file_url: downloadURL,
        storage_path: uploadResult.ref.fullPath,
        conversation_id: conversationId,
        file_size: file.size,
        file_type: file.type,
        mime_type: file.type,
        extension: fileExtension,
        metadata: {
          ...metadata,
          lastModified: file.lastModified,
          storage_metadata: {
            name: fileMetadata.name || fileName,
            size: fileMetadata.size || file.size,
            contentType: fileMetadata.contentType || file.type,
            timeCreated: fileMetadata.timeCreated || new Date().toISOString(),
            updated: fileMetadata.updated || new Date().toISOString(),
          },
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        status: 'uploaded',
      };

      const docRef = await addDoc(
        collection(db, this.documentsCollection),
        documentData
      );

      return {
        id: docRef.id,
        ...documentData,
      };
    } catch (error) {
      console.error("Erreur lors de l'upload du document:", error);
      throw error;
    }
  }

  // Récupérer un document par ID
  async getDocumentById(documentId) {
    try {
      const documentDoc = await getDoc(
        doc(db, this.documentsCollection, documentId)
      );

      if (!documentDoc.exists()) {
        throw new Error('Document non trouvé');
      }

      return {
        id: documentDoc.id,
        ...documentDoc.data(),
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      throw error;
    }
  }

  // Récupérer les documents d'une conversation
  async getDocumentsByConversation(conversationId, limit = 50, filters = {}) {
    try {
      let documentsQuery = query(
        collection(db, this.documentsCollection),
        where('conversation_id', '==', conversationId),
        where('is_active', '==', true)
      );

      // Appliquer les filtres
      if (filters.fileType) {
        documentsQuery = query(
          documentsQuery,
          where('file_type', '==', filters.fileType)
        );
      }

      if (filters.status) {
        documentsQuery = query(
          documentsQuery,
          where('status', '==', filters.status)
        );
      }

      // Trier par date de création
      documentsQuery = query(documentsQuery, orderBy('created_at', 'desc'));

      const querySnapshot = await getDocs(documentsQuery);
      const documents = [];

      querySnapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Appliquer les filtres côté client si nécessaire
      let filteredDocuments = documents;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(
          doc =>
            doc.name.toLowerCase().includes(searchTerm) ||
            (doc.metadata &&
              doc.metadata.description &&
              doc.metadata.description.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.minSize) {
        filteredDocuments = filteredDocuments.filter(
          doc => doc.file_size >= filters.minSize
        );
      }

      if (filters.maxSize) {
        filteredDocuments = filteredDocuments.filter(
          doc => doc.file_size <= filters.maxSize
        );
      }

      return filteredDocuments.slice(0, limit);
    } catch (error) {
      const msg = String(error?.message || '');
      // Si un index Firestore manque, ne pas casser l'app: retourner une liste vide.
      if (msg.includes('requires an index')) {
        console.warn(
          'Index Firestore manquant pour documents; retour liste vide.'
        );
        return [];
      }
      console.error('Erreur lors de la récupération des documents:', error);
      throw new Error('Impossible de récupérer les documents');
    }
  }

  // Mettre à jour un document
  async updateDocument(documentId, updates, userId) {
    try {
      const document = await this.getDocumentById(documentId);

      // Vérifier les permissions si nécessaire
      if (
        updates.status &&
        !['uploaded', 'processing', 'error'].includes(updates.status)
      ) {
        throw new Error('Statut invalide');
      }

      await updateDoc(doc(db, this.documentsCollection, documentId), {
        ...updates,
        updated_at: new Date(),
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      throw error;
    }
  }

  // Supprimer un document
  async deleteDocument(documentId, userId) {
    try {
      const document = await this.getDocumentById(documentId);

      // Supprimer le fichier du storage
      if (document.storage_path) {
        try {
          const fileRef = ref(storage, document.storage_path);
          await deleteObject(fileRef);
        } catch (storageError) {
          console.warn(
            'Impossible de supprimer le fichier du storage:',
            storageError
          );
        }
      }

      // Supprimer l'entrée de Firestore
      await deleteDoc(doc(db, this.documentsCollection, documentId));

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  // Récupérer les documents d'un utilisateur
  async getDocumentsByUser(userId, limit = 20) {
    try {
      const documentsQuery = query(
        collection(db, this.documentsCollection),
        where('created_by', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(documentsQuery);
      const documents = [];

      querySnapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return documents.slice(0, limit);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des documents utilisateur:',
        error
      );
      throw new Error('Impossible de récupérer les documents');
    }
  }

  // Rechercher des documents
  async searchDocuments(query, conversationId = null, limit = 20) {
    try {
      let documentsQuery = query(
        collection(db, this.documentsCollection),
        where('is_active', '==', true)
      );

      if (conversationId) {
        documentsQuery = query(
          documentsQuery,
          where('conversation_id', '==', conversationId)
        );
      }

      const querySnapshot = await getDocs(documentsQuery);
      const documents = [];

      querySnapshot.forEach(doc => {
        const document = doc.data();

        // Recherche dans le nom et les métadonnées
        const searchFields = [
          document.name,
          document.original_name,
          document.metadata?.description,
          document.metadata?.tags?.join(' '),
        ].filter(Boolean);

        if (
          searchFields.some(field =>
            field.toLowerCase().includes(query.toLowerCase())
          )
        ) {
          documents.push({ id: doc.id, ...document });
        }
      });

      // Trier par date de création
      documents.sort((a, b) => b.created_at - a.created_at);

      return documents.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche de documents:', error);
      throw new Error('Impossible de rechercher les documents');
    }
  }

  // Récupérer les statistiques des documents
  async getDocumentStats(conversationId = null) {
    try {
      let documentsQuery = collection(db, this.documentsCollection);

      if (conversationId) {
        documentsQuery = query(
          documentsQuery,
          where('conversation_id', '==', conversationId)
        );
      }

      const querySnapshot = await getDocs(documentsQuery);
      const stats = {
        total_documents: 0,
        total_size: 0,
        average_size: 0,
        file_types: {},
        status_counts: {},
        created_today: 0,
        created_this_week: 0,
      };

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      querySnapshot.forEach(doc => {
        const document = doc.data();
        stats.total_documents++;

        if (document.file_size) {
          stats.total_size += document.file_size;
        }

        // Compter les types de fichiers
        const fileType = document.file_type || 'unknown';
        stats.file_types[fileType] = (stats.file_types[fileType] || 0) + 1;

        // Compter les statuts
        const status = document.status || 'unknown';
        stats.status_counts[status] = (stats.status_counts[status] || 0) + 1;

        const createdDate = document.created_at?.toDate() || new Date();
        if (createdDate >= today) {
          stats.created_today++;
        }
        if (createdDate >= weekAgo) {
          stats.created_this_week++;
        }
      });

      if (stats.total_documents > 0) {
        stats.average_size = stats.total_size / stats.total_documents;
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // Vérifier l'espace de stockage utilisé
  async getStorageUsage(conversationId = null) {
    try {
      let documentsQuery = collection(db, this.documentsCollection);

      if (conversationId) {
        documentsQuery = query(
          documentsQuery,
          where('conversation_id', '==', conversationId)
        );
      }

      const querySnapshot = await getDocs(documentsQuery);
      let totalSize = 0;
      let fileCount = 0;

      querySnapshot.forEach(doc => {
        const document = doc.data();
        if (document.file_size) {
          totalSize += document.file_size;
          fileCount++;
        }
      });

      return {
        total_size: totalSize,
        file_count: fileCount,
        average_size: fileCount > 0 ? totalSize / fileCount : 0,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'espace de stockage:",
        error
      );
      throw new Error("Impossible de vérifier l'espace de stockage");
    }
  }

  // Nettoyer les anciens documents
  async cleanupOldDocuments(daysOld = 30, conversationId = null) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let documentsQuery = query(
        collection(db, this.documentsCollection),
        where('created_at', '<', cutoffDate),
        where('is_active', '==', true)
      );

      if (conversationId) {
        documentsQuery = query(
          documentsQuery,
          where('conversation_id', '==', conversationId)
        );
      }

      const querySnapshot = await getDocs(documentsQuery);
      const deletePromises = [];

      querySnapshot.forEach(doc => {
        const document = doc.data();

        // Marquer comme supprimé au lieu de supprimer complètement
        deletePromises.push(
          updateDoc(doc.ref, {
            is_active: false,
            deleted_at: new Date(),
            updated_at: new Date(),
          })
        );
      });

      await Promise.all(deletePromises);

      return {
        cleaned_count: deletePromises.length,
        message: `${deletePromises.length} documents nettoyés`,
      };
    } catch (error) {
      console.error('Erreur lors du nettoyage des documents:', error);
      throw new Error('Impossible de nettoyer les documents');
    }
  }
}

export default new DocumentService();
