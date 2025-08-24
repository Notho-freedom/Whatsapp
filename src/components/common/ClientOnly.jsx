'use client';

import { useState, useEffect } from 'react';

/**
 * Composant qui ne s'affiche que côté client
 * Évite les erreurs d'hydratation et les problèmes SSR
 */
export default function ClientOnly({ children, fallback = null }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return fallback;
  }

  return children;
}
