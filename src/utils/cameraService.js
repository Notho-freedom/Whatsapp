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
  orderBy
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

class CameraService {
  constructor() {
    this.mediaCollection = 'camera_media';
    this.storageFolder = 'camera';
  }

  // Capturer une photo depuis la caméra
  async capturePhoto(imageBlob, conversationId, metadata = {}) {
    try {
      // Validation de l'image
      if (!imageBlob || !(imageBlob instanceof Blob)) {
        throw new Error('Données d\'image invalides');
      }

      // Vérifier la taille (max 10MB pour les photos)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (imageBlob.size > maxSize) {
        throw new Error('L\'image est trop volumineuse (max 10MB)');
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileName = `photo_${timestamp}_${randomId}.jpg`;
      
      // Créer la référence de stockage
      const storageRef = ref(storage, `${this.storageFolder}/${conversationId}/photos/${fileName}`);
      
      // Upload de l'image
      const uploadResult = await uploadBytes(storageRef, imageBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Créer l'entrée dans Firestore
      const mediaData = {
        type: 'photo',
        file_url: downloadURL,
        storage_path: uploadResult.ref.fullPath,
        conversation_id: conversationId,
        file_size: imageBlob.size,
        file_type: 'image/jpeg',
        extension: 'jpg',
        metadata: {
          ...metadata,
          capture_method: 'camera',
          timestamp: timestamp,
          device_info: await this.getDeviceInfo()
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        status: 'captured'
      };

      const docRef = await addDoc(collection(db, this.mediaCollection), mediaData);
      
      return {
        id: docRef.id,
        ...mediaData
      };
    } catch (error) {
      console.error('Erreur lors de la capture de la photo:', error);
      throw error;
    }
  }

  // Enregistrer une vidéo depuis la caméra
  async recordVideo(videoBlob, conversationId, metadata = {}) {
    try {
      // Validation de la vidéo
      if (!videoBlob || !(videoBlob instanceof Blob)) {
        throw new Error('Données vidéo invalides');
      }

      // Vérifier la taille (max 100MB pour les vidéos)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (videoBlob.size > maxSize) {
        throw new Error('La vidéo est trop volumineuse (max 100MB)');
      }

      // Générer un nom de fichier unique
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileName = `video_${timestamp}_${randomId}.mp4`;
      
      // Créer la référence de stockage
      const storageRef = ref(storage, `${this.storageFolder}/${conversationId}/videos/${fileName}`);
      
      // Upload de la vidéo
      const uploadResult = await uploadBytes(storageRef, videoBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Créer l'entrée dans Firestore
      const mediaData = {
        type: 'video',
        file_url: downloadURL,
        storage_path: uploadResult.ref.fullPath,
        conversation_id: conversationId,
        file_size: videoBlob.size,
        file_type: 'video/mp4',
        extension: 'mp4',
        metadata: {
          ...metadata,
          capture_method: 'camera',
          timestamp: timestamp,
          device_info: await this.getDeviceInfo()
        },
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true,
        status: 'recorded'
      };

      const docRef = await addDoc(collection(db, this.mediaCollection), mediaData);
      
      return {
        id: docRef.id,
        ...mediaData
      };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la vidéo:', error);
      throw error;
    }
  }

  // Sélectionner des photos/vidéos depuis la galerie
  async selectMedia(files, conversationId, metadata = {}) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Aucun fichier sélectionné');
      }

      const mediaResults = [];

      for (const file of files) {
        // Validation du fichier
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          console.warn(`Type de fichier non supporté: ${file.type}`);
          continue;
        }

        // Vérifier la taille
        const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
        if (file.size > maxSize) {
          console.warn(`Fichier trop volumineux: ${file.name}`);
          continue;
        }

        // Déterminer le type et l'extension
        const isImage = file.type.startsWith('image/');
        const mediaType = isImage ? 'photo' : 'video';
        const extension = file.name.split('.').pop();
        const storageSubfolder = isImage ? 'photos' : 'videos';

        // Générer un nom de fichier unique
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const fileName = `${mediaType}_${timestamp}_${randomId}.${extension}`;
        
        // Créer la référence de stockage
        const storageRef = ref(storage, `${this.storageFolder}/${conversationId}/${storageSubfolder}/${fileName}`);
        
        // Upload du fichier
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        // Créer l'entrée dans Firestore
        const mediaData = {
          type: mediaType,
          file_url: downloadURL,
          storage_path: uploadResult.ref.fullPath,
          conversation_id: conversationId,
          file_size: file.size,
          file_type: file.type,
          extension: extension,
          original_name: file.name,
          metadata: {
            ...metadata,
            capture_method: 'gallery',
            timestamp: timestamp,
            device_info: await this.getDeviceInfo()
          },
          created_at: new Date(),
          updated_at: new Date(),
          is_active: true,
          status: 'selected'
        };

        const docRef = await addDoc(collection(db, this.mediaCollection), mediaData);
        
        mediaResults.push({
          id: docRef.id,
          ...mediaData
        });
      }

