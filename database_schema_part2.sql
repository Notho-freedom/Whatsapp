-- =====================================================
-- SCHEMA SQL ULTRA-DÉTAILLÉ - APPLICATION WHATSAPP
-- PARTIE 2: CONVERSATIONS ET MESSAGES
-- =====================================================

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
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_last_activity ON conversations(last_activity_at);
CREATE INDEX idx_conversations_archived ON conversations(is_archived);

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
    
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_active ON conversation_participants(is_active);

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
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_type ON messages(message_type);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_reply_to ON messages(reply_to_message_id);
CREATE INDEX idx_messages_forward_from ON messages(forward_from_message_id);

-- Table des réactions aux messages
CREATE TABLE message_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction_type VARCHAR(10) NOT NULL, -- Emoji ou type de réaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(message_id, user_id, reaction_type)
);

CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX idx_message_reactions_type ON message_reactions(reaction_type);

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
    
    UNIQUE(conversation_id, message_id)
);

CREATE INDEX idx_pinned_messages_conversation_id ON pinned_messages(conversation_id);
CREATE INDEX idx_pinned_messages_message_id ON pinned_messages(message_id);

-- Table des conversations épinglées
CREATE TABLE pinned_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    conversation_id INTEGER NOT NULL,
    pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INTEGER DEFAULT 0, -- Ordre d'affichage
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, conversation_id)
);

CREATE INDEX idx_pinned_conversations_user_id ON pinned_conversations(user_id);
CREATE INDEX idx_pinned_conversations_conversation_id ON pinned_conversations(conversation_id);
CREATE INDEX idx_pinned_conversations_position ON pinned_conversations(position);

-- Table des statuts de lecture
CREATE TABLE message_read_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);
CREATE INDEX idx_message_read_status_read_at ON message_read_status(read_at);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_statuses_user_id ON statuses(user_id);
CREATE INDEX idx_statuses_type ON statuses(status_type);
CREATE INDEX idx_statuses_expires_at ON statuses(expires_at);
CREATE INDEX idx_statuses_active ON statuses(is_active);
CREATE INDEX idx_statuses_created_at ON statuses(created_at);

-- Table des vues de statuts
CREATE TABLE status_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status_id INTEGER NOT NULL,
    viewer_id INTEGER NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reaction VARCHAR(10), -- Réaction au statut (emoji)
    
    FOREIGN KEY (status_id) REFERENCES statuses(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(status_id, viewer_id)
);

CREATE INDEX idx_status_views_status_id ON status_views(status_id);
CREATE INDEX idx_status_views_viewer_id ON status_views(viewer_id);
CREATE INDEX idx_status_views_viewed_at ON status_views(viewed_at);

-- Table des paramètres de confidentialité des statuts
CREATE TABLE status_privacy_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    setting_type ENUM('default_privacy', 'excluded_contacts', 'selected_contacts') NOT NULL,
    setting_value JSON, -- Valeur du paramètre (contacts exclus, sélectionnés, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE(user_id, setting_type)
);

CREATE INDEX idx_status_privacy_settings_user_id ON status_privacy_settings(user_id);
CREATE INDEX idx_status_privacy_settings_type ON status_privacy_settings(setting_type);
