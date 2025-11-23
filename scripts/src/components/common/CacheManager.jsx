'use client';

/**
 * Composant de gestion du cache local
 * Affiche les statistiques et permet la gestion manuelle du cache
 */

import React, { useState } from 'react';
import { useLocalCache } from '@/hooks';

export default function CacheManager() {
  const {
    cacheStats,
    clearCache,
    exportCache,
    preloadData,
    updateCacheStats
  } = useLocalCache();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  // Formater la taille en bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formater le pourcentage
  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
  };

  // Vider le cache
  const handleClearCache = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider tout le cache local ? Cette action ne peut pas être annulée.')) {
      setIsClearing(true);
      try {
        await clearCache();
        updateCacheStats();
        console.log('✅ Cache vidé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors du vidage du cache:', error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  // Précharger les données
  const handlePreloadData = async () => {
    setIsPreloading(true);
    try {
      await preloadData();
      updateCacheStats();
      console.log('✅ Préchargement terminé');
    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  // Exporter le cache
  const handleExportCache = () => {
    try {
      const cacheData = exportCache();
      const blob = new Blob([JSON.stringify(cacheData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whatsapp-cache-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('📁 Cache exporté avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'export du cache:', error);
    }
  };

  if (!cacheStats) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Gestionnaire de Cache
          </h3>
          <button
            onClick={updateCacheStats}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Actualiser
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Chargement des statistiques du cache...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      {/* En-tête */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            📦 Gestionnaire de Cache Local
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={updateCacheStats}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              🔄 Actualiser
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            >
              {isExpanded ? '📉 Réduire' : '📊 Détailler'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Conversations</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {cacheStats.conversations.count}
                </p>
              </div>
              <div className="text-blue-500 text-2xl">💬</div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {formatBytes(cacheStats.conversations.memory)}
            </p>
          </div>

          {/* Messages */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Messages</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {cacheStats.messages.totalMessages}
                </p>
              </div>
              <div className="text-green-500 text-2xl">📝</div>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {cacheStats.messages.count} conversations
            </p>
          </div>

          {/* Utilisateurs */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Utilisateurs</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {cacheStats.users.count}
                </p>
              </div>
              <div className="text-purple-500 text-2xl">👥</div>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {formatBytes(cacheStats.users.memory)}
            </p>
          </div>
        </div>

        {/* Utilisation mémoire totale */}
        <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Utilisation mémoire totale
            </span>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {formatBytes(cacheStats.totalMemory)}
            </span>
          </div>
        </div>
      </div>

      {/* Détails (si étendu) */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Détails du Cache
          </h4>
          
          <div className="space-y-3">
            {/* Conversations détaillées */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversations en Cache
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Nombre total: {cacheStats.conversations.count}</p>
                <p>• Mémoire utilisée: {formatBytes(cacheStats.conversations.memory)}</p>
                <p>• Limite: 100 conversations</p>
              </div>
            </div>

            {/* Messages détaillés */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Messages en Cache
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Conversations avec messages: {cacheStats.messages.count}</p>
                <p>• Total des messages: {cacheStats.messages.totalMessages}</p>
                <p>• Mémoire utilisée: {formatBytes(cacheStats.messages.memory)}</p>
                <p>• Limite par conversation: 1000 messages</p>
              </div>
            </div>

            {/* Utilisateurs détaillés */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Utilisateurs en Cache
              </h5>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>• Nombre total: {cacheStats.users.count}</p>
                <p>• Mémoire utilisée: {formatBytes(cacheStats.users.memory)}</p>
                <p>• Limite: 200 utilisateurs</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePreloadData}
            disabled={isPreloading}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isPreloading ? '⏳ Préchargement...' : '🚀 Précharger'}
          </button>
          
          <button
            onClick={handleExportCache}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            📁 Exporter
          </button>
          
          <button
            onClick={handleClearCache}
            disabled={isClearing}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isClearing ? '⏳ Suppression...' : '🗑️ Vider Cache'}
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>💡 Le cache local améliore les performances en gardant les données fréquemment utilisées en mémoire.</p>
          <p>🔄 Les données sont automatiquement synchronisées et nettoyées selon leur durée de vie.</p>
        </div>
      </div>
    </div>
  );
}
