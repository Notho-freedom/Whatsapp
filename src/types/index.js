// Types et interfaces pour l'application WhatsApp

// Types de base
export const TYPES = {
  // Messages
  MESSAGE: 'message',
  REPLY: 'reply',
  FORWARD: 'forward',
  
  // Appels
  INCOMING_CALL: 'incoming_call',
  OUTGOING_CALL: 'outgoing_call',
  MISSED_CALL: 'missed_call',
  
  // Statuts
  STATUS_UPDATE: 'status_update',
  STATUS_VIEW: 'status_view',
  
  // Contacts
  CONTACT_ADD: 'contact_add',
  CONTACT_UPDATE: 'contact_update',
  CONTACT_DELETE: 'contact_delete'
};

// Interface pour un message
export const createMessageInterface = () => ({
  id: '',
  type: '',
  content: '',
  sender: '',
  timestamp: new Date(),
  status: '',
  isReply: false,
  replyTo: null,
  media: null,
  reactions: [],
  isStarred: false,
  isForwarded: false
});

// Interface pour un contact
export const createContactInterface = () => ({
  id: '',
  name: '',
  phone: '',
  email: '',
  avatar: '',
  status: '',
  lastSeen: null,
  isOnline: false,
  isBlocked: false,
  isFavorite: false
});

// Interface pour un appel
export const createCallInterface = () => ({
  id: '',
  type: '',
  status: '',
  startTime: null,
  endTime: null,
  duration: 0,
  isVideo: false,
  participants: [],
  isMuted: false,
  isSpeakerOn: false
});

// Interface pour un statut
export const createStatusInterface = () => ({
  id: '',
  type: '',
  content: '',
  media: null,
  timestamp: new Date(),
  expiresAt: null,
  views: [],
  isViewed: false,
  isExpired: false
});

// Interface pour un utilisateur
export const createUserInterface = () => ({
  id: '',
  name: '',
  email: '',
  phone: '',
  avatar: '',
  status: '',
  lastSeen: null,
  isOnline: false,
  settings: {},
  preferences: {}
});

// Interface pour les paramètres
export const createSettingsInterface = () => ({
  theme: 'light',
  language: 'fr',
  notifications: true,
  sound: true,
  vibration: true,
  autoDownload: true,
  privacy: {
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    status: 'everyone'
  }
});

// Interface pour une conversation
export const createChatInterface = () => ({
  id: '',
  type: 'individual', // individual, group, broadcast
  name: '',
  participants: [],
  lastMessage: null,
  unreadCount: 0,
  isPinned: false,
  isArchived: false,
  isMuted: false,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Interface pour un groupe
export const createGroupInterface = () => ({
  id: '',
  name: '',
  description: '',
  avatar: '',
  participants: [],
  admins: [],
  createdAt: new Date(),
  settings: {
    onlyAdminsCanSendMessages: false,
    onlyAdminsCanEditInfo: false,
    onlyAdminsCanAddParticipants: false
  }
});

// Interface pour les médias
export const createMediaInterface = () => ({
  id: '',
  type: '', // image, video, audio, document
  url: '',
  thumbnail: '',
  filename: '',
  size: 0,
  duration: null, // pour audio/video
  mimeType: '',
  uploadedAt: new Date()
});

// Interface pour les réactions
export const createReactionInterface = () => ({
  id: '',
  emoji: '',
  user: '',
  timestamp: new Date()
});

// Interface pour les notifications
export const createNotificationInterface = () => ({
  id: '',
  type: '',
  title: '',
  body: '',
  data: {},
  timestamp: new Date(),
  isRead: false,
  action: null
});

// Interface pour les événements
export const createEventInterface = () => ({
  id: '',
  type: '',
  data: {},
  timestamp: new Date(),
  source: '',
  target: null
});

// Types d'erreurs
export const ERROR_TYPES = {
  NETWORK: 'network_error',
  AUTHENTICATION: 'authentication_error',
  AUTHORIZATION: 'authorization_error',
  VALIDATION: 'validation_error',
  NOT_FOUND: 'not_found_error',
  SERVER: 'server_error',
  UNKNOWN: 'unknown_error'
};

// Types de validation
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  MIN_LENGTH: 'min_length',
  MAX_LENGTH: 'max_length',
  PATTERN: 'pattern',
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url'
};
