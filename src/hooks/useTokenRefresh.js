"use client";

import { useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';

/**
 * Hook pour gérer le rafraîchissement automatique des tokens JWT
 * Vérifie l'expiration du token toutes les minutes et le rafraîchit si nécessaire
 */
export const useTokenRefresh = () => {
  const auth = getAuth();
  const isAuthenticated = Boolean(auth.currentUser);
  const accessToken = null; // Firebase refresh is automatic
  const expiresAt = null;
  const refreshAccessToken = async () => auth.currentUser ? auth.currentUser.getIdToken(true) : null;
  const checkTokenExpiration = () => Boolean(auth.currentUser);
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Nettoyer les timers existants
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si l'utilisateur n'est pas authentifié, ne rien faire
    if (!isAuthenticated || !accessToken || !expiresAt) {
      return;
    }

    const checkAndRefreshToken = async () => {
      try {
        const isExpired = !checkTokenExpiration();
        
        if (isExpired) {
          console.log('🔄 Token expiré, rafraîchissement automatique...');
          await refreshAccessToken();
          console.log('✅ Token rafraîchi avec succès');
        }
      } catch (error) {
        console.error('❌ Erreur lors du rafraîchissement automatique du token:', error);
        // En cas d'erreur, l'utilisateur sera automatiquement déconnecté
      }
    };

    // Calculer le temps jusqu'à l'expiration
    const now = Date.now();
    const expiresIn = new Date(expiresAt).getTime() - now;
    
    // Si le token expire dans moins de 5 minutes, le rafraîchir immédiatement
    if (expiresIn < 5 * 60 * 1000) {
      checkAndRefreshToken();
    }

    // Vérifier toutes les minutes
    intervalRef.current = setInterval(checkAndRefreshToken, 60 * 1000);

    // Programmer une vérification spécifique 1 minute avant l'expiration
    const timeUntilCheck = Math.max(expiresIn - 60 * 1000, 0);
    timeoutRef.current = setTimeout(checkAndRefreshToken, timeUntilCheck);

    // Nettoyage lors du démontage
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, accessToken, expiresAt, checkTokenExpiration, refreshAccessToken]);

  // Fonction pour forcer un rafraîchissement manuel
  const forceRefresh = async () => {
    try {
      await refreshAccessToken();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement forcé:', error);
      return false;
    }
  };

  return {
    forceRefresh
  };
};
