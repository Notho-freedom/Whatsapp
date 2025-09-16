'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../utils/firebaseConfig';
import { getAuth } from 'firebase/auth';

export const useUser = () => {
  const authInstance = useMemo(() => getAuth(), []);

  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [preferences, setPreferences] = useState({ theme: 'light' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chargement automatique des contacts au montage du composant
  useEffect(() => {
    const uid = (auth || authInstance).currentUser?.uid;
    if (!uid) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const userRef = doc(db, 'users', uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setCurrentUser({ id: snap.id, ...snap.data() });
          if (snap.data()?.preferences) setPreferences(snap.data().preferences);
        }
        await fetchContacts();
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [authInstance]);

  // Application automatique du thème
  useEffect(() => {
    if (preferences.theme) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
    }
  }, [preferences.theme]);

  // Fonction de mise à jour du profil simplifiée
  const handleUpdateProfile = async (updates) => {
    try {
      const uid = (auth || authInstance).currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { ...updates, updatedAt: new Date() });
      setCurrentUser((prev) => ({ ...(prev || {}), ...updates }));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction d'ajout de contact simplifiée
  const handleAddContact = async (contactData) => {
    try {
      const uid = (auth || authInstance).currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');
      const contactsRef = collection(db, 'contacts');
      const newDoc = doc(contactsRef);
      const docData = { ...contactData, user_id: uid, created_at: new Date(), updated_at: new Date(), isFavorite: false, isBlocked: false };
      await setDoc(newDoc, docData);
      const created = { id: newDoc.id, ...docData };
      setContacts((prev) => [created, ...prev]);
      return { success: true, contact: created };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de mise à jour de contact simplifiée
  const handleUpdateContact = async (contactId, updates) => {
    try {
      const ref = doc(db, 'contacts', contactId);
      await updateDoc(ref, { ...updates, updated_at: new Date() });
      setContacts((prev) => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de suppression de contact simplifiée
  const handleRemoveContact = async (contactId) => {
    try {
      // Soft delete: mark as deleted (to keep simple)
      const ref = doc(db, 'contacts', contactId);
      await updateDoc(ref, { deleted: true, updated_at: new Date() });
      setContacts((prev) => prev.filter(c => c.id !== contactId));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de synchronisation simplifiée
  const handleSyncContacts = async () => {
    try {
      await fetchContacts();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de changement de thème avec application immédiate
  const handleSetTheme = (theme) => {
    setPreferences((prev) => ({ ...(prev || {}), theme }));
    const uid = (auth || authInstance).currentUser?.uid;
    if (uid) {
      const userRef = doc(db, 'users', uid);
      updateDoc(userRef, { preferences: { ...(preferences || {}), theme }, updatedAt: new Date() }).catch(() => {});
    }
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Fonction de recherche de contacts avec debounce
  const handleSearchContacts = (query) => {
    return searchContacts(query);
  };

  // Fonction de gestion des favoris
  const handleToggleFavorite = async (contactId) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      const next = !contact?.isFavorite;
      await handleUpdateContact(contactId, { isFavorite: next });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Fonction de gestion du blocage
  const handleToggleBlock = async (contactId) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      const next = !contact?.isBlocked;
      await handleUpdateContact(contactId, { isBlocked: next });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const fetchContacts = useCallback(async (filters = {}) => {
    const uid = (auth || authInstance).currentUser?.uid;
    if (!uid) return [];
    const contactsRef = collection(db, 'contacts');
    let q = query(contactsRef, where('user_id', '==', uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => !c.deleted);
    setContacts(list);
    return list;
  }, [authInstance]);

  const searchContacts = useCallback((searchTerm) => {
    const term = (searchTerm || '').toLowerCase();
    return contacts.filter(c => `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase().includes(term));
  }, [contacts]);

  const getFavoriteContacts = useCallback(() => contacts.filter(c => c.isFavorite), [contacts]);
  const getBlockedContacts = useCallback(() => contacts.filter(c => c.isBlocked), [contacts]);

  const updatePreferences = useCallback(async (updates) => {
    const uid = (auth || authInstance).currentUser?.uid;
    if (!uid) return;
    const next = { ...(preferences || {}), ...updates };
    setPreferences(next);
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { preferences: next, updatedAt: new Date() });
  }, [authInstance, preferences]);

  const setLanguage = useCallback(async (lang) => updatePreferences({ language: lang }), [updatePreferences]);
  const updateNotificationSettings = useCallback(async (cfg) => updatePreferences({ notificationSettings: cfg }), [updatePreferences]);
  const updatePrivacySettings = useCallback(async (cfg) => updatePreferences({ privacy: cfg }), [updatePreferences]);
  const updateChatSettings = useCallback(async (cfg) => updatePreferences({ chat: cfg }), [updatePreferences]);

  const clearError = useCallback(() => setError(null), []);
  const reset = useCallback(() => {
    setContacts([]);
    setUsers([]);
    setPreferences({ theme: 'light' });
    setError(null);
  }, []);

  return {
    // État
    currentUser,
    contacts,
    users,
    preferences,
    isLoading,
    error,
    
    // Actions de profil
    updateProfile: handleUpdateProfile,
    updateProfilePhoto: async () => {},
    updateStatus: async () => {},
    
    // Actions de contacts
    addContact: handleAddContact,
    updateContact: handleUpdateContact,
    removeContact: handleRemoveContact,
    toggleFavoriteContact: handleToggleFavorite,
    toggleBlockContact: handleToggleBlock,
    searchContacts: handleSearchContacts,
    getFavoriteContacts,
    getBlockedContacts,
    
    // Actions de préférences
    updatePreferences,
    setTheme: handleSetTheme,
    setLanguage,
    updateNotificationSettings,
    updatePrivacySettings,
    updateChatSettings,
    
    // Actions de synchronisation
    syncContacts: handleSyncContacts,
    loadContacts: fetchContacts,
    saveContacts: async () => {},
    
    // Utilitaires
    clearError,
    reset
  };
};
