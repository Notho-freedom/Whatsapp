import { FaPlay, FaPause, FaMicrophone } from 'react-icons/fa';
import { useState } from 'react';

export default function MediaGroup({ media = [], isMe = false, isMobile = false }) {
  if (!media.length) return null;

  const isSingleMedia = media.length === 1;
  const gridCols = media.length === 2 ? 'grid-cols-2' : media.length >= 3 ? 'grid-cols-3' : '';

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
          return <AudioMessage key={idx} audio={item} isMe={isMe} isMobile={isMobile} />;
        }
        
        return null;
      })}
    </div>
  );
}

function AudioMessage({ audio, isMe, isMobile }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Générer une forme d'onde aléatoire mais réaliste
  const waveformBars = Array.from({ length: isMobile ? 25 : 35 }, () => 
    Math.random() * 0.7 + 0.3
  );

  return (
    <div 
      className={`flex items-center gap-2 py-[6px] ${isMobile ? 'w-full max-w-[320px]' : 'w-full max-w-[380px]'}`}
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Avatar/Bouton Play */}
      <div className="relative flex-shrink-0">
        <div 
          className={`${isMobile ? 'w-[32px] h-[32px]' : 'w-[36px] h-[36px]'} rounded-full overflow-hidden cursor-pointer group`}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <img 
            src={`https://ui-avatars.com/api/?name=${isMe ? 'Me' : 'Contact'}&background=${isMe ? '005c4b' : '6a7175'}&color=fff&size=40`}
            alt=""
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isPlaying ? (
              <FaPause size={isMobile ? 12 : 14} className="text-white" />
            ) : (
              <FaPlay size={isMobile ? 12 : 14} className="text-white ml-1" />
            )}
          </div>
        </div>
      </div>

      {/* Forme d'onde et durée */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className={`flex items-center gap-[1px] ${isMobile ? 'h-[22px]' : 'h-[26px]'}`}>
          {waveformBars.map((height, idx) => (
            <div
              key={idx}
              className="w-[1.5px] bg-[#3b4a54] rounded-full transition-all flex-shrink-0"
              style={{
                height: `${height * (isMobile ? 18 : 22)}px`,
                backgroundColor: idx < (currentTime * waveformBars.length) ? '#00a884' : '#3b4a54'
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] text-[#8696a0]">
            {audio.duration || '0:56'}
          </span>
        </div>
      </div>

      {/* Icône microphone */}
      <div className="flex-shrink-0">
        <div className={`${isMobile ? 'w-[12px] h-[12px]' : 'w-[14px] h-[14px]'} rounded-full bg-[#00a884] flex items-center justify-center`}>
          <FaMicrophone size={isMobile ? 6 : 7} className="text-white" />
        </div>
      </div>
    </div>
  );
}
  