import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types pour l'authentification
const createAuthSlice = (set, get) => ({
  // État de l'authentification
  isAuthenticated: false,
  user: null,
  accessToken: null,
  sessionToken: null,
  expiresAt: null,
  
  // État de chargement
  isLoading: false,
  error: null,
  
  // Actions d'authentification
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de l\'authentification');
      }
      
      const data = await response.json();
      
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        sessionToken: data.session.sessionToken,
        expiresAt: data.expiresAt,
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },

  // Inscription
  register: async (userData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de l\'inscription');
      }
      
      const data = await response.json();
      
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        sessionToken: data.session.sessionToken,
        expiresAt: data.expiresAt,
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },
  
  // Authentification Google
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken })
      });
      
      if (!response.ok) {
        throw new Error('Échec de l\'authentification Google');
      }
      
      const data = await response.json();
      
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        sessionToken: data.session?.sessionToken,
        expiresAt: data.expiresAt,
        isLoading: false,
        error: null
      });
      
      return data;
    } catch (error) {
      set({
        isLoading: false,
        error: error.message
      });
      throw error;
    }
  },
  
  // Déconnexion
  logout: async () => {
    const { sessionToken } = get();
    
    try {
      // Invalider la session côté serveur
      if (sessionToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken })
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion côté serveur:', error);
    }
    
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      sessionToken: null,
      expiresAt: null,
      error: null
    });
  },
  
  // Rafraîchissement du token
  refreshAccessToken: async () => {
    const { sessionToken } = get();
    
    if (!sessionToken) {
      throw new Error('Aucun session token disponible');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken })
      });
      
      if (!response.ok) {
        throw new Error('Échec du rafraîchissement du token');
      }
      
      const data = await response.json();
      
      set({
        accessToken: data.accessToken,
        expiresAt: data.expiresAt
      });
      
      return data.accessToken;
    } catch (error) {
      // Si le refresh échoue, déconnecter l'utilisateur
      get().logout();
      throw error;
    }
  },
  
  // Vérification de l'expiration du token
  checkTokenExpiration: () => {
    const { expiresAt, accessToken } = get();
    
    if (!expiresAt || !accessToken) {
      return false;
    }
    
    const now = Date.now();
    const expiresIn = new Date(expiresAt).getTime() - now;
    
    // Retourner true si le token est encore valide (plus de 5 minutes restantes)
    return expiresIn > 5 * 60 * 1000;
  },
  
  // Mise à jour du profil utilisateur
  updateUserProfile: (updates) => {
    set((state) => ({
      user: { ...state.user, ...updates }
    }));
  },
  
  // Réinitialisation de l'erreur
  clearError: () => set({ error: null }),
  
  // Vérification de l'état d'authentification au démarrage
  checkAuthStatus: async () => {
    const { accessToken, sessionToken } = get();
    
    if (!accessToken && !sessionToken) {
      return false;
    }
    
    try {
      // Vérifier si le token est valide
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, sessionToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: true,
          user: data.user
        });
        return true;
      } else {
        // Token invalide, déconnecter l'utilisateur
        get().logout();
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
      get().logout();
      return false;
    }
  }
});

// Store d'authentification avec persistance
export const useAuthStore = create(
  persist(
    createAuthSlice,
    {
      name: 'whatsapp-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        sessionToken: state.sessionToken,
        expiresAt: state.expiresAt
      }),
      // Fonction de migration pour gérer les changements de structure
      migrate: (persistedState, version) => {
        // Si l'état persistant a l'ancienne structure (avec refreshToken)
        if (persistedState && persistedState.refreshToken && !persistedState.sessionToken) {
          console.log('🔄 Migration de l\'état d\'authentification...');
          return {
            ...persistedState,
            sessionToken: null, // Pas de session token dans l'ancienne version
            refreshToken: undefined // Supprimer l'ancien refreshToken
          };
        }
        return persistedState;
      },
      version: 2 // Version pour la migration
    }
  )
);
