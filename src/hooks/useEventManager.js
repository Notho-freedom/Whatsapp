import { useEffect } from 'react';
import eventManager from '@/utils/eventManager';

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
