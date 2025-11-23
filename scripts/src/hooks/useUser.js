'use client';

import { useUserStore } from '../stores/userStore';
import { useEffect } from 'react';

export const useUser = () => {
  const {
    currentUser,
    contacts,
    users,
    preferences,
    isLoading,
    error,
    updateProfile,
    updateProfilePhoto,
    updateStatus,
    addContact,
    updateContact,
    removeContact,
    toggleFavoriteContact,
    toggleBlockContact,
    searchContacts,
    getFavoriteContacts,
    getBlockedContacts,
    updatePreferences,
    setTheme,
    setLanguage,
    updateNotificationSettings,
    updatePrivacySettings,
    updateChatSettings,
    syncContacts,
    loadContacts,
    saveContacts,
    clearError,
    reset
  } = useUserStore();

  // Chargement automatique des contacts au montage du composant
  useEffect(() => {
    if (contacts.length === 0) {
      loadContacts();
    }
  }, [contacts.length, loadContacts]);

  // Application automatique du thème
  useEffect(() => {
    if (preferences.theme) {
      document.documentElement.setAttribute('data-theme', preferences.theme);
    }
  }, [preferences.theme]);

  // Fonction de mise à jour du profil simplifiée
  const handleUpdateProfile = async (updates) => {
    try {
      await updateProfile(updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction d'ajout de contact simplifiée
  const handleAddContact = async (contactData) => {
    try {
      const newContact = addContact(contactData);
      await saveContacts();
      return { success: true, contact: newContact };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de mise à jour de contact simplifiée
  const handleUpdateContact = async (contactId, updates) => {
    try {
      updateContact(contactId, updates);
      await saveContacts();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de suppression de contact simplifiée
  const handleRemoveContact = async (contactId) => {
    try {
      removeContact(contactId);
      await saveContacts();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de synchronisation simplifiée
  const handleSyncContacts = async () => {
    try {
      await syncContacts();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de changement de thème avec application immédiate
  const handleSetTheme = (theme) => {
    setTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Fonction de recherche de contacts avec debounce
  const handleSearchContacts = (query) => {
    return searchContacts(query);
  };

  // Fonction de gestion des favoris
  const handleToggleFavorite = async (contactId) => {
    try {
      toggleFavoriteContact(contactId);
      await saveContacts();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fonction de gestion du blocage
  const handleToggleBlock = async (contactId) => {
    try {
      toggleBlockContact(contactId);
      await saveContacts();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

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
    updateProfilePhoto,
    updateStatus,
    
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
    loadContacts,
    saveContacts,
    
    // Utilitaires
    clearError,
    reset
  };
};
