'use client';

import { useState, useEffect, useCallback } from 'react';

export function useGoogleAuth() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
    
    // Écouter les événements d'authentification
    const handleAuthSuccess = (event) => {
      const { user: userData, type } = event.detail;
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
      setIsLoading(false);
      
      console.log(`Authentification ${type} réussie:`, userData);
    };

    const handleAuthLogout = () => {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setIsLoading(false);
      
      console.log('Déconnexion réussie');
    };

    const handleAuthError = (event) => {
      setError(event.detail.error);
      setIsLoading(false);
      
      console.error('Erreur d\'authentification:', event.detail.error);
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('google-auth-success', handleAuthSuccess);
    window.addEventListener('google-auth-logout', handleAuthLogout);
    window.addEventListener('google-auth-error', handleAuthError);

    return () => {
      // Nettoyer les écouteurs
      window.removeEventListener('google-auth-success', handleAuthSuccess);
      window.removeEventListener('google-auth-logout', handleAuthLogout);
      window.removeEventListener('google-auth-error', handleAuthError);
    };
  }, []);

  // Vérifier le statut d'authentification
  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('googleAuthToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Appel direct à l'endpoint Google userinfo pour avoir toutes les infos
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('Hook - Informations utilisateur récupérées:', userInfo);
        
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          token: token
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        console.log('Utilisateur authentifié via hook:', userData);
      } else {
        // Fallback vers notre API route
        console.log('Fallback vers API route pour vérification...');
        const fallbackResponse = await fetch(`/api/google/validate?token=${encodeURIComponent(token)}`);
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          const userData = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            picture: data.user.picture,
            token: token
          };
          
          setUser(userData);
          setIsAuthenticated(true);
          console.log('Utilisateur authentifié via API route:', userData);
        } else {
          // Token invalide, le supprimer
          localStorage.removeItem('googleAuthToken');
          console.log('Token invalide, supprimé du localStorage');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
      localStorage.removeItem('googleAuthToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(() => {
    // Nettoyer le client Google si disponible
    if (window.googleAuthClient) {
      // La nouvelle API gère automatiquement la déconnexion
      console.log('Client Google nettoyé');
    }
    
    localStorage.removeItem('googleAuthToken');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    // Émettre l'événement de déconnexion
    window.dispatchEvent(new CustomEvent('google-auth-logout'));
  }, []);

  // Rafraîchir les informations utilisateur
  const refreshUserInfo = useCallback(async () => {
    if (!user?.token) return;

    try {
      // Appel direct à l'endpoint Google userinfo
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        const updatedUser = {
          ...user,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture
        };
        
        setUser(updatedUser);
        console.log('Informations utilisateur rafraîchies:', updatedUser);
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des informations utilisateur:', error);
    }
  }, [user]);

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Ici vous pouvez implémenter votre logique de permissions
    // Par exemple, basée sur le rôle ou les scopes Google
    return true;
  }, [user]);

  // Obtenir les informations de base de l'utilisateur
  const getUserInfo = useCallback(() => {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      isNewUser: user.isNewUser || false
    };
  }, [user]);

  return {
    // État
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    logout,
    refreshUserInfo,
    
    // Utilitaires
    hasPermission,
    getUserInfo,
    
    // État dérivé
    isLoggedIn: isAuthenticated && !!user,
    displayName: user?.name || 'Utilisateur',
    userEmail: user?.email || '',
    userAvatar: user?.picture || null
  };
}
