'use client';

import { FaPlay, FaPause, FaMicrophone, FaDownload } from 'react-icons/fa';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAudioEventManager } from '@/hooks';
import { useMediaContextMenu } from '@/hooks';

/**
 * Drop-in pour un rendu "voice message" quasi-identique à WhatsApp Desktop
 * - Forme d'onde cliquable + seek
 * - Bouton lecture/pause en pastille
 * - Temps écoulé / durée
 * - Vitesse (1x / 1.5x / 2x) comme WA
 * - Téléchargement du fichier
 * - Stop auto des autres pistes via useAudioEventManager
 * - Accessibilité + mobile-friendly
 * - Utilise de vrais avatars d'utilisateurs
 */

function MediaGroup({
  media = [],
  isMe = false,
  isMobile = false,
  messageId,
  onAudioStateChange,
  userInfo = null,
}) {
  const { updateAudioState, getAudioState, stopAllAudio } =
    useAudioEventManager();

  // Hook pour les menus contextuels natifs d'Electron
  const nativeMediaMenu = useMediaContextMenu((actionId, data) => {
    console.log('Action de menu contextuel de média:', actionId, data);
    // Ici vous pouvez ajouter la logique pour les actions de média
  });

  const handleAudioStart = useCallback(
    audioItem => {
      if (audioItem.type === 'audio') {
        stopAllAudio();
        updateAudioState(messageId, { isPlaying: true, currentTime: 0 });
        onAudioStateChange?.({ isPlaying: true, currentTime: 0 });
      }
    },
    [messageId, stopAllAudio, updateAudioState, onAudioStateChange]
  );

  if (!media.length) return null;

  const normalizedMedia = media
    .map(item => normalizeMedia(item))
    .filter(item => !!item);

  const isSingleMedia = normalizedMedia.length === 1;

  // Meilleure gestion de la grille
  const MAX_IMAGES_TO_SHOW = 4;
  const displayMedia = normalizedMedia.slice(0, MAX_IMAGES_TO_SHOW);
  const remainingCount = normalizedMedia.length - MAX_IMAGES_TO_SHOW;

  // Déterminer le nombre de colonnes selon le nombre d'images
  let gridCols = '';
  if (!isSingleMedia) {
    if (displayMedia.length === 2) {
      gridCols = 'grid-cols-2';
    } else if (displayMedia.length <= 4) {
      gridCols = 'grid-cols-2';
    } else {
      gridCols = 'grid-cols-3';
    }
  }

  return (
    <div className={`${!isSingleMedia && `grid gap-[2px] ${gridCols}`}`}>
      {displayMedia.map((item, idx) => {
        if (item.mediaType === 'image')
          return (
            <ImageItem
              key={idx}
              item={item}
              isSingleMedia={isSingleMedia}
              isMobile={isMobile}
              totalCount={displayMedia.length}
              isLast={idx === displayMedia.length - 1 && remainingCount > 0}
              remainingCount={remainingCount}
            />
          );
        if (item.mediaType === 'video')
          return (
            <VideoItem
              key={idx}
              item={item}
              isSingleMedia={isSingleMedia}
              isMobile={isMobile}
              totalCount={displayMedia.length}
            />
          );
        if (item.mediaType === 'audio')
          return (
            <AudioMessage
              key={idx}
              audio={item}
              isMe={isMe}
              isMobile={isMobile}
              messageId={messageId}
              userInfo={userInfo}
              onAudioStart={() => handleAudioStart(item)}
              onAudioStateChange={onAudioStateChange}
            />
          );
        return null;
      })}
    </div>
  );
}

// Normalise les payloads issus de Firestore/attachments pour garantir un rendu visuel
function normalizeMedia(item) {
  if (!item) return null;

  const rawType = (item.type || item.mediaType || '').toLowerCase();
  let mediaType = rawType;

  if (['image', 'images', 'photo', 'picture', 'img'].includes(rawType))
    mediaType = 'image';
  else if (['video', 'videos'].includes(rawType)) mediaType = 'video';
  else if (['audio', 'audios', 'voice'].includes(rawType)) mediaType = 'audio';

  const url =
    item.url || item.file_url || item.downloadURL || item.fileUrl || item.path;
  if (!url && mediaType !== 'audio') return null; // rien à afficher

  return {
    ...item,
    mediaType,
    url,
    duration: item.duration || item.metadata?.duration,
    waveform: item.waveform || item.metadata?.waveform,
    name: item.original_name || item.name || item.filename,
  };
}

