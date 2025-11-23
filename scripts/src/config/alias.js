// Configuration des alias de chemins pour le projet WhatsApp

// Alias de base
export const BASE_ALIASES = {
  '@': 'src',
  '@src': 'src',
  '@root': '.'
};

// Alias des composants
export const COMPONENT_ALIASES = {
  '@components': 'src/components',
  '@auth': 'src/components/auth',
  '@layout': 'src/components/layout',
  '@common': 'src/components/common',
  '@ui': 'src/components/ui',
  '@chat': 'src/components/chat',
  '@status': 'src/components/status',
  '@calls': 'src/components/calls'
};

// Alias des modules
export const MODULE_ALIASES = {
  '@features': 'src/features',
  '@hooks': 'src/hooks',
  '@utils': 'src/utils',
  '@context': 'src/context',
  '@types': 'src/types',
  '@constants': 'src/constants',
  '@styles': 'src/styles',
  '@app': 'src/app',
  '@config': 'src/config'
};

// Alias des ressources
export const ASSET_ALIASES = {
  '@assets': 'public',
  '@images': 'public/images',
  '@sounds': 'public/Sounds',
  '@icons': 'public/icons',
  '@fonts': 'public/fonts'
};

// Tous les alias combinés
export const ALL_ALIASES = {
  ...BASE_ALIASES,
  ...COMPONENT_ALIASES,
  ...MODULE_ALIASES,
  ...ASSET_ALIASES
};

// Configuration pour webpack
export const WEBPACK_ALIASES = Object.entries(ALL_ALIASES).reduce((acc, [key, value]) => {
  acc[key] = require('path').resolve(process.cwd(), value);
  return acc;
}, {});

// Configuration pour ESLint
export const ESLINT_ALIASES = Object.entries(ALL_ALIASES).map(([key, value]) => [key, `./${value}`]);

// Configuration pour jsconfig.json
export const JSCONFIG_ALIASES = Object.entries(ALL_ALIASES).reduce((acc, [key, value]) => {
  acc[key] = [value];
  return acc;
}, {});

export default {
  BASE_ALIASES,
  COMPONENT_ALIASES,
  MODULE_ALIASES,
  ASSET_ALIASES,
  ALL_ALIASES,
  WEBPACK_ALIASES,
  ESLINT_ALIASES,
  JSCONFIG_ALIASES
};
