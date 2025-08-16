import { FaPlay, FaPause, FaVolumeUp, FaFile } from 'react-icons/fa';
import { useState } from 'react';

export default function MediaGroup({ media = [] }) {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [audioProgress, setAudioProgress] = useState({});

  if (!media.length) return null;

  const getGridClass = () => {
    switch (media.length) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-2';
      case 4: return 'grid-cols-2';
      case 5: return 'grid-cols-3';
      case 6: return 'grid-cols-3';
      case 7: return 'grid-cols-3';
      case 8: return 'grid-cols-3';
      default: return 'grid-cols-3';
    }
  };

  const getMediaSize = (index, total) => {
    if (total === 3 && index === 0) return 'row-span-2 col-span-2';
    if (total === 4 && index === 0) return 'row-span-2 col-span-2';
    if (total === 5 && index === 0) return 'row-span-2 col-span-2';
    if (total === 6 && index === 0) return 'row-span-2 col-span-2';
    if (total === 7 && index === 0) return 'row-span-2 col-span-2';
    if (total === 8 && index === 0) return 'row-span-2 col-span-2';
    return '';
  };

  const handleVideoClick = (index) => {
    if (playingVideo === index) {
      setPlayingVideo(null);
    } else {
      setPlayingVideo(index);
    }
  };

  const handleAudioProgress = (index, e) => {
    const audio = e.target;
    const progress = (audio.currentTime / audio.duration) * 100;
    setAudioProgress(prev => ({ ...prev, [index]: progress }));
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`mt-1 media-grid ${getGridClass()} max-h-[200px] sm:max-h-[240px] lg:max-h-[280px] gap-0.5`}>
      {media.map((item, idx) => {
        const sizeClass = getMediaSize(idx, media.length);
        const isLastItem = idx === media.length - 1;
        const hasMoreItems = media.length > 8 && idx === 7;
        
        if (item.type === 'image') {
          return (
            <div key={idx} className={`relative overflow-hidden rounded-md ${sizeClass}`}>
              <img 
                src={item.url} 
                alt="Media"
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
              />
              
              {/* Overlay pour montrer qu'il y a plus d'images */}
              {hasMoreItems && (
                <div className="absolute inset-0 media-overlay flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base lg:text-lg font-bold">+{media.length - 8}</span>
                </div>
              )}
              
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                  {item.caption}
                </div>
              )}
            </div>
          );
        }
        
        if (item.type === 'video') {
          const isPlaying = playingVideo === idx;
          return (
            <div key={idx} className={`relative overflow-hidden rounded-md ${sizeClass}`}>
              <video 
                src={item.url} 
                className="w-full h-full object-cover"
                muted={!isPlaying}
                loop
                onClick={() => handleVideoClick(idx)}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-black/50 rounded-full p-1.5 sm:p-2">
                    <FaPlay className="text-white w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                </div>
              )}
              
              {/* Overlay pour montrer qu'il y a plus d'images */}
              {hasMoreItems && (
                <div className="absolute inset-0 media-overlay flex items-center justify-center">
                  <span className="text-white text-sm sm:text-base lg:text-lg font-bold">+{media.length - 8}</span>
                </div>
              )}
              
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1">
                  {item.caption}
                </div>
              )}
            </div>
          );
        }
        
        if (item.type === 'audio') {
          const progress = audioProgress[idx] || 0;
          return (
            <div key={idx} className={`bg-black/20 rounded-md p-1.5 sm:p-2 ${sizeClass}`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="bg-green-500 rounded-full p-1 sm:p-1.5">
                  <FaVolumeUp className="text-white w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-300 mb-1">
                    {item.title || 'Audio'}
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-1 mb-1">
                    <div 
                      className="bg-green-500 h-1 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatDuration(item.duration || 0)}</span>
                    <span>{item.size || '0 MB'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (item.type === 'document') {
          return (
            <div key={idx} className={`bg-black/20 rounded-md p-1.5 sm:p-2 ${sizeClass}`}>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="bg-blue-500 rounded-full p-1 sm:p-1.5">
                  <FaFile className="text-white w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white mb-1">
                    {item.name || 'Document'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.size || '0 MB'}
                  </div>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
  
  