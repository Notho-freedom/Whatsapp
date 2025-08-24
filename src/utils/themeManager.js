import React from 'react';
/**
 * Gestionnaire de thèmes pour WhatsApp Clone
 * Construit progressivement en parcourant composant par composant
 */

// Thème par défaut (extrait de TitleBar)
export const defaultTheme = {
  // === TITLEBAR ===
  titlebar: {
    background: '#202020',
    text: {
      primary: '#ffffff', // text-white
      secondary: '#10b981', // text-green-500 (logo WhatsApp)
      accent: '#ffffff' // text-white (nom de l'application)
    },
    buttons: {
      background: {
        default: 'transparent',
        hover: 'rgba(55, 65, 81, 0.8)', // hover:bg-whatsapp-dark-700/80
        close: '#dc2626' // hover:bg-red-600
      },
      text: '#ffffff'
    }
  },

  // === SIDEBAR ===
  sidebar: {
    background: {
      reduced: '#202020', // Version réduite
      extended: 'rgba(44, 44, 44, 0.8)', // Version étendue avec transparence
      backdrop: '30px' // Effet de flou
    },
    border: {
      right: '#404040' // border-neutral-700
    },
    indicator: {
      active: '#1DAA61' // Indicateur d'onglet actif (vert WhatsApp)
    },
    buttons: {
      background: {
        default: 'transparent',
        hover: 'rgba(55, 65, 81, 0.5)', // hover:bg-whatsapp-dark-700/50
        active: 'rgba(55, 65, 81, 0.5)' // bg-whatsapp-dark-700/50
      },
      text: '#ffffff',
      icon: '#ffffff'
    },
    separator: '#404040', // border-neutral-700
    badges: {
      green: '#1DAA61', // Badge vert WhatsApp
      pink: '#FF99A4', // Badge rose
      text: {
        green: '#0a0a0a', // text-whatsapp-dark-950
        pink: '#000000' // text-black pour badge rose
      }
    },
    profile: {
      avatar: 'rgba(64, 64, 64, 0.95)', // bg-neutral-700/95
      icon: '#9ca3af' // text-gray-400
    }
  },

  // === CHAT HEADER ===
  chatHeader: {
    background: '#2C2C2C', // Background principal
    border: {
      right: '#171717' // border-neutral-900
    },
    text: {
      name: '#ffffff', // Nom de l'utilisateur
      status: '#d1d5db' // Statut (text-gray-300)
    },
    buttons: {
      group: {
        background: 'rgba(64, 64, 64, 0.5)', // bg-neutral-700/50
        border: '#404040' // border-neutral-700
      },
      separator: '#404040', // Séparateur vertical
      hover: 'rgba(255, 255, 255, 0.1)', // hover:bg-white/10
      icon: {
        primary: '#ffffff', // Icônes vidéo/audio
        secondary: '#d1d5db' // Icônes recherche/menu
      }
    }
  },

  // === CHAT BODY ===
  chatBody: {
    background: {
      main: 'var(--wa-conversation-panel-background)', // Background principal
      image: 'o.png', // Image de fond
      empty: 'var(--wa-chat-bg)' // Background quand pas de chat sélectionné
    },
    empty: {
      icon: '#525252', // Icône WhatsApp (text-neutral-600)
      title: '#ffffff', // Titre principal
      description: '#9ca3af', // Description (text-neutral-400)
      lock: {
        icon: '#737373', // Icône cadenas (text-neutral-500)
        text: '#737373' // Texte cadenas (text-neutral-500)
      }
    },
    messages: {
      noMessages: '#8696a0', // Texte "No messages yet"
      dateDivider: {
        background: 'rgba(134, 150, 160, 0.1)', // Fond du séparateur de date
        text: '#8696a0' // Texte de la date
      }
    },
    scrollButton: {
      background: '#202c33', // Bouton scroll to bottom
      hover: '#2a373f', // Hover du bouton
      icon: '#8696a0' // Icône du bouton
    }
  },

  // === CHAT FOOTER === (à extraire ensuite)
  chatFooter: {
    // Sera rempli lors de l'analyse du composant ChatFooter
  },

  // === CHAT LIST === (à extraire ensuite)
  chatList: {
    // Sera rempli lors de l'analyse du composant ChatList
  },

  // === MESSAGE BUBBLE === (à extraire ensuite)
  messageBubble: {
    // Sera rempli lors de l'analyse du composant MessageBubble
  },

  // === UTILITAIRES ===
  colors: {
    white: '#ffffff',
    black: '#000000',
    green: {
      500: '#10b981', // Logo WhatsApp
      600: '#059669'
    },
    red: {
      600: '#dc2626' // Bouton fermer
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151', // whatsapp-dark-700
      800: '#1f2937',
      900: '#111827'
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a'
    }
  }
};

