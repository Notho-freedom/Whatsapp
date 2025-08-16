export default function ReactionBar({ reactions = [] }) {
    if (!reactions.length) return null;
  
    return (
      <div className="absolute -top-4 right-0 flex space-x-1 text-xs text-gray-400 bg-black/30 rounded-full px-1">
        {reactions.map((r, idx) => (
          <span key={idx}>{r}</span>
        ))}
      </div>
    );
  }
  