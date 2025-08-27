'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context';
import { FaDatabase, FaTrash, FaChartBar, FaMemory } from 'react-icons/fa';

export default function CacheStats() {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { getCacheStats, clearCache } = useAppContext();

  useEffect(() => {
    const updateStats = () => {
      const cacheStats = getCacheStats();
      setStats(cacheStats);
    };

    // Mettre à jour les stats toutes les 5 secondes
    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [getCacheStats]);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getHitRateColor = (hitRate) => {
    if (hitRate > 0.7) return 'text-green-400';
    if (hitRate > 0.4) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleClearCache = () => {
    clearCache();
    setStats(getCacheStats());
  };

  if (!stats) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Bouton pour afficher/masquer les stats */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-[#2c2c2c] hover:bg-[#3a3f42] text-white p-2 rounded-full shadow-lg transition-colors"
        title="Statistiques du cache"
      >
        <FaDatabase size={16} />
      </button>

      {/* Panneau des statistiques */}
      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-[#2c2c2c] border border-[#3a3f42] rounded-lg shadow-2xl p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <FaChartBar size={14} />
              Statistiques du Cache
            </h3>
            <button
              onClick={handleClearCache}
              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
              title="Vider le cache"
            >
              <FaTrash size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Taille du cache */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs">Taille:</span>
              <span className="text-white text-xs font-medium">
                {stats.size} / {stats.maxSize}
              </span>
            </div>

            {/* Taux de réussite */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs">Taux de réussite:</span>
              <span className={`text-xs font-medium ${getHitRateColor(stats.hitRate)}`}>
                {(stats.hitRate * 100).toFixed(1)}%
              </span>
            </div>

            {/* Utilisation mémoire */}
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-xs flex items-center gap-1">
                <FaMemory size={10} />
                Mémoire:
              </span>
              <span className="text-white text-xs font-medium">
                {formatBytes(stats.memoryUsage)}
              </span>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-[#1f2c34] rounded-full h-2">
              <div
                className="bg-[#00a884] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.size / stats.maxSize) * 100}%` }}
              />
            </div>

            {/* Indicateurs de performance */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-[#1f2c34] rounded">
                <div className="text-green-400 font-medium">
                  {stats.size > 0 ? '✅' : '❌'}
                </div>
                <div className="text-gray-400">Cache actif</div>
              </div>
              <div className="text-center p-2 bg-[#1f2c34] rounded">
                <div className={`font-medium ${stats.hitRate > 0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {stats.hitRate > 0.5 ? '🚀' : '🐌'}
                </div>
                <div className="text-gray-400">Performance</div>
              </div>
            </div>

            {/* Conseils */}
            {stats.size >= stats.maxSize * 0.8 && (
              <div className="text-yellow-400 text-xs p-2 bg-yellow-400/10 rounded border border-yellow-400/20">
                ⚠️ Cache presque plein. Considérez le vider.
              </div>
            )}

            {stats.hitRate < 0.3 && (
              <div className="text-blue-400 text-xs p-2 bg-blue-400/10 rounded border border-blue-400/20">
                💡 Taux de réussite faible. Le cache pourrait être optimisé.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
