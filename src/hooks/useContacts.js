"use client";

import { useEffect, useCallback, useState } from 'react';
import { collection, doc, getDocs, query, where, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { getAuth } from 'firebase/auth';

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [contactGroups, setContactGroups] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({ limit: 50, offset: 0 });

  // Charger les contacts au montage du composant
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoading(true);
        await fetchContacts();
        await fetchContactGroups();
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, []);

  // Fonction pour rechercher des contacts
  const searchContacts = useCallback(async (searchTerm) => {
    try {
      await updateFilters({ search: searchTerm });
      await fetchContacts({ search: searchTerm });
    } catch (e) {
      console.error('Erreur lors de la recherche:', e);
    }
  }, []);

  // Fonction pour filtrer par favoris
  const filterByFavorite = useCallback(async (isFavorite) => {
    try {
      await updateFilters({ isFavorite });
      await fetchContacts({ isFavorite });
    } catch (e) {
      console.error('Erreur lors du filtrage par favoris:', e);
    }
  }, []);

  // Fonction pour filtrer par groupe
  const filterByGroup = useCallback(async (groupId) => {
    try {
      await updateFilters({ groupId });
      await fetchContacts({ groupId });
    } catch (e) {
      console.error('Erreur lors du filtrage par groupe:', e);
    }
  }, []);

  // Fonction pour charger plus de contacts (pagination)
  const loadMoreContacts = useCallback(async () => {
    try {
      const newOffset = pagination.offset + pagination.limit;
      setPagination((p) => ({ ...p, offset: newOffset }));
      await fetchContacts({}, { offset: newOffset });
    } catch (e) {
      console.error('Erreur lors du chargement de plus de contacts:', e);
    }
  }, [pagination]);

  // Fonction pour créer un contact avec gestion d'erreur
  const handleCreateContact = useCallback(async (contactData) => {
    try {
      const uid = getAuth().currentUser?.uid;
      const contactsRef = collection(db, 'contacts');
      const newRef = doc(contactsRef);
      const data = { ...contactData, user_id: uid, created_at: new Date(), updated_at: new Date(), isFavorite: false };
      await setDoc(newRef, data);
      const created = { id: newRef.id, ...data };
      setContacts((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('Erreur lors de la création du contact:', e);
      throw e;
    }
  }, []);

  // Fonction pour mettre à jour un contact avec gestion d'erreur
  const handleUpdateContact = useCallback(async (contactId, updateData) => {
    try {
      const ref = doc(db, 'contacts', contactId);
      await updateDoc(ref, { ...updateData, updated_at: new Date() });
      setContacts((prev) => prev.map(c => c.id === contactId ? { ...c, ...updateData } : c));
      return { id: contactId, ...updateData };
    } catch (e) {
      console.error('Erreur lors de la mise à jour du contact:', e);
      throw e;
    }
  }, []);

  // Fonction pour supprimer un contact avec gestion d'erreur
  const handleDeleteContact = useCallback(async (contactId) => {
    try {
      const ref = doc(db, 'contacts', contactId);
      await updateDoc(ref, { deleted: true, updated_at: new Date() });
      setContacts((prev) => prev.filter(c => c.id !== contactId));
      return true;
    } catch (e) {
      console.error('Erreur lors de la suppression du contact:', e);
      throw e;
    }
  }, []);

  // Fonction pour basculer le statut favori avec gestion d'erreur
  const handleToggleFavorite = useCallback(async (contactId) => {
    try {
      const c = contacts.find(x => x.id === contactId);
      const updated = await handleUpdateContact(contactId, { isFavorite: !c?.isFavorite });
      return updated;
    } catch (e) {
      console.error('Erreur lors du changement de statut favori:', e);
      throw e;
    }
  }, [contacts, handleUpdateContact]);

  // Fonction pour créer un groupe avec gestion d'erreur
  const handleCreateGroup = useCallback(async (groupData) => {
    try {
      const uid = getAuth().currentUser?.uid;
      const col = collection(db, 'contact_groups');
      const newRef = doc(col);
      const data = { ...groupData, user_id: uid, created_at: new Date(), updated_at: new Date() };
      await setDoc(newRef, data);
      const created = { id: newRef.id, ...data };
      setContactGroups((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error('Erreur lors de la création du groupe:', e);
      throw e;
    }
  }, []);

  // Fonction pour mettre à jour un groupe avec gestion d'erreur
  const handleUpdateGroup = useCallback(async (groupId, updateData) => {
    try {
      const ref = doc(db, 'contact_groups', groupId);
      await updateDoc(ref, { ...updateData, updated_at: new Date() });
      setContactGroups((prev) => prev.map(g => g.id === groupId ? { ...g, ...updateData } : g));
      return { id: groupId, ...updateData };
    } catch (e) {
      console.error('Erreur lors de la mise à jour du groupe:', e);
      throw e;
    }
  }, []);

  // Fonction pour supprimer un groupe avec gestion d'erreur
  const handleDeleteGroup = useCallback(async (groupId) => {
    try {
      const ref = doc(db, 'contact_groups', groupId);
      await updateDoc(ref, { deleted: true, updated_at: new Date() });
      setContactGroups((prev) => prev.filter(g => g.id !== groupId));
      return true;
    } catch (e) {
      console.error('Erreur lors de la suppression du groupe:', e);
      throw e;
    }
  }, []);

  // Fonction pour ajouter un contact à un groupe avec gestion d'erreur
  const handleAddContactToGroup = useCallback(async (contactId, groupId) => {
    try {
      const ref = doc(db, 'contacts', contactId);
      await updateDoc(ref, { groupId });
      setContacts((prev) => prev.map(c => c.id === contactId ? { ...c, groupId } : c));
      return true;
    } catch (e) {
      console.error('Erreur lors de l\'ajout du contact au groupe:', e);
      throw e;
    }
  }, []);

  // Fonction pour retirer un contact d'un groupe avec gestion d'erreur
  const handleRemoveContactFromGroup = useCallback(async (contactId, groupId) => {
    try {
      const ref = doc(db, 'contacts', contactId);
      await updateDoc(ref, { groupId: null });
      setContacts((prev) => prev.map(c => c.id === contactId ? { ...c, groupId: null } : c));
      return true;
    } catch (e) {
      console.error('Erreur lors du retrait du contact du groupe:', e);
      throw e;
    }
  }, []);

  // Fonction pour récupérer les membres d'un groupe avec gestion d'erreur
  const handleFetchGroupMembers = useCallback(async (groupId) => {
    try {
      const col = collection(db, 'contacts');
      const q = query(col, where('groupId', '==', groupId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error('Erreur lors de la récupération des membres du groupe:', e);
      throw e;
    }
  }, []);

  // Fonction pour sélectionner un contact
  const handleSelectContact = useCallback((contact) => {
    setSelectedContact(contact);
  }, []);

  // Fonction pour sélectionner un groupe
  const handleSelectGroup = useCallback((group) => {
    setSelectedGroup(group);
  }, []);

  // Fonction pour effacer la sélection
  const handleClearSelection = useCallback(() => {
    setSelectedContact(null);
    setSelectedGroup(null);
  }, []);

  // Fonction pour effacer les erreurs
  const handleClearError = useCallback(() => {
    setError(null);
  }, []);

  // Fonction pour réinitialiser l'état
  const handleReset = useCallback(() => {
    setContacts([]);
    setContactGroups([]);
    setSelectedContact(null);
    setSelectedGroup(null);
    setError(null);
    setFilters({});
    setPagination({ limit: 50, offset: 0 });
  }, []);

  const updateFilters = useCallback(async (u) => setFilters((f) => ({ ...f, ...u })), []);

  const fetchContacts = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return [];
    const col = collection(db, 'contacts');
    const q = query(col, where('user_id', '==', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => !c.deleted);
    setContacts(list);
    return list;
  }, []);

  const fetchContactGroups = useCallback(async () => {
    const uid = getAuth().currentUser?.uid;
    if (!uid) return [];
    const col = collection(db, 'contact_groups');
    const q = query(col, where('user_id', '==', uid));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(g => !g.deleted);
    setContactGroups(list);
    return list;
  }, []);

  return {
    // État
    contacts,
    contactGroups,
    selectedContact,
    selectedGroup,
    isLoading,
    error,
    filters,
    pagination,

    // Actions de base
    fetchContacts,
    fetchContactGroups,
    createContact: handleCreateContact,
    updateContact: handleUpdateContact,
    deleteContact: handleDeleteContact,
    toggleFavorite: handleToggleFavorite,
    createContactGroup: handleCreateGroup,
    updateContactGroup: handleUpdateGroup,
    deleteContactGroup: handleDeleteGroup,
    addContactToGroup: handleAddContactToGroup,
    removeContactFromGroup: handleRemoveContactFromGroup,
    fetchGroupMembers: handleFetchGroupMembers,

    // Actions de sélection
    selectContact: handleSelectContact,
    selectGroup: handleSelectGroup,
    clearSelection: handleClearSelection,

    // Actions de filtrage et recherche
    searchContacts,
    filterByFavorite,
    filterByGroup,
    updateFilters,
    loadMoreContacts,

    // Actions utilitaires
    clearError: handleClearError,
    reset: handleReset
  };
};
