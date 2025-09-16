'use client';

import { useState, useEffect, useRef } from 'react';
import avatarCacheService from '@/utils/avatarCacheService';

/**
 * Composant Avatar avec gestion du cache et fallback automatique
 * Gère les erreurs 429 (Too Many Requests) et autres erreurs de chargement
 */
export default function Avatar({ 
  src, 
  alt = 'Avatar', 
  name = 'User',
  size = 40,
  className = '',
  fallbackClassName = '',
  showFallback = true,
  onLoad,
  onError,
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!src) {
      setImageSrc(avatarCacheService.generateFallbackAvatar(name, size));
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const loadAvatar = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const dataUrl = await avatarCacheService.loadAvatar(src, name, { size });
        
        if (mountedRef.current) {
          setImageSrc(dataUrl);
          setIsLoading(false);
          onLoad?.(dataUrl);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.warn(`Erreur lors du chargement de l'avatar ${src}:`, error);
          setHasError(true);
          setIsLoading(false);
          onError?.(error);
          
          // Générer un fallback
          const fallbackSrc = avatarCacheService.generateFallbackAvatar(name, size);
          setImageSrc(fallbackSrc);
        }
      }
    };

    loadAvatar();
  }, [src, name, size, onLoad, onError]);

  // Fonction pour réessayer le chargement
  const handleRetry = async () => {
    if (retryCount >= 3) return;
    
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
    
    try {
      // Nettoyer l'échec précédent pour permettre un nouveau retry
      avatarCacheService.clearFailure(src);
      
      const dataUrl = await avatarCacheService.loadAvatar(src, name, { size });
      
      if (mountedRef.current) {
        setImageSrc(dataUrl);
        setIsLoading(false);
        setHasError(false);
        onLoad?.(dataUrl);
      }
    } catch (error) {
      if (mountedRef.current) {
        setHasError(true);
        setIsLoading(false);
        onError?.(error);
      }
    }
  };

  const sizeClasses = {
    24: 'w-6 h-6',
    32: 'w-8 h-8',
    40: 'w-10 h-10',
    48: 'w-12 h-12',
    56: 'w-14 h-14',
    64: 'w-16 h-16',
    80: 'w-20 h-20',
    96: 'w-24 h-24'
  };

  const sizeClass = sizeClasses[size] || `w-${size/4} h-${size/4}`;

  return (
    <div className={`relative ${sizeClass} ${className}`} {...props}>
      {isLoading && (
        <div className={`absolute inset-0 ${sizeClass} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex items-center justify-center`}>
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
        </div>
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${sizeClass} rounded-full object-cover transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${fallbackClassName}`}
          onLoad={() => {
            if (mountedRef.current) {
              setIsLoading(false);
            }
          }}
          onError={() => {
            if (mountedRef.current) {
              setHasError(true);
              setIsLoading(false);
              onError?.(new Error('Image load failed'));
            }
          }}
        />
      )}
      
      {/* Indicateur d'erreur avec bouton de retry */}
      {hasError && showFallback && retryCount < 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleRetry}
            className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center group"
            title="Cliquer pour réessayer"
          >
            <svg 
              className="w-4 h-4 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
          </button>
        </div>
      )}
      
      {/* Indicateur d'erreur permanente */}
      {hasError && retryCount >= 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Composant Avatar avec statut (en ligne, hors ligne, etc.)
 */
export function AvatarWithStatus({ 
  src, 
  alt = 'Avatar', 
  name = 'User',
  size = 40,
  status = 'offline',
  className = '',
  ...props 
}) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    invisible: 'bg-gray-600'
  };

  const statusSizes = {
    24: 'w-2 h-2',
    32: 'w-2.5 h-2.5',
    40: 'w-3 h-3',
    48: 'w-3.5 h-3.5',
    56: 'w-4 h-4',
    64: 'w-4 h-4',
    80: 'w-5 h-5',
    96: 'w-6 h-6'
  };

  const statusSize = statusSizes[size] || 'w-3 h-3';
  const statusColor = statusColors[status] || statusColors.offline;

  return (
    <div className={`relative ${className}`} {...props}>
      <Avatar 
        src={src} 
        alt={alt} 
        name={name} 
        size={size}
      />
      
      {/* Indicateur de statut */}
      <div className={`absolute bottom-0 right-0 ${statusSize} ${statusColor} rounded-full border-2 border-white dark:border-gray-800`}></div>
    </div>
  );
}

/**
 * Composant Avatar de groupe (plusieurs avatars superposés)
 */
export function GroupAvatar({ 
  avatars = [], 
  maxVisible = 3,
  size = 40,
  className = '',
  ...props 
}) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;

  return (
    <div className={`flex ${className}`} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div 
          key={index}
          className={`relative ${index > 0 ? '-ml-2' : ''}`}
          style={{ zIndex: maxVisible - index }}
        >
          <Avatar 
            src={avatar.src} 
            alt={avatar.alt || `Avatar ${index + 1}`} 
            name={avatar.name || 'User'}
            size={size}
            className="border-2 border-white dark:border-gray-800"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className={`relative -ml-2 border-2 border-white dark:border-gray-800 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300`}
          style={{ 
            width: size, 
            height: size,
            zIndex: 0
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
