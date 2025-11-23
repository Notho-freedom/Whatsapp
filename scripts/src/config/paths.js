// Configuration des chemins et alias du projet WhatsApp

import path from 'path';

// Chemins de base
export const BASE_PATHS = {
  SRC: 'src',
  COMPONENTS: 'src/components',
  FEATURES: 'src/features',
  HOOKS: 'src/hooks',
  UTILS: 'src/utils',
  CONTEXT: 'src/context',
  TYPES: 'src/types',
  CONSTANTS: 'src/constants',
  STYLES: 'src/styles',
  APP: 'src/app',
  PUBLIC: 'public',
  ELECTRON: 'electron'
};

// Chemins des composants
export const COMPONENT_PATHS = {
  AUTH: 'src/components/auth',
  LAYOUT: 'src/components/layout',
  COMMON: 'src/components/common',
  UI: 'src/components/ui',
  CHAT: 'src/components/chat',
  STATUS: 'src/components/status',
  CALLS: 'src/components/calls'
};

// Chemins des fonctionnalités
export const FEATURE_PATHS = {
  NOTIFICATIONS: 'src/features/notifications',
  CONTEXT_MENU: 'src/features/context-menu',
  GOOGLE_INTEGRATION: 'src/features/google-integration'
};

// Chemins des ressources
export const ASSET_PATHS = {
  IMAGES: 'public/images',
  SOUNDS: 'public/Sounds',
  ICONS: 'public/icons',
  FONTS: 'public/fonts'
};

// Alias de chemins pour les imports
export const PATH_ALIASES = {
  '@': 'src',
  '@/components': 'src/components',
  '@/auth': 'src/components/auth',
  '@/layout': 'src/components/layout',
  '@/common': 'src/components/common',
  '@/ui': 'src/components/ui',
  '@/chat': 'src/components/chat',
  '@/status': 'src/components/status',
  '@/calls': 'src/components/calls',
  '@/features': 'src/features',
  '@/hooks': 'src/hooks',
  '@/utils': 'src/utils',
  '@/context': 'src/context',
  '@/types': 'src/types',
  '@/constants': 'src/constants',
  '@/styles': 'src/styles',
  '@/app': 'src/app',
  '@/assets': 'public',
  '@/sounds': 'public/Sounds',
  '@/icons': 'public/icons'
};

// Fonction utilitaire pour résoudre les chemins
export const resolvePath = (relativePath) => {
  return path.resolve(process.cwd(), relativePath);
};

// Fonction utilitaire pour vérifier l'existence d'un chemin
export const pathExists = async (filePath) => {
  try {
    const fs = await import('fs/promises');
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Configuration des extensions supportées
export const SUPPORTED_EXTENSIONS = {
  JAVASCRIPT: ['.js', '.jsx'],
  TYPESCRIPT: ['.ts', '.tsx'],
  STYLES: ['.css', '.scss', '.sass', '.less'],
  ASSETS: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'],
  AUDIO: ['.mp3', '.wav', '.ogg', '.m4a', '.aac'],
  VIDEO: ['.mp4', '.avi', '.mov', '.mkv', '.webm']
};

// Configuration des dossiers à ignorer
export const IGNORED_DIRECTORIES = [
  'node_modules',
  '.git',
  '.next',
  'out',
  'dist',
  'build',
  '.vscode',
  'coverage'
];

// Configuration des fichiers à ignorer
export const IGNORED_FILES = [
  '.DS_Store',
  'Thumbs.db',
  '*.log',
  '*.tmp',
  '*.temp'
];

// Configuration des patterns de recherche
export const SEARCH_PATTERNS = {
  COMPONENTS: '**/*.{js,jsx,ts,tsx}',
  STYLES: '**/*.{css,scss,sass,less}',
  ASSETS: '**/*.{png,jpg,jpeg,gif,svg,ico,webp}',
  AUDIO: '**/*.{mp3,wav,ogg,m4a,aac}',
  VIDEO: '**/*.{mp4,avi,mov,mkv,webm}',
  DOCS: '**/*.{md,mdx,txt,rtf}',
  CONFIG: '**/*.{json,js,ts,yml,yaml,env}'
};

// Configuration des métadonnées du projet
export const PROJECT_METADATA = {
  NAME: 'WhatsApp Desktop',
  VERSION: '1.0.0',
  DESCRIPTION: 'Application de bureau WhatsApp avec fonctionnalités avancées',
  AUTHOR: 'Équipe de développement',
  LICENSE: 'MIT',
  REPOSITORY: 'https://github.com/username/whatsapp-desktop',
  KEYWORDS: ['whatsapp', 'desktop', 'electron', 'react', 'nextjs']
};

// Configuration des environnements
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TESTING: 'testing',
  STAGING: 'staging'
};

// Configuration des modes de build
export const BUILD_MODES = {
  DEV: 'development',
  PROD: 'production',
  ANALYZE: 'analyze',
  ELECTRON: 'electron'
};

export default {
  BASE_PATHS,
  COMPONENT_PATHS,
  FEATURE_PATHS,
  ASSET_PATHS,
  PATH_ALIASES,
  SUPPORTED_EXTENSIONS,
  IGNORED_DIRECTORIES,
  IGNORED_FILES,
  SEARCH_PATTERNS,
  PROJECT_METADATA,
  ENVIRONMENTS,
  BUILD_MODES
};
