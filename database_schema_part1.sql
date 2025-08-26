-- =====================================================
-- SCHEMA SQL ULTRA-DÉTAILLÉ - APPLICATION WHATSAPP
-- PARTIE 1: AUTHENTIFICATION ET UTILISATEURS
-- =====================================================
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
    deleted_at TIMESTAMP NULL
);

-- Index pour les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_online_status ON users(is_online, last_seen);
CREATE INDEX idx_users_created_at ON users(created_at);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_access_token ON auth_sessions(access_token);
CREATE INDEX idx_auth_sessions_refresh_token ON auth_sessions(refresh_token);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX idx_auth_sessions_valid ON auth_sessions(is_valid);

-- Table des tentatives de connexion
CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(100),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_google_auth_user_id ON google_auth(user_id);
CREATE INDEX idx_google_auth_google_id ON google_auth(google_id);
CREATE INDEX idx_google_auth_email ON google_auth(email);

-- Table de récupération de mot de passe
CREATE TABLE password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_password_resets_expires_at ON password_resets(expires_at);

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
    FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_contact_user_id ON contacts(contact_user_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_favorite ON contacts(is_favorite);
CREATE INDEX idx_contacts_blocked ON contacts(is_blocked);
CREATE INDEX idx_contacts_sync_source ON contacts(sync_source);

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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_contact_groups_user_id ON contact_groups(user_id);
CREATE INDEX idx_contact_groups_name ON contact_groups(name);

-- Table de liaison contacts-groupes
CREATE TABLE contact_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    contact_id INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES contact_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    
    UNIQUE(group_id, contact_id)
);

CREATE INDEX idx_contact_group_members_group_id ON contact_group_members(group_id);
CREATE INDEX idx_contact_group_members_contact_id ON contact_group_members(contact_id);
