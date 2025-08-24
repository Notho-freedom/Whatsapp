import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Types pour l'authentification
const createAuthSlice = (set, get) => ({
  // État de l'authentification
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  
  // État de chargement
  isLoading: false,
  error: null,
  
  // Actions d'authentification
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulation d'une API d'authentification
      // Plus tard, remplacez par votre vraie API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error('Échec de l\'authentification');
      }
      
      const data = await response.json();
      
      set({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
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
        refreshToken: data.refreshToken,
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
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      error: null
    });
  },
  
  // Rafraîchissement du token
  refreshAccessToken: async () => {
    const { refreshToken } = get();
    
    if (!refreshToken) {
      throw new Error('Aucun refresh token disponible');
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
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
    const expiresIn = expiresAt - now;
    
    // Si le token expire dans moins de 5 minutes, le rafraîchir
    if (expiresIn < 5 * 60 * 1000) {
      get().refreshAccessToken();
    }
    
    return expiresIn > 0;
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
    const { accessToken, checkTokenExpiration } = get();
    
    if (!accessToken) {
      return false;
    }
    
    try {
      // Vérifier si le token est valide
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: true,
          user: data.user
        });
        return true;
      } else {
        // Token invalide, essayer de le rafraîchir
        await checkTokenExpiration();
        return get().isAuthenticated;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
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
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt
      })
    }
  )
);