      return mediaResults;
    } catch (error) {
      console.error('Erreur lors de la sélection des médias:', error);
      throw error;
    }
  }

  // Récupérer un média par ID
  async getMediaById(mediaId) {
    try {
      const mediaDoc = await getDoc(doc(db, this.mediaCollection, mediaId));
      
      if (!mediaDoc.exists()) {
        throw new Error('Média non trouvé');
      }

      return {
        id: mediaDoc.id,
        ...mediaDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du média:', error);
      throw error;
    }
  }

  // Récupérer les médias d'une conversation
  async getMediaByConversation(conversationId, filters = {}, limit = 50) {
    try {
      let mediaQuery = query(
        collection(db, this.mediaCollection),
        where('conversation_id', '==', conversationId),
        where('is_active', '==', true)
      );

      // Appliquer les filtres
      if (filters.type) {
        mediaQuery = query(mediaQuery, where('type', '==', filters.type));
      }

      if (filters.status) {
        mediaQuery = query(mediaQuery, where('status', '==', filters.status));
      }

      // Trier par date de création
      mediaQuery = query(mediaQuery, orderBy('created_at', 'desc'));

      const querySnapshot = await getDocs(mediaQuery);
      const media = [];

      querySnapshot.forEach((doc) => {
        media.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Appliquer les filtres côté client si nécessaire
      let filteredMedia = media;

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredMedia = filteredMedia.filter(item => 
          item.original_name?.toLowerCase().includes(searchTerm) ||
          (item.metadata && item.metadata.description && 
           item.metadata.description.toLowerCase().includes(searchTerm))
        );
      }

      if (filters.minSize) {
        filteredMedia = filteredMedia.filter(item => item.file_size >= filters.minSize);
      }

      if (filters.maxSize) {
        filteredMedia = filteredMedia.filter(item => item.file_size <= filters.maxSize);
      }

      return filteredMedia.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des médias:', error);
      throw new Error('Impossible de récupérer les médias');
    }
  }

  // Supprimer un média
  async deleteMedia(mediaId, userId) {
    try {
      const media = await this.getMediaById(mediaId);
      
      // Supprimer le fichier du storage
      if (media.storage_path) {
        try {
          const fileRef = ref(storage, media.storage_path);
          await deleteObject(fileRef);
        } catch (storageError) {
          console.warn('Impossible de supprimer le fichier du storage:', storageError);
        }
      }

      // Supprimer l'entrée de Firestore
      await deleteDoc(doc(db, this.mediaCollection, mediaId));

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du média:', error);
      throw error;
    }
  }

  // Récupérer les informations du dispositif
  async getDeviceInfo() {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        timestamp: Date.now()
      };

      // Ajouter des informations sur l'écran si disponibles
      if (window.screen) {
        deviceInfo.screen = {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth
        };
      }

      // Ajouter des informations sur la connexion si disponibles
      if (navigator.connection) {
        deviceInfo.connection = {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        };
      }

      return deviceInfo;
    } catch (error) {
      console.warn('Impossible de récupérer les informations du dispositif:', error);
      return { timestamp: Date.now() };
    }
  }

  // Récupérer les statistiques des médias
  async getMediaStats(conversationId = null) {
    try {
      let mediaQuery = collection(db, this.mediaCollection);
      
      if (conversationId) {
        mediaQuery = query(mediaQuery, where('conversation_id', '==', conversationId));
      }

      const querySnapshot = await getDocs(mediaQuery);
      const stats = {
        total_media: 0,
        total_photos: 0,
        total_videos: 0,
        total_size: 0,
        average_size: 0,
        capture_methods: {},
        status_counts: {},
        created_today: 0,
        created_this_week: 0
      };

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      querySnapshot.forEach((doc) => {
        const media = doc.data();
        stats.total_media++;
        
        if (media.type === 'photo') {
          stats.total_photos++;
        } else if (media.type === 'video') {
          stats.total_videos++;
        }

        if (media.file_size) {
          stats.total_size += media.file_size;
        }

        // Compter les méthodes de capture
        const captureMethod = media.metadata?.capture_method || 'unknown';
        stats.capture_methods[captureMethod] = (stats.capture_methods[captureMethod] || 0) + 1;

        // Compter les statuts
        const status = media.status || 'unknown';
        stats.status_counts[status] = (stats.status_counts[status] || 0) + 1;

        const createdDate = media.created_at?.toDate() || new Date();
        if (createdDate >= today) {
          stats.created_today++;
        }
        if (createdDate >= weekAgo) {
          stats.created_this_week++;
        }
      });

      if (stats.total_media > 0) {
        stats.average_size = stats.total_size / stats.total_media;
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // Nettoyer les anciens médias
  async cleanupOldMedia(daysOld = 30, conversationId = null) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      let mediaQuery = query(
        collection(db, this.mediaCollection),
        where('created_at', '<', cutoffDate),
        where('is_active', '==', true)
      );

      if (conversationId) {
        mediaQuery = query(mediaQuery, where('conversation_id', '==', conversationId));
      }

      const querySnapshot = await getDocs(mediaQuery);
      const deletePromises = [];

      querySnapshot.forEach((doc) => {
        const media = doc.data();
        
        // Marquer comme supprimé au lieu de supprimer complètement
        deletePromises.push(
          updateDoc(doc.ref, {
            is_active: false,
            deleted_at: new Date(),
            updated_at: new Date()
          })
        );
      });

      await Promise.all(deletePromises);

      return {
        cleaned_count: deletePromises.length,
        message: `${deletePromises.length} médias nettoyés`
      };
    } catch (error) {
      console.error('Erreur lors du nettoyage des médias:', error);
      throw new Error('Impossible de nettoyer les médias');
    }
  }
}

export default new CameraService();