/**
 * Classe pour gérer les thèmes
 */
class ThemeManager {
  constructor() {
    this.currentTheme = 'default';
    this.themes = {
      default: defaultTheme
    };
    this.customThemes = {};
  }

  /**
   * Obtenir le thème actuel
   */
  getCurrentTheme() {
    return this.themes[this.currentTheme] || this.themes.default;
  }

  /**
   * Obtenir une valeur spécifique du thème
   */
  getThemeValue(path) {
    const theme = this.getCurrentTheme();
    return path.split('.').reduce((obj, key) => obj?.[key], theme);
  }

  /**
   * Obtenir une classe CSS basée sur le thème
   */
  getThemeClass(path, fallback = '') {
    const value = this.getThemeValue(path);
    if (!value) return fallback;

    // Convertir la valeur en classe CSS appropriée
    if (typeof value === 'string' && value.startsWith('#')) {
      // Couleur hexadécimale
      return `[color:${value}]`;
    }

    return value;
  }

  /**
   * Obtenir des styles inline basés sur le thème
   */
  getThemeStyles(path, fallback = {}) {
    const value = this.getThemeValue(path);
    if (!value) return fallback;

    // Convertir la valeur en styles CSS appropriés
    if (typeof value === 'string' && value.startsWith('#')) {
      if (path.includes('background')) {
        return { backgroundColor: value };
      } else if (path.includes('text') || path.includes('color')) {
        return { color: value };
      } else if (path.includes('border')) {
        return { borderColor: value };
      }
    }

    return fallback;
  }

