import { Video, Phone, Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import UserProfilePopup from './UserProfilePopup';
import { useUserContextMenu } from '@/hooks/useNativeContextMenu';
import { useTheme } from '@/utils/themeManager';

export default function ChatHeader({ selectedChat }) {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const { getThemeStyles } = useTheme();
  
  // Hook pour les menus contextuels natifs d'Electron
  const nativeUserMenu = useUserContextMenu((actionId, data) => {
    console.log('Action de menu contextuel d\'utilisateur:', actionId, data);
    // Ici vous pouvez ajouter la logique pour les actions d'utilisateur
  });

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
    <header 
      className="flex items-center justify-between px-4 py-3 w-full border-r"
      style={{
        ...getThemeStyles('chatHeader.background', { backgroundColor: '#2C2C2C' }),
        ...getThemeStyles('chatHeader.border.right', { borderRightColor: '#171717' })
      }}
    >
      <div className="flex items-center gap-3 p-[1px]">
        <button
          onClick={handleAvatarClick}
          className="hover:opacity-80 transition-opacity cursor-pointer"
          aria-label="Voir le profil"
          onContextMenu={(e) => {
            // Menu contextuel natif Electron pour l'utilisateur
            if (nativeUserMenu.isElectron) {
              nativeUserMenu.handleContextMenu(e, {
                userId: selectedChat.id,
                name: selectedChat.name,
                avatar: selectedChat.avatar,
                status: selectedChat.status
              });
            }
          }}
        >
          <img 
            alt={`${selectedChat.name} profile picture`} 
            className="w-10 h-10 rounded-full object-cover" 
            src={selectedChat.avatar || `https://placehold.co/40x40/png?text=${selectedChat.name.charAt(0)}`}
          />
        </button>
        <div>
          <p 
            className="font-semibold text-sm font-segoe"
            style={getThemeStyles('chatHeader.text.name', { color: '#ffffff' })}
          >
            {selectedChat.name}
          </p>
          <p 
            className="text-xs"
            style={getThemeStyles('chatHeader.text.status', { color: '#d1d5db' })}
          >
            {selectedChat.status || 'last seen today at 6:39 PM'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Groupe vidéo/audio avec style joint */}
        <div 
          className="flex gap-0 items-center backdrop-blur-sm rounded-md"
          style={{
            ...getThemeStyles('chatHeader.buttons.group.background', { backgroundColor: 'rgba(64, 64, 64, 0.5)' }),
            ...getThemeStyles('chatHeader.buttons.group.border', { border: '1px solid #404040' })
          }}
        >
          
          <button 
            aria-label="Video call" 
            type="button"
            className="px-3.5 py-2.5 transition-colors flex items-center justify-center"
            style={getThemeStyles('chatHeader.buttons.text', { color: '#ffffff' })}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = getThemeStyles('chatHeader.buttons.hover', { backgroundColor: 'rgba(255, 255, 255, 0.1)' }).backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
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
            <Video size={19} style={getThemeStyles('chatHeader.buttons.icon.primary', { color: '#ffffff' })} />
          </button>

          <div 
            className="w-px h-6 rounded-full"
            style={getThemeStyles('chatHeader.buttons.separator', { backgroundColor: '#404040' })}
          ></div>

          <button 
            aria-label="Voice call" 
            type="button"
            className="px-3.5 py-2.5 transition-colors flex items-center justify-center"
            style={getThemeStyles('chatHeader.buttons.text', { color: '#ffffff' })}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = getThemeStyles('chatHeader.buttons.hover', { backgroundColor: 'rgba(255, 255, 255, 0.1)' }).backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
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
            <Phone size={19} style={getThemeStyles('chatHeader.buttons.icon.primary', { color: '#ffffff' })} />
          </button>

        </div>
        
        {/* Bouton recherche */}
        <button 
          aria-label="Search" 
          type="button"
          className="p-2 rounded-md transition-colors flex items-center justify-center"
          style={getThemeStyles('chatHeader.buttons.text', { color: '#ffffff' })}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = getThemeStyles('chatHeader.buttons.hover', { backgroundColor: 'rgba(255, 255, 255, 0.1)' }).backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
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
          <Search size={16} className="rotate-90" style={getThemeStyles('chatHeader.buttons.icon.secondary', { color: '#d1d5db' })} />
        </button>
        
        {/* Bouton menu (plus d'options) */}
        <button 
          aria-label="More options" 
          type="button"
          className="p-2 rounded-md transition-colors flex items-center justify-center"
          style={getThemeStyles('chatHeader.buttons.text', { color: '#ffffff' })}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = getThemeStyles('chatHeader.buttons.hover', { backgroundColor: 'rgba(255, 255, 255, 0.1)' }).backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
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
          <MoreVertical size={16} style={getThemeStyles('chatHeader.buttons.icon.secondary', { color: '#d1d5db' })} />
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
