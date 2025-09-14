-- =====================================================
-- SCHEMA SQL ULTRA-DÉTAILLÉ - APPLICATION WHATSAPP
-- =====================================================
-- Ce schéma couvre tous les systèmes et services de l'application
-- Version: 1.0.0
-- Date: 2024-12-19
-- =====================================================

-- =====================================================
-- 1. SYSTÈME D'AUTHENTIFICATION ET UTILISATEURS
-- =====================================================

-- Table des utilisateurs principaux
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150),
    profile_photo_url VARCHAR(500),
    status_message TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    country_code VARCHAR(3),
    language_code VARCHAR(5) DEFAULT 'fr',
    timezone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    -- Index pour les performances
    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_username (username),
    INDEX idx_users_online_status (is_online, last_seen),
    INDEX idx_users_created_at (created_at)
);

-- Table des sessions d'authentification
CREATE TABLE auth_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    access_token VARCHAR(500) NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    token_type VARCHAR(20) DEFAULT 'Bearer',
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    is_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_auth_sessions_user_id (user_id),
    INDEX idx_auth_sessions_access_token (access_token),
    INDEX idx_auth_sessions_refresh_token (refresh_token),
    INDEX idx_auth_sessions_expires_at (expires_at),
    INDEX idx_auth_sessions_valid (is_valid)
);

-- Table des tentatives de connexion
CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_login_attempts_email (email),
    INDEX idx_login_attempts_ip (ip_address),
    INDEX idx_login_attempts_attempted_at (attempted_at)
);

-- Table de l'authentification Google
CREATE TABLE google_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    google_id VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    access_token VARCHAR(500),
    refresh_token VARCHAR(500),
    token_expires_at TIMESTAMP,
    profile_data JSON,
    is_linked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_google_auth_user_id (user_id),
    INDEX idx_google_auth_google_id (google_id),
    INDEX idx_google_auth_email (email)
);

-- Table de récupération de mot de passe
CREATE TABLE password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_password_resets_user_id (user_id),
    INDEX idx_password_resets_token (token),
    INDEX idx_password_resets_expires_at (expires_at)
);

-- =====================================================
-- 2. SYSTÈME DE CONTACTS ET RELATIONS
-- =====================================================

-- Table des contacts
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Propriétaire du contact
    contact_user_id INTEGER, -- Si le contact est un utilisateur de l'app
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(255),
    profile_photo_url VARCHAR(500),
    company VARCHAR(100),
    job_title VARCHAR(100),
    address TEXT,
    birthday DATE,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    labels JSON, -- Array de labels
    custom_fields JSON, -- Champs personnalisés
    sync_source ENUM('manual', 'google', 'apple', 'outlook'),
    sync_id VARCHAR(255), -- ID externe pour la synchronisation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_contacts_user_id (user_id),
    INDEX idx_contacts_contact_user_id (contact_user_id),
    INDEX idx_contacts_phone (phone),
    INDEX idx_contacts_email (email),
    INDEX idx_contacts_favorite (is_favorite),
    INDEX idx_contacts_blocked (is_blocked),
    INDEX idx_contacts_sync_source (sync_source)
);

-- Table des groupes de contacts
CREATE TABLE contact_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Code couleur hex
    is_system BOOLEAN DEFAULT FALSE, -- Groupes système (Favoris, Famille, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_contact_groups_user_id (user_id),
    INDEX idx_contact_groups_name (name)
);

-- Table de liaison contacts-groupes
CREATE TABLE contact_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES contact_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    
    UNIQUE(group_id, contact_id),
    INDEX idx_contact_group_members_group_id (group_id),
    INDEX idx_contact_group_members_contact_id (contact_id)
);

-- =====================================================
-- 3. SYSTÈME DE CONVERSATIONS ET MESSAGES
-- =====================================================

-- Table des conversations
CREATE TABLE conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type ENUM('individual', 'group', 'broadcast') NOT NULL,
    name VARCHAR(255), -- Pour les groupes
    description TEXT, -- Pour les groupes
    avatar_url VARCHAR(500),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    theme VARCHAR(50) DEFAULT 'default',
    custom_settings JSON,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_conversations_type (type),
    INDEX idx_conversations_created_by (created_by),
    INDEX idx_conversations_last_activity (last_activity_at),
    INDEX idx_conversations_archived (is_archived)
);

-- Table des participants aux conversations
CREATE TABLE conversation_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role ENUM('admin', 'member', 'readonly') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    custom_name VARCHAR(100), -- Nom personnalisé dans cette conversation
    notification_settings JSON, -- Paramètres de notification spécifiques
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(conversation_id, user_id),
    INDEX idx_conversation_participants_conversation_id (conversation_id),
    INDEX idx_conversation_participants_user_id (user_id),
    INDEX idx_conversation_participants_active (is_active)
);

