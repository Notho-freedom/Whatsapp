import { FaPlay, FaPause, FaMicrophone } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import { useAudioEventManager } from '@/hooks/useEventManager';

export default function MediaGroup({ media = [], isMe = false, isMobile = false, messageId, onAudioStateChange }) {
  const { updateAudioState, getAudioState, stopAllAudio } = useAudioEventManager();
  
  if (!media.length) return null;

  const isSingleMedia = media.length === 1;
  const gridCols = media.length === 2 ? 'grid-cols-2' : media.length >= 3 ? 'grid-cols-3' : '';

  // Arrêter tous les autres audios quand on commence à en lire un
  const handleAudioStart = useCallback((audioItem) => {
    if (audioItem.type === 'audio') {
      stopAllAudio();
      updateAudioState(messageId, { isPlaying: true, currentTime: 0 });
      onAudioStateChange?.({ isPlaying: true, currentTime: 0 });
    }
  }, [messageId, stopAllAudio, updateAudioState, onAudioStateChange]);

  return (
    <div className={`${!isSingleMedia && `grid gap-[2px] ${gridCols}`}`}>
      {media.map((item, idx) => {
        if (item.type === 'image') {
          return (
            <div key={idx} className="relative overflow-hidden bg-[#0b0e11]">
              <img 
                src={item.url} 
                className={`w-full object-cover cursor-pointer ${
                  isSingleMedia 
                    ? (isMobile ? 'max-h-[250px]' : 'max-h-[330px]') + ' rounded-[7.5px]'
                    : isMobile ? 'h-[80px]' : 'h-[120px]'
                }`}
                alt=""
              />
            </div>
          );
        }
        
        if (item.type === 'video') {
          return (
            <div key={idx} className="relative overflow-hidden bg-[#0b0e11] group cursor-pointer">
              <video 
                src={item.url} 
                className={`w-full object-cover ${
                  isSingleMedia 
                    ? (isMobile ? 'max-h-[250px]' : 'max-h-[330px]') + ' rounded-[7.5px]'
                    : isMobile ? 'h-[80px]' : 'h-[120px]'
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`${isMobile ? 'w-[35px] h-[35px]' : 'w-[40px] h-[40px]'} rounded-full bg-[rgba(11,20,26,0.8)] flex items-center justify-center group-hover:scale-110 transition-transform`}>
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
        
        if (item.type === 'audio') {
          return (
            <AudioMessage 
              key={idx} 
              audio={item} 
              isMe={isMe} 
              isMobile={isMobile}
              messageId={messageId}
              onAudioStart={() => handleAudioStart(item)}
              onAudioStateChange={onAudioStateChange}
            />
          );
        }
        
        return null;
      })}
    </div>
  );
}

function AudioMessage({ audio, isMe, isMobile, messageId, onAudioStart, onAudioStateChange }) {
  const { updateAudioState, getAudioState } = useAudioEventManager();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Utiliser la forme d'onde fournie ou en générer une par défaut
  const waveformBars = audio.waveform || Array.from({ length: isMobile ? 25 : 35 }, () => 
    Math.random() * 0.7 + 0.3
  );

  // Couleurs selon si c'est envoyé ou reçu
  const bubbleColor = isMe ? 'bg-[#005c4b]' : 'bg-[#202c33]';
  const playIconColor = 'text-[#00a884]'; // Toujours bleu
  const progressColor = 'bg-[#00a884]'; // Toujours bleu
  const waveformColor = 'bg-[#8696a0]'; // Toujours gris
  const microphoneBg = 'bg-[#00a884]'; // Toujours bleu

  // Gestion de la lecture audio
  const handlePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setIsPlaying(newPlayingState);
    
    if (newPlayingState) {
      // Démarrer la lecture
      onAudioStart?.();
      updateAudioState(messageId, { isPlaying: true, currentTime: 0 });
      onAudioStateChange?.({ isPlaying: true, currentTime: 0 });
      console.log('Démarrage de la lecture audio');
    } else {
      // Mettre en pause
      updateAudioState(messageId, { isPlaying: false, currentTime });
      onAudioStateChange?.({ isPlaying: false, currentTime });
      console.log('Mise en pause de l\'audio');
    }
  }, [isPlaying, currentTime, messageId, onAudioStart, updateAudioState, onAudioStateChange]);

  // Gestion de la progression (simulation)
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.01;
          // Arrêter à la fin de l'audio
          if (newTime >= 1) {
            setIsPlaying(false);
            updateAudioState(messageId, { isPlaying: false, currentTime: 0 });
            onAudioStateChange?.({ isPlaying: false, currentTime: 0 });
            return 0;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, messageId, updateAudioState, onAudioStateChange]);

  // Synchroniser avec l'état global
  useEffect(() => {
    const globalState = getAudioState(messageId);
    if (globalState.isPlaying !== isPlaying) {
      setIsPlaying(globalState.isPlaying);
      setCurrentTime(globalState.currentTime);
    }
  }, [messageId, getAudioState, isPlaying]);

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2 items-end gap-2`}>
      {/* Bulle de message audio */}
      <div className={`${bubbleColor} rounded-lg px-3 py-2 max-w-[280px] ${isMobile ? 'max-w-[240px]' : ''}`}>
        <div className="flex items-center gap-3">
          {/* Icône de lecture bleue */}
          <div 
            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handlePlayPause}
            title={isPlaying ? 'Mettre en pause' : 'Lire'}
          >
            {isPlaying ? (
              <FaPause size={isMobile ? 14 : 16} className={playIconColor} />
            ) : (
              <FaPlay size={isMobile ? 14 : 16} className={playIconColor} />
            )}
          </div>
          
          {/* Forme d'onde grise avec progression visuelle */}
          <div className={`flex items-center gap-[1px] h-5 flex-1 relative`}>
            {waveformBars.map((height, idx) => {
              const isPlayed = idx < (currentTime * waveformBars.length);
              const isCurrent = Math.abs(idx - (currentTime * waveformBars.length)) < 1;
              
              return (
                <div
                  key={idx}
                  className={`w-[1.5px] rounded-full transition-all duration-100 flex-shrink-0 ${
                    isCurrent ? 'bg-[#00a884]' : // Barre actuelle en bleu vif
                    isPlayed ? 'bg-[#00a884]' : // Barres déjà jouées en bleu
                    'bg-white/40' // Barres non jouées en gris clair
                  }`}
                  style={{
                    height: `${height * 16}px`,
                    opacity: isCurrent ? 1 : isPlayed ? 0.8 : 0.4
                  }}
                />
              );
            })}
            
            {/* Indicateur de progression qui se déplace sur la forme d'onde */}
            <div 
              className={`absolute top-0 w-3 h-3 rounded-full ${progressColor} transition-all duration-100 ease-out shadow-lg`}
              style={{
                left: `${currentTime * 100}%`,
                transform: 'translateX(-50%)'
              }}
            ></div>
          </div>
        </div>
        
        {/* Temps de lecture et heure du message sur la même ligne */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/80">
            {(() => {
              // Calculer le temps écoulé basé sur la progression
              const durationParts = (audio.duration || '0:14').split(':');
              const durationSeconds = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);
              const elapsedSeconds = Math.floor(currentTime * durationSeconds);
              const elapsedMinutes = Math.floor(elapsedSeconds / 60);
              const elapsedSecondsRemainder = elapsedSeconds % 60;
              const elapsedTime = `${elapsedMinutes}:${String(elapsedSecondsRemainder).padStart(2, '0')}`;
              
              return `${elapsedTime} / ${audio.duration || '0:14'}`;
            })()}
          </span>
          <span className="text-xs text-white/60">
            {audio.timestamp || '4:06 PM'}
          </span>
        </div>

        {/* Barre de progression linéaire (optionnel) */}
        <div className="mt-2 w-full bg-white/20 rounded-full h-1">
          <div 
            className={`h-1 rounded-full ${progressColor} transition-all duration-100 ease-out`}
            style={{
              width: `${currentTime * 100}%`
            }}
          />
        </div>

        {/* Métadonnées supplémentaires (optionnel) */}
        {audio.size && (
          <div className="text-[10px] text-white/50 mt-1">
            {audio.size} • {audio.quality}
          </div>
        )}
      </div>

      {/* Avatar avec icône microphone au coin inférieur droit */}
      <div className="relative flex-shrink-0">
        <div 
          className={`${isMobile ? 'w-[32px] h-[32px]' : 'w-[36px] h-[36px]'} rounded-full overflow-hidden cursor-pointer group`}
          onClick={handlePlayPause}
          title="Cliquer pour lire/mettre en pause"
        >
          <img 
            src={`https://ui-avatars.com/api/?name=${isMe ? 'Me' : 'Contact'}&background=${isMe ? '005c4b' : '6a7175'}&color=fff&size=40`}
            alt=""
            className="w-full h-full"
          />
        </div>
        
        {/* Icône microphone au coin inférieur droit de l'avatar */}
        <div className={`absolute -bottom-1 -right-1 ${isMobile ? 'w-[12px] h-[12px]' : 'w-[14px] h-[14px]'} rounded-full ${microphoneBg} flex items-center justify-center border-2 border-white`}>
          <FaMicrophone size={isMobile ? 4 : 5} className="text-white" />
        </div>
      </div>
    </div>
  );
}
  