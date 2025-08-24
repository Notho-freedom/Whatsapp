'use client';

import { useEffect, useState, useCallback } from 'react';
import { eventManager } from '@/utils';

/**
 * Hook personnalisé pour initialiser le gestionnaire d'événements
 * S'assure que l'initialisation se fait seulement côté client
 */
export function useEventManager() {
  useEffect(() => {
    // Vérifier que window existe (côté client uniquement)
    if (typeof window === 'undefined') {
      return;
    }

    // Initialiser le gestionnaire d'événements seulement côté client
    eventManager.initializeGlobalListeners();

    // Nettoyer lors du démontage du composant
    return () => {
      eventManager.cleanup();
    };
  }, []);

  return eventManager;
}

// Gestion des événements audio
export const useAudioEventManager = () => {
  const [audioStates, setAudioStates] = useState(new Map());
  
  const updateAudioState = useCallback((messageId, audioState) => {
    setAudioStates(prev => new Map(prev).set(messageId, audioState));
  });
  
  const getAudioState = useCallback((messageId) => {
    return audioStates.get(messageId) || { isPlaying: false, currentTime: 0 };
  });
  
  const stopAllAudio = useCallback(() => {
    setAudioStates(new Map());
  });
  
  return {
    audioStates,
    updateAudioState,
    getAudioState,
    stopAllAudio
  };
};
