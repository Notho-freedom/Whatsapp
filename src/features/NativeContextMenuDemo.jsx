'use client';

import React, { useState } from 'react';
import { 
  useMessageContextMenu, 
  useChatContextMenu, 
  useMediaContextMenu, 
  useUserContextMenu,
  useGlobalShortcuts 
} from '@/hooks/useNativeContextMenu';

export default function NativeContextMenuDemo() {
  const [lastAction, setLastAction] = useState(null);
  const [lastShortcut, setLastShortcut] = useState(null);

  // Gestionnaire d'actions pour tous les menus
  const handleAction = (actionId, data) => {
    console.log('Action exécutée:', actionId, data);
    setLastAction({ actionId, data, timestamp: new Date().toLocaleTimeString() });
    
    // Traiter les actions spécifiques
    switch (actionId) {
      case 'reply':
        console.log('Répondre au message');
        break;
      case 'forward':
        console.log('Transférer le message');
        break;
      case 'copy':
        console.log('Copier le texte');
        break;
      case 'pin':
        console.log('Épingler l\'élément');
        break;
      case 'delete':
        console.log('Supprimer l\'élément');
        break;
      default:
        console.log('Action non reconnue:', actionId);
    }
  };

  // Hooks pour les différents types de menus contextuels
  const messageMenu = useMessageContextMenu(handleAction);
  const chatMenu = useChatContextMenu(handleAction);
  const mediaMenu = useMediaContextMenu(handleAction);
  const userMenu = useUserContextMenu(handleAction);
  const globalShortcuts = useGlobalShortcuts();

  // Écouter les raccourcis clavier globaux
  React.useEffect(() => {
    const handleGlobalShortcut = (event) => {
      setLastShortcut({ 
        shortcut: event.detail.shortcut, 
        timestamp: new Date().toLocaleTimeString() 
      });
    };

    window.addEventListener('global-keyboard-shortcut', handleGlobalShortcut);
    
    return () => {
      window.removeEventListener('global-keyboard-shortcut', handleGlobalShortcut);
    };
  }, []);

  // Écouter les actions de menu contextuel
  React.useEffect(() => {
    const handleContextMenuAction = (event) => {
      console.log('Action de menu contextuel reçue:', event.detail);
    };

    window.addEventListener('native-context-menu-action', handleContextMenuAction);
    
    return () => {
      window.removeEventListener('native-context-menu-action', handleContextMenuAction);
    };
  }, []);

  return (
    <div className="p-6 space-y-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        🖱️ Démonstration des Menus Contextuels Natifs
      </h1>

      {/* Informations sur l'environnement */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Environnement</h2>
        <div className="text-sm text-gray-300 space-y-1">
          <p>Electron: {typeof window !== 'undefined' && window.electronAPI ? '✅ Disponible' : '❌ Non disponible'}</p>
          <p>Plateforme: {typeof window !== 'undefined' && window.electronEnv ? window.electronEnv.platform : 'Inconnue'}</p>
          <p>Version: {typeof window !== 'undefined' && window.electronEnv ? window.electronEnv.version : 'Inconnue'}</p>
        </div>
      </div>

      {/* Dernière action exécutée */}
      {lastAction && (
        <div className="bg-green-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Dernière Action</h3>
          <div className="text-sm text-white">
            <p><strong>Action:</strong> {lastAction.actionId}</p>
            <p><strong>Données:</strong> {JSON.stringify(lastAction.data)}</p>
            <p><strong>Heure:</strong> {lastAction.timestamp}</p>
          </div>
        </div>
      )}

      {/* Dernier raccourci clavier */}
      {lastShortcut && (
        <div className="bg-blue-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Dernier Raccourci</h3>
          <div className="text-sm text-white">
            <p><strong>Raccourci:</strong> {lastShortcut.shortcut}</p>
            <p><strong>Heure:</strong> {lastShortcut.timestamp}</p>
          </div>
        </div>
      )}

      {/* Tests des menus contextuels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Menu contextuel de message */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">💬 Menu Message</h3>
          <div className="space-y-2">
            <button
              className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onContextMenu={(e) => messageMenu.handleContextMenu(e, { 
                messageId: 'msg-123', 
                text: 'Exemple de message' 
              })}
            >
              Clic droit pour menu message
            </button>
            <p className="text-xs text-gray-400">
              Inclut: Répondre, Transférer, Copier, Épingler, Supprimer
            </p>
          </div>
        </div>

        {/* Menu contextuel de chat */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">💭 Menu Chat</h3>
          <div className="space-y-2">
            <button
              className="w-full p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              onContextMenu={(e) => chatMenu.handleContextMenu(e, { 
                chatId: 'chat-456', 
                name: 'Conversation Test' 
              })}
            >
              Clic droit pour menu chat
            </button>
            <p className="text-xs text-gray-400">
              Inclut: Nouveau message, Recherche, Épingler, Archiver
            </p>
          </div>
        </div>

        {/* Menu contextuel de média */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">🖼️ Menu Média</h3>
          <div className="space-y-2">
            <button
              className="w-full p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              onContextMenu={(e) => mediaMenu.handleContextMenu(e, { 
                mediaId: 'media-789', 
                url: 'https://example.com/image.jpg',
                type: 'image' 
              })}
            >
              Clic droit pour menu média
            </button>
            <p className="text-xs text-gray-400">
              Inclut: Ouvrir, Télécharger, Partager, Copier le lien
            </p>
          </div>
        </div>

        {/* Menu contextuel d'utilisateur */}
        <div className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">👤 Menu Utilisateur</h3>
          <div className="space-y-2">
            <button
              className="w-full p-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              onContextMenu={(e) => userMenu.handleContextMenu(e, { 
                userId: 'user-101', 
                name: 'John Doe' 
              })}
            >
              Clic droit pour menu utilisateur
            </button>
            <p className="text-xs text-gray-400">
              Inclut: Profil, Message, Appel, Ajouter aux contacts
            </p>
          </div>
        </div>
      </div>

      {/* Raccourcis clavier */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">⌨️ Raccourcis Clavier</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-600 p-2 rounded text-center">
            <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl+N</kbd>
            <p className="text-gray-300 mt-1">Nouveau chat</p>
          </div>
          <div className="bg-gray-600 p-2 rounded text-center">
            <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl+F</kbd>
            <p className="text-gray-300 mt-1">Recherche</p>
          </div>
          <div className="bg-gray-600 p-2 rounded text-center">
            <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl+R</kbd>
            <p className="text-gray-300 mt-1">Répondre</p>
          </div>
          <div className="bg-gray-600 p-2 rounded text-center">
            <kbd className="bg-gray-800 px-2 py-1 rounded">Ctrl+S</kbd>
            <p className="text-gray-300 mt-1">Sauvegarder</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">📋 Instructions</h3>
        <div className="text-sm text-white space-y-1">
          <p>1. <strong>Clic droit</strong> sur les boutons pour afficher les menus contextuels natifs</p>
          <p>2. Les menus s'adaptent automatiquement à la plateforme (Windows, macOS, Linux)</p>
          <p>3. Utilisez les <strong>raccourcis clavier</strong> pour des actions rapides</p>
          <p>4. Les actions sont traitées côté Electron pour une meilleure performance</p>
          <p>5. Support complet des <strong>gestes tactiles</strong> sur mobile</p>
        </div>
      </div>

      {/* État des hooks */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">🔧 État des Hooks</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className={`p-2 rounded text-center ${messageMenu.isElectron ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-white font-semibold">Message</p>
            <p className="text-xs">{messageMenu.isElectron ? '✅ Actif' : '❌ Inactif'}</p>
          </div>
          <div className={`p-2 rounded text-center ${chatMenu.isElectron ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-white font-semibold">Chat</p>
            <p className="text-xs">{chatMenu.isElectron ? '✅ Actif' : '❌ Inactif'}</p>
          </div>
          <div className={`p-2 rounded text-center ${mediaMenu.isElectron ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-white font-semibold">Média</p>
            <p className="text-xs">{mediaMenu.isElectron ? '✅ Actif' : '❌ Inactif'}</p>
          </div>
          <div className={`p-2 rounded text-center ${userMenu.isElectron ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-white font-semibold">Utilisateur</p>
            <p className="text-xs">{userMenu.isElectron ? '✅ Actif' : '❌ Inactif'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
