export default function ReactionBar({ reactions = [] }) {
  if (!reactions.length) return null;

  return (
    <div 
      className="absolute -bottom-[15px] right-[8px] flex items-center gap-[2px] px-[4px] py-[2px] rounded-full shadow-sm"
      style={{ 
        backgroundColor: '#1f2c34',
        border: '1px solid #2a373f',
        fontSize: '11px'
      }}
    >
      {reactions.slice(0, 3).map((reaction, idx) => (
        <span key={idx} className="inline-block">
          {reaction}
        </span>
      ))}
      {reactions.length > 3 && (
        <span className="text-[#8696a0] text-[10px] ml-[2px]">
          +{reactions.length - 3}
        </span>
      )}
    </div>
  );
}
  