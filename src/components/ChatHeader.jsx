import { Video, Phone, Search } from 'lucide-react';

export default function ChatHeader({ selectedChat }) {
  if (!selectedChat) {
    return (
      <header className="flex items-center justify-between px-4 py-3 bg-whatsapp-dark-800 w-full border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-whatsapp-dark-700 flex items-center justify-center">
            <span className="text-gray-400">💬</span>
          </div>
          <div>
            <p className="font-semibold text-white text-sm font-segoe">
              Sélectionnez un chat
            </p>
            <p className="text-xs text-gray-400">
              Commencez une conversation
            </p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-whatsapp-dark-800 w-full border-b border-whatsapp-dark-900">
      <div className="flex items-center gap-3">
        <img 
          alt={`${selectedChat.name} profile picture`} 
          className="w-10 h-10 rounded-full object-cover" 
          src={selectedChat.avatar || `https://placehold.co/40x40/png?text=${selectedChat.name.charAt(0)}`}
        />
        <div>
          <p className="font-semibold text-white text-sm font-segoe">
            {selectedChat.name}
          </p>
          <p className="text-xs text-gray-400">
            {selectedChat.status || 'last seen today at 6:39 PM'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Groupe vidéo/audio avec style joint */}
        <div className="flex">
          <button 
            aria-label="Video call" 
            type="button"
            className="p-2 rounded-l-md bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            <Video size={16} className="text-gray-300 hover:text-white transition-colors" />
          </button>
          <button 
            aria-label="Voice call" 
            type="button"
            className="p-2 rounded-r-md bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center border-l border-white/20"
          >
            <Phone size={16} className="text-gray-300 hover:text-white transition-colors" />
          </button>
        </div>
        
        {/* Bouton recherche */}
        <button 
          aria-label="Search" 
          type="button"
          className="p-2 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <Search size={16} className="text-gray-300 hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
}
