import { useState } from 'react';

export default function ReactionBar({ reactions = [] }) {
  const [showAllReactions, setShowAllReactions] = useState(false);

  if (!reactions.length) return null;

  // Grouper les réactions par emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (typeof reaction === 'string') {
      acc[reaction] = (acc[reaction] || 0) + 1;
    } else if (reaction.emoji) {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    }
    return acc;
  }, {});

  const reactionEntries = Object.entries(groupedReactions);
  const displayReactions = showAllReactions ? reactionEntries : reactionEntries.slice(0, 3);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {/* Réactions visibles */}
      {displayReactions.map(([emoji, count], index) => (
        <div
          key={index}
          className="reaction-bubble rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs flex items-center gap-0.5 sm:gap-1 cursor-pointer hover:bg-gray-700 transition-colors"
          title={`${emoji} ${count}`}
        >
          <span className="text-xs sm:text-sm">{emoji}</span>
          {count > 1 && <span className="text-gray-300 text-xs">{count}</span>}
        </div>
      ))}

      {/* Indicateur de plus de réactions */}
      {reactionEntries.length > 3 && (
        <button
          onClick={() => setShowAllReactions(!showAllReactions)}
          className="reaction-bubble rounded-full px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
        >
          {showAllReactions ? '−' : `+${reactionEntries.length - 3}`}
        </button>
      )}
    </div>
  );
}
  