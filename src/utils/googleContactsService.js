/**
 * Service pour récupérer les contacts Google
 * Utilise l'API Google People pour accéder aux contacts
 */

class GoogleContactsService {
  constructor() {
    this.baseUrl = 'https://people.googleapis.com/v1';
    this.contacts = [];
    this.isLoading = false;
    this.error = null;
  }

  /**
   * Récupérer tous les contacts Google
   * @param {string} accessToken - Token d'accès Google
   * @returns {Promise<Array>} Liste des contacts
   */
  async fetchContacts(accessToken) {
    if (!accessToken) {
      throw new Error('Token d\'accès requis');
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Récupérer la liste des personnes (contacts)
      const peopleResponse = await fetch(
        `${this.baseUrl}/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=1000`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!peopleResponse.ok) {
        throw new Error(`Erreur API: ${peopleResponse.status} ${peopleResponse.statusText}`);
      }

      const peopleData = await peopleResponse.json();
      this.contacts = this.parseContacts(peopleData.connections || []);
      
      return this.contacts;
    } catch (error) {
      this.error = error.message;
      console.error('Erreur lors de la récupération des contacts:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Parser les données des contacts Google
   * @param {Array} connections - Données brutes des contacts
   * @returns {Array} Contacts formatés
   */
  parseContacts(connections) {
    return connections
      .filter(connection => connection.resourceName) // Filtrer les contacts valides
      .map(connection => {
        const contact = {
          id: connection.resourceName,
          resourceName: connection.resourceName,
          etag: connection.etag,
          metadata: connection.metadata || {},
          names: [],
          emails: [],
          phones: [],
          photos: [],
          organizations: []
        };

        // Extraire les noms
        if (connection.names && connection.names.length > 0) {
          contact.names = connection.names.map(name => ({
            displayName: name.displayName,
            givenName: name.givenName,
            familyName: name.familyName,
            displayNameLastFirst: name.displayNameLastFirst,
            metadata: name.metadata || {}
          }));
        }

        // Extraire les emails
        if (connection.emailAddresses && connection.emailAddresses.length > 0) {
          contact.emails = connection.emailAddresses.map(email => ({
            value: email.value,
            type: email.type,
            formattedType: email.formattedType,
            metadata: email.metadata || {}
          }));
        }

        // Extraire les numéros de téléphone
        if (connection.phoneNumbers && connection.phoneNumbers.length > 0) {
          contact.phones = connection.phoneNumbers.map(phone => ({
            value: phone.value,
            type: phone.type,
            formattedType: phone.formattedType,
            metadata: phone.metadata || {}
          }));
        }

        // Extraire les photos
        if (connection.photos && connection.photos.length > 0) {
          contact.photos = connection.photos.map(photo => ({
            url: photo.url,
            metadata: photo.metadata || {}
          }));
        }

        // Extraire les organisations
        if (connection.organizations && connection.organizations.length > 0) {
          contact.organizations = connection.organizations.map(org => ({
            name: org.name,
            title: org.title,
            type: org.type,
            metadata: org.metadata || {}
          }));
        }

        // Ajouter un nom d'affichage principal
        contact.displayName = this.getDisplayName(contact);
        contact.primaryEmail = this.getPrimaryEmail(contact);
        contact.primaryPhone = this.getPrimaryPhone(contact);
        contact.primaryPhoto = this.getPrimaryPhoto(contact);

        return contact;
      })
      .sort((a, b) => a.displayName.localeCompare(b.displayName)); // Trier par nom
  }

  /**
   * Obtenir le nom d'affichage principal d'un contact
   * @param {Object} contact - Contact formaté
   * @returns {string} Nom d'affichage
   */
  getDisplayName(contact) {
    if (contact.names && contact.names.length > 0) {
      return contact.names[0].displayName || 
             `${contact.names[0].givenName || ''} ${contact.names[0].familyName || ''}`.trim();
    }
    return 'Sans nom';
  }

  /**
   * Obtenir l'email principal d'un contact
   * @param {Object} contact - Contact formaté
   * @returns {string|null} Email principal
   */
  getPrimaryEmail(contact) {
    if (contact.emails && contact.emails.length > 0) {
      return contact.emails[0].value;
    }
    return null;
  }

  /**
   * Obtenir le téléphone principal d'un contact
   * @param {Object} contact - Contact formaté
   * @returns {string|null} Téléphone principal
   */
  getPrimaryPhone(contact) {
    if (contact.phones && contact.phones.length > 0) {
      return contact.phones[0].value;
    }
    return null;
  }

  /**
   * Obtenir la photo principale d'un contact
   * @param {Object} contact - Contact formaté
   * @returns {string|null} URL de la photo
   */
  getPrimaryPhoto(contact) {
    if (contact.photos && contact.photos.length > 0) {
      return contact.photos[0].url;
    }
    return null;
  }

  /**
   * Rechercher des contacts par nom ou email
   * @param {string} query - Terme de recherche
   * @returns {Array} Contacts correspondants
   */
  searchContacts(query) {
    if (!query || query.trim() === '') {
      return this.contacts;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.contacts.filter(contact => {
      // Rechercher dans les noms
      const nameMatch = contact.names.some(name => 
        name.displayName?.toLowerCase().includes(searchTerm) ||
        name.givenName?.toLowerCase().includes(searchTerm) ||
        name.familyName?.toLowerCase().includes(searchTerm)
      );

      // Rechercher dans les emails
      const emailMatch = contact.emails.some(email =>
        email.value?.toLowerCase().includes(searchTerm)
      );

      // Rechercher dans les organisations
      const orgMatch = contact.organizations.some(org =>
        org.name?.toLowerCase().includes(searchTerm) ||
        org.title?.toLowerCase().includes(searchTerm)
      );

      return nameMatch || emailMatch || orgMatch;
    });
  }

  /**
   * Obtenir les statistiques des contacts
   * @returns {Object} Statistiques des contacts
   */
  getContactsStats() {
    const total = this.contacts.length;
    const withPhotos = this.contacts.filter(c => c.primaryPhoto).length;
    const withEmails = this.contacts.filter(c => c.primaryEmail).length;
    const withPhones = this.contacts.filter(c => c.primaryPhone).length;
    const withOrganizations = this.contacts.filter(c => c.organizations.length > 0).length;

    return {
      total,
      withPhotos,
      withEmails,
      withPhones,
      withOrganizations,
      withoutPhotos: total - withPhotos,
      withoutEmails: total - withEmails,
      withoutPhones: total - withPhones
    };
  }

  /**
   * Exporter les contacts au format JSON
   * @returns {string} Contacts au format JSON
   */
  exportContactsToJSON() {
    return JSON.stringify(this.contacts, null, 2);
  }

  /**
   * Exporter les contacts au format CSV
   * @returns {string} Contacts au format CSV
   */
  exportContactsToCSV() {
    const headers = ['Nom', 'Email', 'Téléphone', 'Organisation', 'Titre'];
    const rows = this.contacts.map(contact => [
      contact.displayName,
      contact.primaryEmail || '',
      contact.primaryPhone || '',
      contact.organizations[0]?.name || '',
      contact.organizations[0]?.title || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Obtenir les contacts récents (derniers ajoutés/modifiés)
   * @param {number} limit - Nombre de contacts à retourner
   * @returns {Array} Contacts récents
   */
  getRecentContacts(limit = 10) {
    return this.contacts
      .sort((a, b) => {
        const aTime = a.metadata?.sources?.[0]?.updateTime || 0;
        const bTime = b.metadata?.sources?.[0]?.updateTime || 0;
        return new Date(bTime) - new Date(aTime);
      })
      .slice(0, limit);
  }

  /**
   * Obtenir les contacts favoris (avec photos et informations complètes)
   * @returns {Array} Contacts favoris
   */
  getFavoriteContacts() {
    return this.contacts.filter(contact => 
      contact.primaryPhoto && 
      contact.primaryEmail && 
      contact.primaryPhone
    );
  }
}

// Instance singleton
const googleContactsService = new GoogleContactsService();

export default googleContactsService;
export { GoogleContactsService };
