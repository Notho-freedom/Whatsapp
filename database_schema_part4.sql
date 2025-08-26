-- =====================================================
-- SCHEMA SQL ULTRA-DÉTAILLÉ - APPLICATION WHATSAPP
-- PARTIE 4: PARAMÈTRES, SÉCURITÉ ET SYSTÈMES AVANCÉS
-- =====================================================

-- =====================================================
-- 8. SYSTÈME DE PARAMÈTRES ET PRÉFÉRENCES
-- =====================================================

-- Table des paramètres utilisateur
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    setting_category ENUM('interface', 'chat', 'notifications', 'privacy', 'security', 'storage', 'performance', 'accessibility') NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, setting_category, setting_key)
);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_user_settings_category ON user_settings(setting_category);
CREATE INDEX idx_user_settings_key ON user_settings(setting_key);

-- Table des thèmes personnalisés
CREATE TABLE user_themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    theme_data JSON NOT NULL, -- Configuration du thème
    is_active BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE, -- Thème système
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_themes_user_id ON user_themes(user_id);
CREATE INDEX idx_user_themes_active ON user_themes(is_active);
CREATE INDEX idx_user_themes_system ON user_themes(is_system);

-- Table des raccourcis clavier
CREATE TABLE keyboard_shortcuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    shortcut_name VARCHAR(100) NOT NULL,
    key_combination VARCHAR(50) NOT NULL,
    action_description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, shortcut_name)
);

CREATE INDEX idx_keyboard_shortcuts_user_id ON keyboard_shortcuts(user_id);
CREATE INDEX idx_keyboard_shortcuts_enabled ON keyboard_shortcuts(is_enabled);

-- =====================================================
-- 9. SYSTÈME DE SÉCURITÉ ET CHIFFREMENT
-- =====================================================

-- Table des clés de chiffrement
CREATE TABLE encryption_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key_type ENUM('message', 'media', 'backup') NOT NULL,
    key_data TEXT NOT NULL, -- Clé chiffrée
    key_iv VARCHAR(255) NOT NULL, -- Vecteur d'initialisation
    algorithm VARCHAR(50) DEFAULT 'AES-256-GCM',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_encryption_keys_user_id ON encryption_keys(user_id);
CREATE INDEX idx_encryption_keys_type ON encryption_keys(key_type);
CREATE INDEX idx_encryption_keys_active ON encryption_keys(is_active);
CREATE INDEX idx_encryption_keys_expires_at ON encryption_keys(expires_at);

-- Table de l'authentification à deux facteurs
CREATE TABLE two_factor_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    secret_key VARCHAR(255) NOT NULL,
    backup_codes JSON, -- Codes de sauvegarde
    is_enabled BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id)
);

CREATE INDEX idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX idx_two_factor_auth_enabled ON two_factor_auth(is_enabled);

-- Table des tentatives de connexion échouées
CREATE TABLE failed_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    attempt_reason VARCHAR(100),
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_failed_login_attempts_user_id ON failed_login_attempts(user_id);
CREATE INDEX idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX idx_failed_login_attempts_blocked_until ON failed_login_attempts(blocked_until);

-- =====================================================
-- 10. SYSTÈME DE SAUVEGARDE ET SYNCHRONISATION
-- =====================================================

-- Table des sauvegardes
CREATE TABLE backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    backup_type ENUM('full', 'messages', 'media', 'settings', 'contacts') NOT NULL,
    backup_name VARCHAR(255) NOT NULL,
    backup_size INTEGER NOT NULL, -- Taille en bytes
    backup_path VARCHAR(500) NOT NULL,
    backup_url VARCHAR(500),
    encryption_key_id INTEGER,
    compression_type VARCHAR(20),
    checksum VARCHAR(64), -- Hash de vérification
    is_encrypted BOOLEAN DEFAULT TRUE,
    is_compressed BOOLEAN DEFAULT TRUE,
    backup_status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (encryption_key_id) REFERENCES encryption_keys(id) ON DELETE SET NULL
);

CREATE INDEX idx_backups_user_id ON backups(user_id);
CREATE INDEX idx_backups_type ON backups(backup_type);
CREATE INDEX idx_backups_status ON backups(backup_status);
CREATE INDEX idx_backups_created_at ON backups(created_at);

-- Table de synchronisation
CREATE TABLE sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    sync_type ENUM('contacts', 'messages', 'media', 'settings', 'full') NOT NULL,
    sync_status ENUM('pending', 'in_progress', 'completed', 'failed', 'partial') NOT NULL,
    items_synced INTEGER DEFAULT 0,
    items_total INTEGER DEFAULT 0,
    sync_direction ENUM('upload', 'download', 'bidirectional') NOT NULL,
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_sync_at TIMESTAMP NULL,
    error_message TEXT,
    sync_metadata JSON,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sync_log_user_id ON sync_log(user_id);
CREATE INDEX idx_sync_log_type ON sync_log(sync_type);
CREATE INDEX idx_sync_log_status ON sync_log(sync_status);
CREATE INDEX idx_sync_log_last_sync ON sync_log(last_sync_at);

-- =====================================================
-- 11. SYSTÈME DE JOURNALISATION ET AUDIT
-- =====================================================

-- Table des logs d'activité
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    metadata JSON,
    severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_severity ON activity_logs(severity);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Table des erreurs système
CREATE TABLE system_errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    user_id INTEGER,
    request_data JSON,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP NULL,
    resolved_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_system_errors_error_type ON system_errors(error_type);
