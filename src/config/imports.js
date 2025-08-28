// Configuration des imports et exports centralisés

// Composants d'authentification
export { GoogleAuthDemo, AuthNavigation, GoogleContactsManager } from '@/components/auth';

// Composants de mise en page
export { Titlebar, Sidebar, Splitter } from '@/components/layout';

// Composants communs
export { Profile, ProfilePanel, WelcomeScreen } from '@/components/common';

// Composants d'interface utilisateur
export { StatusCircle, Message } from '@/components/ui';

// Composants de chat
export * from '@/components/chat';

// Composants de statut
export * from '@/components/status';

// Composants d'appels
export * from '@/components/calls';

// Fonctionnalités
export { NativeNotificationDemo } from '@/features';

// Hooks personnalisés
export * from '@/hooks';

// Utilitaires
export * from '@/utils';

// Contextes
export * from '@/context';

// Types
export * from '@/types';

// Constantes
export * from '@/constants';

// Composant principal
export { default as WhatsApp } from '@/components/WhatsApp';

// Configuration des alias d'imports
export const IMPORT_ALIASES = {
  // Composants
  '@components': '@/components',
  '@auth': '@/components/auth',
  '@layout': '@/components/layout',
  '@common': '@/components/common',
  '@ui': '@/components/ui',
  '@chat': '@/components/chat',
  '@status': '@/components/status',
  '@calls': '@/components/calls',
  
  // Fonctionnalités
  '@features': '@/features',
  
  // Autres modules
  '@hooks': '@/hooks',
  '@utils': '@/utils',
  '@context': '@/context',
  '@types': '@/types',
  '@constants': '@/constants',
  '@styles': '@/styles',
  '@app': '@/app',
  '@config': '@/config'
};

// Configuration des exports par défaut
export const DEFAULT_EXPORTS = {
  // Composants principaux
  WhatsApp: '@/components/WhatsApp',
  
  // Composants d'authentification
  GoogleAuth: '@/components/auth/GoogleAuthDemo',
  AuthNav: '@/components/auth/AuthNavigation',
  ContactsManager: '@/components/auth/GoogleContactsManager',
  
  // Composants de mise en page
  AppTitlebar: '@/components/layout/Titlebar',
  AppSidebar: '@/components/layout/Sidebar',
  AppSplitter: '@/components/layout/Splitter',
  
  // Composants communs
  UserProfile: '@/components/common/Profile',
  ProfilePanel: '@/components/common/ProfilePanel',
  Welcome: '@/components/common/WelcomeScreen',
  
  // Composants d'interface
  StatusIndicator: '@/components/ui/StatusCircle',
  MessageComponent: '@/components/ui/Message'
};

// Configuration des exports nommés
export const NAMED_EXPORTS = {
  // Authentification
  auth: ['GoogleAuthDemo', 'AuthNavigation', 'GoogleContactsManager'],
  
  // Mise en page
  layout: ['Titlebar', 'Sidebar', 'Splitter'],
  
  // Composants communs
  common: ['Profile', 'ProfilePanel', 'WelcomeScreen'],
  
  // Interface utilisateur
  ui: ['StatusCircle', 'Message'],
  
  // Fonctionnalités
  features: ['NativeNotificationDemo']
};

// Fonction utilitaire pour importer dynamiquement
export const dynamicImport = async (modulePath) => {
  try {
    const importedModule = await import(modulePath);
    return importedModule.default || importedModule;
  } catch (error) {
    console.error(`Erreur lors de l'import de ${modulePath}:`, error);
    return null;
  }
};

// Fonction utilitaire pour importer avec fallback
export const importWithFallback = async (primaryPath, fallbackPath) => {
  try {
    return await dynamicImport(primaryPath);
  } catch (error) {
    console.warn(`Import principal échoué, utilisation du fallback: ${fallbackPath}`);
    return await dynamicImport(fallbackPath);
  }
};

// Configuration des imports conditionnels
export const CONDITIONAL_IMPORTS = {
  // Imports basés sur l'environnement
  development: {
    devTools: '@/features/dev-tools',
    debugPanel: '@/components/debug/DebugPanel'
  },
  
  production: {
    analytics: '@/utils/analytics',
    errorTracking: '@/utils/error-tracking'
  },
  
  // Imports basés sur les fonctionnalités
  features: {
    notifications: '@/features/notifications',
    contextMenu: '@/features/context-menu',
    googleIntegration: '@/features/google-integration'
  }
};

// Configuration des imports asynchrones
export const ASYNC_IMPORTS = {
  // Composants lourds chargés à la demande
  heavyComponents: {
    MediaViewer: () => import('@/components/ui'),
    VideoPlayer: () => import('@/components/ui'),
    AudioPlayer: () => import('@/components/ui'),
    DocumentViewer: () => import('@/components/ui')
  },
  
  // Fonctionnalités avancées
  advancedFeatures: {
    VoiceRecorder: () => import('@/features'),
    ScreenShare: () => import('@/features'),
    FileTransfer: () => import('@/features')
  }
};

// Configuration des imports de développement
export const DEV_IMPORTS = {
  // Outils de développement
  devTools: process.env.NODE_ENV === 'development' ? [
    '@/utils/dev-logger',
    '@/components/dev/DevPanel',
    '@/hooks/useDevTools'
  ] : [],
  
  // Composants de débogage
  debugComponents: process.env.NODE_ENV === 'development' ? [
    '@/components/debug/StateViewer',
    '@/components/debug/PerformanceMonitor',
    '@/components/debug/NetworkMonitor'
  ] : []
};

// Export par défaut de la configuration
export default {
  IMPORT_ALIASES,
  DEFAULT_EXPORTS,
  NAMED_EXPORTS,
  CONDITIONAL_IMPORTS,
  ASYNC_IMPORTS,
  DEV_IMPORTS,
  dynamicImport,
  importWithFallback
};
