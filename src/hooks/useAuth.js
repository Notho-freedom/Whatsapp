"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { auth } from '@/config/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  getIdToken
} from 'firebase/auth';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoading(false);
      setError(null);
      if (user) {
        try {
          const token = await getIdToken(user, true);
          setAccessToken(token);
        } catch (e) {
          setAccessToken(null);
        }
      } else {
        setAccessToken(null);
      }
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!auth) return { success: false, error: 'Firebase non initialisé' };
    setIsLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken(true);
      setAccessToken(token);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!auth) return { success: false, error: 'Firebase non initialisé' };
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken(true);
      setAccessToken(token);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return { success: false, error: e.message };
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
    setAccessToken(null);
  }, []);

  const updateUserProfile = useCallback(async (updates) => {
    if (!auth || !auth.currentUser) return { success: false, error: 'Utilisateur non connecté' };
    try {
      await updateProfile(auth.currentUser, updates);
      setCurrentUser({ ...auth.currentUser });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!auth || !auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken(true);
    setAccessToken(token);
    return token;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);

  return {
    isAuthenticated,
    user: currentUser,
    accessToken,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    refreshAccessToken,
    updateUserProfile,
    clearError
  };
};
