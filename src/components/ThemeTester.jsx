import React from 'react';
import { useTheme } from '@/utils/themeManager';

export default function ThemeTester() {
  const { theme, themeName, setTheme, getThemeValue, getThemeStyles } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

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
        🎨 Testeur de Système de Thèmes
      </h1>

      {/* Informations sur le thème actuel */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Thème Actuel</h2>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong>Nom:</strong> {themeName}</p>
          <p><strong>Background TitleBar:</strong> {getThemeValue('titlebar.background')}</p>
          <p><strong>Texte Principal:</strong> {getThemeValue('titlebar.text.primary')}</p>
          <p><strong>Logo WhatsApp:</strong> {getThemeValue('titlebar.text.secondary')}</p>
        </div>
      </div>

      {/* Sélecteur de thèmes */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🎯 Changer de Thème</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => handleThemeChange('default')}
          >
            🌙 Thème Par Défaut
          </button>
          <button
            className="p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={createCustomTheme}
          >
            ✨ Créer Thème Personnalisé
          </button>
        </div>
      </div>

      {/* Aperçu des couleurs du thème */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🎨 Aperçu des Couleurs</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* TitleBar Background */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">TitleBar Background</h4>
            <div 
              className="w-20 h-20 rounded border-2 border-white"
              style={getThemeStyles('titlebar.background', { backgroundColor: '#202020' })}
            ></div>
            <p className="text-xs text-gray-400 mt-1">{getThemeValue('titlebar.background')}</p>
          </div>

          {/* Texte Principal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Texte Principal</h4>
            <div 
              className="w-20 h-20 rounded border-2 border-white flex items-center justify-center"
              style={getThemeStyles('titlebar.text.primary', { color: '#ffffff' })}
            >
              <span className="text-lg font-bold">T</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{getThemeValue('titlebar.text.primary')}</p>
          </div>

          {/* Logo WhatsApp */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Logo WhatsApp</h4>
            <div 
              className="w-20 h-20 rounded border-2 border-white flex items-center justify-center"
              style={getThemeStyles('titlebar.text.secondary', { color: '#10b981' })}
            >
              <span className="text-lg font-bold">W</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{getThemeValue('titlebar.text.secondary')}</p>
          </div>

          {/* Bouton Fermer */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Bouton Fermer</h4>
            <div 
              className="w-20 h-20 rounded border-2 border-white flex items-center justify-center"
              style={getThemeStyles('titlebar.buttons.background.close', { backgroundColor: '#dc2626' })}
            >
              <span className="text-white text-lg font-bold">X</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{getThemeValue('titlebar.buttons.background.close')}</p>
          </div>
        </div>
      </div>

      {/* Test des variables CSS */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🔧 Variables CSS</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong>--titlebar-bg:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--titlebar-bg') || 'Non définie'}</p>
          <p><strong>--titlebar-text-primary:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--titlebar-text-primary') || 'Non définie'}</p>
          <p><strong>--titlebar-text-secondary:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--titlebar-text-secondary') || 'Non définie'}</p>
          <p><strong>--color-green-500:</strong> {getComputedStyle(document.documentElement).getPropertyValue('--color-green-500') || 'Non définie'}</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">📋 Instructions</h3>
        <div className="text-sm text-white space-y-1">
          <p>1. <strong>Changez de thème</strong> pour voir les couleurs se modifier</p>
          <p>2. <strong>Créez un thème personnalisé</strong> avec des couleurs différentes</p>
          <p>3. <strong>Observez</strong> comment TitleBar s'adapte automatiquement</p>
          <p>4. <strong>Vérifiez</strong> que les variables CSS sont bien appliquées</p>
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
            <p className="text-white font-semibold">Variables CSS</p>
            <p className="text-xs">✅ Appliquées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
