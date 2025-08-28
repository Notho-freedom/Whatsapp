import databaseService from './databaseService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class AuthDatabaseService {
  constructor() {
    this.db = databaseService;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  }

  // ===== GESTION DES UTILISATEURS =====

  async createUser(userData) {
    try {
      const {
        username,
        email,
        password,
        phone,
        first_name,
        last_name,
        profile_photo_url,
        status_message,
        is_online = false,
        last_seen = new Date().toISOString(),
        created_at = new Date().toISOString(),
        updated_at = new Date().toISOString()
      } = userData;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = this.db.get(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUser) {
        throw new Error('Un utilisateur avec cet email ou nom d\'utilisateur existe déjà');
      }

      // Générer un salt et hasher le mot de passe
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insérer le nouvel utilisateur
      const result = this.db.run(`
        INSERT INTO users (
          username, email, password_hash, salt, phone, first_name, last_name,
          profile_photo_url, status_message, is_online, last_seen, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        username, email, hashedPassword, salt, phone, first_name, last_name,
        profile_photo_url, status_message, is_online, last_seen, created_at, updated_at
      ]);

      // Récupérer l'utilisateur créé
      const newUser = this.db.get('SELECT * FROM users WHERE id = ?', [result.lastInsertRowid]);
      
      // Retourner l'utilisateur sans le mot de passe
      const { password_hash, ...userWithoutPassword } = newUser;
      return userWithoutPassword;

    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = this.db.get('SELECT * FROM users WHERE id = ?', [userId]);
      if (!user) return null;

      // Retourner l'utilisateur sans le mot de passe
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = this.db.get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) return null;

      // Retourner l'utilisateur sans le mot de passe
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur par email:', error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const user = this.db.get('SELECT * FROM users WHERE username = ?', [username]);
      if (!user) return null;

      // Retourner l'utilisateur sans le mot de passe
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur par username:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const allowedFields = [
        'username', 'email', 'phone', 'first_name', 'last_name',
        'profile_photo_url', 'status_message', 'is_online', 'last_seen'
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
      values.push(userId);

      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = ? 
        WHERE id = ?
      `;

      const result = this.db.run(query, values);

      if (result.changes === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      // Récupérer l'utilisateur mis à jour
      return await this.getUserById(userId);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const result = this.db.run('DELETE FROM users WHERE id = ?', [userId]);
      
      if (result.changes === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      return { success: true, message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }

  // ===== AUTHENTIFICATION =====

  async authenticateUser(email, password) {
    try {
      // Récupérer l'utilisateur avec le mot de passe hashé
      const user = this.db.get('SELECT * FROM users WHERE email = ?', [email]);
      
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        // Enregistrer la tentative de connexion échouée
        await this.recordFailedLoginAttempt(user.id, email);
        throw new Error('Email ou mot de passe incorrect');
      }

      // Mettre à jour last_seen et is_online
      this.db.run(
        'UPDATE users SET last_seen = ?, is_online = ? WHERE id = ?',
        [new Date().toISOString(), true, user.id]
      );

      // Retourner l'utilisateur sans le mot de passe
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erreur lors de l\'authentification:', error);
      throw error;
    }
  }

  async recordFailedLoginAttempt(userId, email) {
    try {
      this.db.run(`
        INSERT INTO login_attempts (user_id, email, ip_address, user_agent, success, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, email, 'unknown', 'unknown', false, new Date().toISOString()]);
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement de la tentative de connexion échouée:', error);
    }
  }

  // ===== GESTION DES SESSIONS =====

  async createSession(userId, deviceInfo = {}) {
    try {
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

      const result = this.db.run(`
        INSERT INTO auth_sessions (
          user_id, session_token, device_info, ip_address, user_agent,
          is_active, expires_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, sessionToken, JSON.stringify(deviceInfo), 'unknown', 'unknown',
        true, expiresAt.toISOString(), new Date().toISOString(), new Date().toISOString()
      ]);

      return {
        sessionId: result.lastInsertRowid,
        sessionToken,
        expiresAt
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session:', error);
      throw error;
    }
  }

  async validateSession(sessionToken) {
    try {
      const session = this.db.get(`
        SELECT s.*, u.* 
        FROM auth_sessions s 
        JOIN users u ON s.user_id = u.id 
        WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > ?
      `, [sessionToken, new Date().toISOString()]);

      if (!session) {
        return null;
      }

      // Mettre à jour last_activity
      this.db.run(
        'UPDATE auth_sessions SET last_activity = ?, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), new Date().toISOString(), session.id]
      );

      // Retourner l'utilisateur sans le mot de passe
      const { password_hash, ...userWithoutPassword } = session;
      return userWithoutPassword;
    } catch (error) {
      console.error('❌ Erreur lors de la validation de la session:', error);
      throw error;
    }
  }

  async invalidateSession(sessionToken) {
    try {
      const result = this.db.run(
        'UPDATE auth_sessions SET is_active = 0, updated_at = ? WHERE session_token = ?',
        [new Date().toISOString(), sessionToken]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('❌ Erreur lors de l\'invalidation de la session:', error);
      throw error;
    }
  }

  async invalidateAllUserSessions(userId) {
    try {
      const result = this.db.run(
        'UPDATE auth_sessions SET is_active = 0, updated_at = ? WHERE user_id = ?',
        [new Date().toISOString(), userId]
      );

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors de l\'invalidation de toutes les sessions:', error);
      throw error;
    }
  }

  // ===== GESTION DES MOTS DE PASSE =====

  async createPasswordReset(email) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

      // Supprimer les anciens tokens de réinitialisation
      this.db.run('DELETE FROM password_resets WHERE user_id = ?', [user.id]);

      // Créer un nouveau token
      this.db.run(`
        INSERT INTO password_resets (user_id, reset_token, expires_at, created_at)
        VALUES (?, ?, ?, ?)
      `, [user.id, resetToken, expiresAt.toISOString(), new Date().toISOString()]);

      return { resetToken, expiresAt };
    } catch (error) {
      console.error('❌ Erreur lors de la création du token de réinitialisation:', error);
      throw error;
    }
  }

  async validatePasswordReset(resetToken) {
    try {
      const reset = this.db.get(`
        SELECT * FROM password_resets 
        WHERE reset_token = ? AND expires_at > ? AND used = 0
      `, [resetToken, new Date().toISOString()]);

      return reset;
    } catch (error) {
      console.error('❌ Erreur lors de la validation du token de réinitialisation:', error);
      throw error;
    }
  }

  async resetPassword(resetToken, newPassword) {
    try {
      const reset = await this.validatePasswordReset(resetToken);
      if (!reset) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Mettre à jour le mot de passe
      this.db.run(
        'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
        [hashedPassword, new Date().toISOString(), reset.user_id]
      );

      // Marquer le token comme utilisé
      this.db.run(
        'UPDATE password_resets SET used = 1, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), reset.id]
      );

      // Invalider toutes les sessions de l'utilisateur
      await this.invalidateAllUserSessions(reset.user_id);

      return { success: true, message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  }

  // ===== UTILITAIRES =====

  async generateJWT(user) {
    try {
      const payload = {
        userId: user.id,
        email: user.email,
        username: user.username
      };

      return jwt.sign(payload, this.jwtSecret, { expiresIn: '30d' });
    } catch (error) {
      console.error('❌ Erreur lors de la génération du JWT:', error);
      throw error;
    }
  }

  async verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du JWT:', error);
      throw error;
    }
  }

  // ===== NETTOYAGE =====

  async cleanupExpiredSessions() {
    try {
      const result = this.db.run(
        'UPDATE auth_sessions SET is_active = 0 WHERE expires_at < ?',
        [new Date().toISOString()]
      );

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des sessions expirées:', error);
      throw error;
    }
  }

  async cleanupExpiredPasswordResets() {
    try {
      const result = this.db.run(
        'DELETE FROM password_resets WHERE expires_at < ?',
        [new Date().toISOString()]
      );

      return result.changes;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des tokens de réinitialisation expirés:', error);
      throw error;
    }
  }
}

export default new AuthDatabaseService();
