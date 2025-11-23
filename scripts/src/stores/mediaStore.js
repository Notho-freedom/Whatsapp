import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const createMediaSlice = (set, get) => ({
  // Médias stockés localement
  media: {
    images: [],
    videos: [],
    audios: [],
    documents: [],
    other: []
  },
  
  // Cache des médias
  mediaCache: new Map(),
  
  // État de chargement
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  
  // Actions de gestion des médias
  addMedia: (mediaItem) => {
    const newMedia = {
      id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...mediaItem,
      addedAt: new Date().toISOString(),
      size: mediaItem.file?.size || 0,
      type: mediaItem.file?.type || 'unknown',
      isDownloaded: false,
      isCached: false,
      metadata: {
        width: mediaItem.metadata?.width,
        height: mediaItem.metadata?.height,
        duration: mediaItem.metadata?.duration,
        format: mediaItem.metadata?.format,
        bitrate: mediaItem.metadata?.bitrate
      }
    };
    
    // Ajouter au bon type de média
    const mediaType = getMediaType(newMedia.type);
    set((state) => ({
      media: {
        ...state.media,
        [mediaType]: [...state.media[mediaType], newMedia]
      }
    }));
    
    return newMedia;
  },
  
  // Supprimer un média
  removeMedia: (mediaId) => {
    set((state) => ({
      media: {
        images: state.media.images.filter(m => m.id !== mediaId),
        videos: state.media.videos.filter(m => m.id !== mediaId),
        audios: state.media.audios.filter(m => m.id !== mediaId),
        documents: state.media.documents.filter(m => m.id !== mediaId),
        other: state.media.other.filter(m => m.id !== mediaId)
      }
    }));
  },
  
  // Mettre à jour un média
  updateMedia: (mediaId, updates) => {
    set((state) => ({
      media: {
        images: state.media.images.map(m => m.id === mediaId ? { ...m, ...updates } : m),
        videos: state.media.videos.map(m => m.id === mediaId ? { ...m, ...updates } : m),
        audios: state.media.audios.map(m => m.id === mediaId ? { ...m, ...updates } : m),
        documents: state.media.documents.map(m => m.id === mediaId ? { ...m, ...updates } : m),
        other: state.media.other.map(m => m.id === mediaId ? { ...m, ...updates } : m)
      }
    }));
  },
  
  // Marquer un média comme téléchargé
  markAsDownloaded: (mediaId) => {
    get().updateMedia(mediaId, { isDownloaded: true });
  },
  
  // Marquer un média comme mis en cache
  markAsCached: (mediaId) => {
    get().updateMedia(mediaId, { isCached: true });
  },
  
  // Actions de téléchargement
  downloadMedia: async (mediaId, filename = null) => {
    const media = get().getMediaById(mediaId);
    
    if (!media) {
      throw new Error('Média non trouvé');
    }
    
    try {
      // Créer un lien de téléchargement
      const response = await fetch(media.url);
      const blob = await response.blob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || media.filename || `media_${mediaId}`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      // Marquer comme téléchargé
      get().markAsDownloaded(mediaId);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  },
  
  // Actions d'upload
  uploadMedia: async (file, options = {}) => {
    set({ isUploading: true, uploadProgress: 0 });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Ajouter les options
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      const xhr = new XMLHttpRequest();
      
      // Suivre le progrès
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          set({ uploadProgress: progress });
        }
      });
      
      // Gérer la réponse
      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              const mediaItem = get().addMedia({
                ...response,
                file,
                filename: file.name,
                url: response.url || URL.createObjectURL(file)
              });
              
              set({ isUploading: false, uploadProgress: 0 });
              resolve(mediaItem);
            } catch (error) {
              reject(new Error('Réponse invalide du serveur'));
            }
          } else {
            reject(new Error(`Erreur HTTP: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Erreur réseau'));
        
        xhr.open('POST', '/api/media/upload');
        xhr.send(formData);
      });
    } catch (error) {
      set({ isUploading: false, uploadProgress: 0 });
      throw error;
    }
  },
  
  // Actions de cache
  addToCache: (mediaId, data) => {
    const media = get().getMediaById(mediaId);
    
    if (!media) return;
    
    // Ajouter au cache
    get().mediaCache.set(mediaId, {
      data,
      timestamp: Date.now(),
      size: data.size || 0
    });
    
    // Marquer comme mis en cache
    get().markAsCached(mediaId);
  },
  
  // Obtenir depuis le cache
  getFromCache: (mediaId) => {
    const cached = get().mediaCache.get(mediaId);
    
    if (!cached) return null;
    
    // Vérifier si le cache n'est pas expiré (24h)
    const now = Date.now();
    const cacheAge = now - cached.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    
    if (cacheAge > maxAge) {
      get().mediaCache.delete(mediaId);
      return null;
    }
    
    return cached.data;
  },
  
  // Nettoyer le cache
  clearCache: () => {
    get().mediaCache.clear();
    
    // Marquer tous les médias comme non mis en cache
    set((state) => ({
      media: {
        images: state.media.images.map(m => ({ ...m, isCached: false })),
        videos: state.media.videos.map(m => ({ ...m, isCached: false })),
        audios: state.media.audios.map(m => ({ ...m, isCached: false })),
        documents: state.media.documents.map(m => ({ ...m, isCached: false })),
        other: state.media.other.map(m => ({ ...m, isCached: false }))
      }
    }));
  },
  
  // Actions de recherche
  searchMedia: (query, filters = {}) => {
    const { media } = get();
    const allMedia = [
      ...media.images,
      ...media.videos,
      ...media.audios,
      ...media.documents,
      ...media.other
    ];
    
    let results = allMedia.filter(item =>
      item.filename?.toLowerCase().includes(query.toLowerCase()) ||
      item.type?.toLowerCase().includes(query.toLowerCase())
    );
    
    // Appliquer les filtres
    if (filters.type) {
      results = results.filter(item => item.type.startsWith(filters.type));
    }
    
    if (filters.size) {
      results = results.filter(item => item.size <= filters.size);
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date);
      results = results.filter(item => new Date(item.addedAt) >= filterDate);
    }
    
    return results;
  },
  
  // Obtenir les médias par type
  getMediaByType: (type) => {
    const { media } = get();
    return media[type] || [];
  },
  
  // Obtenir un média par ID
  getMediaById: (mediaId) => {
    const { media } = get();
    const allMedia = [
      ...media.images,
      ...media.videos,
      ...media.audios,
      ...media.documents,
      ...media.other
    ];
    
    return allMedia.find(item => item.id === mediaId);
  },
  
  // Obtenir les statistiques des médias
  getMediaStats: () => {
    const { media } = get();
    const allMedia = [
      ...media.images,
      ...media.videos,
      ...media.audios,
      ...media.documents,
      ...media.other
    ];
    
    const totalSize = allMedia.reduce((sum, item) => sum + (item.size || 0), 0);
    const totalCount = allMedia.length;
    
    return {
      totalCount,
      totalSize,
      byType: {
        images: media.images.length,
        videos: media.videos.length,
        audios: media.audios.length,
        documents: media.documents.length,
        other: media.other.length
      },
      averageSize: totalCount > 0 ? totalSize / totalCount : 0
    };
  },
  
  // Actions de compression
  compressMedia: async (mediaId, quality = 'medium') => {
    const media = get().getMediaById(mediaId);
    
    if (!media) {
      throw new Error('Média non trouvé');
    }
    
    try {
      // Ici vous pouvez implémenter la logique de compression
      // Pour l'instant, on simule
      const compressedUrl = await compressFile(media.file, quality);
      
      // Créer un nouveau média compressé
      const compressedMedia = get().addMedia({
        ...media,
        url: compressedUrl,
        isCompressed: true,
        originalMediaId: mediaId,
        compressionQuality: quality
      });
      
      return compressedMedia;
    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      throw error;
    }
  },
  
  // Actions de conversion
  convertMedia: async (mediaId, targetFormat) => {
    const media = get().getMediaById(mediaId);
    
    if (!media) {
      throw new Error('Média non trouvé');
    }
    
    try {
      // Ici vous pouvez implémenter la logique de conversion
      // Pour l'instant, on simule
      const convertedUrl = await convertFile(media.file, targetFormat);
      
      // Créer un nouveau média converti
      const convertedMedia = get().addMedia({
        ...media,
        url: convertedUrl,
        isConverted: true,
        originalMediaId: mediaId,
        targetFormat
      });
      
      return convertedMedia;
    } catch (error) {
      console.error('Erreur lors de la conversion:', error);
      throw error;
    }
  },
  
  // Actions de sauvegarde
  saveMediaToGallery: async (mediaId) => {
    const media = get().getMediaById(mediaId);
    
    if (!media) {
      throw new Error('Média non trouvé');
    }
    
    try {
      // Télécharger le média
      const response = await fetch(media.url);
      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = media.filename || `media_${mediaId}`;
      link.click();
      
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  },
  
  // Réinitialiser l'erreur
  clearError: () => set({ error: null }),
  
  // Réinitialiser l'état
  reset: () => set({
    media: {
      images: [],
      videos: [],
      audios: [],
      documents: [],
      other: []
    },
    mediaCache: new Map(),
    isLoading: false,
    isUploading: false,
    uploadProgress: 0,
    error: null
  })
});

// Fonction utilitaire pour déterminer le type de média
const getMediaType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audios';
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'documents';
  return 'other';
};

// Fonction utilitaire pour la compression (simulation)
const compressFile = async (file, quality) => {
  // Simulation de compression
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
};

// Fonction utilitaire pour la conversion (simulation)
const convertFile = async (file, targetFormat) => {
  // Simulation de conversion
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file));
    }, 1000);
  });
};

// Store des médias avec persistance
export const useMediaStore = create(
  persist(
    createMediaSlice,
    {
      name: 'whatsapp-media-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        media: state.media
      }),
      // Fonction de migration pour gérer les changements de structure
      migrate: (persistedState, version) => {
        if (persistedState) {
          console.log('🔄 Migration de l\'état des médias...');
          return {
            media: persistedState.media || {
              images: [],
              videos: [],
              audios: [],
              documents: [],
              other: []
            }
          };
        }
        return persistedState;
      },
      version: 1 // Version pour la migration
    }
  )
);
