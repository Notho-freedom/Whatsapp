const databaseService = require('./databaseService');

class ContactDatabaseService {
  constructor() {
    this.db = databaseService;
  }

  // ===== GESTION DES CONTACTS =====

  async createContact(contactData) {
    try {
      const {
        user_id,
        first_name,
        last_name,
        display_name,
        phone,
        email,
        profile_photo_url,
        is_favorite = false,
        labels = [],
        notes,
        created_at = new Date().toISOString(),
        updated_at = new Date().toISOString()
      } = contactData;

      const result = this.db.run(`
        INSERT INTO contacts (
          user_id, first_name, last_name, display_name, phone, email,
          profile_photo_url, is_favorite, labels, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user_id, first_name, last_name, display_name, phone, email,
        profile_photo_url, is_favorite, JSON.stringify(labels), notes,
        created_at, updated_at
      ]);

      const contactId = result.lastInsertRowid;
      return await this.getContactById(contactId);
    } catch (error) {
      console.error('❌ Erreur lors de la création du contact:', error);
      throw error;
    }
  }

  async getContactById(contactId) {
    try {
      const contact = this.db.get(`
        SELECT * FROM contacts WHERE id = ?
      `, [contactId]);

      if (contact && contact.labels) {
        contact.labels = JSON.parse(contact.labels);
      }

      return contact;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du contact:', error);
      throw error;
    }
  }

  async getContactsByUserId(userId, limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT * FROM contacts WHERE user_id = ?
      `;

      const params = [userId];

      // Ajouter les filtres
      if (filters.isFavorite !== undefined) {
        sql += ` AND is_favorite = ?`;
        params.push(filters.isFavorite);
      }

      if (filters.search) {
        sql += ` AND (
          first_name LIKE ? OR 
          last_name LIKE ? OR 
          display_name LIKE ? OR 
          phone LIKE ? OR 
          email LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (filters.label) {
        sql += ` AND labels LIKE ?`;
        params.push(`%${filters.label}%`);
      }

      sql += ` ORDER BY is_favorite DESC, display_name ASC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const contacts = this.db.all(sql, params);

      // Parser les labels JSON pour chaque contact
      contacts.forEach(contact => {
        if (contact.labels) {
          contact.labels = JSON.parse(contact.labels);
        }
      });

      return contacts;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des contacts:', error);
      throw error;
    }
  }

  async updateContact(contactId, updateData) {
    try {
      const allowedFields = [
        'first_name', 'last_name', 'display_name', 'phone', 'email',
        'profile_photo_url', 'is_favorite', 'labels', 'notes'
      ];

      const fieldsToUpdate = Object.keys(updateData).filter(field => 
        allowedFields.includes(field)
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }

      const setClause = fieldsToUpdate.map(field => {
        if (field === 'labels') {
          return `${field} = ?`;
        }
        return `${field} = ?`;
      }).join(', ');

      const values = fieldsToUpdate.map(field => {
        if (field === 'labels') {
          return JSON.stringify(updateData[field]);
        }
        return updateData[field];
      });
      values.push(new Date().toISOString()); // updated_at
      values.push(contactId);

      const query = `
        UPDATE contacts 
        SET ${setClause}, updated_at = ? 
        WHERE id = ?
      `;

      const result = this.db.run(query, values);

      if (result.changes === 0) {
        throw new Error('Contact non trouvé');
      }

      return await this.getContactById(contactId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du contact:', error);
      throw error;
    }
  }

  async deleteContact(contactId) {
    try {
      const result = this.db.run('DELETE FROM contacts WHERE id = ?', [contactId]);
      
      if (result.changes === 0) {
        throw new Error('Contact non trouvé');
      }

      return { success: true, message: 'Contact supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du contact:', error);
      throw error;
    }
  }

  async toggleFavorite(contactId) {
    try {
      const contact = await this.getContactById(contactId);
      if (!contact) {
        throw new Error('Contact non trouvé');
      }

      const newFavoriteStatus = !contact.is_favorite;
      return await this.updateContact(contactId, { is_favorite: newFavoriteStatus });
    } catch (error) {
      console.error('❌ Erreur lors du changement de statut favori:', error);
      throw error;
    }
  }

  // ===== GESTION DES GROUPES DE CONTACTS =====

  async createContactGroup(groupData) {
    try {
      const {
        user_id,
        name,
        description,
        color,
        is_system = false,
        created_at = new Date().toISOString(),
        updated_at = new Date().toISOString()
      } = groupData;

      const result = this.db.run(`
        INSERT INTO contact_groups (
          user_id, name, description, color, is_system, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        user_id, name, description, color, is_system, created_at, updated_at
      ]);

      const groupId = result.lastInsertRowid;
      return await this.getContactGroupById(groupId);
    } catch (error) {
      console.error('❌ Erreur lors de la création du groupe:', error);
      throw error;
    }
  }

  async getContactGroupById(groupId) {
    try {
      return this.db.get(`
        SELECT * FROM contact_groups WHERE id = ?
      `, [groupId]);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du groupe:', error);
      throw error;
    }
  }

  async getContactGroupsByUserId(userId) {
    try {
      return this.db.all(`
        SELECT * FROM contact_groups 
        WHERE user_id = ? 
        ORDER BY is_system DESC, name ASC
      `, [userId]);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des groupes:', error);
      throw error;
    }
  }

  async updateContactGroup(groupId, updateData) {
    try {
      const allowedFields = ['name', 'description', 'color'];

      const fieldsToUpdate = Object.keys(updateData).filter(field => 
        allowedFields.includes(field)
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }

      const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
      const values = fieldsToUpdate.map(field => updateData[field]);
      values.push(new Date().toISOString()); // updated_at
      values.push(groupId);

      const query = `
        UPDATE contact_groups 
        SET ${setClause}, updated_at = ? 
        WHERE id = ?
      `;

      const result = this.db.run(query, values);

      if (result.changes === 0) {
        throw new Error('Groupe non trouvé');
      }

      return await this.getContactGroupById(groupId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du groupe:', error);
      throw error;
    }
  }

  async deleteContactGroup(groupId) {
    try {
      // Supprimer d'abord les membres du groupe
      this.db.run('DELETE FROM contact_group_members WHERE group_id = ?', [groupId]);
      
      // Supprimer le groupe
      const result = this.db.run('DELETE FROM contact_groups WHERE id = ?', [groupId]);
      
      if (result.changes === 0) {
        throw new Error('Groupe non trouvé');
      }

      return { success: true, message: 'Groupe supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du groupe:', error);
      throw error;
    }
  }

  // ===== GESTION DES MEMBRES DE GROUPES =====

  async addContactToGroup(contactId, groupId) {
    try {
      const result = this.db.run(`
        INSERT INTO contact_group_members (contact_id, group_id, added_at)
        VALUES (?, ?, ?)
      `, [contactId, groupId, new Date().toISOString()]);

      return {
        memberId: result.lastInsertRowid,
        contactId,
        groupId
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du contact au groupe:', error);
      throw error;
    }
  }

  async removeContactFromGroup(contactId, groupId) {
    try {
      const result = this.db.run(`
        DELETE FROM contact_group_members 
        WHERE contact_id = ? AND group_id = ?
      `, [contactId, groupId]);

      if (result.changes === 0) {
        throw new Error('Membre non trouvé');
      }

      return { success: true, message: 'Contact retiré du groupe' };
    } catch (error) {
      console.error('❌ Erreur lors du retrait du contact du groupe:', error);
      throw error;
    }
  }

  async getGroupMembers(groupId) {
    try {
      return this.db.all(`
        SELECT c.*, cgm.added_at as joined_at
        FROM contacts c
        INNER JOIN contact_group_members cgm ON c.id = cgm.contact_id
        WHERE cgm.group_id = ?
        ORDER BY c.display_name ASC
      `, [groupId]);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des membres du groupe:', error);
      throw error;
    }
  }

  async getContactGroups(contactId) {
    try {
      return this.db.all(`
        SELECT cg.*, cgm.added_at as joined_at
        FROM contact_groups cg
        INNER JOIN contact_group_members cgm ON cg.id = cgm.group_id
        WHERE cgm.contact_id = ?
        ORDER BY cg.name ASC
      `, [contactId]);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des groupes du contact:', error);
      throw error;
    }
  }

  // ===== RECHERCHE ET FILTRAGE =====

  async searchContacts(userId, query, filters = {}) {
    try {
      let sql = `
        SELECT * FROM contacts WHERE user_id = ?
      `;

      const params = [userId];

      // Ajouter la recherche
      if (query) {
        sql += ` AND (
          first_name LIKE ? OR 
          last_name LIKE ? OR 
          display_name LIKE ? OR 
          phone LIKE ? OR 
          email LIKE ? OR
          notes LIKE ?
        )`;
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Ajouter les filtres
      if (filters.isFavorite !== undefined) {
        sql += ` AND is_favorite = ?`;
        params.push(filters.isFavorite);
      }

      if (filters.label) {
        sql += ` AND labels LIKE ?`;
        params.push(`%${filters.label}%`);
      }

      if (filters.groupId) {
        sql += ` AND id IN (
          SELECT contact_id FROM contact_group_members WHERE group_id = ?
        )`;
        params.push(filters.groupId);
      }

      sql += ` ORDER BY is_favorite DESC, display_name ASC`;

      if (filters.limit) {
        sql += ` LIMIT ?`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ` OFFSET ?`;
        params.push(filters.offset);
      }

      const contacts = this.db.all(sql, params);

      // Parser les labels JSON
      contacts.forEach(contact => {
        if (contact.labels) {
          contact.labels = JSON.parse(contact.labels);
        }
      });

      return contacts;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de contacts:', error);
      throw error;
    }
  }

  // ===== STATISTIQUES =====

  async getContactStats(userId) {
    try {
      const stats = this.db.get(`
        SELECT 
          COUNT(*) as total_contacts,
          SUM(CASE WHEN is_favorite = 1 THEN 1 ELSE 0 END) as favorite_contacts,
          SUM(CASE WHEN phone IS NOT NULL AND phone != '' THEN 1 ELSE 0 END) as contacts_with_phone,
          SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as contacts_with_email,
          SUM(CASE WHEN profile_photo_url IS NOT NULL AND profile_photo_url != '' THEN 1 ELSE 0 END) as contacts_with_photo
        FROM contacts 
        WHERE user_id = ?
      `, [userId]);

      // Ajouter les statistiques des groupes
      const groupStats = this.db.get(`
        SELECT COUNT(*) as total_groups
        FROM contact_groups 
        WHERE user_id = ?
      `, [userId]);

      return { ...stats, ...groupStats };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // ===== NETTOYAGE =====

  async cleanupOrphanedGroupMembers() {
    try {
      const result = this.db.run(`
        DELETE FROM contact_group_members 
        WHERE contact_id NOT IN (SELECT id FROM contacts)
        OR group_id NOT IN (SELECT id FROM contact_groups)
      `);

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des membres orphelins:', error);
      throw error;
    }
  }
}

module.exports = new ContactDatabaseService();
