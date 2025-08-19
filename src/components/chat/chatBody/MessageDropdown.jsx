import { useState, useEffect, useRef } from 'react';
import { 
  FaReply, 
  FaStar, 
  FaThumbtack, 
  FaTrash, 
  FaCopy, 
  FaForward, 
  FaDownload, 
  FaEye, 
  FaShare,
  FaEllipsisH
} from 'react-icons/fa';
import { 
  Smile, 
  Heart, 
  ThumbsUp, 
  MessageCircle
} from 'lucide-react';

const MessageDropdown = ({ 
  message, 
  isMe, 
  isVisible, 
  position, 
  onAction,
  onAddReaction,
  onClose 
}) => {
  const dropdownRef = useRef(null);
  const [showReactions, setShowReactions] = useState(false);

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Actions principales
  const mainActions = [
    {
      id: 'reply',
      icon: FaReply,
      label: 'Reply',
      action: () => onAction('reply', message),
      color: 'text-blue-400'
    },
    {
      id: 'forward',
      icon: FaForward,
      label: 'Forward',
      action: () => onAction('forward', message),
      color: 'text-blue-400'
    },
    {
      id: 'copy',
      icon: FaCopy,
      label: 'Copy',
      action: () => onAction('copy', message.text),
      color: 'text-gray-300',
      show: !!message.text
    }
  ];

  // Actions pour les médias
  const mediaActions = message.media && message.media.length > 0 ? [
    {
      id: 'view-media',
      icon: FaEye,
      label: 'View',
      action: () => onAction('view-media', message.media[0]),
      color: 'text-green-400'
    },
    {
      id: 'save-media',
      icon: FaDownload,
      label: 'Save',
      action: () => onAction('save-media', message.media[0]),
      color: 'text-green-400'
    }
  ] : [];

  // Actions utilisateur
  const userActions = isMe ? [
    {
      id: 'delete',
      icon: FaTrash,
      label: 'Delete',
      action: () => onAction('delete', message),
      color: 'text-red-400'
    }
  ] : [];

  // Réactions rapides
  const quickReactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Laugh' },
    { emoji: '😢', label: 'Sad' }
  ];

  const allActions = [...mainActions, ...mediaActions, ...userActions].filter(action => action.show !== false);

  return (
    <div
      ref={dropdownRef}
      className={`absolute z-50 bg-[#233138] border border-[#3a3f42] rounded-lg shadow-2xl backdrop-blur-sm
        transition-all duration-200 ease-out transform origin-top-right
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{
        top: position?.top || 0,
        left: position?.left || 0,
        minWidth: '200px'
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#3a3f42] transition-colors group"
          >
            <action.icon 
              size={14} 
              className={`${action.color} group-hover:scale-110 transition-transform`} 
            />
            <span className="text-white text-sm">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Séparateur */}
      <div className="border-t border-[#3a3f42] mx-2" />

      {/* Actions secondaires */}
      <div className="p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAction('star', message)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#3a3f42] transition-colors group"
          >
            <FaStar 
              size={14} 
              className={`${message.isStarred ? 'text-yellow-400' : 'text-gray-300'} group-hover:scale-110 transition-transform`} 
            />
            <span className="text-white text-sm">{message.isStarred ? 'Unstar' : 'Star'}</span>
          </button>

          <button
            onClick={() => onAction('pin', message)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#3a3f42] transition-colors group"
          >
            <FaThumbtack size={14} className="text-gray-300 group-hover:scale-110 transition-transform" />
            <span className="text-white text-sm">Pin</span>
          </button>
        </div>
      </div>

      {/* Réactions rapides */}
      <div className="p-2 border-t border-[#3a3f42]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-xs font-medium">Quick reactions</span>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1 rounded-full hover:bg-[#3a3f42] transition-colors"
          >
            <FaEllipsisH size={10} className="text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {quickReactions.map((reaction, index) => (
            <button
              key={index}
              onClick={() => {
                onAddReaction(reaction.emoji);
                onClose();
              }}
              className="p-1.5 rounded-full hover:bg-[#3a3f42] transition-colors text-base hover:scale-110 transform"
              title={reaction.label}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>

        {/* Réactions étendues */}
        {showReactions && (
          <div className="mt-2 pt-2 border-t border-[#3a3f42]">
            <div className="grid grid-cols-4 gap-1">
              {[
                { emoji: '😮', label: 'Wow' },
                { emoji: '🙏', label: 'Pray' },
                { emoji: '👏', label: 'Clap' },
                { emoji: '🔥', label: 'Fire' }
              ].map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onAddReaction(reaction.emoji);
                    onClose();
                  }}
                  className="p-1.5 rounded-full hover:bg-[#3a3f42] transition-colors text-base hover:scale-110 transform"
                  title={reaction.label}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDropdown;
