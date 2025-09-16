"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import firebaseService from '@/utils/firebaseService';
import { auth, db } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export const useUser = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [preferences, setPreferences] = useState({ theme: 'light', language: 'fr' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const loadContacts = useCallback(async () => {
    if (!db || !currentUser) return [];
    setIsLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'contacts'), where('ownerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContacts(list);
      setIsLoading(false);
      return list;
    } catch (e) {
      setIsLoading(false);
      setError(e.message);
      return [];
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadContacts();
    } else {
      setContacts([]);
    }
  }, [currentUser, loadContacts]);

  const addContact = useCallback(async (contact) => {
    if (!db || !currentUser) return { success: false, error: 'Non connecté' };
    try {
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...contact,
        ownerId: currentUser.uid,
        created_at: new Date()
      });
      const newContact = { id: docRef.id, ...contact };
      setContacts(prev => [...prev, newContact]);
      return { success: true, contact: newContact };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [currentUser]);

  const updateContact = useCallback(async (contactId, updates) => {
    if (!db) return { success: false, error: 'Firebase non initialisé' };
    try {
      await updateDoc(doc(db, 'contacts', contactId), { ...updates, updated_at: new Date() });
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const removeContact = useCallback(async (contactId) => {
    if (!db) return { success: false, error: 'Firebase non initialisé' };
    try {
      await deleteDoc(doc(db, 'contacts', contactId));
      setContacts(prev => prev.filter(c => c.id !== contactId));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

  const setTheme = useCallback((theme) => {
    setPreferences(prev => ({ ...prev, theme }));
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const setLanguage = useCallback((language) => {
    setPreferences(prev => ({ ...prev, language }));
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!currentUser) return { success: false, error: 'Utilisateur non connecté' };
    try {
      await firebaseService.updateUser(currentUser.uid, updates);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [currentUser]);

  const value = useMemo(() => ({
    currentUser,
    contacts,
    preferences,
    isLoading,
    error
  }), [currentUser, contacts, preferences, isLoading, error]);

  const searchContacts = (queryText) => {
    const q = (queryText || '').toLowerCase();
    return contacts.filter(c => (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(queryText));
  };

  return {
    ...value,
    loadContacts,
    addContact,
    updateContact,
    removeContact,
    setTheme,
    setLanguage,
    updateProfile,
    searchContacts
  };
};
