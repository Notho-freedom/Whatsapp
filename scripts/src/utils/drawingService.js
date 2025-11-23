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

class DrawingService {
  constructor() {
    this.drawingsCollection = 'drawings';
    this.storageFolder = 'drawings';
  }

  // Créer un nouveau dessin
  async createDrawing(drawingData) {
    try {
      const drawing = {
        ...drawingData,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      const docRef = await addDoc(collection(db, this.drawingsCollection), drawing);
      
      return {
        id: docRef.id,
        ...drawing
      };
    } catch (error) {
      console.error('Erreur lors de la création du dessin:', error);
      throw new Error('Impossible de créer le dessin');
    }
  }

  // Sauvegarder un dessin avec image
  async saveDrawingWithImage(drawingData, imageBlob, conversationId) {
    try {
      // Upload de l'image
      const fileName = `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
      const storageRef = ref(storage, `${this.storageFolder}/${conversationId}/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, imageBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // Créer le dessin avec l'URL de l'image
      const drawing = {
        ...drawingData,
        image_url: downloadURL,
        storage_path: uploadResult.ref.fullPath,
        conversation_id: conversationId,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      };

      const docRef = await addDoc(collection(db, this.drawingsCollection), drawing);
      
      return {
        id: docRef.id,
        ...drawing
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du dessin:', error);
      throw new Error('Impossible de sauvegarder le dessin');
    }
  }

  // Récupérer un dessin par ID
  async getDrawingById(drawingId) {
    try {
      const drawingDoc = await getDoc(doc(db, this.drawingsCollection, drawingId));
      
      if (!drawingDoc.exists()) {
        throw new Error('Dessin non trouvé');
      }

      return {
        id: drawingDoc.id,
        ...drawingDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du dessin:', error);
      throw error;
    }
  }

  // Récupérer les dessins d'une conversation
  async getDrawingsByConversation(conversationId, limit = 50) {
    try {
      const drawingsQuery = query(
        collection(db, this.drawingsCollection),
        where('conversation_id', '==', conversationId),
        where('is_active', '==', true),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(drawingsQuery);
      const drawings = [];

      querySnapshot.forEach((doc) => {
        drawings.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return drawings.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des dessins:', error);
      throw new Error('Impossible de récupérer les dessins');
    }
  }

  // Mettre à jour un dessin
  async updateDrawing(drawingId, updates, userId) {
    try {
      const drawing = await this.getDrawingById(drawingId);
      
      if (drawing.created_by !== userId) {
        throw new Error('Seul le créateur peut modifier le dessin');
      }

      await updateDoc(doc(db, this.drawingsCollection, drawingId), {
        ...updates,
        updated_at: new Date()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du dessin:', error);
      throw error;
    }
  }

  // Supprimer un dessin
  async deleteDrawing(drawingId, userId) {
    try {
      const drawing = await this.getDrawingById(drawingId);
      
      if (drawing.created_by !== userId) {
        throw new Error('Seul le créateur peut supprimer le dessin');
      }

      // Supprimer l'image du storage si elle existe
      if (drawing.storage_path) {
        try {
          const imageRef = ref(storage, drawing.storage_path);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.warn('Impossible de supprimer l\'image du storage:', storageError);
        }
      }

      // Supprimer le document
      await deleteDoc(doc(db, this.drawingsCollection, drawingId));

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du dessin:', error);
      throw error;
    }
  }

  // Récupérer les dessins créés par un utilisateur
  async getDrawingsByUser(userId, limit = 20) {
    try {
      const drawingsQuery = query(
        collection(db, this.drawingsCollection),
        where('created_by', '==', userId),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(drawingsQuery);
      const drawings = [];

      querySnapshot.forEach((doc) => {
        drawings.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return drawings.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des dessins utilisateur:', error);
      throw new Error('Impossible de récupérer les dessins');
    }
  }

  // Rechercher des dessins par tags ou description
  async searchDrawings(query, conversationId = null, limit = 20) {
    try {
      let drawingsQuery = query(
        collection(db, this.drawingsCollection),
        where('is_active', '==', true)
      );

      if (conversationId) {
        drawingsQuery = query(
          drawingsQuery,
          where('conversation_id', '==', conversationId)
        );
      }

      const querySnapshot = await getDocs(drawingsQuery);
      const drawings = [];

      querySnapshot.forEach((doc) => {
        const drawing = doc.data();
        
        // Recherche simple dans les tags et la description
        if (drawing.tags && drawing.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        )) {
          drawings.push({ id: doc.id, ...drawing });
        } else if (drawing.description && 
          drawing.description.toLowerCase().includes(query.toLowerCase())
        ) {
          drawings.push({ id: doc.id, ...drawing });
        }
      });

      // Trier par date de création
      drawings.sort((a, b) => b.created_at - a.created_at);

      return drawings.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche de dessins:', error);
      throw new Error('Impossible de rechercher les dessins');
    }
  }

  // Ajouter des tags à un dessin
  async addTagsToDrawing(drawingId, tags, userId) {
    try {
      const drawing = await this.getDrawingById(drawingId);
      
      if (drawing.created_by !== userId) {
        throw new Error('Seul le créateur peut modifier le dessin');
      }

      const currentTags = drawing.tags || [];
      const newTags = [...new Set([...currentTags, ...tags])];

      await updateDoc(doc(db, this.drawingsCollection, drawingId), {
        tags: newTags,
        updated_at: new Date()
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des tags:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des dessins
  async getDrawingStats(conversationId = null) {
    try {
      let drawingsQuery = collection(db, this.drawingsCollection);
      
      if (conversationId) {
        drawingsQuery = query(drawingsQuery, where('conversation_id', '==', conversationId));
      }

      const querySnapshot = await getDocs(drawingsQuery);
      const stats = {
        total_drawings: 0,
        total_size: 0,
        average_size: 0,
        tags_frequency: {},
        created_today: 0,
        created_this_week: 0
      };

      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      querySnapshot.forEach((doc) => {
        const drawing = doc.data();
        stats.total_drawings++;
        
        if (drawing.file_size) {
          stats.total_size += drawing.file_size;
        }

        if (drawing.tags) {
          drawing.tags.forEach(tag => {
            stats.tags_frequency[tag] = (stats.tags_frequency[tag] || 0) + 1;
          });
        }

        const createdDate = drawing.created_at?.toDate() || new Date();
        if (createdDate >= today) {
          stats.created_today++;
        }
        if (createdDate >= weekAgo) {
          stats.created_this_week++;
        }
      });

      if (stats.total_drawings > 0) {
        stats.average_size = stats.total_size / stats.total_drawings;
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }
}

export default new DrawingService();
