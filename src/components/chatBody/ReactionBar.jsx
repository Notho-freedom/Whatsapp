import { FaPlus } from 'react-icons/fa';

export default function ReactionBar({ reactions = [] }) {
  if (!reactions.length) return null;

  return (
    <div 
      className="absolute -bottom-[18px] right-[8px] flex items-center gap-[1px] px-[3px] py-[2px] rounded-full shadow-md z-10"
      style={{ 
        backgroundColor: '#1f2c34',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      {reactions.slice(0, 6).map((reaction, idx) => (
        <span 
          key={idx} 
          className="inline-block text-[13px] px-[3px] cursor-pointer hover:scale-125 transition-transform"
        >
          {reaction}
        </span>
      ))}
      <button 
        className="inline-flex items-center justify-center w-[20px] h-[20px] rounded-full hover:bg-[#2a373f] transition-colors ml-[2px]"
      >
        <FaPlus size={10} className="text-[#8696a0]" />
      </button>
    </div>
  );
}
  