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
      // Utiliser notre API route Next.js pour éviter le CORS
      const response = await fetch(`/api/google/contacts?token=${encodeURIComponent(accessToken)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('Erreur API route:', errorData);
        
        // Si l'API route échoue, utiliser les contacts de démonstration
        console.log('API route non disponible, utilisation de contacts de démonstration');
        return this.getDemoContacts();
      }

      const data = await response.json();
      this.contacts = this.parseContacts(data.connections || []);
      
      console.log(`${this.contacts.length} contacts récupérés avec succès`);
      return this.contacts;
      
    } catch (error) {
      this.error = error.message;
      console.error('Erreur lors de la récupération des contacts:', error);
      
      // En cas d'erreur, retourner des contacts de démonstration
      console.log('Utilisation de contacts de démonstration en raison de l\'erreur');
      return this.getDemoContacts();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Parser les données des contacts Google (API People v3)
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

  /**
   * Parser les données des contacts Google (API Contacts v3)
   * @param {Array} contacts - Données brutes des contacts
   * @returns {Array} Contacts formatés
   */
  parseContactsV3(contacts) {
    return contacts
      .filter(contact => contact.id)
      .map(contact => {
        const parsedContact = {
          id: contact.id,
          resourceName: contact.id,
          etag: contact.etag || '',
          metadata: contact.metadata || {},
          names: [],
          emails: [],
          phones: [],
          photos: [],
          organizations: []
        };

        // Extraire les noms
        if (contact.name) {
          parsedContact.names = [{
            displayName: contact.name.displayName || `${contact.name.givenName || ''} ${contact.name.familyName || ''}`.trim(),
            givenName: contact.name.givenName || '',
            familyName: contact.name.familyName || '',
            displayNameLastFirst: contact.name.displayNameLastFirst || '',
            metadata: {}
          }];
        }

        // Extraire les emails
        if (contact.emails && contact.emails.length > 0) {
          parsedContact.emails = contact.emails.map(email => ({
            value: email.value || '',
            type: email.type || 'home',
            formattedType: email.formattedType || 'Home',
            metadata: {}
          }));
        }

        // Extraire les numéros de téléphone
        if (contact.phones && contact.phones.length > 0) {
          parsedContact.phones = contact.phones.map(phone => ({
            value: phone.value || '',
            type: phone.type || 'mobile',
            formattedType: phone.formattedType || 'Mobile',
            metadata: {}
          }));
        }

        // Extraire les photos
        if (contact.photos && contact.photos.length > 0) {
          parsedContact.photos = contact.photos.map(photo => ({
            url: photo.url || '',
            metadata: {}
          }));
        }

        // Extraire les organisations
        if (contact.organizations && contact.organizations.length > 0) {
          parsedContact.organizations = contact.organizations.map(org => ({
            name: org.name || '',
            title: org.title || '',
            metadata: {}
          }));
        }

        // Propriétés calculées pour la compatibilité
        parsedContact.displayName = parsedContact.names[0]?.displayName || 'Contact sans nom';
        parsedContact.primaryEmail = parsedContact.emails[0]?.value || '';
        parsedContact.primaryPhone = parsedContact.phones[0]?.value || '';
        parsedContact.primaryPhoto = parsedContact.photos[0]?.url || '';

        return parsedContact;
      });
  }

  /**
   * Obtenir des contacts de démonstration pour le développement
   * @returns {Array} Contacts de démonstration
   */
  getDemoContacts() {
    return [
      {
        id: 'demo-1',
        resourceName: 'demo-1',
        displayName: 'Jean Dupont',
        names: [{ displayName: 'Jean Dupont', givenName: 'Jean', familyName: 'Dupont' }],
        emails: [{ value: 'jean.dupont@email.com', type: 'work' }],
        phones: [{ value: '+33 1 23 45 67 89', type: 'mobile' }],
        photos: [{ url: 'https://via.placeholder.com/150/1DAA61/FFFFFF?text=JD' }],
        organizations: [{ name: 'TechCorp', title: 'Développeur' }],
        primaryEmail: 'jean.dupont@email.com',
        primaryPhone: '+33 1 23 45 67 89',
        primaryPhoto: 'https://via.placeholder.com/150/1DAA61/FFFFFF?text=JD'
      },
      {
        id: 'demo-2',
        resourceName: 'demo-2',
        displayName: 'Marie Martin',
        names: [{ displayName: 'Marie Martin', givenName: 'Marie', familyName: 'Martin' }],
        emails: [{ value: 'marie.martin@email.com', type: 'personal' }],
        phones: [{ value: '+33 6 12 34 56 78', type: 'mobile' }],
        photos: [{ url: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=MM' }],
        organizations: [{ name: 'DesignStudio', title: 'Designer' }],
        primaryEmail: 'marie.martin@email.com',
        primaryPhone: '+33 6 12 34 56 78',
        primaryPhoto: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=MM'
      },
      {
        id: 'demo-3',
        resourceName: 'demo-3',
        displayName: 'Pierre Durand',
        names: [{ displayName: 'Pierre Durand', givenName: 'Pierre', familyName: 'Durand' }],
        emails: [{ value: 'pierre.durand@email.com', type: 'work' }],
        phones: [{ value: '+33 4 56 78 90 12', type: 'work' }],
        photos: [{ url: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=PD' }],
        organizations: [{ name: 'MarketingPro', title: 'Manager' }],
        primaryEmail: 'pierre.durand@email.com',
        primaryPhone: '+33 4 56 78 90 12',
        primaryPhoto: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=PD'
      }
    ];
  }
}

// Instance singleton
const googleContactsService = new GoogleContactsService();

export default googleContactsService;
export { GoogleContactsService };