-- Table des messages
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message_type ENUM('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker', 'system') NOT NULL,
    content TEXT, -- Contenu texte ou description
    media_url VARCHAR(500), -- URL du média
    media_metadata JSON, -- Métadonnées du média (taille, durée, etc.)
    reply_to_message_id INTEGER, -- Message auquel on répond
    forward_from_message_id INTEGER, -- Message original si forwardé
    forward_from_conversation_id INTEGER, -- Conversation originale si forwardé
    status ENUM('sending', 'sent', 'delivered', 'read', 'failed') DEFAULT 'sending',
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by INTEGER, -- Qui a supprimé le message
    encryption_data JSON, -- Données de chiffrement si applicable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    FOREIGN KEY (forward_from_message_id) REFERENCES messages(id) ON DELETE SET NULL,
    FOREIGN KEY (forward_from_conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_messages_conversation_id (conversation_id),
    INDEX idx_messages_sender_id (sender_id),
    INDEX idx_messages_type (message_type),
    INDEX idx_messages_status (status),
    INDEX idx_messages_created_at (created_at),
    INDEX idx_messages_reply_to (reply_to_message_id),
    INDEX idx_messages_forward_from (forward_from_message_id)
);

-- Table des réactions aux messages
CREATE TABLE message_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction_type VARCHAR(10) NOT NULL, -- Emoji ou type de réaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(message_id, user_id, reaction_type),
    INDEX idx_message_reactions_message_id (message_id),
    INDEX idx_message_reactions_user_id (user_id),
    INDEX idx_message_reactions_type (reaction_type)
);

-- Table des messages épinglés
CREATE TABLE pinned_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    message_id INTEGER NOT NULL,
    pinned_by INTEGER NOT NULL,
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (pinned_by) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(conversation_id, message_id),
    INDEX idx_pinned_messages_conversation_id (conversation_id),
    INDEX idx_pinned_messages_message_id (message_id)
);

-- Table des conversations épinglées
CREATE TABLE pinned_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    conversation_id INTEGER NOT NULL,
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER DEFAULT 0, -- Ordre d'affichage
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, conversation_id),
    INDEX idx_pinned_conversations_user_id (user_id),
    INDEX idx_pinned_conversations_conversation_id (conversation_id),
    INDEX idx_pinned_conversations_position (position)
);

-- Table des statuts de lecture
CREATE TABLE message_read_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(message_id, user_id),
    INDEX idx_message_read_status_message_id (message_id),
    INDEX idx_message_read_status_user_id (user_id),
    INDEX idx_message_read_status_read_at (read_at)
);

-- =====================================================
-- 4. SYSTÈME DE STATUTS (STORIES)
-- =====================================================

-- Table des statuts
CREATE TABLE statuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    status_type ENUM('text', 'image', 'video', 'audio') NOT NULL,
    content TEXT, -- Contenu texte ou description
    media_url VARCHAR(500), -- URL du média
    media_metadata JSON, -- Métadonnées du média
    background_color VARCHAR(7), -- Couleur de fond pour les statuts texte
    font_style VARCHAR(50), -- Style de police
    privacy ENUM('public', 'contacts', 'selected_contacts', 'exclude_contacts') DEFAULT 'contacts',
    expires_at TIMESTAMP NOT NULL, -- Expiration automatique (24h par défaut)
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_statuses_user_id (user_id),
    INDEX idx_statuses_type (status_type),
    INDEX idx_statuses_expires_at (expires_at),
    INDEX idx_statuses_active (is_active),
    INDEX idx_statuses_created_at (created_at)
);

-- Table des vues de statuts
CREATE TABLE status_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_id INTEGER NOT NULL,
    viewer_id INTEGER NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reaction VARCHAR(10), -- Réaction au statut (emoji)
    
    FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(status_id, viewer_id),
    INDEX idx_status_views_status_id (status_id),
    INDEX idx_status_views_viewer_id (viewer_id),
    INDEX idx_status_views_viewed_at (viewed_at)
);

