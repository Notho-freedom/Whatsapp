'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGoogleAuth } from './useGoogleAuth';
import { googleContactsService } from '@/utils';

export function useGoogleContacts() {
  const { user, isAuthenticated } = useGoogleAuth();
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Récupérer les contacts au chargement ou changement d'utilisateur
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      fetchContacts();
    } else {
      // Réinitialiser les contacts si l'utilisateur se déconnecte
      setContacts([]);
      setFilteredContacts([]);
      setStats(null);
      setLastSync(null);
    }
  }, [isAuthenticated, user?.token]);

  // Filtrer les contacts quand la recherche change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = googleContactsService.searchContacts(searchQuery);
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  // Mettre à jour les statistiques quand les contacts changent
  useEffect(() => {
    if (contacts.length > 0) {
      const newStats = googleContactsService.getContactsStats();
      setStats(newStats);
    }
  }, [contacts]);

  // Récupérer tous les contacts
  const fetchContacts = useCallback(async () => {
    if (!user?.token) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedContacts = await googleContactsService.fetchContacts(user.token);
      setContacts(fetchedContacts);
      setFilteredContacts(fetchedContacts);
      setLastSync(new Date());
      
      console.log(`${fetchedContacts.length} contacts récupérés avec succès`);
    } catch (error) {
      setError(error.message);
      //console.error('Erreur lors de la récupération des contacts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  // Rafraîchir les contacts
  const refreshContacts = useCallback(async () => {
    await fetchContacts();
  }, [fetchContacts]);

  // Rechercher des contacts
  const searchContacts = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  // Obtenir les contacts récents
  const getRecentContacts = useCallback((limit = 10) => {
    return googleContactsService.getRecentContacts(limit);
  }, []);

  // Obtenir les contacts favoris
  const getFavoriteContacts = useCallback(() => {
    return googleContactsService.getFavoriteContacts();
  }, []);

  // Obtenir un contact par ID
  const getContactById = useCallback((contactId) => {
    return contacts.find(contact => contact.id === contactId);
  }, [contacts]);

  // Obtenir les contacts par organisation
  const getContactsByOrganization = useCallback((orgName) => {
    return contacts.filter(contact => 
      contact.organizations.some(org => 
        org.name?.toLowerCase().includes(orgName.toLowerCase())
      )
    );
  }, [contacts]);

  // Exporter les contacts
  const exportContacts = useCallback((format = 'json') => {
    try {
      let content, filename, mimeType;

      if (format === 'json') {
        content = googleContactsService.exportContactsToJSON();
        filename = `contacts_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        content = googleContactsService.exportContactsToCSV();
        filename = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        throw new Error('Format d\'export non supporté');
      }

      // Créer et télécharger le fichier
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Synchroniser les contacts avec l'API Google
  const syncContacts = useCallback(async () => {
    if (!user?.token) return;

    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si les contacts ont été modifiés depuis la dernière synchronisation
      const lastSyncTime = lastSync?.getTime() || 0;
      const currentTime = Date.now();
      const timeSinceLastSync = currentTime - lastSyncTime;

      // Synchroniser seulement si plus de 5 minutes se sont écoulées
      if (timeSinceLastSync < 5 * 60 * 1000) {
        console.log('Synchronisation récente, pas besoin de resynchroniser');
        setIsLoading(false);
        return;
      }

      await fetchContacts();
      console.log('Contacts synchronisés avec succès');
    } catch (error) {
      setError(error.message);
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.token, lastSync, fetchContacts]);

  // Vérifier les permissions des contacts
  const checkContactsPermissions = useCallback(async () => {
    if (!user?.token) return false;

    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=names',
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }, [user?.token]);

  // Obtenir les informations de synchronisation
  const getSyncInfo = useCallback(() => {
    return {
      lastSync,
      totalContacts: contacts.length,
      hasPermission: isAuthenticated && user?.token,
      isLoading,
      error
    };
  }, [lastSync, contacts.length, isAuthenticated, user?.token, isLoading, error]);

  return {
    // État
    contacts,
    filteredContacts,
    isLoading,
    error,
    searchQuery,
    stats,
    lastSync,

    // Actions
    fetchContacts,
    refreshContacts,
    searchContacts,
    syncContacts,
    exportContacts,

    // Utilitaires
    getRecentContacts,
    getFavoriteContacts,
    getContactById,
    getContactsByOrganization,
    checkContactsPermissions,
    getSyncInfo,

    // État dérivé
    hasContacts: contacts.length > 0,
    totalContacts: contacts.length,
    searchResults: filteredContacts.length,
    canSync: isAuthenticated && user?.token && !isLoading
  };
}
