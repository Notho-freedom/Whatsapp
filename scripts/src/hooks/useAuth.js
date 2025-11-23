'use client';

import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    refreshAccessToken,
    checkTokenExpiration,
    updateUserProfile,
    clearError,
    checkAuthStatus
  } = useAuthStore();

  // Vérification automatique du statut d'authentification au montage du composant
  useEffect(() => {
    if (accessToken) {
      checkAuthStatus();
    }
  }, [accessToken, checkAuthStatus]);

  // Vérification périodique de l'expiration du token
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // Vérifier toutes les minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, accessToken, checkTokenExpiration]);

  // Fonction de connexion simplifiée
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de connexion Google simplifiée
  const handleGoogleLogin = async (googleToken) => {
    try {
      await loginWithGoogle(googleToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de déconnexion avec nettoyage
  const handleLogout = () => {
    logout();
    // Ici vous pouvez ajouter d'autres actions de nettoyage si nécessaire
  };

  return {
    // État
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout,
    refreshAccessToken,
    updateUserProfile,
    clearError,
    
    // Utilitaires
    checkTokenExpiration,
    checkAuthStatus
  };
};
