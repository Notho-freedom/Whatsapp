// Configuration Firebase pour le projet elite-5b171
// Remplacez ces valeurs par vos vraies clés Firebase

export const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "elite-5b171.firebaseapp.com",
  projectId: "elite-5b171",
  storageBucket: "elite-5b171.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// Configuration pour les émulateurs (développement local)
export const emulatorConfig = {
  useEmulator: process.env.NODE_ENV === 'development',
  firestore: {
    host: 'localhost:8080',
    ssl: false
  },
  auth: {
    host: 'localhost:9099',
    ssl: false
  },
  storage: {
    host: 'localhost:9199',
    ssl: false
  },
  functions: {
    host: 'localhost:5001',
    ssl: false
  }
};

// URLs de l'application
export const appUrls = {
  production: 'https://elite-5b171.web.app',
  development: 'http://localhost:3000',
  emulator: 'http://localhost:4000'
};

// Configuration des collections Firestore
export const collections = {
  users: 'users',
  conversations: 'conversations',
  messages: 'messages',
  notifications: 'notifications',
  status: 'status',
  calls: 'calls',
  contacts: 'contacts'
};

// Configuration du stockage
export const storageConfig = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 100 * 1024 * 1024, // 100MB
  maxAudioSize: 20 * 1024 * 1024, // 20MB
  maxDocumentSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
  allowedAudioTypes: ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ]
};

// Configuration des notifications
export const notificationConfig = {
  vapidKey: 'VOTRE_VAPID_KEY',
  defaultIcon: '/icon-192x192.png',
  defaultBadge: '/badge-72x72.png'
};

// Configuration de sécurité
export const securityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 heures
  passwordMinLength: 8
};

export default {
  firebaseConfig,
  emulatorConfig,
  appUrls,
  collections,
  storageConfig,
  notificationConfig,
  securityConfig
};
