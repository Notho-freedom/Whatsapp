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

      // Valider le token avec Google
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.sub,
          email: data.email,
          name: data.name,
          picture: data.picture,
          token: token
        };
        
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token invalide, le supprimer
        localStorage.removeItem('googleAuthToken');
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
    if (window.googleAuth2) {
      window.googleAuth2.signOut();
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
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${user.token}`);
      if (response.ok) {
        const data = await response.json();
        const updatedUser = {
          ...user,
          email: data.email,
          name: data.name,
          picture: data.picture
        };
        
        setUser(updatedUser);
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
