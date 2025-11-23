'use client';

import { FaPlus } from 'react-icons/fa';
import { useState } from 'react';

export default function ReactionBar({ 
  reactions = [], 
  isMobile = false, 
  onAddReaction,
  onRemoveReaction 
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  if (!reactions.length && !onAddReaction) return null;

  const handleReactionClick = (reaction) => {
    if (onRemoveReaction) {
      onRemoveReaction(reaction);
    }
  };

  const handleAddReaction = () => {
    if (onAddReaction) {
      // Ajouter une réaction aléatoire pour la démo
      const availableReactions = ['👍', '❤️', '😊', '😮', '😢', '🙏', '😂', '😍', '🤔', '👏'];
      const randomReaction = availableReactions[Math.floor(Math.random() * availableReactions.length)];
      onAddReaction(randomReaction);
    }
  };

  return (
    <>
      <div 
        className={`absolute ${isMobile ? '-bottom-[16px]' : '-bottom-[18px]'} right-[8px] flex items-center gap-[1px] px-[3px] py-[2px] rounded-full shadow-md z-10`}
        style={{ 
          backgroundColor: '#1f2c34',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {reactions.slice(0, isMobile ? 4 : 6).map((reaction, idx) => (
          <button
            key={idx} 
            className={`inline-block ${isMobile ? 'text-[12px] px-[2px]' : 'text-[13px] px-[3px]'} cursor-pointer hover:scale-125 transition-transform`}
            onClick={() => handleReactionClick(reaction)}
            aria-label={`Remove reaction ${reaction}`}
          >
            {reaction}
          </button>
        ))}
        {onAddReaction && (
          <button 
            className={`inline-flex items-center justify-center ${isMobile ? 'w-[18px] h-[18px]' : 'w-[20px] h-[20px]'} rounded-full hover:bg-[#2a373f] transition-colors ml-[2px]`}
            onClick={handleAddReaction}
            aria-label="Add reaction"
          >
            <FaPlus size={isMobile ? 8 : 10} className="text-[#8696a0]" />
          </button>
        )}
      </div>

      {/* Reaction Picker (pour une implémentation future) */}
      {showReactionPicker && (
        <div className="absolute bottom-8 right-0 bg-[#233138] rounded-lg shadow-lg p-2 border border-[#2a373f]">
          <div className="grid grid-cols-5 gap-1">
            {['👍', '❤️', '😊', '😮', '😢', '🙏', '😂', '😍', '🤔', '👏'].map((emoji) => (
              <button
                key={emoji}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#2a373f] rounded transition-colors"
                onClick={() => {
                  onAddReaction?.(emoji);
                  setShowReactionPicker(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
  