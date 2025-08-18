import { FaCheck, FaCheckDouble, FaAngleDown, FaReply, FaStar, FaThumbtack, FaTrash, FaCopy, FaForward } from 'react-icons/fa';
import { MdOutlineCheckBox } from 'react-icons/md';
import MediaGroup from './MediaGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAppContext } from '@/context/AppContext';

const MessageBubble = memo(function MessageBubble({ message, isFirstInGroup, isLastInGroup, isMobile }) {
  const isMe = message.sender === 'me';
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);
  const messageRef = useRef(null);
  const longPressTimer = useRef(null);
  const { addReactionToMessage, removeReactionFromMessage, deleteMessage, selectedChat } = useAppContext();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          messageRef.current && !messageRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    const handleScroll = () => {
      setShowMenu(false);
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [showMenu]);

  const calculateMenuPosition = useCallback((triggerElement, isContextMenu = false) => {
    if (!triggerElement) return { x: 0, y: 0 };

    const rect = triggerElement.getBoundingClientRect();
    const menuWidth = isMobile ? 180 : 200;
    const menuHeight = 280; // Hauteur approximative du menu
    const padding = 10;

    let x, y;

    if (isContextMenu) {
      // Menu contextuel - position à la souris
      x = Math.min(window.innerWidth - menuWidth - padding, Math.max(padding, rect.left));
      y = Math.min(window.innerHeight - menuHeight - padding, Math.max(padding, rect.top));
    } else {
      // Menu chevron - position relative au message
      if (isMe) {
        // Message de l'utilisateur - menu à gauche du message
        x = Math.max(padding, rect.left - menuWidth - 8);
      } else {
        // Message de l'autre - menu à droite du message
        x = Math.min(window.innerWidth - menuWidth - padding, rect.right + 8);
      }
      y = Math.min(window.innerHeight - menuHeight - padding, Math.max(padding, rect.top - 5));
    }

    return { x, y };
  }, [isMe, isMobile]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (isMobile) return; // Désactiver le menu contextuel sur mobile
    
    const position = calculateMenuPosition(e.currentTarget, true);
    setMenuPosition(position);
    setShowMenu(true);
  }, [isMobile, calculateMenuPosition]);

  const handleChevronClick = useCallback((e) => {
    e.stopPropagation();
    const position = calculateMenuPosition(messageRef.current);
    setMenuPosition(position);
    setShowMenu(true);
  }, [calculateMenuPosition]);

  const handleLongPressStart = useCallback(() => {
    if (!isMobile) return;
    
    longPressTimer.current = setTimeout(() => {
      const position = calculateMenuPosition(messageRef.current);
      setMenuPosition(position);
      setShowMenu(true);
      
      // Vibration feedback si disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, [isMobile, calculateMenuPosition]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDeleteMessage = useCallback(() => {
    if (selectedChat && message.id) {
      deleteMessage(selectedChat.id, message.id);
    }
    setShowMenu(false);
  }, [selectedChat, message.id, deleteMessage]);

  const handleCopyMessage = useCallback(() => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
    setShowMenu(false);
  }, [message.text]);

  const handleForwardMessage = useCallback(() => {
    // TODO: Implémenter le forward
    console.log('Forward message:', message);
    setShowMenu(false);
  }, [message]);

  const handleStarMessage = useCallback(() => {
    // TODO: Implémenter le star
    console.log('Star message:', message);
    setShowMenu(false);
  }, [message]);

  const handlePinMessage = useCallback(() => {
    // TODO: Implémenter le pin
    console.log('Pin message:', message);
    setShowMenu(false);
  }, [message]);

  const handleReplyMessage = useCallback(() => {
    // TODO: Implémenter le reply
    console.log('Reply to message:', message);
    setShowMenu(false);
  }, [message]);

  const handleAddReaction = useCallback((reaction) => {
    if (selectedChat && message.id) {
      addReactionToMessage(selectedChat.id, message.id, reaction);
    }
  }, [selectedChat, message.id, addReactionToMessage]);

  const handleRemoveReaction = useCallback((reaction) => {
    if (selectedChat && message.id) {
      removeReactionFromMessage(selectedChat.id, message.id, reaction);
    }
  }, [selectedChat, message.id, removeReactionFromMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
    <>
      <div 
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-[2px] group`}
        ref={messageRef}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
      >
        <div className="relative flex items-start max-w-[75%] md:max-w-[80%]">
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
            role="article"
            aria-label={`Message from ${isMe ? 'you' : message.senderName || 'contact'}`}
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
                className="mb-[3px] p-[5px] sm:p-[6px] rounded-[7.5px] border-l-[4px] cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: isMe ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isMe ? '#06cf9c' : '#8696a0'
                }}
                role="blockquote"
              >
                <div className="text-[12px] sm:text-[13px] font-medium mb-[2px]" style={{ color: isMe ? '#06cf9c' : '#53bdeb' }}>
                  {message.replyTo.sender === 'me' ? 'You' : message.replyTo.senderName || 'Unknown'}
                </div>
                <div className="text-[#d1d7db] text-[13px] sm:text-[14px] line-clamp-3">
                  {message.replyTo.text || (message.replyTo.media ? 'Media' : 'Message')}
                </div>
              </div>
            )}

            {/* Media */}
            {message.media && message.media.length > 0 && (
              <MediaGroup media={message.media} isMe={isMe} isMobile={isMobile} />
            )}

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
              <span className="wa-message-time">{message.time || 'now'}</span>
              {isMe && (
                <span className="wa-message-status ml-1" aria-label={message.read ? 'Read' : 'Delivered'}>
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
              <ReactionBar 
                reactions={message.reactions} 
                isMobile={isMobile}
                onAddReaction={handleAddReaction}
                onRemoveReaction={handleRemoveReaction}
              />
            )}
          </div>

          {/* Options chevron on hover - Desktop only */}
          {!isMobile && (
            <button 
              className={`absolute top-[8px] ${isMe ? '-left-[28px]' : '-right-[28px]'} 
                opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded hover:bg-[#2a373f]`}
              onClick={handleChevronClick}
              aria-label="Message options"
            >
              <FaAngleDown size={18} className="text-[#8696a0] hover:text-[#d1d7db]" />
            </button>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div
          ref={menuRef}
          className={`fixed z-[9999] py-2 rounded-md shadow-xl message-dropdown ${isMobile ? 'min-w-[180px]' : 'min-w-[200px]'}`}
          style={{
            backgroundColor: 'var(--wa-context-menu-bg)',
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            maxHeight: '300px',
            overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
          role="menu"
          aria-label="Message options menu"
        >
          <button 
            className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
            role="menuitem"
            onClick={handleReplyMessage}
          >
            <FaReply size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Reply
          </button>
          
          <button 
            className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
            role="menuitem"
            onClick={handleForwardMessage}
          >
            <FaForward size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Forward
          </button>

          {message.text && (
            <button 
              className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
              role="menuitem"
              onClick={handleCopyMessage}
            >
              <FaCopy size={isMobile ? 14 : 16} className="text-[#8696a0]" />
              Copy
            </button>
          )}

          <button 
            className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
            role="menuitem"
            onClick={handleStarMessage}
          >
            <FaStar size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Star
          </button>
          
          <button 
            className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
            role="menuitem"
            onClick={handlePinMessage}
          >
            <FaThumbtack size={isMobile ? 14 : 16} className="text-[#8696a0]" />
            Pin
          </button>
          
          {isMe && (
            <button 
              className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
              role="menuitem"
              onClick={handleDeleteMessage}
            >
              <FaTrash size={isMobile ? 14 : 16} className="text-[#8696a0]" />
              Delete for me
            </button>
          )}
          
          <div className="border-t border-[rgba(255,255,255,0.08)] my-1" role="separator" />
          
          <button 
            className={`w-full ${isMobile ? 'px-4 py-2' : 'px-6 py-2.5'} text-left text-[14px] text-[#d1d7db] hover:bg-[var(--wa-context-menu-hover)] flex items-center gap-3 transition-colors message-dropdown-item`}
            role="menuitem"
            onClick={() => setShowMenu(false)}
          >
            <MdOutlineCheckBox size={isMobile ? 16 : 18} className="text-[#8696a0]" />
            Select
          </button>
        </div>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Optimisation des re-renders
  return prevProps.message.id === nextProps.message.id &&
         prevProps.isFirstInGroup === nextProps.isFirstInGroup &&
         prevProps.isLastInGroup === nextProps.isLastInGroup &&
         prevProps.isMobile === nextProps.isMobile;
});

export default MessageBubble;
