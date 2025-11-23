import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useContactStore = create(
  persist(
    (set, get) => ({
      // ===== ÉTAT =====
      contacts: [],
      contactGroups: [],
      selectedContact: null,
      selectedGroup: null,
      isLoading: false,
      error: null,
      filters: {
        search: '',
        isFavorite: null,
        label: '',
        groupId: null
      },
      pagination: {
        limit: 50,
        offset: 0,
        total: 0
      },

      // ===== ACTIONS =====

      // Récupérer tous les contacts
      fetchContacts: async (filters = {}, pagination = {}) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const params = new URLSearchParams({
            limit: pagination.limit || get().pagination.limit,
            offset: pagination.offset || get().pagination.offset,
            ...filters
          });

          const response = await fetch(`/api/contacts?${params}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des contacts');
          }

          const data = await response.json();
          
          set({
            contacts: data.data.contacts,
            pagination: data.data.pagination,
            filters: { ...get().filters, ...filters },
            isLoading: false
          });

          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Créer un nouveau contact
      createContact: async (contactData) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la création du contact');
          }

          const data = await response.json();
          
          set(state => ({
            contacts: [data.data, ...state.contacts],
            isLoading: false
          }));

          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Mettre à jour un contact
      updateContact: async (contactId, updateData) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/${contactId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du contact');
          }

          const data = await response.json();
          
          set(state => ({
            contacts: state.contacts.map(contact => 
              contact.id === contactId ? data.data : contact
            ),
            selectedContact: state.selectedContact?.id === contactId ? data.data : state.selectedContact,
            isLoading: false
          }));

          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Supprimer un contact
      deleteContact: async (contactId) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/${contactId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la suppression du contact');
          }

          set(state => ({
            contacts: state.contacts.filter(contact => contact.id !== contactId),
            selectedContact: state.selectedContact?.id === contactId ? null : state.selectedContact,
            isLoading: false
          }));

          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Basculer le statut favori d'un contact
      toggleFavorite: async (contactId) => {
        try {
          const contact = get().contacts.find(c => c.id === contactId);
          if (!contact) throw new Error('Contact non trouvé');

          const updatedContact = await get().updateContact(contactId, {
            is_favorite: !contact.is_favorite
          });

          return updatedContact;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Récupérer tous les groupes de contacts
      fetchContactGroups: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch('/api/contacts/groups', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des groupes');
          }

          const data = await response.json();
          
          set({
            contactGroups: data.data,
            isLoading: false
          });

          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Créer un nouveau groupe
      createContactGroup: async (groupData) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch('/api/contacts/groups', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(groupData)
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la création du groupe');
          }

          const data = await response.json();
          
          set(state => ({
            contactGroups: [...state.contactGroups, data.data],
            isLoading: false
          }));

          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Mettre à jour un groupe
      updateContactGroup: async (groupId, updateData) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/groups/${groupId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour du groupe');
          }

          const data = await response.json();
          
          set(state => ({
            contactGroups: state.contactGroups.map(group => 
              group.id === groupId ? data.data : group
            ),
            selectedGroup: state.selectedGroup?.id === groupId ? data.data : state.selectedGroup,
            isLoading: false
          }));

          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Supprimer un groupe
      deleteContactGroup: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/groups/${groupId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la suppression du groupe');
          }

          set(state => ({
            contactGroups: state.contactGroups.filter(group => group.id !== groupId),
            selectedGroup: state.selectedGroup?.id === groupId ? null : state.selectedGroup,
            isLoading: false
          }));

          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Ajouter un contact à un groupe
      addContactToGroup: async (contactId, groupId) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/groups/${groupId}/members`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contactId })
          });

          if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout du contact au groupe');
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Retirer un contact d'un groupe
      removeContactFromGroup: async (contactId, groupId) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/groups/${groupId}/members?contactId=${contactId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erreur lors du retrait du contact du groupe');
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Récupérer les membres d'un groupe
      fetchGroupMembers: async (groupId) => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) throw new Error('Token d\'authentification manquant');

          const response = await fetch(`/api/contacts/groups/${groupId}/members`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Erreur lors de la récupération des membres du groupe');
          }

          const data = await response.json();
          set({ isLoading: false });
          return data.data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ===== ACTIONS LOCALES =====

      // Sélectionner un contact
      selectContact: (contact) => {
        set({ selectedContact: contact });
      },

      // Sélectionner un groupe
      selectGroup: (group) => {
        set({ selectedGroup: group });
      },

      // Effacer la sélection
      clearSelection: () => {
        set({ selectedContact: null, selectedGroup: null });
      },

      // Mettre à jour les filtres
      updateFilters: (newFilters) => {
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          pagination: { ...state.pagination, offset: 0 } // Reset pagination
        }));
      },

      // Effacer les erreurs
      clearError: () => {
        set({ error: null });
      },

      // Réinitialiser l'état
      reset: () => {
        set({
          contacts: [],
          contactGroups: [],
          selectedContact: null,
          selectedGroup: null,
          isLoading: false,
          error: null,
          filters: {
            search: '',
            isFavorite: null,
            label: '',
            groupId: null
          },
          pagination: {
            limit: 50,
            offset: 0,
            total: 0
          }
        });
      }
    }),
    {
      name: 'contact-storage',
      storage: createJSONStorage(() => localStorage),
      version: 0,
      migrate: (persistedState, version) => {
        // Migration future si nécessaire
        return persistedState;
      }
    }
  )
);

export default useContactStore;
