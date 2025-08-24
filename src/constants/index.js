// Constantes de l'application WhatsApp

// Types de messages
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  SYSTEM: 'system'
};

// Statuts des messages
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

// Types de notifications
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  CALL: 'call',
  STATUS: 'status',
  CONTACT: 'contact'
};

// Configuration des appels
export const CALL_CONFIG = {
  RING_TIMEOUT: 30000, // 30 secondes
  MAX_CALL_DURATION: 3600000, // 1 heure
  AUDIO_QUALITY: 'high'
};

// Configuration des statuts
export const STATUS_CONFIG = {
  MAX_DURATION: 30000, // 30 secondes
  AUTO_DELETE_AFTER: 86400000 // 24 heures
};

// Routes de l'API
export const API_ROUTES = {
  GOOGLE_AUTH: '/api/google/validate',
  GOOGLE_CONTACTS: '/api/google/contacts',
  UPLOAD_MEDIA: '/api/upload',
  USER_PROFILE: '/api/user/profile'
};

// Configuration des médias
export const MEDIA_CONFIG = {
  MAX_IMAGE_SIZE: 16 * 1024 * 1024, // 16MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_AUDIO_SIZE: 16 * 1024 * 1024, // 16MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  SUPPORTED_VIDEO_FORMATS: ['mp4', 'avi', 'mov', 'mkv'],
  SUPPORTED_AUDIO_FORMATS: ['mp3', 'wav', 'ogg', 'm4a']
};

// Configuration de l'interface
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 350,
  CHAT_HEADER_HEIGHT: 60,
  MESSAGE_BUBBLE_MAX_WIDTH: 400,
  EMOJI_PICKER_HEIGHT: 300
};

// Configuration des sons
export const SOUND_CONFIG = {
  MESSAGE_NOTIFICATION: '/Sounds/message_in_chat.mp3',
  CALL_RINGTONE: '/Sounds/whatsapp-short-ringtone.mp3',
  VOLUME: 0.7
};

// Configuration des thèmes
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Configuration des langues
export const LANGUAGE_CONFIG = {
  FR: 'fr',
  EN: 'en',
  ES: 'es',
  DE: 'de'
};

// Configuration des raccourcis clavier
export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: 'Ctrl+N',
  SEARCH: 'Ctrl+F',
  MARK_AS_READ: 'Ctrl+Shift+R',
  ARCHIVE_CHAT: 'Ctrl+E',
  DELETE_CHAT: 'Delete',
  TOGGLE_SIDEBAR: 'Ctrl+B'
};
