import { Video, Phone, Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import UserProfilePopup from './UserProfilePopup';

export default function ChatHeader({ selectedChat }) {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  if (!selectedChat) {
    return null;
  }

  const handleAvatarClick = () => {
    setIsProfilePopupOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfilePopupOpen(false);
  };



  const handleSearch = (user) => {
    // Ouvrir la recherche dans le chat
    window.dispatchEvent(new CustomEvent('search-chat', { 
      detail: { 
        chatId: user.id,
        action: 'open',
        participant: user,
        timestamp: new Date()
      } 
    }));
  };

  const handleEdit = (user) => {
    // Ouvrir l'édition du profil
    window.dispatchEvent(new CustomEvent('edit-profile', { 
      detail: { 
        userId: user.id,
        action: 'edit',
        participant: user,
        timestamp: new Date()
      } 
    }));
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 w-full bg-[#2C2C2C] border-r border-neutral-900">
      <div className="flex items-center gap-3 p-[1px]">
        <button
          onClick={handleAvatarClick}
          className="hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Voir le profil"
        >
          <img 
            alt={`${selectedChat.name} profile picture`} 
            className="w-10 h-10 rounded-full object-cover" 
            src={selectedChat.avatar || `https://placehold.co/40x40/png?text=${selectedChat.name.charAt(0)}`}
          />
        </button>
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
            className="px-3.5 py-2.5 transition-colors flex items-center justify-center hover:bg-white/10"
            onClick={() => {
              // Démarrer un appel vidéo
              window.dispatchEvent(new CustomEvent('start-call', { 
                detail: { 
                  type: 'video',
                  participant: selectedChat,
                  fromChat: true,
                  timestamp: new Date(),
                  chatId: selectedChat.id
                } 
              }));
              
              // Émettre aussi un événement spécifique pour l'appel vidéo
              window.dispatchEvent(new CustomEvent('video-call-started', { 
                detail: { 
                  participant: selectedChat,
                  fromChat: true,
                  timestamp: new Date()
                } 
              }));
            }}
          >
            <Video size={19} className="text-white" />
          </button>

          <div className="w-px h-6 rounded-full bg-neutral-700"></div>

          <button 
            aria-label="Voice call" 
            type="button"
            className="px-3.5 py-2.5 transition-colors flex items-center justify-center hover:bg-white/10"
            onClick={() => {
              // Démarrer un appel vocal
              window.dispatchEvent(new CustomEvent('start-call', { 
                detail: { 
                  type: 'voice',
                  participant: selectedChat,
                  fromChat: true,
                  timestamp: new Date(),
                  chatId: selectedChat.id
                } 
              }));
              
              // Émettre aussi un événement spécifique pour l'appel vocal
              window.dispatchEvent(new CustomEvent('voice-call-started', { 
                detail: { 
                  participant: selectedChat,
                  fromChat: true,
                  timestamp: new Date()
                } 
              }));
            }}
            >
            <Phone size={19} className="text-white rotate-135" />
          </button>

        </div>
        
        {/* Bouton recherche */}
        <button 
          aria-label="Search" 
          type="button"
          className="p-2 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center"
          onClick={() => {
            // Ouvrir la recherche dans le chat
            window.dispatchEvent(new CustomEvent('search-chat', { 
              detail: { 
                chatId: selectedChat.id,
                action: 'open',
                participant: selectedChat,
                timestamp: new Date()
              } 
            }));
            
            // Émettre aussi un événement pour notifier l'ouverture de la recherche
            window.dispatchEvent(new CustomEvent('chat-search-opened', { 
              detail: { 
                chatId: selectedChat.id,
                participant: selectedChat,
                timestamp: new Date()
              } 
            }));
          }}
        >
          <Search size={16} className="text-gray-300 rotate-90" />
        </button>
        
        {/* Bouton menu (plus d'options) */}
        <button 
          aria-label="More options" 
          type="button"
          className="p-2 rounded-md hover:bg-white/10 transition-colors flex items-center justify-center"
          onClick={() => {
            // Ouvrir le menu des options du chat
            window.dispatchEvent(new CustomEvent('open-chat-menu', { 
              detail: { 
                chatId: selectedChat.id,
                participant: selectedChat,
                action: 'show-menu',
                timestamp: new Date()
              } 
            }));
            
            // Émettre aussi un événement pour notifier l'ouverture du menu
            window.dispatchEvent(new CustomEvent('chat-menu-opened', { 
              detail: { 
                chatId: selectedChat.id,
                participant: selectedChat,
                timestamp: new Date()
              } 
            }));
          }}
        >
          <MoreVertical size={16} className="text-gray-300" />
        </button>
      </div>

      {/* UserProfilePopup */}
      <UserProfilePopup
        user={selectedChat}
        isOpen={isProfilePopupOpen}
        onClose={handleCloseProfile}
        onSearch={handleSearch}
        onEdit={handleEdit}
      />
    </header>
  );
}
