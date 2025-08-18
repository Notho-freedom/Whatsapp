import { FaLock, FaPhone, FaVideo } from 'react-icons/fa';
import { MdCallReceived, MdCallMade, MdCallMissed } from 'react-icons/md';
import { useState, useEffect } from 'react';

export default function SystemMessage({ message }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Messages système de type appel
  if (message.systemType === 'call' || message.systemType === 'video') {
    const isVideo = message.systemType === 'video';
    const Icon = isVideo ? FaVideo : FaPhone;
    
    let statusIcon = null;
    let statusColor = '#8696a0';
    
    if (message.callStatus === 'missed') {
      statusIcon = MdCallMissed;
      statusColor = '#f15c6d';
    } else if (message.callStatus === 'incoming') {
      statusIcon = MdCallReceived;
      statusColor = '#00a884';
    } else if (message.callStatus === 'outgoing') {
      statusIcon = MdCallMade;
      statusColor = '#00a884';
    }
    
    const StatusIcon = statusIcon;

    return (
      <div className="wa-message-container flex justify-start">
        <div 
          className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isMobile ? 'max-w-[320px]' : 'max-w-[380px]'}`}
          style={{ backgroundColor: 'var(--wa-system-message-bg)' }}
        >
          <div 
            className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center flex-shrink-0`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <Icon size={isMobile ? 16 : 18} style={{ color: statusColor }} />
          </div>
          <div className="flex-1">
            <div className={`${isMobile ? 'text-[13px]' : 'text-[14px]'} text-[#e9edef] mb-0.5`}>
              {message.text || `${isVideo ? 'Video' : 'Voice'} call`}
            </div>
            <div className={`${isMobile ? 'text-[11px]' : 'text-[12px]'} text-[#8696a0]`}>
              {message.subtitle || 'Click to call back'}
            </div>
          </div>
          {StatusIcon && (
            <StatusIcon size={isMobile ? 18 : 20} style={{ color: statusColor }} className="flex-shrink-0" />
          )}
        </div>
      </div>
    );
  }

  // Messages système centrés (dates, chiffrement)
  if (message.systemType === 'date' || message.systemType === 'encryption') {
    return (
      <div className="wa-date-divider">
        <div className="wa-date-divider-text flex items-center">
          {message.systemType === 'encryption' && (
            <FaLock size={isMobile ? 9 : 10} className="mr-1.5" />
          )}
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  // Message système par défaut (centré)
  return (
    <div className="wa-date-divider">
      <div className="wa-system-message">
        <span>{message.text}</span>
      </div>
    </div>
  );
}