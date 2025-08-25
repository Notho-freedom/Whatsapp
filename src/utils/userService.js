// Service de gestion des utilisateurs et contacts
class UserService {
  constructor() {
    this.baseURL = '/api';
  }

  // Gestion du profil utilisateur
  async getProfile() {
    const response = await fetch(`${this.baseURL}/profile`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération du profil');
    }

    return response.json();
  }

  async updateProfile(updates) {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du profil');
    }

    return response.json();
  }

  async updateProfilePartial(updates) {
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du profil');
    }

    return response.json();
  }

  // Gestion des contacts
  async getContacts() {
    const response = await fetch(`${this.baseURL}/contacts`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la récupération des contacts');
    }

    return response.json();
  }

  async saveContacts(contacts) {
    const response = await fetch(`${this.baseURL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacts }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la sauvegarde des contacts');
    }

    return response.json();
  }

  async syncContacts() {
    const response = await fetch(`${this.baseURL}/contacts/sync`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la synchronisation des contacts');
    }

    return response.json();
  }

  // Utilitaires pour les contacts
  searchContacts(contacts, query) {
    if (!query) return contacts;
    
    return contacts.filter(contact =>
      contact.name?.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone?.includes(query) ||
      contact.email?.toLowerCase().includes(query.toLowerCase())
    );
  }

  getFavoriteContacts(contacts) {
    return contacts.filter(contact => contact.isFavorite);
  }

  getBlockedContacts(contacts) {
    return contacts.filter(contact => contact.isBlocked);
  }

  // Validation des données de contact
  validateContact(contact) {
    const errors = [];

    if (!contact.name || contact.name.trim().length === 0) {
      errors.push('Le nom est requis');
    }

    if (!contact.phone || contact.phone.trim().length === 0) {
      errors.push('Le numéro de téléphone est requis');
    }

    if (contact.email && !this.isValidEmail(contact.email)) {
      errors.push('L\'email n\'est pas valide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validation d'email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Génération d'ID unique pour les contacts
  generateContactId() {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Formatage des données de contact
  formatContact(contactData) {
    return {
      id: contactData.id || this.generateContactId(),
      name: contactData.name || '',
      phone: contactData.phone || '',
      email: contactData.email || '',
      profilePhoto: contactData.profilePhoto || '',
      status: contactData.status || '',
      lastSeen: contactData.lastSeen || new Date().toISOString(),
      addedAt: contactData.addedAt || new Date().toISOString(),
      isFavorite: contactData.isFavorite || false,
      isBlocked: contactData.isBlocked || false,
      notes: contactData.notes || '',
      labels: contactData.labels || []
    };
  }
}

// Instance singleton du service
export const userService = new UserService();
export default userService;