-- Table des paramètres de confidentialité des statuts
CREATE TABLE status_privacy_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    setting_type ENUM('default_privacy', 'excluded_contacts', 'selected_contacts') NOT NULL,
    setting_value JSON, -- Valeur du paramètre (contacts exclus, sélectionnés, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, setting_type),
    INDEX idx_status_privacy_settings_user_id (user_id),
    INDEX idx_status_privacy_settings_type (setting_type)
);

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
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    
    INDEX idx_calls_initiator_id (initiator_id),
    INDEX idx_calls_conversation_id (conversation_id),
    INDEX idx_calls_status (call_status),
    INDEX idx_calls_start_time (start_time),
    INDEX idx_calls_type (call_type)
);

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
    
    UNIQUE(call_id, user_id),
    INDEX idx_call_participants_call_id (call_id),
    INDEX idx_call_participants_user_id (user_id),
    INDEX idx_call_participants_join_time (join_time)
);

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
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
    
    INDEX idx_call_history_user_id (user_id),
    INDEX idx_call_history_call_id (call_id),
    INDEX idx_call_history_contact_id (contact_id),
    INDEX idx_call_history_date (call_date),
    INDEX idx_call_history_direction (call_direction)
);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_type (notification_type),
    INDEX idx_notifications_read (is_read),
    INDEX idx_notifications_priority (priority),
    INDEX idx_notifications_created_at (created_at),
    INDEX idx_notifications_expires_at (expires_at)
);

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
    
    UNIQUE(user_id, setting_type, target_id, setting_name),
    INDEX idx_notification_settings_user_id (user_id),
    INDEX idx_notification_settings_type (setting_type),
    INDEX idx_notification_settings_target (target_id)
);

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
    
    UNIQUE(user_id),
    INDEX idx_quiet_hours_user_id (user_id),
    INDEX idx_quiet_hours_enabled (is_enabled)
);

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
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
    
    INDEX idx_media_user_id (user_id),
    INDEX idx_media_conversation_id (conversation_id),
    INDEX idx_media_message_id (message_id),
    INDEX idx_media_type (media_type),
    INDEX idx_media_created_at (created_at),
    INDEX idx_media_file_size (file_size)
);

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
    
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    
    INDEX idx_media_cache_media_id (media_id),
    INDEX idx_media_cache_key (cache_key),
    INDEX idx_media_cache_expires_at (expires_at),
    INDEX idx_media_cache_type (cache_type)
);

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
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    
    INDEX idx_media_downloads_user_id (user_id),
    INDEX idx_media_downloads_media_id (media_id),
    INDEX idx_media_downloads_status (download_status),
    INDEX idx_media_downloads_started_at (started_at)
);

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
    
    UNIQUE(user_id, setting_category, setting_key),
    INDEX idx_user_settings_user_id (user_id),
    INDEX idx_user_settings_category (setting_category),
    INDEX idx_user_settings_key (setting_key)
);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user_themes_user_id (user_id),
    INDEX idx_user_themes_active (is_active),
    INDEX idx_user_themes_system (is_system)
);

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
    
    UNIQUE(user_id, shortcut_name),
    INDEX idx_keyboard_shortcuts_user_id (user_id),
    INDEX idx_keyboard_shortcuts_enabled (is_enabled)
);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_encryption_keys_user_id (user_id),
    INDEX idx_encryption_keys_type (key_type),
    INDEX idx_encryption_keys_active (is_active),
    INDEX idx_encryption_keys_expires_at (expires_at)
);

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
    
    UNIQUE(user_id),
    INDEX idx_two_factor_auth_user_id (user_id),
    INDEX idx_two_factor_auth_enabled (is_enabled)
);

-- Table des tentatives de connexion échouées
CREATE TABLE failed_login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email VARCHAR(255),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    attempt_reason VARCHAR(100),
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_failed_login_attempts_user_id (user_id),
    INDEX idx_failed_login_attempts_email (email),
    INDEX idx_failed_login_attempts_ip (ip_address),
    INDEX idx_failed_login_attempts_blocked_until (blocked_until)
);

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
    FOREIGN KEY (encryption_key_id) REFERENCES encryption_keys(id) ON DELETE SET NULL,
    
    INDEX idx_backups_user_id (user_id),
    INDEX idx_backups_type (backup_type),
    INDEX idx_backups_status (backup_status),
    INDEX idx_backups_created_at (created_at)
);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_sync_log_user_id (user_id),
    INDEX idx_sync_log_type (sync_type),
    INDEX idx_sync_log_status (sync_status),
    INDEX idx_sync_log_last_sync (last_sync_at)
);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_action_type (action_type),
    INDEX idx_activity_logs_severity (severity),
    INDEX idx_activity_logs_created_at (created_at)
);

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
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_system_errors_error_type (error_type),
    INDEX idx_system_errors_user_id (user_id),
    INDEX idx_system_errors_severity (severity),
    INDEX idx_system_errors_resolved (is_resolved),
    INDEX idx_system_errors_created_at (created_at)
);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_performance_metrics_user_id (user_id),
    INDEX idx_performance_metrics_type (metric_type),
    INDEX idx_performance_metrics_name (metric_name),
    INDEX idx_performance_metrics_recorded_at (recorded_at)
);

-- Table de l'utilisation des ressources
CREATE TABLE resource_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    resource_type ENUM('storage', 'memory', 'bandwidth', 'cpu') NOT NULL,
    usage_amount REAL NOT NULL,
    usage_unit VARCHAR(20) NOT NULL,
    usage_period VARCHAR(20) DEFAULT 'daily', -- daily, weekly, monthly
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_resource_usage_user_id (user_id),
    INDEX idx_resource_usage_type (resource_type),
    INDEX idx_resource_usage_period (usage_period),
    INDEX idx_resource_usage_recorded_at (recorded_at)
);

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
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_database_versions_version (version_number),
    INDEX idx_database_versions_applied_at (applied_at),
    INDEX idx_database_versions_active (is_active)
);

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
