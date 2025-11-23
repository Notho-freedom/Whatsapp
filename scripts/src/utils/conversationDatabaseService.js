const databaseService = require('./databaseService');

class ConversationDatabaseService {
  constructor() {
    this.db = databaseService;
  }

  // ===== GESTION DES CONVERSATIONS TEMPORAIRES =====

  async createTempConversation(conversationData) {
    try {
      const {
        name,
        avatar_url,
        description,
        created_by = 1,
        is_temporary = true,
        custom_settings = {}
      } = conversationData;

      // Vérifier si l'utilisateur existe, sinon le créer
      let userId = created_by;
      const existingUser = await this.db.get(`
        SELECT id FROM users WHERE id = ?
      `, [created_by]);

      if (!existingUser) {
        // Créer un utilisateur par défaut
        const newUser = await this.db.run(`
          INSERT INTO users (
            username, email, phone, first_name, last_name, 
            avatar_url, is_active, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          'user_default',
          'default@whatsapp.local',
          '+33000000000',
          'Utilisateur',
          'Par Défaut',
          '/default-avatar.png',
          1,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
        userId = newUser.lastInsertRowid;
      }

      // Créer la conversation
      const conversation = await this.db.run(`
        INSERT INTO conversations (
          type, name, description, created_by, avatar_url, 
          custom_settings, is_temporary, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'individual',
        name,
        description,
        userId,
        avatar_url,
        JSON.stringify(custom_settings),
        is_temporary ? 1 : 0,
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      const conversationId = conversation.lastInsertRowid;

      // Ajouter le créateur comme participant
      await this.db.run(`
        INSERT INTO conversation_participants (
          conversation_id, user_id, role, is_active, 
          notification_settings, joined_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        conversationId,
        userId,
        'member',
        1,
        JSON.stringify({ muted: false, sound: true, vibration: true }),
        new Date().toISOString()
      ]);

      // Si un contact est fourni dans custom_settings, l'ajouter comme participant virtuel
      if (custom_settings.contact) {
        await this.db.run(`
          INSERT INTO conversation_participants (
            conversation_id, user_id, role, is_active, 
            notification_settings, joined_at, is_virtual_contact
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          conversationId,
          `virtual_${custom_settings.contact.id || Date.now()}`,
          'member',
          1,
          JSON.stringify({ muted: false, sound: true, vibration: true }),
          new Date().toISOString(),
          1
        ]);
      }

      return {
        id: conversationId,
        name,
        avatar_url,
        custom_settings,
        is_temporary: true,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation temporaire:', error);
      throw error;
    }
  }

  async getTempConversations() {
    try {
      const conversations = await this.db.all(`
        SELECT 
          c.id,
          c.name,
          c.avatar_url,
          c.custom_settings,
          c.created_at,
          c.updated_at,
          c.is_temporary
        FROM conversations c
        WHERE c.is_temporary = 1
        ORDER BY c.updated_at DESC
      `);

      return conversations.map(conv => ({
        ...conv,
        custom_settings: JSON.parse(conv.custom_settings || '{}'),
        contact: JSON.parse(conv.custom_settings || '{}').contact || null
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations temporaires:', error);
      return [];
    }
  }

  async cleanupOldTempConversations() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      // Récupérer les conversations à supprimer
      const oldConversations = await this.db.all(`
        SELECT id FROM conversations 
        WHERE is_temporary = 1 AND updated_at < ?
      `, [sevenDaysAgo]);

      // Supprimer chaque conversation
      for (const conv of oldConversations) {
        await this.deleteTempConversation(conv.id);
      }

      console.log(`🧹 Nettoyage: ${oldConversations.length} conversations temporaires supprimées`);
      return oldConversations.length;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des conversations temporaires:', error);
      return 0;
    }
  }

  async deleteTempConversation(conversationId) {
    try {
      // Supprimer les participants
      await this.db.run(`
        DELETE FROM conversation_participants 
        WHERE conversation_id = ?
      `, [conversationId]);

      // Supprimer les messages
      await this.db.run(`
        DELETE FROM messages 
        WHERE conversation_id = ?
      `, [conversationId]);

      // Supprimer la conversation
      await this.db.run(`
        DELETE FROM conversations 
        WHERE id = ? AND is_temporary = 1
      `, [conversationId]);

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la conversation temporaire:', error);
      throw error;
    }
  }

  // ===== GESTION DES CONVERSATIONS =====

  async createConversation(conversationData) {
    try {
      const {
        type = 'individual',
        name,
        description,
        created_by,
        avatar_url,
        custom_settings = {},
        created_at = new Date().toISOString(),
        updated_at = new Date().toISOString()
      } = conversationData;

      const result = this.db.run(`
        INSERT INTO conversations (
          type, name, description, created_by, avatar_url,
          custom_settings, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        type, name, description, created_by, avatar_url,
        JSON.stringify(custom_settings), created_at, updated_at
      ]);

      const conversationId = result.lastInsertRowid;
      return await this.getConversationById(conversationId);
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      throw error;
    }
  }

  async getConversationById(conversationId) {
    try {
      const conversation = this.db.get(`
        SELECT * FROM conversations WHERE id = ?
      `, [conversationId]);

      if (conversation) {
        // Parser les paramètres JSON
        if (conversation.custom_settings) {
          conversation.custom_settings = JSON.parse(conversation.custom_settings);
        }
      }

      return conversation;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la conversation:', error);
      throw error;
    }
  }

  async getConversationsByUserId(userId, limit = 50, offset = 0) {
    try {
      const conversations = this.db.all(`
        SELECT c.*, 
               cp.role as user_role,
               cp.joined_at,
               cp.is_admin,
               cp.is_muted,
               cp.mute_until,
               cp.is_pinned,
               cp.pinned_at,
               cp.is_archived,
               cp.archived_at,
               cp.custom_name,
               cp.custom_photo_url,
               cp.wallpaper_url,
               cp.theme_color,
               cp.font_size,
               cp.enter_to_send,
               cp.media_visibility,
               cp.read_receipts,
               cp.typing_indicators,
               cp.message_preview,
               cp.notification_sound,
               cp.notification_vibration,
               cp.notification_light,
               cp.notification_priority,
               cp.auto_delete_messages,
               cp.auto_delete_after,
               cp.auto_backup,
               cp.backup_frequency,
               cp.last_backup,
               cp.encryption_enabled,
               cp.encryption_key,
               cp.encryption_algorithm,
               cp.encryption_version,
               cp.verification_status,
               cp.verification_method,
               cp.verification_date,
               cp.trust_level,
               cp.risk_score,
               cp.blocked,
               cp.blocked_at,
               cp.blocked_reason,
               cp.reported,
               cp.reported_at,
               cp.reported_reason,
               cp.reported_by,
               cp.report_status,
               cp.report_resolution,
               cp.report_resolved_at,
               cp.report_resolved_by,
               cp.report_notes,
               cp.created_at as participant_created_at,
               cp.updated_at as participant_updated_at
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
        ORDER BY cp.is_pinned DESC, c.updated_at DESC
        LIMIT ? OFFSET ?
      `, [userId, limit, offset]);

      // Parser les paramètres JSON pour chaque conversation
      conversations.forEach(conv => {
        if (conv.custom_settings) {
          conv.custom_settings = JSON.parse(conv.custom_settings);
        }
      });

      return conversations;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  }

  async updateConversation(conversationId, updateData) {
    try {
      const allowedFields = [
        'name', 'description', 'avatar_url', 'custom_settings',
        'is_archived', 'is_muted'
      ];

      const fieldsToUpdate = Object.keys(updateData).filter(field => 
        allowedFields.includes(field)
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }

      const setClause = fieldsToUpdate.map(field => {
        if (field === 'custom_settings') {
          return `${field} = ?`;
        }
        return `${field} = ?`;
      }).join(', ');

      const values = fieldsToUpdate.map(field => {
        if (field === 'custom_settings') {
          return JSON.stringify(updateData[field]);
        }
        return updateData[field];
      });
      values.push(new Date().toISOString()); // updated_at
      values.push(conversationId);

      const query = `
        UPDATE conversations 
        SET ${setClause}, updated_at = ? 
        WHERE id = ?
      `;

      const result = this.db.run(query, values);

      if (result.changes === 0) {
        throw new Error('Conversation non trouvée');
      }

      return await this.getConversationById(conversationId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la conversation:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId) {
    try {
      // Supprimer d'abord les participants
      this.db.run('DELETE FROM conversation_participants WHERE conversation_id = ?', [conversationId]);
      
      // Supprimer les messages
      this.db.run('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
      
      // Supprimer la conversation
      const result = this.db.run('DELETE FROM conversations WHERE id = ?', [conversationId]);
      
      if (result.changes === 0) {
        throw new Error('Conversation non trouvée');
      }

      return { success: true, message: 'Conversation supprimée avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la conversation:', error);
      throw error;
    }
  }

  // ===== GESTION DES PARTICIPANTS =====

  async addParticipant(conversationId, userId, participantData = {}) {
    try {
      const {
        role = 'member',
        is_active = true,
        custom_name = null,
        notification_settings = {},
        joined_at = new Date().toISOString()
      } = participantData;

      const result = this.db.run(`
        INSERT INTO conversation_participants (
          conversation_id, user_id, role, joined_at, is_active, custom_name, notification_settings
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        conversationId, userId, role, joined_at, is_active || true, custom_name, 
        JSON.stringify(notification_settings || {})
      ]);

      return {
        participantId: result.lastInsertRowid,
        conversationId,
        userId,
        role,
        joinedAt: joined_at
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du participant:', error);
      throw error;
    }
  }

  async removeParticipant(conversationId, userId) {
    try {
      const result = this.db.run(`
        DELETE FROM conversation_participants 
        WHERE conversation_id = ? AND user_id = ?
      `, [conversationId, userId]);

      if (result.changes === 0) {
        throw new Error('Participant non trouvé');
      }

      return { success: true, message: 'Participant supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du participant:', error);
      throw error;
    }
  }

  async getParticipants(conversationId) {
    try {
      const participants = this.db.all(`
        SELECT cp.*, u.username, u.first_name, u.last_name, u.profile_photo_url,
               u.is_online, u.last_seen
        FROM conversation_participants cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = ?
        ORDER BY cp.role DESC, cp.joined_at ASC
      `, [conversationId]);

      return participants;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des participants:', error);
      throw error;
    }
  }

  async updateParticipant(conversationId, userId, updateData) {
    try {
      const allowedFields = [
        'role', 'is_admin', 'is_muted', 'mute_until', 'is_pinned', 'pinned_at',
        'is_archived', 'archived_at', 'custom_name', 'custom_photo_url',
        'wallpaper_url', 'theme_color', 'font_size', 'enter_to_send',
        'media_visibility', 'read_receipts', 'typing_indicators',
        'message_preview', 'notification_sound', 'notification_vibration',
        'notification_light', 'notification_priority', 'auto_delete_messages',
        'auto_delete_after', 'auto_backup', 'backup_frequency', 'last_backup',
        'encryption_enabled', 'encryption_key', 'encryption_algorithm',
        'encryption_version', 'verification_status', 'verification_method',
        'verification_date', 'trust_level', 'risk_score', 'blocked',
        'blocked_at', 'blocked_reason', 'reported', 'reported_at',
        'reported_reason', 'reported_by', 'report_status', 'report_resolution',
        'report_resolved_at', 'report_resolved_by', 'report_notes'
      ];

      const fieldsToUpdate = Object.keys(updateData).filter(field => 
        allowedFields.includes(field)
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }

      const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
      const values = fieldsToUpdate.map(field => updateData[field]);
      values.push(new Date().toISOString()); // updated_at
      values.push(conversationId);
      values.push(userId);

      const query = `
        UPDATE conversation_participants 
        SET ${setClause}, updated_at = ? 
        WHERE conversation_id = ? AND user_id = ?
      `;

      const result = this.db.run(query, values);

      if (result.changes === 0) {
        throw new Error('Participant non trouvé');
      }

      return { success: true, message: 'Participant mis à jour avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du participant:', error);
      throw error;
    }
  }

  // ===== RECHERCHE ET FILTRAGE =====

  async searchConversations(userId, query, filters = {}) {
    try {
      let sql = `
        SELECT DISTINCT c.*, cp.role as user_role, cp.is_pinned, cp.is_archived
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
      `;

      const params = [userId];

      // Ajouter la recherche par titre
      if (query) {
        sql += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`);
      }

      // Ajouter les filtres
      if (filters.type) {
        sql += ` AND c.conversation_type = ?`;
        params.push(filters.type);
      }

      if (filters.isGroup !== undefined) {
        sql += ` AND c.is_group = ?`;
        params.push(filters.isGroup);
      }

      if (filters.isPinned !== undefined) {
        sql += ` AND cp.is_pinned = ?`;
        params.push(filters.isPinned);
      }

      if (filters.isArchived !== undefined) {
        sql += ` AND cp.is_archived = ?`;
        params.push(filters.isArchived);
      }

      sql += ` ORDER BY cp.is_pinned DESC, c.updated_at DESC`;

      if (filters.limit) {
        sql += ` LIMIT ?`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ` OFFSET ?`;
        params.push(filters.offset);
      }

      const conversations = this.db.all(sql, params);

      // Parser les paramètres JSON
      conversations.forEach(conv => {
        if (conv.group_settings) {
          conv.group_settings = JSON.parse(conv.group_settings);
        }
      });

      return conversations;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche des conversations:', error);
      throw error;
    }
  }

  // ===== STATISTIQUES =====

  async getConversationStats(userId) {
    try {
      const stats = this.db.get(`
        SELECT 
          COUNT(*) as total_conversations,
          SUM(CASE WHEN c.is_group = 1 THEN 1 ELSE 0 END) as group_conversations,
          SUM(CASE WHEN c.is_group = 0 THEN 1 ELSE 0 END) as individual_conversations,
          SUM(CASE WHEN cp.is_pinned = 1 THEN 1 ELSE 0 END) as pinned_conversations,
          SUM(CASE WHEN cp.is_archived = 1 THEN 1 ELSE 0 END) as archived_conversations,
          SUM(CASE WHEN cp.is_muted = 1 THEN 1 ELSE 0 END) as muted_conversations
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ?
      `, [userId]);

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // ===== NETTOYAGE =====

  async cleanupOrphanedConversations() {
    try {
      const result = this.db.run(`
        DELETE FROM conversations 
        WHERE id NOT IN (
          SELECT DISTINCT conversation_id 
          FROM conversation_participants
        )
      `);

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des conversations orphelines:', error);
      throw error;
    }
  }
}

module.exports = new ConversationDatabaseService();
