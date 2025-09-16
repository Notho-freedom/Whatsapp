'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';
import firebaseService from '../utils/firebaseService';

export const useAuth = () => {
  const authInstance = useMemo(() => getAuth(), []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth || authInstance, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setIsAuthenticated(true);
          setUser(firebaseUser);
          const token = await firebaseUser.getIdToken();
          setAccessToken(token);
          // Ensure user doc exists/updated
          await firebaseService.updateUserLoginInfo(firebaseUser.uid).catch(async () => {
            await firebaseService.createUser({ id: firebaseUser.uid, email: firebaseUser.email, displayName: firebaseUser.displayName || '' });
          });
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setAccessToken(null);
        }
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [authInstance]);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth || authInstance, email, password);
      return { success: true };
    } catch (e) {
      setError(e);
      return { success: false, error: e?.message };
    } finally {
      setIsLoading(false);
    }
  }, [authInstance]);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth || authInstance, provider);
      return { success: true };
    } catch (e) {
      setError(e);
      return { success: false, error: e?.message };
    } finally {
      setIsLoading(false);
    }
  }, [authInstance]);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth || authInstance);
      return { success: true };
    } catch (e) {
      setError(e);
      return { success: false, error: e?.message };
    }
  }, [authInstance]);

  const updateUserProfile = useCallback(async (updates) => {
    if (!authInstance.currentUser && !auth?.currentUser) return { success: false, error: 'No user' };
    try {
      await firebaseUpdateProfile((auth || authInstance).currentUser, updates);
      if ((auth || authInstance).currentUser?.uid) {
        await firebaseService.updateUser((auth || authInstance).currentUser.uid, updates);
      }
      return { success: true };
    } catch (e) {
      setError(e);
      return { success: false, error: e?.message };
    }
  }, [authInstance]);

  const clearError = useCallback(() => setError(null), []);

  const refreshAccessToken = useCallback(async () => {
    const current = (auth || authInstance).currentUser;
    if (!current) return null;
    const token = await current.getIdToken(true);
    setAccessToken(token);
    return token;
  }, [authInstance]);

  const checkTokenExpiration = useCallback(() => {
    // Firebase handles token refresh; expose presence check for compatibility
    return Boolean(accessToken);
  }, [accessToken]);

  const checkAuthStatus = useCallback(() => {
    return Boolean((auth || authInstance).currentUser);
  }, [authInstance]);

  return {
    isAuthenticated,
    user,
    accessToken,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    refreshAccessToken,
    updateUserProfile,
    clearError,
    checkTokenExpiration,
    checkAuthStatus
  };
};
