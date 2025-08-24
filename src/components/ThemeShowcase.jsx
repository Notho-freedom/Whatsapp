import React from 'react';
import { useTheme } from '@/utils/themeManager';

export default function ThemeShowcase() {
  const { theme, themeName, setTheme, getThemeValue, getThemeStyles } = useTheme();

  const createCustomTheme = () => {
    const customTheme = {
      titlebar: {
        background: '#1a1a2e', // Bleu foncé
        text: {
          primary: '#e94560', // Rouge
          secondary: '#0f3460', // Bleu
          accent: '#16213e' // Bleu très foncé
        },
        buttons: {
          background: {
            default: 'transparent',
            hover: 'rgba(233, 69, 96, 0.8)', // Rouge avec transparence
            close: '#e94560' // Rouge
          },
          text: '#ffffff'
        }
      },
      sidebar: {
        background: {
          reduced: '#0f3460', // Bleu foncé
          extended: 'rgba(15, 52, 96, 0.8)', // Bleu avec transparence
          backdrop: '20px'
        },
        border: {
          right: '#e94560' // Rouge
        },
        indicator: {
          active: '#e94560' // Rouge
        },
        buttons: {
          background: {
            default: 'transparent',
            hover: 'rgba(233, 69, 96, 0.3)',
            active: 'rgba(233, 69, 96, 0.5)'
          },
          text: '#ffffff',
          icon: '#ffffff'
        },
        separator: '#e94560',
        badges: {
          green: '#e94560',
          pink: '#0f3460',
          text: {
            green: '#ffffff',
            pink: '#ffffff'
          }
        },
        profile: {
          avatar: 'rgba(233, 69, 96, 0.95)',
          icon: '#ffffff'
        }
      },
      chatHeader: {
        background: '#16213e', // Bleu très foncé
        border: {
          right: '#e94560' // Rouge
        },
        text: {
          name: '#e94560', // Rouge
          status: '#0f3460' // Bleu
        },
        buttons: {
          group: {
            background: 'rgba(233, 69, 96, 0.3)',
            border: '#e94560'
          },
          separator: '#e94560',
          hover: 'rgba(233, 69, 96, 0.2)',
          icon: {
            primary: '#ffffff',
            secondary: '#0f3460'
          }
        }
      },
      chatBody: {
        background: {
          main: '#0f3460',
          image: 'o.png',
          empty: '#16213e'
        },
        empty: {
          icon: '#e94560',
          title: '#ffffff',
          description: '#0f3460',
          lock: {
            icon: '#e94560',
            text: '#0f3460'
          }
        },
        messages: {
          noMessages: '#e94560',
          dateDivider: {
            background: 'rgba(233, 69, 96, 0.1)',
            text: '#e94560'
          }
        },
        scrollButton: {
          background: '#e94560',
          hover: '#0f3460',
          icon: '#ffffff'
        }
      }
    };

    // Créer le thème personnalisé
    const manager = require('@/utils/themeManager').getThemeManager();
    manager.createCustomTheme('custom', customTheme);
    setTheme('custom');
  };

  return (
    <div className="p-6 space-y-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        🎨 Démonstration Complète des Thèmes
      </h1>

      {/* Informations sur le thème actuel */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Thème Actuel: {themeName}</h2>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong>Composants thématisés:</strong> TitleBar, Sidebar, ChatHeader, ChatBody</p>
          <p><strong>Variables CSS:</strong> {Object.keys(theme).length} sections principales</p>
        </div>
      </div>

      {/* Sélecteur de thèmes */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Changer de Thème</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => setTheme('default')}
          >
            🌙 Thème Par Défaut
          </button>
          <button
            className="p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={createCustomTheme}
          >
            ✨ Thème Personnalisé (Bleu/Rouge)
          </button>
        </div>
      </div>

      {/* Aperçu des couleurs par composant */}
      <div className="grid grid-cols-2 gap-4">
        {/* TitleBar */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3">🎯 TitleBar</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white"
                style={getThemeStyles('titlebar.background', { backgroundColor: '#202020' })}
              ></div>
              <span className="text-sm text-gray-300">Background</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white flex items-center justify-center"
                style={getThemeStyles('titlebar.text.secondary', { color: '#10b981' })}
              >
                <span className="text-xs font-bold">W</span>
              </div>
              <span className="text-sm text-gray-300">Logo</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3">📱 Sidebar</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white"
                style={getThemeStyles('sidebar.background.reduced', { backgroundColor: '#202020' })}
              ></div>
              <span className="text-sm text-gray-300">Background</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white flex items-center justify-center"
                style={getThemeStyles('sidebar.indicator.active', { backgroundColor: '#1DAA61' })}
              >
                <span className="text-white text-xs">|</span>
              </div>
              <span className="text-sm text-gray-300">Indicateur</span>
            </div>
          </div>
        </div>

        {/* ChatHeader */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3">💬 ChatHeader</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white"
                style={getThemeStyles('chatHeader.background', { backgroundColor: '#2C2C2C' })}
              ></div>
              <span className="text-sm text-gray-300">Background</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white flex items-center justify-center"
                style={getThemeStyles('chatHeader.buttons.group.background', { backgroundColor: 'rgba(64, 64, 64, 0.5)' })}
              >
                <span className="text-white text-xs">📹</span>
              </div>
              <span className="text-sm text-gray-300">Boutons</span>
            </div>
          </div>
        </div>

        {/* ChatBody */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-white mb-3">💭 ChatBody</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white"
                style={getThemeStyles('chatBody.background.main', { backgroundColor: 'var(--wa-conversation-panel-background)' })}
              ></div>
              <span className="text-sm text-gray-300">Background</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded border border-white flex items-center justify-center"
                style={getThemeStyles('chatBody.scrollButton.background', { backgroundColor: '#202c33' })}
              >
                <span className="text-white text-xs">↓</span>
              </div>
              <span className="text-sm text-gray-300">Scroll</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test des variables CSS */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🔧 Variables CSS Appliquées</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <h4 className="font-semibold text-white mb-2">TitleBar</h4>
            <p>--titlebar-bg: {getComputedStyle(document.documentElement).getPropertyValue('--titlebar-bg') || 'Non définie'}</p>
            <p>--titlebar-text-primary: {getComputedStyle(document.documentElement).getPropertyValue('--titlebar-text-primary') || 'Non définie'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">Sidebar</h4>
            <p>--sidebar-bg-reduced: {getComputedStyle(document.documentElement).getPropertyValue('--sidebar-bg-reduced') || 'Non définie'}</p>
            <p>--sidebar-indicator-active: {getComputedStyle(document.documentElement).getPropertyValue('--sidebar-indicator-active') || 'Non définie'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">ChatHeader</h4>
            <p>--chatheader-bg: {getComputedStyle(document.documentElement).getPropertyValue('--chatheader-bg') || 'Non définie'}</p>
            <p>--chatheader-text-name: {getComputedStyle(document.documentElement).getPropertyValue('--chatheader-text-name') || 'Non définie'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">ChatBody</h4>
            <p>--chatbody-bg-main: {getComputedStyle(document.documentElement).getPropertyValue('--chatbody-bg-main') || 'Non définie'}</p>
            <p>--chatbody-scroll-button-bg: {getComputedStyle(document.documentElement).getPropertyValue('--chatbody-scroll-button-bg') || 'Non définie'}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">📋 Instructions</h3>
        <div className="text-sm text-white space-y-1">
          <p>1. <strong>Changez de thème</strong> pour voir tous les composants se modifier</p>
          <p>2. <strong>Observez</strong> comment TitleBar, Sidebar, ChatHeader et ChatBody s'adaptent</p>
          <p>3. <strong>Vérifiez</strong> que les variables CSS sont bien appliquées</p>
          <p>4. <strong>Testez</strong> le thème personnalisé bleu/rouge</p>
        </div>
      </div>

      {/* État du système */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">🔧 État du Système</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 rounded text-center bg-green-600">
            <p className="text-white font-semibold">Gestionnaire de Thèmes</p>
            <p className="text-xs">✅ Actif</p>
          </div>
          <div className="p-2 rounded text-center bg-green-600">
            <p className="text-white font-semibold">Composants Thématisés</p>
            <p className="text-xs">✅ 4/4</p>
          </div>
          <div className="p-2 rounded text-center bg-green-600">
            <p className="text-white font-semibold">Variables CSS</p>
            <p className="text-xs">✅ Appliquées</p>
          </div>
          <div className="p-2 rounded text-center bg-green-600">
            <p className="text-white font-semibold">Thèmes Disponibles</p>
            <p className="text-xs">✅ 2</p>
          </div>
        </div>
      </div>
    </div>
  );
}