function ImageItem({
  item,
  isSingleMedia,
  isMobile,
  totalCount,
  isLast,
  remainingCount,
}) {
  return (
    <div
      className="relative overflow-hidden bg-[#0b0e11]"
      onContextMenu={e => {
        // Menu contextuel natif Electron pour les images
        if (window.electronAPI) {
          window.electronAPI.showContextMenu('media', [], e.clientX, e.clientY);
        }
      }}
    >
      <img
        src={item.url}
        className={`w-full object-cover cursor-pointer ${
          isSingleMedia
            ? (isMobile ? 'max-h-[250px]' : 'max-h-[330px]') +
              ' rounded-[7.5px]'
            : isMobile
            ? 'h-[80px]'
            : 'h-[120px]'
        }`}
        alt=""
      />

      {/* Afficher "+N" pour les images restantes */}
      {isLast && remainingCount > 0 && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[7.5px]">
          <span className="text-white text-lg sm:text-2xl font-bold">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}

function VideoItem({ item, isSingleMedia, isMobile, totalCount }) {
  return (
    <div
      className="relative overflow-hidden bg-[#0b0e11] group cursor-pointer"
      onContextMenu={e => {
        // Menu contextuel natif Electron pour les vidéos
        if (window.electronAPI) {
          window.electronAPI.showContextMenu('media', [], e.clientX, e.clientY);
        }
      }}
    >
      <video
        src={item.url}
        className={`w-full object-cover ${
          isSingleMedia
            ? (isMobile ? 'max-h-[250px]' : 'max-h-[330px]') +
              ' rounded-[7.5px]'
            : isMobile
            ? 'h-[80px]'
            : 'h-[120px]'
        }`}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`${
            isMobile ? 'w-[35px] h-[35px]' : 'w-[40px] h-[40px]'
          } rounded-full bg-[rgba(11,20,26,0.8)] flex items-center justify-center group-hover:scale-110 transition-transform`}
        >
          <FaPlay size={isMobile ? 12 : 14} className="text-white ml-1" />
        </div>
      </div>
      {item.duration && (
        <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[rgba(11,20,26,0.8)] rounded text-[10px] sm:text-[11px] text-white">
          {item.duration}
        </div>
      )}
    </div>
  );
}

function AudioMessage({
  audio,
  isMe,
  isMobile,
  messageId,
  onAudioStart,
  onAudioStateChange,
  userInfo,
}) {
  const { updateAudioState, getAudioState } = useAudioEventManager();
  const audioRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0); // seconds
  const [rate, setRate] = useState(1);
  const [hoverX, setHoverX] = useState(null);

  const waveformBars = useMemo(() => {
    // Utiliser la forme d'onde fournie ou générer une courbe stable
    if (
      audio.waveform &&
      Array.isArray(audio.waveform) &&
      audio.waveform.length
    )
      return audio.waveform;
    const len = isMobile ? 25 : 35;
    // Génération pseudo-aléatoire déterministe selon l'URL
    const seed = (audio.url || '')
      .split('')
      .reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1e9, 7);
    let x = seed;
    const arr = [];
    for (let i = 0; i < len; i++) {
      x = (x * 1664525 + 1013904223) % 4294967296;
      const v = 0.3 + (x / 4294967296) * 0.7; // 0.3..1
      arr.push(v);
    }
    return arr;
  }, [audio.waveform, audio.url, isMobile]);

  // Couleurs WhatsApp-like
  const accent = '#00a884';

  const fmt = useCallback(sec => {
    if (!isFinite(sec)) return '0:00';
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
  }, []);

  // Charger durée + sync rate
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => {
      setDuration(el.duration || 0);
      el.playbackRate = rate;
    };
    const onTime = () => {
      if (!duration || !el.duration) return;
      setProgress(el.currentTime / el.duration);
    };
    const onEnd = () => {
      setIsPlaying(false);
      setProgress(0);
      updateAudioState(messageId, { isPlaying: false, currentTime: 0 });
      onAudioStateChange?.({ isPlaying: false, currentTime: 0 });
    };
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnd);
    };
  }, [duration, rate, messageId, onAudioStateChange, updateAudioState]);

  // Synchroniser avec l'état global (si une autre piste démarre)
  useEffect(() => {
    const g = getAudioState(messageId) || {};
    if (g.isPlaying !== undefined && g.isPlaying !== isPlaying)
      setIsPlaying(g.isPlaying);
  }, [getAudioState, messageId, isPlaying]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) {
      onAudioStart?.();
      el.playbackRate = rate;
      el.play().catch(() => setIsPlaying(false));
      updateAudioState(messageId, {
        isPlaying: true,
        currentTime: el.currentTime,
      });
      onAudioStateChange?.({ isPlaying: true, currentTime: el.currentTime });
    } else {
      el.pause();
      updateAudioState(messageId, {
        isPlaying: false,
        currentTime: el.currentTime,
      });
      onAudioStateChange?.({ isPlaying: false, currentTime: el.currentTime });
    }
  }, [
    isPlaying,
    rate,
    messageId,
    onAudioStart,
    onAudioStateChange,
    updateAudioState,
  ]);

  const cycleRate = useCallback(() => {
    const next = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1;
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, [rate]);

  const onWaveClick = useCallback(e => {
    const el = audioRef.current;
    const box = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    if (el && isFinite(el.duration)) {
      el.currentTime = ratio * el.duration;
      setProgress(ratio);
    }
  }, []);

  const onWaveMove = useCallback(e => {
    const box = e.currentTarget.getBoundingClientRect();
    setHoverX(Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)));
  }, []);

  const onWaveLeave = useCallback(() => setHoverX(null), []);

  const playedBars = Math.round(progress * waveformBars.length);
  const hoverBars =
    hoverX != null ? Math.round(hoverX * waveformBars.length) : null;

  const timeLabel = useMemo(() => {
    const el = audioRef.current;
    const d =
      duration || (audio.duration && parseTimeString(audio.duration)) || 0;
    const cur = el ? el.currentTime : progress * d;
    return `${fmt(cur)} / ${fmt(d)}`;
  }, [duration, progress, fmt, audio.duration]);

  // Déterminer l'avatar à utiliser
  const getAvatarSrc = () => {
    // Utiliser l'avatar réel passé par userInfo, sinon fallback généré
    if (userInfo?.avatar) {
      return userInfo.avatar;
    }
    // Fallback si pas d'avatar réel
    if (isMe) {
      return `https://ui-avatars.com/api/?name=Me&background=005c4b&color=fff&size=40`;
    } else {
      return `https://ui-avatars.com/api/?name=${
        userInfo?.name || 'Contact'
      }&background=6a7175&color=fff&size=40`;
    }
  };

  return (
    <div
      className={`flex items-end gap-2 -mb-2 w-[320px] justify-between ${
        isMe ? 'flex-row' : 'flex-row-reverse'
      }`}
    >
      <audio ref={audioRef} src={audio.url} preload="metadata" />

      {/* Avatar avec micro */}
      <div className="relative flex-shrink-0">
        <div
          className={`${
            isMobile ? 'w-[32px] h-[32px]' : 'w-[36px] h-[36px]'
          } rounded-full overflow-hidden`}
        >
          <img
            src={getAvatarSrc()}
            alt={userInfo?.name || (isMe ? 'Me' : 'Contact')}
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className={`absolute -bottom-1 -right-1 ${
            isMobile ? 'w-[12px] h-[12px]' : 'w-[14px] h-[14px]'
          } rounded-full bg-[#00a884] flex items-center justify-center border-2 border-white`}
        >
          <FaMicrophone size={isMobile ? 4 : 5} className="text-white" />
        </div>
      </div>

      {/* Bulle */}
      <div
        className={`rounded-lg py-2 w-full ${
          isMobile ? 'max-w-[260px]' : ''
        } relative pb-3`}
      >
        <div className="flex items-center gap-3">
          {/* Pastille lecture/pause */}
          <button
            className="flex-shrink-0 w-[20px] h-[20px] rounded-full flex items-center justify-center hover:opacity-90 bg-transparent"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Lire'}
          >
            {isPlaying ? (
              <FaPause size={20} className="text-gray-200" />
            ) : (
              <FaPlay size={20} className="text-gray-200" />
            )}
          </button>

          {/* Waveform cliquable */}
          <div
            ref={containerRef}
            className="flex w-full items-center gap-[1px] h-5 flex-1 relative cursor-pointer select-none"
            onClick={onWaveClick}
            onMouseMove={onWaveMove}
            onMouseLeave={onWaveLeave}
          >
            {waveformBars.map((h, i) => {
              const isPlayed = i < playedBars;
              const isHover = hoverBars != null && i <= hoverBars;
              return (
                <div
                  key={i}
                  className={`flex-1 min-w-[1px] rounded-full transition-all duration-100 ${
                    isHover
                      ? 'bg-white'
                      : isPlayed
                      ? 'bg-[#00a884]'
                      : 'bg-white/40'
                  }`}
                  style={{
                    height: `${h * 16}px`,
                    opacity: isHover ? 1 : isPlayed ? 0.9 : 0.5,
                  }}
                />
              );
            })}

            {/* Indicateur rond */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow"
              style={{
                left: `${progress * 100}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: accent,
              }}
            />
          </div>

          {/* Vitesse */}
          <button
            onClick={cycleRate}
            className="text-white/80 text-xs px-2 py-1 rounded hover:bg-white/10"
            aria-label={`Vitesse ${rate}x`}
          >
            {rate}x
          </button>

          {/* Download */}
          {audio.url && (
            <a
              href={audio.url}
              download
              className="text-white/80 p-2 rounded hover:bg-white/10 hidden"
              aria-label="Télécharger l'audio"
            >
              <FaDownload size={12} />
            </a>
          )}
        </div>
        <span className="text-[10px] text-white/70 min-w-[55px] left-8 absolute -bottom-3">
          {timeLabel}
        </span>
      </div>
    </div>
  );
}

function parseTimeString(s) {
  // '0:14' -> 14
  if (!s) return 0;
  const [m, sec] = String(s)
    .split(':')
    .map(x => parseInt(x, 10) || 0);
  return m * 60 + sec;
}

export default MediaGroup;
export { AudioMessage };
