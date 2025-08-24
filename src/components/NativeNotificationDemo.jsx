import React, { useState, useEffect } from 'react';
import { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning,
  showMessageNotification,
  showCallNotification,
  showMediaNotification,
  showStatusNotification,
  isNativeNotificationAvailable
} from '@/utils/nativeNotificationUtils';

export default function NativeNotificationDemo() {
  const [lastNotification, setLastNotification] = useState(null);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Vérifier si Electron est disponible
    setIsElectron(isNativeNotificationAvailable());

    // Écouter les événements de notification
    if (typeof window !== 'undefined' && window.electronAPI) {
      const handleNotificationAction = (event, data) => {
        console.log('Action de notification cliquée:', data);
        setLastNotification({
          type: 'action',
          data,
          timestamp: new Date().toLocaleTimeString()
        });
      };

      const handleNotificationClick = (event, data) => {
        console.log('Notification cliquée:', data);
        setLastNotification({
          type: 'click',
          data,
          timestamp: new Date().toLocaleTimeString()
        });
      };

      const handleNotificationClose = (event, data) => {
        console.log('Notification fermée:', data);
        setLastNotification({
          type: 'close',
          data,
          timestamp: new Date().toLocaleTimeString()
        });
      };

      // Ajouter les écouteurs
      window.electronAPI.onNotificationAction(handleNotificationAction);
      window.electronAPI.onNotificationClick(handleNotificationClick);
      window.electronAPI.onNotificationClose(handleNotificationClose);

      return () => {
        // Nettoyer les écouteurs
        window.electronAPI.onNotificationAction(handleNotificationAction);
        window.electronAPI.onNotificationClick(handleNotificationClick);
        window.electronAPI.onNotificationClose(handleNotificationClose);
      };
    }
  }, []);

  const handleNotification = async (type, title, message, options = {}) => {
    try {
      let result;
      switch (type) {
        case 'success':
          result = await showSuccess(title, message);
          break;
        case 'error':
          result = await showError(title, message);
          break;
        case 'info':
          result = await showInfo(title, message);
          break;
        case 'warning':
          result = await showWarning(title, message);
          break;
        default:
          result = await showInfo(title, message);
      }

      setLastNotification({
        type: 'sent',
        data: { type, title, message, result },
        timestamp: new Date().toLocaleTimeString()
      });

      console.log('Notification envoyée:', { type, title, message, result });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      setLastNotification({
        type: 'error',
        data: { error: error.message },
        timestamp: new Date().toLocaleTimeString()
      });
    }
  };

  const handleSpecialNotification = async (type) => {
    try {
      let result;
      switch (type) {
        case 'message':
          result = await showMessageNotification('John Doe', 'Salut ! Comment ça va ?');
          break;
        case 'call':
          result = await showCallNotification('Jane Smith', 'video');
          break;
        case 'media':
          result = await showMediaNotification('download', 'photo_vacances.jpg');
          break;
        case 'status':
          result = await showStatusNotification('Alice', 'typing');
          break;
        default:
          result = await showInfo('Test', 'Notification spéciale');
      }

      setLastNotification({
        type: 'special',
        data: { type, result },
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification spéciale:', error);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        🔔 Démonstration des Notifications Natives Electron
      </h1>

      {/* Informations sur l'environnement */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-2">Environnement</h2>
        <div className="text-sm text-gray-300 space-y-1">
          <p>Electron: {isElectron ? '✅ Disponible' : '❌ Non disponible'}</p>
          <p>Notifications natives: {isElectron ? '✅ Actives' : '❌ Inactives'}</p>
        </div>
      </div>

      {/* Dernière notification */}
      {lastNotification && (
        <div className="bg-green-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Dernière Notification</h3>
          <div className="text-sm text-white space-y-1">
            <p><strong>Type:</strong> {lastNotification.type}</p>
            <p><strong>Données:</strong> {JSON.stringify(lastNotification.data)}</p>
            <p><strong>Heure:</strong> {lastNotification.timestamp}</p>
          </div>
        </div>
      )}

      {/* Tests des notifications de base */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">📝 Notifications de Base</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            onClick={() => handleNotification('success', 'Succès !', 'Opération réussie avec succès')}
          >
            ✅ Succès
          </button>
          <button
            className="p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => handleNotification('error', 'Erreur !', 'Une erreur est survenue')}
          >
            ❌ Erreur
          </button>
          <button
            className="p-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => handleNotification('info', 'Information', 'Voici une information importante')}
          >
            ℹ️ Information
          </button>
          <button
            className="p-3 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            onClick={() => handleNotification('warning', 'Attention !', 'Attention à cette action')}
          >
            ⚠️ Avertissement
          </button>
        </div>
      </div>

      {/* Tests des notifications spéciales */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">🚀 Notifications Spéciales</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-3 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={() => handleSpecialNotification('message')}
          >
            💬 Nouveau Message
          </button>
          <button
            className="p-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            onClick={() => handleSpecialNotification('call')}
          >
            📹 Appel Vidéo
          </button>
          <button
            className="p-3 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
            onClick={() => handleSpecialNotification('media')}
          >
            📁 Téléchargement
          </button>
          <button
            className="p-3 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            onClick={() => handleSpecialNotification('status')}
          >
            🟢 Statut Utilisateur
          </button>
        </div>
      </div>

      {/* Notifications avec actions */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">⚡ Notifications avec Actions</h3>
        <div className="space-y-2">
          <button
            className="w-full p-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
            onClick={() => handleNotification('info', 'Message Important', 'Cliquez pour répondre', {
              actions: [
                { text: 'Répondre', action: 'reply' },
                { text: 'Marquer comme lu', action: 'mark-read' }
              ],
              timeout: 10000
            })}
          >
            📱 Notification avec Boutons d'Action
          </button>
          <p className="text-xs text-gray-400">
            Cette notification inclut des boutons d'action et un timeout de 10 secondes
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">📋 Instructions</h3>
        <div className="text-sm text-white space-y-1">
          <p>1. <strong>Cliquez</strong> sur les boutons pour tester les différents types de notifications</p>
          <p>2. Les notifications s'affichent dans la <strong>zone de notification du système</strong></p>
          <p>3. <strong>Cliquez</strong> sur les notifications pour les actions</p>
          <p>4. Les notifications avec actions incluent des <strong>boutons cliquables</strong></p>
          <p>5. <strong>Auto-fermeture</strong> selon le timeout configuré</p>
        </div>
      </div>

      {/* État des notifications */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">🔧 État des Notifications</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className={`p-2 rounded text-center ${isElectron ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-white font-semibold">Électron</p>
            <p className="text-xs">{isElectron ? '✅ Actif' : '❌ Inactif'}</p>
          </div>
          <div className={`p-2 rounded text-center ${isElectron ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="text-white font-semibold">Notifications</p>
            <p className="text-xs">{isElectron ? '✅ Natives' : '❌ Navigateur'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
