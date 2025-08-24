import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaReply,
  FaShare,
  FaStar,
  FaThumbtack,
  FaTrash,
  FaCopy,
  FaForward,
  FaDownload,
  FaEye,
  FaPlus
} from 'react-icons/fa';
import { 
  Smile, 
  Heart, 
  ThumbsUp, 
  MessageCircle, 
  Image, 
  Video, 
  FileText,
  Link
} from 'lucide-react';

const MessageContextMenu = ({ 
  isOpen, 
  position, 
  message, 
  isMe, 
  onClose, 
  onAction,
  onAddReaction 
}) => {
  const menuRef = useRef(null);
  const [animationState, setAnimationState] = useState('entering');

    // Positionner le menu intelligemment
  const getMenuPosition = useCallback(() => {
    if (!position) return { top: 0, left: 0 };

    const { x, y } = position;
    const menuWidth = 200;
    const menuHeight = 240;

    // Ajuster la position pour éviter de sortir de l'écran
    let adjustedX = x;
    let adjustedY = y;

    if (x + menuWidth > window.innerWidth) {
      adjustedX = x - menuWidth;
    }

    if (y + menuHeight > window.innerHeight) {
      adjustedY = y - menuHeight;
    }

    return {
      top: Math.max(10, adjustedY),
      left: Math.max(10, adjustedX)
    };
  }, [position]);

  // Animation d'entrée/sortie
  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      const timer = setTimeout(() => setAnimationState('entered'), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('exiting');
      const timer = setTimeout(() => setAnimationState('exited'), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || animationState === 'exited') return null;

  const menuPosition = getMenuPosition();

  // Icônes pour les réactions
  const reactionIcons = [
    { emoji: '👍', icon: ThumbsUp, label: 'Like' },
    { emoji: '❤️', icon: Heart, label: 'Love' },
    { emoji: '😂', icon: Smile, label: 'Laugh' },
    { emoji: '😢', icon: MessageCircle, label: 'Sad' },
    { emoji: '😮', icon: Smile, label: 'Wow' },
    { emoji: '🙏', icon: MessageCircle, label: 'Pray' }
  ];

  // Actions du menu
  const menuActions = [
    {
      id: 'reply',
      label: 'Reply',
      icon: FaReply,
      action: () => onAction('reply', message),
      color: 'text-blue-400'
    },
    {
      id: 'copy',
      label: 'Copy',
      icon: FaCopy,
      action: () => onAction('copy', message.text),
      color: 'text-gray-300',
      show: !!message.text
    },
    {
      id: 'forward',
      label: 'Forward',
      icon: FaForward,
      action: () => onAction('forward', message),
      color: 'text-blue-400'
    },
    {
      id: 'star',
      label: message.isStarred ? 'Unstar' : 'Star',
      icon: FaStar,
      action: () => onAction('star', message),
      color: message.isStarred ? 'text-yellow-400' : 'text-gray-300'
    },
    {
      id: 'pin',
      label: 'Pin chat',
      icon: FaThumbtack,
      action: () => onAction('pin', message),
      color: 'text-gray-300'
    }
  ];

  // Actions pour les médias
  const mediaActions = message.media && message.media.length > 0 ? [
    {
      id: 'view-media',
      label: 'View media',
      icon: FaEye,
      action: () => onAction('view-media', message.media[0]),
      color: 'text-green-400'
    },
    {
      id: 'save-media',
      label: 'Save media',
      icon: FaDownload,
      action: () => onAction('save-media', message.media[0]),
      color: 'text-green-400'
    },
    {
      id: 'share-media',
      label: 'Share media',
      icon: FaShare,
      action: () => onAction('share-media', message.media[0]),
      color: 'text-green-400'
    }
  ] : [];

  // Actions pour les liens
  const linkActions = message.link ? [
    {
      id: 'view-link',
      label: 'View link',
      icon: Link,
      action: () => onAction('view-link', message.link),
      color: 'text-blue-400'
    }
  ] : [];

  // Actions pour les messages de l'utilisateur
  const userActions = isMe ? [
    {
      id: 'delete',
      label: 'Delete for me',
      icon: FaTrash,
      action: () => onAction('delete', message),
      color: 'text-red-400'
    }
  ] : [];

  const allActions = [...menuActions, ...mediaActions, ...linkActions, ...userActions].filter(action => action.show !== false);

  return (
    <div
      ref={menuRef}
      className={`fixed z-[10000] bg-[#2c2c2c] border border-[#3a3f42] rounded-lg shadow-2xl backdrop-blur-sm
        ${animationState === 'entering' ? 'animate-menu-enter' : ''}
        ${animationState === 'exiting' ? 'animate-menu-exit' : ''}
        ${animationState === 'entered' ? 'opacity-100 scale-100' : ''}
        transition-all duration-200 ease-out`}
                        style={{
                    top: menuPosition.top,
                    left: menuPosition.left,
                    minWidth: '200px',
                    maxWidth: '220px'
                  }}
    >
      

                        {/* Actions principales */}
                  <div className="p-2">
                    {allActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action();
                          onClose();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[#3a3f42] transition-colors group"
                      >
                        <action.icon
                          size={14}
                          className={` group-hover:scale-110 transition-transform`}
                        />
                        <span className="text-white text-sm">{action.label}</span>
                      </button>
                    ))}
                  </div>

      {/* Séparateur */}
      <div className="border-t border-[#3a3f42] mx-2" />

                        {/* Section réactions */}
                  <div className="p-2">
                    {/* Réactions rapides */}
                    <div className="flex items-center gap-1">
                      {reactionIcons.slice(0, 5).map((reaction, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            onAddReaction(reaction.emoji);
                            onClose();
                          }}
                          className="p-1 rounded-full hover:bg-[#3a3f42] transition-colors text-sm hover:scale-110 transform"
                          title={reaction.label}
                        >
                          {reaction.emoji}
                        </button>
                      ))}
                      {/* Bouton plus pour emoji picker */}
                      <button
                        onClick={() => {
                          // Ouvrir l'emoji picker
                          window.dispatchEvent(new CustomEvent('open-emoji-picker', {
                            detail: { position: { x: position?.x || 0, y: position?.y || 0 } }
                          }));
                          onClose();
                        }}
                        className="p-1 rounded-full hover:bg-[#3a3f42] transition-colors hover:scale-110 transform"
                        title="More emojis"
                      >
                        <FaPlus size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>


    </div>
  );
};

export default MessageContextMenu;
