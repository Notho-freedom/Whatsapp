const databaseService = require('./databaseService');

class MessageDatabaseService {
  constructor() {
    this.db = databaseService;
  }

  // ===== GESTION DES MESSAGES =====

  async createMessage(messageData) {
    try {
      const {
        conversation_id,
        sender_id,
        message_type = 'text',
        content,
        media_url,
        media_metadata = {},
        reply_to_message_id = null,
        forward_from_message_id = null,
        forward_from_conversation_id = null,
        status = 'sent',
        is_edited = false,
        edited_at = null,
        is_deleted = false,
        deleted_at = null,
        deleted_by = null,
        encryption_data = {},
        created_at = new Date().toISOString(),
        updated_at = new Date().toISOString()
      } = messageData;

      const result = this.db.run(`
        INSERT INTO messages (
          conversation_id, sender_id, message_type, content, media_url,
          media_metadata, reply_to_message_id, forward_from_message_id,
          forward_from_conversation_id, status, is_edited, edited_at,
          is_deleted, deleted_at, deleted_by, encryption_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        conversation_id, sender_id, message_type, content, media_url,
        JSON.stringify(media_metadata || {}), reply_to_message_id, forward_from_message_id,
        forward_from_conversation_id, status || 'sent', is_edited || false, edited_at,
        is_deleted || false, deleted_at, deleted_by, JSON.stringify(encryption_data || {}),
        created_at, updated_at
      ]);

      const messageId = result.lastInsertRowid;
      return await this.getMessageById(messageId);
    } catch (error) {
      console.error('❌ Erreur lors de la création du message:', error);
      throw error;
    }
  }

  async getMessageById(messageId) {
    try {
      const message = this.db.get(`
        SELECT m.*, u.username, u.first_name, u.last_name, u.profile_photo_url
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `, [messageId]);

      if (message) {
        // Parser les paramètres JSON
        if (message.media_metadata) {
          message.media_metadata = JSON.parse(message.media_metadata);
        }
        if (message.edit_history) {
          message.edit_history = JSON.parse(message.edit_history);
        }
      }

      return message;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du message:', error);
      throw error;
    }
  }

  async getMessagesByConversationId(conversationId, limit = 50, offset = 0, filters = {}) {
    try {
      let sql = `
        SELECT m.*, u.username, u.first_name, u.last_name, u.profile_photo_url
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
      `;

      const params = [conversationId];

      // Ajouter les filtres
      if (filters.messageType) {
        sql += ` AND m.message_type = ?`;
        params.push(filters.messageType);
      }

      if (filters.senderId) {
        sql += ` AND m.sender_id = ?`;
        params.push(filters.senderId);
      }

      if (filters.isDeleted !== undefined) {
        sql += ` AND m.is_deleted = ?`;
        params.push(filters.isDeleted);
      }

      if (filters.isEdited !== undefined) {
        sql += ` AND m.is_edited = ?`;
        params.push(filters.isEdited);
      }

      if (filters.isPinned !== undefined) {
        sql += ` AND m.is_pinned = ?`;
        params.push(filters.isPinned);
      }

      if (filters.isStarred !== undefined) {
        sql += ` AND m.is_starred = ?`;
        params.push(filters.isStarred);
      }

      if (filters.dateFrom) {
        sql += ` AND m.created_at >= ?`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        sql += ` AND m.created_at <= ?`;
        params.push(filters.dateTo);
      }

      sql += ` ORDER BY m.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const messages = this.db.all(sql, params);

      // Parser les paramètres JSON pour chaque message
      messages.forEach(message => {
        if (message.media_metadata) {
          message.media_metadata = JSON.parse(message.media_metadata);
        }
        if (message.edit_history) {
          message.edit_history = JSON.parse(message.edit_history);
        }
      });

      return messages;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  async updateMessage(messageId, updateData) {
    try {
      const allowedFields = [
        'content', 'media_url', 'media_type', 'media_size', 'media_duration',
        'media_thumbnail', 'media_metadata', 'is_edited', 'edited_at',
        'edit_history', 'is_deleted', 'deleted_at', 'deleted_by',
        'deletion_reason', 'is_pinned', 'pinned_at', 'pinned_by',
        'is_starred', 'starred_at', 'starred_by', 'encryption_enabled',
        'encryption_key', 'encryption_algorithm', 'encryption_version',
        'verification_status', 'verification_method', 'verification_date',
        'trust_level', 'risk_score', 'spam_score', 'spam_detected',
        'spam_detection_method', 'spam_detection_date', 'spam_detection_confidence',
        'spam_detection_false_positive', 'spam_detection_false_positive_date',
        'spam_detection_false_positive_by', 'spam_detection_false_positive_reason',
        'spam_detection_false_positive_notes'
      ];

      const fieldsToUpdate = Object.keys(updateData).filter(field => 
        allowedFields.includes(field)
      );

      if (fieldsToUpdate.length === 0) {
        throw new Error('Aucun champ valide à mettre à jour');
      }

      const setClause = fieldsToUpdate.map(field => {
        if (field === 'media_metadata' || field === 'edit_history') {
          return `${field} = ?`;
        }
        return `${field} = ?`;
      }).join(', ');

      const values = fieldsToUpdate.map(field => {
        if (field === 'media_metadata' || field === 'edit_history') {
          return JSON.stringify(updateData[field]);
        }
        return updateData[field];
      });
      values.push(new Date().toISOString()); // updated_at
      values.push(messageId);

      const query = `
        UPDATE messages 
        SET ${setClause}, updated_at = ? 
        WHERE id = ?
      `;

      const result = this.db.run(query, values);

      if (result.changes === 0) {
        throw new Error('Message non trouvé');
      }

      return await this.getMessageById(messageId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId, deletedBy = null, reason = null) {
    try {
      const updateData = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        deletion_reason: reason
      };

      return await this.updateMessage(messageId, updateData);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du message:', error);
      throw error;
    }
  }

  async permanentlyDeleteMessage(messageId) {
    try {
      const result = this.db.run('DELETE FROM messages WHERE id = ?', [messageId]);
      
      if (result.changes === 0) {
        throw new Error('Message non trouvé');
      }

      return { success: true, message: 'Message supprimé définitivement' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression définitive du message:', error);
      throw error;
    }
  }

  // ===== GESTION DES RÉACTIONS =====

  async addReaction(messageId, userId, reactionType) {
    try {
      const result = this.db.run(`
        INSERT INTO message_reactions (message_id, user_id, reaction_type, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(message_id, user_id) DO UPDATE SET
        reaction_type = excluded.reaction_type,
        updated_at = excluded.created_at
      `, [messageId, userId, reactionType, new Date().toISOString()]);

      return {
        reactionId: result.lastInsertRowid,
        messageId,
        userId,
        reactionType
      };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout de la réaction:', error);
      throw error;
    }
  }

  async removeReaction(messageId, userId) {
    try {
      const result = this.db.run(`
        DELETE FROM message_reactions 
        WHERE message_id = ? AND user_id = ?
      `, [messageId, userId]);

      if (result.changes === 0) {
        throw new Error('Réaction non trouvée');
      }

      return { success: true, message: 'Réaction supprimée' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la réaction:', error);
      throw error;
    }
  }

  async getMessageReactions(messageId) {
    try {
      const reactions = this.db.all(`
        SELECT mr.*, u.username, u.first_name, u.last_name, u.profile_photo_url
        FROM message_reactions mr
        INNER JOIN users u ON mr.user_id = u.id
        WHERE mr.message_id = ?
        ORDER BY mr.created_at ASC
      `, [messageId]);

      return reactions;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des réactions:', error);
      throw error;
    }
  }

  // ===== GESTION DES LECTURES =====

  async markMessageAsRead(messageId, userId) {
    try {
      const result = this.db.run(`
        INSERT INTO message_reads (message_id, user_id, read_at)
        VALUES (?, ?, ?)
        ON CONFLICT(message_id, user_id) DO NOTHING
      `, [messageId, userId, new Date().toISOString()]);

      return { success: true, message: 'Message marqué comme lu' };
    } catch (error) {
      console.error('❌ Erreur lors du marquage du message comme lu:', error);
      throw error;
    }
  }

  async getMessageReads(messageId) {
    try {
      const reads = this.db.all(`
        SELECT mr.*, u.username, u.first_name, u.last_name, u.profile_photo_url
        FROM message_reads mr
        INNER JOIN users u ON mr.user_id = u.id
        WHERE mr.message_id = ?
        ORDER BY mr.read_at ASC
      `, [messageId]);

      return reads;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des lectures:', error);
      throw error;
    }
  }

  // ===== RECHERCHE DE MESSAGES =====

  async searchMessages(conversationId, query, filters = {}) {
    try {
      let sql = `
        SELECT m.*, u.username, u.first_name, u.last_name, u.profile_photo_url
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ? AND m.is_deleted = 0
      `;

      const params = [conversationId];

      // Ajouter la recherche par contenu
      if (query) {
        sql += ` AND (m.content LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }

      // Ajouter les filtres
      if (filters.messageType) {
        sql += ` AND m.message_type = ?`;
        params.push(filters.messageType);
      }

      if (filters.senderId) {
        sql += ` AND m.sender_id = ?`;
        params.push(filters.senderId);
      }

      if (filters.isEdited !== undefined) {
        sql += ` AND m.is_edited = ?`;
        params.push(filters.isEdited);
      }

      if (filters.isPinned !== undefined) {
        sql += ` AND m.is_pinned = ?`;
        params.push(filters.isPinned);
      }

      if (filters.isStarred !== undefined) {
        sql += ` AND m.is_starred = ?`;
        params.push(filters.isStarred);
      }

      if (filters.dateFrom) {
        sql += ` AND m.created_at >= ?`;
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        sql += ` AND m.created_at <= ?`;
        params.push(filters.dateTo);
      }

      sql += ` ORDER BY m.created_at DESC`;

      if (filters.limit) {
        sql += ` LIMIT ?`;
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ` OFFSET ?`;
        params.push(filters.offset);
      }

      const messages = this.db.all(sql, params);

      // Parser les paramètres JSON
      messages.forEach(message => {
        if (message.media_metadata) {
          message.media_metadata = JSON.parse(message.media_metadata);
        }
        if (message.edit_history) {
          message.edit_history = JSON.parse(message.edit_history);
        }
      });

      return messages;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de messages:', error);
      throw error;
    }
  }

  // ===== MESSAGES ÉPINGLÉS =====

  async getPinnedMessages(conversationId) {
    try {
      const messages = this.db.all(`
        SELECT m.*, u.username, u.first_name, u.last_name, u.profile_photo_url
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ? AND m.is_pinned = 1 AND m.is_deleted = 0
        ORDER BY m.pinned_at DESC
      `, [conversationId]);

      // Parser les paramètres JSON
      messages.forEach(message => {
        if (message.media_metadata) {
          message.media_metadata = JSON.parse(message.media_metadata);
        }
        if (message.edit_history) {
          message.edit_history = JSON.parse(message.edit_history);
        }
      });

      return messages;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages épinglés:', error);
      throw error;
    }
  }

  // ===== MESSAGES FAVORIS =====

  async getStarredMessages(userId, limit = 50, offset = 0) {
    try {
      const messages = this.db.all(`
        SELECT m.*, u.username, u.first_name, u.last_name, u.profile_photo_url,
               c.title as conversation_title
        FROM messages m
        INNER JOIN users u ON m.sender_id = u.id
        INNER JOIN conversations c ON m.conversation_id = c.id
        WHERE m.is_starred = 1 AND m.is_deleted = 0
        ORDER BY m.starred_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      // Parser les paramètres JSON
      messages.forEach(message => {
        if (message.media_metadata) {
          message.media_metadata = JSON.parse(message.media_metadata);
        }
        if (message.edit_history) {
          message.edit_history = JSON.parse(message.edit_history);
        }
      });

      return messages;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des messages favoris:', error);
      throw error;
    }
  }

  // ===== STATISTIQUES =====

  async getMessageStats(conversationId) {
    try {
      const stats = this.db.get(`
        SELECT 
          COUNT(*) as total_messages,
          SUM(CASE WHEN message_type = 'text' THEN 1 ELSE 0 END) as text_messages,
          SUM(CASE WHEN message_type = 'image' THEN 1 ELSE 0 END) as image_messages,
          SUM(CASE WHEN message_type = 'video' THEN 1 ELSE 0 END) as video_messages,
          SUM(CASE WHEN message_type = 'audio' THEN 1 ELSE 0 END) as audio_messages,
          SUM(CASE WHEN message_type = 'document' THEN 1 ELSE 0 END) as document_messages,
          SUM(CASE WHEN is_edited = 1 THEN 1 ELSE 0 END) as edited_messages,
          SUM(CASE WHEN is_deleted = 1 THEN 1 ELSE 0 END) as deleted_messages,
          SUM(CASE WHEN is_pinned = 1 THEN 1 ELSE 0 END) as pinned_messages,
          SUM(CASE WHEN is_starred = 1 THEN 1 ELSE 0 END) as starred_messages,
          SUM(CASE WHEN reply_to_message_id IS NOT NULL THEN 1 ELSE 0 END) as reply_messages,
          SUM(CASE WHEN forward_from_message_id IS NOT NULL THEN 1 ELSE 0 END) as forwarded_messages
        FROM messages 
        WHERE conversation_id = ?
      `, [conversationId]);

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // ===== NETTOYAGE =====

  async cleanupDeletedMessages(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = this.db.run(`
        DELETE FROM messages 
        WHERE is_deleted = 1 AND deleted_at < ?
      `, [cutoffDate.toISOString()]);

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des messages supprimés:', error);
      throw error;
    }
  }

  async cleanupOrphanedReactions() {
    try {
      const result = this.db.run(`
        DELETE FROM message_reactions 
        WHERE message_id NOT IN (SELECT id FROM messages)
      `);

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des réactions orphelines:', error);
      throw error;
    }
  }

  async cleanupOrphanedReads() {
    try {
      const result = this.db.run(`
        DELETE FROM message_reads 
        WHERE message_id NOT IN (SELECT id FROM messages)
      `);

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des lectures orphelines:', error);
      throw error;
    }
  }
}

module.exports = new MessageDatabaseService();
