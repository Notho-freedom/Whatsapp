'use client';

import { useState, useEffect } from 'react';
import avatarCacheService from '@/utils/avatarCacheService';

/**
 * Composant pour afficher les statistiques du cache des avatars
 * Utile pour le débogage et le monitoring
 */
export default function AvatarCacheStats({ className = '' }) {
  const [stats, setStats] = useState({
    cacheSize: 0,
    failedUrls: 0,
    retryQueue: 0,
    memoryUsage: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(avatarCacheService.getCacheStats());
    };

    // Mettre à jour les stats immédiatement
    updateStats();

    // Mettre à jour toutes les 5 secondes
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearCache = () => {
    avatarCacheService.clearCache();
    setStats(avatarCacheService.getCacheStats());
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors ${className}`}
        title="Afficher les statistiques du cache des avatars"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[300px] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cache des Avatars
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearCache}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
            title="Vider le cache"
          >
            Vider
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Avatars en cache:</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.cacheSize}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">URLs en échec:</span>
          <span className="font-medium text-red-600">{stats.failedUrls}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">En attente de retry:</span>
          <span className="font-medium text-yellow-600">{stats.retryQueue}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Mémoire utilisée:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatBytes(stats.memoryUsage)}</span>
        </div>
      </div>

      {/* Indicateur de santé du cache */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">État du cache:</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              stats.failedUrls === 0 ? 'bg-green-500' : 
              stats.failedUrls < 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stats.failedUrls === 0 ? 'Optimal' : 
               stats.failedUrls < 5 ? 'Attention' : 'Problème'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
