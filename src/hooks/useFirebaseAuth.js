import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, authHelpers } from '@/lib/firebase-client';
import { useAuthStore } from '@/stores/authStore';
import { showSuccess, showError } from '@/utils/notificationUtils';

export function useFirebaseAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const {
    user,
    setUser,
    setIsAuthenticated,
    clearAuth
  } = useAuthStore();

  // Observer l'état d'authentification
  useEffect(() => {
    const unsubscribe = authHelpers.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      
      try {
        if (firebaseUser) {
          // Obtenir le token ID
          const idToken = await firebaseUser.getIdToken();
          
          // Récupérer les infos complètes depuis l'API
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            
            setUser({
              ...data.user,
              idToken
            });
            setIsAuthenticated(true);
          } else {
            throw new Error('Erreur vérification utilisateur');
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error('Erreur auth state:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [setUser, setIsAuthenticated, clearAuth]);

  // Connexion email/password
  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await authHelpers.signIn(email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Appeler l'API pour créer la session
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur de connexion');
      }
      
      showSuccess('Connexion', 'Connexion réussie');
      router.push('/');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur connexion:', error);
      setError(error.message);
      showError('Erreur', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Inscription
  const signUp = useCallback(async (email, password, displayName) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, displayName })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur inscription');
      }
      
      // Se connecter avec le token personnalisé
      await auth.signInWithCustomToken(data.customToken);
      
      showSuccess('Inscription', 'Compte créé avec succès');
      router.push('/');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur inscription:', error);
      setError(error.message);
      showError('Erreur', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Connexion Google
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authHelpers.signInWithGoogle();
      const idToken = await result.user.getIdToken();
      
      // Appeler l'API pour gérer l'auth Google
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idToken,
          user: {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
          }
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur connexion Google');
      }
      
      if (data.customToken) {
        // Se reconnecter avec le token personnalisé pour avoir les claims
        await auth.signInWithCustomToken(data.customToken);
      }
      
      showSuccess('Connexion', 'Connexion Google réussie');
      router.push('/');
      
      return { success: true, isNewUser: data.isNewUser };
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      setError(error.message);
      showError('Erreur', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Déconnexion
  const signOut = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Appeler l'API pour mettre à jour le statut
      if (user?.idToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.idToken}`
          }
        });
      }
      
      // Déconnexion Firebase
      await authHelpers.signOut();
      
      clearAuth();
      showSuccess('Déconnexion', 'Déconnexion réussie');
      router.push('/auth');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      showError('Erreur', 'Erreur lors de la déconnexion');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, clearAuth, router]);

  // Réinitialisation mot de passe
  const resetPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authHelpers.resetPassword(email);
      
      showSuccess('Email envoyé', 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe');
      return { success: true };
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      setError(error.message);
      showError('Erreur', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mettre à jour le profil
  const updateProfile = useCallback(async (updates) => {
    if (!user?.idToken) {
      return { success: false, error: 'Non authentifié' };
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur mise à jour profil');
      }
      
      // Mettre à jour le store local
      setUser({
        ...user,
        ...updates
      });
      
      showSuccess('Profil', 'Profil mis à jour avec succès');
      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      showError('Erreur', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [user, setUser]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    clearError: () => setError(null)
  };
}