  /**
   * Changer de thème
   */
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.applyTheme();
      return true;
    }
    return false;
  }

  /**
   * Créer un thème personnalisé
   */
  createCustomTheme(name, themeData) {
    this.customThemes[name] = {
      ...defaultTheme,
      ...themeData
    };
    this.themes[name] = this.customThemes[name];
    return true;
  }

  /**
   * Appliquer le thème actuel au DOM
   */
  applyTheme() {
    const theme = this.getCurrentTheme();
    
    // Émettre un événement pour notifier les composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme: theme, themeName: this.currentTheme }
      }));
    }

    // Appliquer les variables CSS globales
    this.applyCSSVariables(theme);
  }

  /**
   * Appliquer les variables CSS globales
   */
  applyCSSVariables(theme) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Variables pour TitleBar
    root.style.setProperty('--titlebar-bg', theme.titlebar.background);
    root.style.setProperty('--titlebar-text-primary', theme.titlebar.text.primary);
    root.style.setProperty('--titlebar-text-secondary', theme.titlebar.text.secondary);
    root.style.setProperty('--titlebar-text-accent', theme.titlebar.text.accent);
    root.style.setProperty('--titlebar-button-bg-default', theme.titlebar.buttons.background.default);
    root.style.setProperty('--titlebar-button-bg-hover', theme.titlebar.buttons.background.hover);
    root.style.setProperty('--titlebar-button-bg-close', theme.titlebar.buttons.background.close);
    root.style.setProperty('--titlebar-button-text', theme.titlebar.buttons.text);

    // Variables pour Sidebar
    root.style.setProperty('--sidebar-bg-reduced', theme.sidebar.background.reduced);
    root.style.setProperty('--sidebar-bg-extended', theme.sidebar.background.extended);
    root.style.setProperty('--sidebar-backdrop-blur', theme.sidebar.background.backdrop);
    root.style.setProperty('--sidebar-border-right', theme.sidebar.border.right);
    root.style.setProperty('--sidebar-indicator-active', theme.sidebar.indicator.active);
    root.style.setProperty('--sidebar-button-bg-default', theme.sidebar.buttons.background.default);
    root.style.setProperty('--sidebar-button-bg-hover', theme.sidebar.buttons.background.hover);
    root.style.setProperty('--sidebar-button-bg-active', theme.sidebar.buttons.background.active);
    root.style.setProperty('--sidebar-button-text', theme.sidebar.buttons.text);
    root.style.setProperty('--sidebar-button-icon', theme.sidebar.buttons.icon);
    root.style.setProperty('--sidebar-separator', theme.sidebar.separator);
    root.style.setProperty('--sidebar-badge-green', theme.sidebar.badges.green);
    root.style.setProperty('--sidebar-badge-pink', theme.sidebar.badges.pink);
    root.style.setProperty('--sidebar-badge-text-green', theme.sidebar.badges.text.green);
    root.style.setProperty('--sidebar-badge-text-pink', theme.sidebar.badges.text.pink);
    root.style.setProperty('--sidebar-profile-avatar', theme.sidebar.profile.avatar);
    root.style.setProperty('--sidebar-profile-icon', theme.sidebar.profile.icon);

    // Variables pour ChatHeader
    root.style.setProperty('--chatheader-bg', theme.chatHeader.background);
    root.style.setProperty('--chatheader-border-right', theme.chatHeader.border.right);
    root.style.setProperty('--chatheader-text-name', theme.chatHeader.text.name);
    root.style.setProperty('--chatheader-text-status', theme.chatHeader.text.status);
    root.style.setProperty('--chatheader-button-group-bg', theme.chatHeader.buttons.group.background);
    root.style.setProperty('--chatheader-button-group-border', theme.chatHeader.buttons.group.border);
    root.style.setProperty('--chatheader-button-separator', theme.chatHeader.buttons.separator);
    root.style.setProperty('--chatheader-button-hover', theme.chatHeader.buttons.hover);
    root.style.setProperty('--chatheader-button-icon-primary', theme.chatHeader.buttons.icon.primary);
    root.style.setProperty('--chatheader-button-icon-secondary', theme.chatHeader.buttons.icon.secondary);

    // Variables pour ChatBody
    root.style.setProperty('--chatbody-bg-main', theme.chatBody.background.main);
    root.style.setProperty('--chatbody-bg-image', theme.chatBody.background.image);
    root.style.setProperty('--chatbody-bg-empty', theme.chatBody.background.empty);
    root.style.setProperty('--chatbody-empty-icon', theme.chatBody.empty.icon);
    root.style.setProperty('--chatbody-empty-title', theme.chatBody.empty.title);
    root.style.setProperty('--chatbody-empty-description', theme.chatBody.empty.description);
    root.style.setProperty('--chatbody-empty-lock-icon', theme.chatBody.empty.lock.icon);
    root.style.setProperty('--chatbody-empty-lock-text', theme.chatBody.empty.lock.text);
    root.style.setProperty('--chatbody-messages-no-messages', theme.chatBody.messages.noMessages);
    root.style.setProperty('--chatbody-messages-date-divider-bg', theme.chatBody.messages.dateDivider.background);
    root.style.setProperty('--chatbody-messages-date-divider-text', theme.chatBody.messages.dateDivider.text);
    root.style.setProperty('--chatbody-scroll-button-bg', theme.chatBody.scrollButton.background);
    root.style.setProperty('--chatbody-scroll-button-hover', theme.chatBody.scrollButton.hover);
    root.style.setProperty('--chatbody-scroll-button-icon', theme.chatBody.scrollButton.icon);

    // Variables pour les couleurs générales
    Object.entries(theme.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'string') {
        root.style.setProperty(`--color-${colorName}`, colorValue);
      } else if (typeof colorValue === 'object') {
        Object.entries(colorValue).forEach(([shade, shadeValue]) => {
          root.style.setProperty(`--color-${colorName}-${shade}`, shadeValue);
        });
      }
    });
  }

  /**
   * Obtenir tous les thèmes disponibles
   */
  getAvailableThemes() {
    return Object.keys(this.themes);
  }

  /**
   * Exporter le thème actuel
   */
  exportTheme() {
    return {
      name: this.currentTheme,
      theme: this.getCurrentTheme()
    };
  }

  /**
   * Importer un thème
   */
  importTheme(name, themeData) {
    this.themes[name] = themeData;
    return true;
  }
}

// Instance singleton
let themeManager = null;

/**
 * Obtenir l'instance du gestionnaire de thèmes
 */
export const getThemeManager = () => {
  if (!themeManager) {
    themeManager = new ThemeManager();
    // Appliquer le thème par défaut au démarrage
    themeManager.applyTheme();
  }
  return themeManager;
};

/**
 * Hook React pour utiliser le thème
 */
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = React.useState('default');
  const [themeData, setThemeData] = React.useState(defaultTheme);

  React.useEffect(() => {
    const manager = getThemeManager();
    
    const handleThemeChange = (event) => {
      setCurrentTheme(event.detail.themeName);
      setThemeData(event.detail.theme);
    };

    window.addEventListener('theme-changed', handleThemeChange);
    
    // Initialiser avec le thème actuel
    setCurrentTheme(manager.currentTheme);
    setThemeData(manager.getCurrentTheme());

    return () => {
      window.removeEventListener('theme-changed', handleThemeChange);
    };
  }, []);

  return {
    theme: themeData,
    themeName: currentTheme,
    setTheme: (themeName) => getThemeManager().setTheme(themeName),
    getThemeValue: (path) => getThemeManager().getThemeValue(path),
    getThemeClass: (path, fallback) => getThemeManager().getThemeClass(path, fallback),
    getThemeStyles: (path, fallback) => getThemeManager().getThemeStyles(path, fallback)
  };
};

export default getThemeManager;
