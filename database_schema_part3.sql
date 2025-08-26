-- =====================================================
-- SCHEMA SQL ULTRA-DÉTAILLÉ - APPLICATION WHATSAPP
-- PARTIE 3: APPELS, NOTIFICATIONS ET MÉDIAS
-- =====================================================

-- =====================================================
-- 5. SYSTÈME D'APPELS AUDIO/VIDÉO
-- =====================================================

-- Table des appels
CREATE TABLE calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_type ENUM('audio', 'video') NOT NULL,
    initiator_id INTEGER NOT NULL,
    conversation_id INTEGER NOT NULL,
    call_status ENUM('initiating', 'ringing', 'answered', 'ended', 'missed', 'rejected', 'busy') NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration_seconds INTEGER DEFAULT 0,
    is_recorded BOOLEAN DEFAULT FALSE,
    recording_url VARCHAR(500),
    call_quality_metrics JSON, -- Métriques de qualité (latence, perte de paquets, etc.)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (initiator_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_calls_initiator_id ON calls(initiator_id);
CREATE INDEX idx_calls_conversation_id ON calls(conversation_id);
CREATE INDEX idx_calls_status ON calls(call_status);
CREATE INDEX idx_calls_start_time ON calls(start_time);
CREATE INDEX idx_calls_type ON calls(call_type);

-- Table des participants aux appels
CREATE TABLE call_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    join_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    leave_time TIMESTAMP NULL,
    connection_quality JSON, -- Qualité de connexion individuelle
    is_muted BOOLEAN DEFAULT FALSE,
    is_video_enabled BOOLEAN DEFAULT TRUE,
    device_info JSON, -- Informations sur l'appareil
    
    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(call_id, user_id)
);

CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX idx_call_participants_user_id ON call_participants(user_id);
CREATE INDEX idx_call_participants_join_time ON call_participants(join_time);

-- Table de l'historique des appels
CREATE TABLE call_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    call_id INTEGER NOT NULL,
    contact_id INTEGER, -- Contact avec qui l'appel a été fait
    call_type ENUM('audio', 'video') NOT NULL,
    call_direction ENUM('incoming', 'outgoing', 'missed') NOT NULL,
    call_status ENUM('completed', 'missed', 'rejected', 'busy') NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    call_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (call_id) REFERENCES calls(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE INDEX idx_call_history_user_id ON call_history(user_id);
CREATE INDEX idx_call_history_call_id ON call_history(call_id);
CREATE INDEX idx_call_history_contact_id ON call_history(contact_id);
CREATE INDEX idx_call_history_date ON call_history(call_date);
CREATE INDEX idx_call_history_direction ON call_history(call_direction);

-- =====================================================
-- 6. SYSTÈME DE NOTIFICATIONS
-- =====================================================

-- Table des notifications
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notification_type ENUM('message', 'call', 'status', 'system', 'media', 'group') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    icon_url VARCHAR(500),
    action_url VARCHAR(500), -- URL ou action à effectuer
    metadata JSON, -- Données supplémentaires
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    category VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    dismissed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Table des paramètres de notification
CREATE TABLE notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    setting_type ENUM('global', 'conversation', 'contact', 'category') NOT NULL,
    target_id INTEGER, -- ID de la conversation, contact ou catégorie
    setting_name VARCHAR(100) NOT NULL,
    setting_value JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, setting_type, target_id, setting_name)
);

CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_notification_settings_type ON notification_settings(setting_type);
CREATE INDEX idx_notification_settings_target ON notification_settings(target_id);

-- Table des heures silencieuses
CREATE TABLE quiet_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT FALSE,
    start_time TIME DEFAULT '22:00:00',
    end_time TIME DEFAULT '08:00:00',
    days_of_week JSON, -- Jours de la semaine [1,2,3,4,5,6,7]
    exceptions JSON, -- Contacts ou conversations en exception
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id)
);

CREATE INDEX idx_quiet_hours_user_id ON quiet_hours(user_id);
CREATE INDEX idx_quiet_hours_enabled ON quiet_hours(is_enabled);

-- =====================================================
-- 7. SYSTÈME DE MÉDIAS ET FICHIERS
-- =====================================================

-- Table des médias
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Propriétaire du média
    conversation_id INTEGER, -- Conversation d'origine
    message_id INTEGER, -- Message d'origine
    media_type ENUM('image', 'video', 'audio', 'document', 'sticker', 'gif') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    file_size INTEGER NOT NULL, -- Taille en bytes
    mime_type VARCHAR(100) NOT NULL,
    duration_seconds INTEGER, -- Pour audio/vidéo
    width INTEGER, -- Pour images/vidéos
    height INTEGER, -- Pour images/vidéos
    thumbnail_url VARCHAR(500),
    compression_quality VARCHAR(20), -- Qualité de compression
    encryption_data JSON, -- Données de chiffrement
    metadata JSON, -- Métadonnées supplémentaires
    is_downloaded BOOLEAN DEFAULT FALSE,
    is_cached BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_conversation_id ON media(conversation_id);
CREATE INDEX idx_media_message_id ON media(message_id);
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_created_at ON media(created_at);
CREATE INDEX idx_media_file_size ON media(file_size);

-- Table du cache des médias
CREATE TABLE media_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER NOT NULL,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data BLOB, -- Données en cache
    cache_size INTEGER NOT NULL,
    cache_type ENUM('thumbnail', 'preview', 'full') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX idx_media_cache_media_id ON media_cache(media_id);
CREATE INDEX idx_media_cache_key ON media_cache(cache_key);
CREATE INDEX idx_media_cache_expires_at ON media_cache(expires_at);
CREATE INDEX idx_media_cache_type ON media_cache(cache_type);

-- Table des téléchargements de médias
CREATE TABLE media_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    media_id INTEGER NOT NULL,
    download_status ENUM('pending', 'downloading', 'completed', 'failed', 'cancelled') NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    download_path VARCHAR(500),
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE
);

CREATE INDEX idx_media_downloads_user_id ON media_downloads(user_id);
CREATE INDEX idx_media_downloads_media_id ON media_downloads(media_id);
CREATE INDEX idx_media_downloads_status ON media_downloads(download_status);
CREATE INDEX idx_media_downloads_started_at ON media_downloads(started_at);
