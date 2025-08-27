import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata,
  updateMetadata
} from 'firebase/storage';
import { storage } from './firebaseConfig';

class FirebaseStorageService {
  constructor() {
    this.storage = storage;
    this.basePath = 'whatsapp-media';
  }

  // ===== UPLOAD DE FICHIERS =====

  /**
   * Uploader un fichier média
   * @param {File} file - Le fichier à uploader
   * @param {string} conversationId - ID de la conversation
   * @param {string} messageId - ID du message (optionnel)
   * @param {string} mediaType - Type de média (images, videos, documents, audio)
   * @returns {Promise<Object>} - URL de téléchargement et métadonnées
   */
  async uploadMedia(file, conversationId, messageId = null, mediaType = 'images') {
    try {
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomId}.${fileExtension}`;
      
      // Créer le chemin de stockage
      const storagePath = messageId 
        ? `${this.basePath}/${conversationId}/${messageId}/${mediaType}/${fileName}`
        : `${this.basePath}/${conversationId}/${mediaType}/${fileName}`;
      
      const storageRef = ref(this.storage, storagePath);

      // Uploader le fichier
      const snapshot = await uploadBytes(storageRef, file);
      
      // Obtenir l'URL de téléchargement
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Obtenir les métadonnées
      const metadata = await getMetadata(snapshot.ref);

      console.log(`✅ Fichier uploadé avec succès: ${fileName}`);
      
      return {
        url: downloadURL,
        path: storagePath,
        fileName: fileName,
        size: metadata.size,
        contentType: metadata.contentType,
        timeCreated: metadata.timeCreated,
        updated: metadata.updated
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload du fichier:', error);
      throw error;
    }
  }

  /**
   * Uploader une image
   */
  async uploadImage(file, conversationId, messageId = null) {
    return this.uploadMedia(file, conversationId, messageId, 'images');
  }

  /**
   * Uploader une vidéo
   */
  async uploadVideo(file, conversationId, messageId = null) {
    return this.uploadMedia(file, conversationId, messageId, 'videos');
  }

  /**
   * Uploader un document
   */
  async uploadDocument(file, conversationId, messageId = null) {
    return this.uploadMedia(file, conversationId, messageId, 'documents');
  }

  /**
   * Uploader un fichier audio
   */
  async uploadAudio(file, conversationId, messageId = null) {
    return this.uploadMedia(file, conversationId, messageId, 'audio');
  }

  // ===== TÉLÉCHARGEMENT =====

  /**
   * Obtenir l'URL de téléchargement d'un fichier
   * @param {string} filePath - Chemin du fichier dans le storage
   * @returns {Promise<string>} - URL de téléchargement
   */
  async getDownloadURL(filePath) {
    try {
      const storageRef = ref(this.storage, filePath);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'URL:', error);
      throw error;
    }
  }

  /**
   * Obtenir les métadonnées d'un fichier
   * @param {string} filePath - Chemin du fichier dans le storage
   * @returns {Promise<Object>} - Métadonnées du fichier
   */
  async getFileMetadata(filePath) {
    try {
      const storageRef = ref(this.storage, filePath);
      const metadata = await getMetadata(storageRef);
      return metadata;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métadonnées:', error);
      throw error;
    }
  }

  // ===== SUPPRESSION =====

  /**
   * Supprimer un fichier
   * @param {string} filePath - Chemin du fichier dans le storage
   * @returns {Promise<boolean>} - Succès de la suppression
   */
  async deleteFile(filePath) {
    try {
      const storageRef = ref(this.storage, filePath);
      await deleteObject(storageRef);
      console.log(`✅ Fichier supprimé avec succès: ${filePath}`);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du fichier:', error);
      throw error;
    }
  }

  /**
   * Supprimer tous les fichiers d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @returns {Promise<number>} - Nombre de fichiers supprimés
   */
  async deleteConversationFiles(conversationId) {
    try {
      const conversationPath = `${this.basePath}/${conversationId}`;
      const conversationRef = ref(this.storage, conversationPath);
      
      const result = await listAll(conversationRef);
      const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
      
      await Promise.all(deletePromises);
      
      console.log(`✅ ${deletePromises.length} fichiers supprimés pour la conversation ${conversationId}`);
      return deletePromises.length;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des fichiers de conversation:', error);
      throw error;
    }
  }

  // ===== LISTAGE =====

  /**
   * Lister tous les fichiers d'une conversation
   * @param {string} conversationId - ID de la conversation
   * @param {string} mediaType - Type de média (optionnel)
   * @returns {Promise<Array>} - Liste des fichiers
   */
  async listConversationFiles(conversationId, mediaType = null) {
    try {
      const path = mediaType 
        ? `${this.basePath}/${conversationId}/${mediaType}`
        : `${this.basePath}/${conversationId}`;
      
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      
      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          
          return {
            name: itemRef.name,
            path: itemRef.fullPath,
            url: url,
            size: metadata.size,
            contentType: metadata.contentType,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );
      
      return files;
    } catch (error) {
      console.error('❌ Erreur lors du listage des fichiers:', error);
      throw error;
    }
  }

  // ===== MISE À JOUR =====

  /**
   * Mettre à jour les métadonnées d'un fichier
   * @param {string} filePath - Chemin du fichier dans le storage
   * @param {Object} metadata - Nouvelles métadonnées
   * @returns {Promise<Object>} - Métadonnées mises à jour
   */
  async updateFileMetadata(filePath, metadata) {
    try {
      const storageRef = ref(this.storage, filePath);
      const updatedMetadata = await updateMetadata(storageRef, metadata);
      console.log(`✅ Métadonnées mises à jour pour: ${filePath}`);
      return updatedMetadata;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des métadonnées:', error);
      throw error;
    }
  }

  // ===== UTILITAIRES =====

  /**
   * Obtenir la taille d'un fichier en format lisible
   * @param {number} bytes - Taille en bytes
   * @returns {string} - Taille formatée
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Vérifier si un fichier est une image
   * @param {File} file - Le fichier à vérifier
   * @returns {boolean} - True si c'est une image
   */
  isImage(file) {
    return file.type.startsWith('image/');
  }

  /**
   * Vérifier si un fichier est une vidéo
   * @param {File} file - Le fichier à vérifier
   * @returns {boolean} - True si c'est une vidéo
   */
  isVideo(file) {
    return file.type.startsWith('video/');
  }

  /**
   * Vérifier si un fichier est un document
   * @param {File} file - Le fichier à vérifier
   * @returns {boolean} - True si c'est un document
   */
  isDocument(file) {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    return documentTypes.includes(file.type);
  }

  /**
   * Vérifier si un fichier est un fichier audio
   * @param {File} file - Le fichier à vérifier
   * @returns {boolean} - True si c'est un fichier audio
   */
  isAudio(file) {
    return file.type.startsWith('audio/');
  }

  /**
   * Obtenir le type de média d'un fichier
   * @param {File} file - Le fichier à analyser
   * @returns {string} - Type de média (images, videos, documents, audio)
   */
  getMediaType(file) {
    if (this.isImage(file)) return 'images';
    if (this.isVideo(file)) return 'videos';
    if (this.isDocument(file)) return 'documents';
    if (this.isAudio(file)) return 'audio';
    return 'documents'; // Par défaut
  }

  /**
   * Valider un fichier avant upload
   * @param {File} file - Le fichier à valider
   * @param {Object} options - Options de validation
   * @returns {Object} - Résultat de la validation
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 50 * 1024 * 1024, // 50MB par défaut
      allowedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf', 'application/msword', 'text/plain']
    } = options;

    const errors = [];

    // Vérifier la taille
    if (file.size > maxSize) {
      errors.push(`Le fichier est trop volumineux. Taille maximale: ${this.formatFileSize(maxSize)}`);
    }

    // Vérifier le type
    const isAllowedType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      errors.push('Type de fichier non autorisé');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

export default new FirebaseStorageService();
