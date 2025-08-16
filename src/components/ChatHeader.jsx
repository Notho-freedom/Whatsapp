import { Video, Phone, Search } from 'lucide-react';

export default function ChatHeader({ selectedChat }) {
  if (!selectedChat) {
    return null;
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 w-full bg-[#2C2C2C] border-r border-neutral-900">
      <div className="flex items-center gap-3 p-[1px]">
        <img 
          alt={`${selectedChat.name} profile picture`} 
          className="w-10 h-10 rounded-full object-cover" 
          src={selectedChat.avatar || `https://placehold.co/40x40/png?text=${selectedChat.name.charAt(0)}`}
        />
        <div>
          <p className="font-semibold text-white text-sm font-segoe">
            {selectedChat.name}
          </p>
          <p className="text-xs text-gray-300">
            {selectedChat.status || 'last seen today at 6:39 PM'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Groupe vidéo/audio avec style joint */}
        <div className="flex gap-0 items-center bg-neutral-700/50 border border-neutral-700 backdrop-blur-sm rounded-md">
          
          <button 
            aria-label="Video call" 
            type="button"
            className="px-3.5 py-2.5 transition-colors flex items-center justify-center"
          >
            <Video size={19} className="text-white" />
          </button>

          <div className="w-px h-6 rounded-full bg-neutral-700"></div>

          <button 
            aria-label="Voice call" 
            type="button"
            className="px-3.5 py-2.5 transition-colors flex items-center justify-center"
            >
            <Phone size={19} className="text-white rotate-135" />
          </button>

        </div>
        
        {/* Bouton recherche */}
        <button 
          aria-label="Search" 
          type="button"
          className="p-2 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Search size={16} className="text-gray-300 rotate-90" />
        </button>
      </div>
    </header>
  );
}
