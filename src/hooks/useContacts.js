"use client";

import { useEffect, useCallback } from 'react';
import useContactStore from '@/stores/contactStore';

const useContacts = () => {
  const {
    contacts,
    contactGroups,
    selectedContact,
    selectedGroup,
    isLoading,
    error,
    filters,
    pagination,
    fetchContacts,
    fetchContactGroups,
    createContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    createContactGroup,
    updateContactGroup,
    deleteContactGroup,
    addContactToGroup,
    removeContactFromGroup,
    fetchGroupMembers,
    selectContact,
    selectGroup,
    clearSelection,
    updateFilters,
    clearError,
    reset
  } = useContactStore();

  // Charger les contacts au montage du composant
  useEffect(() => {
    const loadContacts = async () => {
      try {
        await fetchContacts();
        await fetchContactGroups();
      } catch (error) {
        console.error('Erreur lors du chargement des contacts:', error);
      }
    };

    loadContacts();
  }, [fetchContacts, fetchContactGroups]);

  // Fonction pour rechercher des contacts
  const searchContacts = useCallback(async (searchTerm) => {
    try {
      await updateFilters({ search: searchTerm });
      await fetchContacts({ search: searchTerm });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  }, [updateFilters, fetchContacts]);

  // Fonction pour filtrer par favoris
  const filterByFavorite = useCallback(async (isFavorite) => {
    try {
      await updateFilters({ isFavorite });
      await fetchContacts({ isFavorite });
    } catch (error) {
      console.error('Erreur lors du filtrage par favoris:', error);
    }
  }, [updateFilters, fetchContacts]);

  // Fonction pour filtrer par groupe
  const filterByGroup = useCallback(async (groupId) => {
    try {
      await updateFilters({ groupId });
      await fetchContacts({ groupId });
    } catch (error) {
      console.error('Erreur lors du filtrage par groupe:', error);
    }
  }, [updateFilters, fetchContacts]);

  // Fonction pour charger plus de contacts (pagination)
  const loadMoreContacts = useCallback(async () => {
    try {
      const newOffset = pagination.offset + pagination.limit;
      await fetchContacts({}, { offset: newOffset });
    } catch (error) {
      console.error('Erreur lors du chargement de plus de contacts:', error);
    }
  }, [fetchContacts, pagination]);

  // Fonction pour créer un contact avec gestion d'erreur
  const handleCreateContact = useCallback(async (contactData) => {
    try {
      const newContact = await createContact(contactData);
      return newContact;
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      throw error;
    }
  }, [createContact]);

  // Fonction pour mettre à jour un contact avec gestion d'erreur
  const handleUpdateContact = useCallback(async (contactId, updateData) => {
    try {
      const updatedContact = await updateContact(contactId, updateData);
      return updatedContact;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contact:', error);
      throw error;
    }
  }, [updateContact]);

  // Fonction pour supprimer un contact avec gestion d'erreur
  const handleDeleteContact = useCallback(async (contactId) => {
    try {
      await deleteContact(contactId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du contact:', error);
      throw error;
    }
  }, [deleteContact]);

  // Fonction pour basculer le statut favori avec gestion d'erreur
  const handleToggleFavorite = useCallback(async (contactId) => {
    try {
      const updatedContact = await toggleFavorite(contactId);
      return updatedContact;
    } catch (error) {
      console.error('Erreur lors du changement de statut favori:', error);
      throw error;
    }
  }, [toggleFavorite]);

  // Fonction pour créer un groupe avec gestion d'erreur
  const handleCreateGroup = useCallback(async (groupData) => {
    try {
      const newGroup = await createContactGroup(groupData);
      return newGroup;
    } catch (error) {
      console.error('Erreur lors de la création du groupe:', error);
      throw error;
    }
  }, [createContactGroup]);

  // Fonction pour mettre à jour un groupe avec gestion d'erreur
  const handleUpdateGroup = useCallback(async (groupId, updateData) => {
    try {
      const updatedGroup = await updateContactGroup(groupId, updateData);
      return updatedGroup;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du groupe:', error);
      throw error;
    }
  }, [updateContactGroup]);

  // Fonction pour supprimer un groupe avec gestion d'erreur
  const handleDeleteGroup = useCallback(async (groupId) => {
    try {
      await deleteContactGroup(groupId);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du groupe:', error);
      throw error;
    }
  }, [deleteContactGroup]);

  // Fonction pour ajouter un contact à un groupe avec gestion d'erreur
  const handleAddContactToGroup = useCallback(async (contactId, groupId) => {
    try {
      await addContactToGroup(contactId, groupId);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact au groupe:', error);
      throw error;
    }
  }, [addContactToGroup]);

  // Fonction pour retirer un contact d'un groupe avec gestion d'erreur
  const handleRemoveContactFromGroup = useCallback(async (contactId, groupId) => {
    try {
      await removeContactFromGroup(contactId, groupId);
      return true;
    } catch (error) {
      console.error('Erreur lors du retrait du contact du groupe:', error);
      throw error;
    }
  }, [removeContactFromGroup]);

  // Fonction pour récupérer les membres d'un groupe avec gestion d'erreur
  const handleFetchGroupMembers = useCallback(async (groupId) => {
    try {
      const members = await fetchGroupMembers(groupId);
      return members;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres du groupe:', error);
      throw error;
    }
  }, [fetchGroupMembers]);

  // Fonction pour sélectionner un contact
  const handleSelectContact = useCallback((contact) => {
    selectContact(contact);
  }, [selectContact]);

  // Fonction pour sélectionner un groupe
  const handleSelectGroup = useCallback((group) => {
    selectGroup(group);
  }, [selectGroup]);

  // Fonction pour effacer la sélection
  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Fonction pour effacer les erreurs
  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  // Fonction pour réinitialiser l'état
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

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

export default useContacts;
