import { FaCheck, FaCheckDouble, FaAngleDown, FaReply, FaStar, FaThumbtack, FaTrash } from 'react-icons/fa';
import { MdOutlineCheckBox } from 'react-icons/md';
import MediaGroup from './MediaGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';
import { useState, useRef, useEffect } from 'react';

export default function MessageBubble({ message, isFirstInGroup, isLastInGroup, isMobile }) {
  const isMe = message.sender === 'me';
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isMobile) return; // Désactiver le menu contextuel sur mobile
    
    const rect = messageRef.current.getBoundingClientRect();
    setMenuPosition({
      x: e.clientX,
      y: e.clientY
    });
    setShowMenu(true);
  };

  const handleChevronClick = (e) => {
    e.stopPropagation();
    const rect = messageRef.current.getBoundingClientRect();
    const menuWidth = 200;
    
    // Ajuster la position pour mobile
    if (isMobile) {
      setMenuPosition({
        x: Math.min(window.innerWidth - menuWidth - 10, Math.max(10, isMe ? rect.left - menuWidth : rect.right)),
        y: rect.top
      });
    } else {
      setMenuPosition({
        x: isMe ? rect.left - menuWidth : rect.right,
        y: rect.top
      });
    }
    setShowMenu(true);
  };

  const handleLongPress = () => {
    if (!isMobile) return;
    
    const rect = messageRef.current.getBoundingClientRect();
    const menuWidth = 200;
    
    setMenuPosition({
      x: Math.min(window.innerWidth - menuWidth - 10, Math.max(10, rect.left)),
      y: rect.top - 50
    });
    setShowMenu(true);
  };

  return (
    <>
      <div 
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-[2px] group`}
        ref={messageRef}
        onTouchStart={isMobile ? () => {
          const timer = setTimeout(handleLongPress, 500);
          messageRef.current.addEventListener('touchend', () => clearTimeout(timer), { once: true });
          messageRef.current.addEventListener('touchmove', () => clearTimeout(timer), { once: true });
        } : undefined}
      >
        <div className="relative flex items-start max-w-[65%] md:max-w-[65%]">
          {/* Message tail pour le premier message d'un groupe */}
          {isFirstInGroup && (
            <div className={`wa-message-tail ${isMe ? 'wa-message-tail-self' : 'wa-message-tail-others'}`} />
          )}

          {/* Message bubble */}
          <div
            className={`wa-message-bubble ${isMe ? 'wa-message-bubble-self' : 'wa-message-bubble-others'} 
              hover:shadow-lg transition-shadow cursor-pointer`}
            style={{
              borderTopRightRadius: isMe && isFirstInGroup ? 0 : 7.5,
              borderTopLeftRadius: !isMe && isFirstInGroup ? 0 : 7.5,
            }}
            onContextMenu={handleContextMenu}
          >
            {/* Message forwarded label */}
            {message.forwarded && (
              <div className="text-[#8696a0] text-[12px] sm:text-[13px] mb-[2px]">
                Forwarded
              </div>
            )}

            {/* Reply */}
            {message.replyTo && (
              <div 
                className="mb-[3px] p-[5px] sm:p-[6px] rounded-[7.5px] border-l-[4px] cursor-pointer"
                style={{
                  backgroundColor: isMe ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isMe ? '#06cf9c' : '#8696a0'
                }}
              >
                <div className="text-[12px] sm:text-[13px] font-medium mb-[2px]" style={{ color: isMe ? '#06cf9c' : '#53bdeb' }}>
                  {message.replyTo.sender === 'me' ? 'You' : message.replyTo.senderName}
                </div>
                <div className="text-[#d1d7db] text-[13px] sm:text-[14px] line-clamp-3">
                  {message.replyTo.text}
                </div>
              </div>
            )}

            {/* Media */}
            {message.media && <MediaGroup media={message.media} isMe={isMe} isMobile={isMobile} />}

            {/* Link preview */}
            {message.link && <PreviewLink link={message.link} />}

            {/* Text message */}
            {message.text && (
              <div className="wa-message-text">
                <span>{message.text}</span>
                {/* Spacer for metadata */}
                <span className="inline-block" style={{ width: message.edited ? '85px' : '74px' }}></span>
              </div>
            )}

            {/* Message metadata (time + status) */}
            <div className="wa-message-meta">
              {message.edited && <span className="text-[10px] sm:text-[11px] mr-1">edited</span>}
              <span className="wa-message-time">{message.time}</span>
              {isMe && (
                <span className="wa-message-status ml-1">
                  {message.read ? (
                    <FaCheckDouble className="text-[#53bdeb]" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '10px' : '11px' }} />
                  ) : (
                    <FaCheckDouble className="text-[#8b9a9f]" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '10px' : '11px' }} />
                  )}
                </span>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <ReactionBar reactions={message.reactions} isMobile={isMobile} />
            )}
          </div>

          {/* Options chevron on hover - Desktop only */}
          {!isMobile && (
            <div 
              className={`absolute top-[4px] ${isMe ? '-left-[28px]' : '-right-[28px]'} 
                opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1`}
              onClick={handleChevronClick}
            >
              <FaAngleDown size={20} className="text-[#8696a0] hover:text-[#d1d7db]" />
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className={`fixed z-50 py-2 rounded-md shadow-lg ${isMobile ? 'min-w-[180px]' : 'min-w-[200px]'}`}
          style={{
            backgroundColor: 'var(--wa-context-menu-bg)',
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <button className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3`}>
            <FaReply size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Reply
          </button>
          <button className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3`}>
            <FaStar size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Star
          </button>
          <button className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3`}>
            <FaThumbtack size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Pin
          </button>
          {isMe && (
            <button className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3`}>
              <FaTrash size={isMobile ? 14 : 16} className="text-[#8696a0]" />
              Delete for me
            </button>
          )}
          <div className="border-t border-[rgba(255,255,255,0.08)] my-1" />
          <button className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3`}>
            <MdOutlineCheckBox size={isMobile ? 16 : 18} className="text-[#8696a0]" />
            Select
          </button>
        </div>
      )}
    </>
  );
}
