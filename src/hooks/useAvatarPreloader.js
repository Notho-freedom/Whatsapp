'use client';

import { useEffect, useCallback, useRef } from 'react';
import avatarCacheService from '@/utils/avatarCacheService';

/**
 * Hook pour précharger les avatars en arrière-plan
 * Optimise les performances en chargeant les avatars avant qu'ils ne soient visibles
 */
export function useAvatarPreloader() {
  const preloadedUrls = useRef(new Set());
  const isPreloading = useRef(false);

  /**
   * Précharge une liste d'avatars
   * @param {Array} avatars - Liste des avatars à précharger
   */
  const preloadAvatars = useCallback(async (avatars) => {
    if (isPreloading.current) return;
    
    isPreloading.current = true;
    
    try {
      const urlsToPreload = avatars
        .filter(avatar => avatar.src && !preloadedUrls.current.has(avatar.src))
        .map(avatar => ({
          url: avatar.src,
          name: avatar.name || 'User'
        }));

      if (urlsToPreload.length === 0) {
        isPreloading.current = false;
        return;
      }

      console.log(`🔄 Préchargement de ${urlsToPreload.length} avatars...`);
      
      const startTime = Date.now();
      
      await avatarCacheService.preloadAvatars(
        urlsToPreload.map(item => item.url),
        urlsToPreload.map(item => item.name)
      );
      
      // Marquer comme préchargés
      urlsToPreload.forEach(item => {
        preloadedUrls.current.add(item.url);
      });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Préchargement terminé en ${duration}ms`);
      
    } catch (error) {
      console.warn('Erreur lors du préchargement des avatars:', error);
    } finally {
      isPreloading.current = false;
    }
  }, []);

  /**
   * Précharge les avatars d'une liste de chats
   * @param {Array} chats - Liste des chats
   */
  const preloadChatAvatars = useCallback((chats) => {
    const avatars = chats.map(chat => ({
      src: chat.avatar,
      name: chat.name
    }));
    
    preloadAvatars(avatars);
  }, [preloadAvatars]);

  /**
   * Précharge les avatars d'une liste de contacts
   * @param {Array} contacts - Liste des contacts
   */
  const preloadContactAvatars = useCallback((contacts) => {
    const avatars = contacts.map(contact => ({
      src: contact.photos?.[0]?.url,
      name: contact.displayName || contact.name
    }));
    
    preloadAvatars(avatars);
  }, [preloadAvatars]);

  /**
   * Nettoie les URLs préchargées
   */
  const clearPreloadedUrls = useCallback(() => {
    preloadedUrls.current.clear();
  }, []);

  /**
   * Obtient les statistiques du préchargement
   */
  const getPreloadStats = useCallback(() => {
    return {
      preloadedCount: preloadedUrls.current.size,
      isPreloading: isPreloading.current,
      cacheStats: avatarCacheService.getCacheStats()
    };
  }, []);

  return {
    preloadAvatars,
    preloadChatAvatars,
    preloadContactAvatars,
    clearPreloadedUrls,
    getPreloadStats
  };
}

/**
 * Hook pour gérer le préchargement automatique des avatars
 * @param {Array} data - Données contenant les avatars à précharger
 * @param {string} type - Type de données ('chats', 'contacts', 'users')
 */
export function useAutoAvatarPreloader(data, type = 'chats') {
  const { preloadChatAvatars, preloadContactAvatars } = useAvatarPreloader();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Délai pour éviter le préchargement immédiat
    const timeoutId = setTimeout(() => {
      switch (type) {
        case 'chats':
          preloadChatAvatars(data);
          break;
        case 'contacts':
          preloadContactAvatars(data);
          break;
        default:
          console.warn(`Type de préchargement non supporté: ${type}`);
      }
    }, 1000); // 1 seconde de délai

    return () => clearTimeout(timeoutId);
  }, [data, type, preloadChatAvatars, preloadContactAvatars]);
}

export default useAvatarPreloader;
