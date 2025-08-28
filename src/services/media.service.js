import { adminStorage } from '@/lib/firebase-admin';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

export class MediaService {
  static MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  static MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  static MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
  static MAX_DOCUMENT_SIZE = 50 * 1024 * 1024; // 50MB
  
  static ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  static ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
  static ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg'];
  static ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ];

  /**
   * Upload un fichier média
   */
  static async uploadMedia(file, userId, conversationId, messageId) {
    try {
      // Validation du fichier
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const extension = this.getFileExtension(file.originalname);
      const fileName = `${timestamp}_${uniqueId}${extension}`;
      
      // Déterminer le chemin de stockage
      const storagePath = `conversations/${conversationId}/messages/${messageId}/${fileName}`;
      
      // Traiter le fichier selon son type
      let processedFile = file.buffer;
      let thumbnail = null;
      let metadata = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString()
      };
      
      switch (validation.type) {
        case 'image':
          const imageResult = await this.processImage(file.buffer, file.mimetype);
          processedFile = imageResult.buffer;
          thumbnail = imageResult.thumbnail;
          metadata = { ...metadata, ...imageResult.metadata };
          break;
          
        case 'video':
          const videoResult = await this.processVideo(file.buffer, file.mimetype);
          processedFile = videoResult.buffer;
          thumbnail = videoResult.thumbnail;
          metadata = { ...metadata, ...videoResult.metadata };
          break;
          
        case 'audio':
          const audioResult = await this.processAudio(file.buffer, file.mimetype);
          metadata = { ...metadata, ...audioResult.metadata };
          break;
      }
      
      // Upload le fichier principal
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(storagePath);
      
      await fileRef.save(processedFile, {
        metadata: {
          contentType: file.mimetype,
          metadata: metadata
        }
      });
      
      // Rendre le fichier public et obtenir l'URL
      await fileRef.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
      
      // Upload la miniature si elle existe
      let thumbnailUrl = null;
      if (thumbnail) {
        const thumbnailPath = `conversations/${conversationId}/messages/${messageId}/thumb_${fileName}`;
        const thumbnailRef = bucket.file(thumbnailPath);
        
        await thumbnailRef.save(thumbnail, {
          metadata: {
            contentType: 'image/jpeg'
          }
        });
        
        await thumbnailRef.makePublic();
        thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;
      }
      
      return {
        url: publicUrl,
        thumbnailUrl,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: processedFile.length,
        metadata,
        storagePath
      };
    } catch (error) {
      console.error('Erreur upload média:', error);
      throw error;
    }
  }

  /**
   * Supprimer un média
   */
  static async deleteMedia(storagePath) {
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(storagePath);
      
      // Supprimer le fichier principal
      await file.delete();
      
      // Essayer de supprimer la miniature si elle existe
      const thumbnailPath = storagePath.replace(/([^/]+)$/, 'thumb_$1');
      try {
        await bucket.file(thumbnailPath).delete();
      } catch (error) {
        // Ignorer si la miniature n'existe pas
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur suppression média:', error);
      throw error;
    }
  }

  /**
   * Obtenir une URL signée temporaire
   */
  static async getSignedUrl(storagePath, expiresIn = 3600) {
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(storagePath);
      
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresIn * 1000
      });
      
      return url;
    } catch (error) {
      console.error('Erreur génération URL signée:', error);
      throw error;
    }
  }

  /**
   * Valider un fichier
   */
  static validateFile(file) {
    // Vérifier la taille
    let maxSize;
    let allowedTypes;
    let type;
    
    if (this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      type = 'image';
      maxSize = this.MAX_IMAGE_SIZE;
      allowedTypes = this.ALLOWED_IMAGE_TYPES;
    } else if (this.ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
      type = 'video';
      maxSize = this.MAX_VIDEO_SIZE;
      allowedTypes = this.ALLOWED_VIDEO_TYPES;
    } else if (this.ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      type = 'audio';
      maxSize = this.MAX_AUDIO_SIZE;
      allowedTypes = this.ALLOWED_AUDIO_TYPES;
    } else if (this.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
      type = 'document';
      maxSize = this.MAX_DOCUMENT_SIZE;
      allowedTypes = this.ALLOWED_DOCUMENT_TYPES;
    } else {
      return {
        isValid: false,
        error: 'Type de fichier non supporté'
      };
    }
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Fichier trop volumineux (max ${maxSize / 1024 / 1024}MB)`
      };
    }
    
    return {
      isValid: true,
      type
    };
  }

  /**
   * Traiter une image
   */
  static async processImage(buffer, mimeType) {
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Redimensionner si nécessaire (max 2048px)
      let processedImage = image;
      if (metadata.width > 2048 || metadata.height > 2048) {
        processedImage = image.resize(2048, 2048, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Optimiser et convertir en JPEG si nécessaire
      if (mimeType !== 'image/jpeg') {
        processedImage = processedImage.jpeg({ quality: 85 });
      }
      
      // Générer une miniature
      const thumbnail = await image
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 70 })
        .toBuffer();
      
      const processedBuffer = await processedImage.toBuffer();
      
      return {
        buffer: processedBuffer,
        thumbnail,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        }
      };
    } catch (error) {
      console.error('Erreur traitement image:', error);
      throw error;
    }
  }

  /**
   * Traiter une vidéo
   */
  static async processVideo(buffer, mimeType) {
    try {
      // Pour une implémentation complète, il faudrait utiliser ffmpeg
      // Ici on retourne simplement le buffer original
      // En production, on pourrait compresser la vidéo et extraire une frame
      
      return {
        buffer,
        thumbnail: null, // TODO: Extraire une frame avec ffmpeg
        metadata: {
          duration: 0, // TODO: Obtenir la durée avec ffmpeg
          width: 0,
          height: 0
        }
      };
    } catch (error) {
      console.error('Erreur traitement vidéo:', error);
      throw error;
    }
  }

  /**
   * Traiter un audio
   */
  static async processAudio(buffer, mimeType) {
    try {
      // Pour une implémentation complète, il faudrait utiliser ffmpeg
      // pour extraire les métadonnées audio
      
      return {
        buffer,
        metadata: {
          duration: 0, // TODO: Obtenir la durée avec ffmpeg
          bitrate: 0
        }
      };
    } catch (error) {
      console.error('Erreur traitement audio:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'extension d'un fichier
   */
  static getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop()}` : '';
  }

  /**
   * Nettoyer les médias d'une conversation
   */
  static async cleanupConversationMedia(conversationId) {
    try {
      const bucket = adminStorage.bucket();
      const [files] = await bucket.getFiles({
        prefix: `conversations/${conversationId}/`
      });
      
      const deletePromises = files.map(file => file.delete());
      await Promise.all(deletePromises);
      
      return {
        success: true,
        deletedCount: files.length
      };
    } catch (error) {
      console.error('Erreur nettoyage médias conversation:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de stockage d'un utilisateur
   */
  static async getUserStorageStats(userId) {
    try {
      // Récupérer toutes les conversations de l'utilisateur
      const conversationsSnapshot = await adminDb
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .get();
      
      let totalSize = 0;
      let fileCount = 0;
      const breakdown = {
        images: { count: 0, size: 0 },
        videos: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        documents: { count: 0, size: 0 }
      };
      
      // Pour chaque conversation, récupérer les fichiers
      for (const conversationDoc of conversationsSnapshot.docs) {
        const bucket = adminStorage.bucket();
        const [files] = await bucket.getFiles({
          prefix: `conversations/${conversationDoc.id}/`
        });
        
        for (const file of files) {
          const [metadata] = await file.getMetadata();
          const size = parseInt(metadata.size);
          const mimeType = metadata.contentType;
          
          totalSize += size;
          fileCount++;
          
          // Catégoriser par type
          if (this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
            breakdown.images.count++;
            breakdown.images.size += size;
          } else if (this.ALLOWED_VIDEO_TYPES.includes(mimeType)) {
            breakdown.videos.count++;
            breakdown.videos.size += size;
          } else if (this.ALLOWED_AUDIO_TYPES.includes(mimeType)) {
            breakdown.audio.count++;
            breakdown.audio.size += size;
          } else {
            breakdown.documents.count++;
            breakdown.documents.size += size;
          }
        }
      }
      
      return {
        totalSize,
        fileCount,
        breakdown,
        formattedSize: this.formatFileSize(totalSize)
      };
    } catch (error) {
      console.error('Erreur calcul stats stockage:', error);
      throw error;
    }
  }

  /**
   * Formater la taille d'un fichier
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}