CREATE INDEX idx_system_errors_user_id ON system_errors(user_id);
CREATE INDEX idx_system_errors_severity ON system_errors(severity);
CREATE INDEX idx_system_errors_resolved ON system_errors(is_resolved);
CREATE INDEX idx_system_errors_created_at ON system_errors(created_at);

-- =====================================================
-- 12. SYSTÈME DE PERFORMANCE ET MÉTRIQUES
-- =====================================================

-- Table des métriques de performance
CREATE TABLE performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit VARCHAR(20),
    context JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);

-- Table de l'utilisation des ressources
CREATE TABLE resource_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    resource_type ENUM('storage', 'memory', 'bandwidth', 'cpu') NOT NULL,
    usage_amount REAL NOT NULL,
    usage_unit VARCHAR(20) NOT NULL,
    usage_period VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_resource_usage_user_id ON resource_usage(user_id);
CREATE INDEX idx_resource_usage_type ON resource_usage(resource_type);
CREATE INDEX idx_resource_usage_period ON resource_usage(usage_period);
CREATE INDEX idx_resource_usage_recorded_at ON resource_usage(recorded_at);

-- =====================================================
-- 13. SYSTÈME DE GESTION DES VERSIONS ET MIGRATIONS
-- =====================================================

-- Table des versions de base de données
CREATE TABLE database_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_number VARCHAR(20) NOT NULL,
    version_name VARCHAR(100),
    migration_script TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(100) DEFAULT 'system',
    rollback_script TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_database_versions_version ON database_versions(version_number);
CREATE INDEX idx_database_versions_applied_at ON database_versions(applied_at);
CREATE INDEX idx_database_versions_active ON database_versions(is_active);

-- =====================================================
-- 14. VUES ET INDEX OPTIMISÉS
-- =====================================================

-- Vue des conversations avec le dernier message
CREATE VIEW conversation_summary AS
SELECT 
    c.id,
    c.type,
    c.name,
    c.avatar_url,
    c.created_at,
    c.last_activity_at,
    c.is_archived,
    c.is_muted,
    COUNT(DISTINCT cp.user_id) as participant_count,
    m.content as last_message_content,
    m.created_at as last_message_time,
    u.display_name as last_message_sender
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.is_active = 1
LEFT JOIN messages m ON m.id = (
    SELECT id FROM messages 
    WHERE conversation_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
)
LEFT JOIN users u ON m.sender_id = u.id
GROUP BY c.id;

-- Vue des statistiques utilisateur
CREATE VIEW user_statistics AS
SELECT 
    u.id,
    u.display_name,
    u.created_at,
    COUNT(DISTINCT c.id) as total_conversations,
    COUNT(DISTINCT m.id) as total_messages,
    COUNT(DISTINCT s.id) as total_statuses,
    COUNT(DISTINCT cl.id) as total_calls,
    SUM(cl.duration_seconds) as total_call_duration,
    COUNT(DISTINCT cont.id) as total_contacts,
    u.last_seen
FROM users u
LEFT JOIN conversation_participants cp ON u.id = cp.user_id AND cp.is_active = 1
LEFT JOIN conversations c ON cp.conversation_id = c.id
LEFT JOIN messages m ON u.id = m.sender_id
LEFT JOIN statuses s ON u.id = s.user_id AND s.is_active = 1
LEFT JOIN call_participants clp ON u.id = clp.user_id
LEFT JOIN calls cl ON clp.call_id = cl.id
LEFT JOIN contacts cont ON u.id = cont.user_id
GROUP BY u.id;

-- =====================================================
-- 15. TRIGGERS POUR MAINTENANCE AUTOMATIQUE
-- =====================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger pour nettoyer les sessions expirées
CREATE TRIGGER cleanup_expired_sessions
    AFTER INSERT ON auth_sessions
    FOR EACH ROW
    BEGIN
        DELETE FROM auth_sessions 
        WHERE expires_at < CURRENT_TIMESTAMP AND is_valid = 1;
    END;

-- Trigger pour mettre à jour last_activity_at des conversations
CREATE TRIGGER update_conversation_activity
    AFTER INSERT ON messages
    FOR EACH ROW
    BEGIN
        UPDATE conversations 
        SET last_activity_at = CURRENT_TIMESTAMP 
        WHERE id = NEW.conversation_id;
    END;

-- Trigger pour nettoyer les statuts expirés
CREATE TRIGGER cleanup_expired_statuses
    AFTER INSERT ON statuses
    FOR EACH ROW
    BEGIN
        UPDATE statuses 
        SET is_active = 0 
        WHERE expires_at < CURRENT_TIMESTAMP AND is_active = 1;
    END;

-- =====================================================
-- 16. DONNÉES INITIALES
-- =====================================================

-- Insertion des paramètres par défaut
INSERT INTO user_settings (user_id, setting_category, setting_key, setting_value) VALUES
(1, 'interface', 'theme', '"light"'),
(1, 'interface', 'language', '"fr"'),
(1, 'interface', 'fontSize', '"medium"'),
(1, 'notifications', 'enabled', 'true'),
(1, 'notifications', 'sound', 'true'),
(1, 'privacy', 'lastSeen', '"everyone"'),
(1, 'chat', 'enterToSend', 'true');

-- Insertion des thèmes système
INSERT INTO user_themes (user_id, theme_name, theme_data, is_system) VALUES
(1, 'Light', '{"primary": "#00a884", "background": "#ffffff", "text": "#000000"}', 1),
(1, 'Dark', '{"primary": "#00a884", "background": "#121212", "text": "#ffffff"}', 1);

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================
