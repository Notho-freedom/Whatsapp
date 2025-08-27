import { FaReply } from 'react-icons/fa';
import { memo } from 'react';
import { XCircle } from 'lucide-react';

const ReplyCap = memo(function ReplyCap({ replyTo, onCancelReply, currentUser, selectedChat, users }) {
  if (!replyTo) return null;

  // Logs de débogage pour vérifier les données reçues
  console.log('ReplyCap - Données reçues:', {
    replyTo,
    currentUser,
    selectedChat,
    usersCount: users?.length || 0
  });

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getMessagePreview = () => {
    if (replyTo.text) return truncateText(replyTo.text);

    if (replyTo.media && replyTo.media.length > 0) {
      const mediaType = replyTo.media[0].type;
      switch (mediaType) {
        case 'image': return '📷 Image';
        case 'video': return '🎥 Video';
        case 'audio': return '🎵 Audio';
        case 'document': return '📄 Document';
        default: return '📎 Media';
      }
    }

    if (replyTo.link) return '🔗 Link';
    return 'Message';
  };

  const getSenderName = () => {
    // Si c'est l'utilisateur actuel
    if (replyTo.sender === 'me' || replyTo.sender === currentUser?.id) {
      return currentUser?.name || 'You';
    }

    // Si on a un nom d'expéditeur direct
    if (replyTo.senderName) {
      return replyTo.senderName;
    }

    // Si on a un ID d'expéditeur, chercher dans la liste des utilisateurs
    if (replyTo.sender && users && users.length > 0) {
      const senderUser = users.find(u => u.id === replyTo.sender);
      if (senderUser) {
        return senderUser.name;
      }
    }

    // Si on a un chat sélectionné et que ce n'est pas l'utilisateur actuel
    if (selectedChat && selectedChat.id !== currentUser?.id) {
      return selectedChat.name || 'Contact';
    }

    // Fallback
    return 'Unknown';
  };

  const getSenderAvatar = () => {
    // Si c'est l'utilisateur actuel
    if (replyTo.sender === 'me' || replyTo.sender === currentUser?.id) {
      return currentUser?.picture || null;
    }

    // Si on a un avatar direct
    if (replyTo.senderAvatar) {
      return replyTo.senderAvatar;
    }

    // Si on a un ID d'expéditeur, chercher dans la liste des utilisateurs
    if (replyTo.sender && users && users.length > 0) {
      const senderUser = users.find(u => u.id === replyTo.sender);
      if (senderUser) {
        return senderUser.avatar;
      }
    }

    // Si on a un chat sélectionné et que ce n'est pas l'utilisateur actuel
    if (selectedChat && selectedChat.id !== currentUser?.id) {
      return selectedChat.avatar || null;
    }

    return null;
  };

  const senderName = getSenderName();
  const senderAvatar = getSenderAvatar();

  return (
    <div className="relative w-full bg-[#2c2c2c] animate-[replyCapSlideIn_0.2s_ease-out]">
      {/* Barre de réponse */}
      <div className="flex items-stretch p-1 pr-2 pt-2 ml-[14.5%]">
        {/* Ligne verte verticale */}
        <div className="w-1 bg-green-500 rounded-l-2xl flex-shrink-0" />
        
        {/* Contenu principal */}
        <div className="flex-1 bg-neutral-600/70 pl-2 min-w-0 flex flex-col justify-center gap-1 border-t-2 rounded-tl-[3px] border-neutral-400">
          
          {/* En-tête avec nom et avatar */}
          <div className="flex items-center gap-1.5 text-[#00a884] text-[13px] font-medium truncate">
            <FaReply className="text-xs shrink-0" />
            
            {/* Avatar de l'expéditeur */}
            {senderAvatar && (
              <img 
                src={senderAvatar} 
                alt={senderName}
                className="w-4 h-4 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            <span className="font-semibold truncate">{senderName}</span>
          </div>
          
          {/* Aperçu du message + thumb */}
          <div className="flex items-center gap-2">
            <div className="flex-1 text-[#d1d7db] text-sm leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
              {getMessagePreview()}
            </div>
            
            {/* Thumbnail pour media */}
            {replyTo.media && replyTo.media.length > 0 && (
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                {replyTo.media[0].type === 'image' ? (
                  <img 
                    src={replyTo.media[0].url} 
                    alt="Media preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-base text-[#8696a0]">
                    {replyTo.media[0].type === 'video' && '🎥'}
                    {replyTo.media[0].type === 'audio' && '🎵'}
                    {replyTo.media[0].type === 'document' && '📄'}
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail pour lien */}
            {replyTo.link?.thumbnail && (
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                <img 
                  src={replyTo.link.thumbnail} 
                  alt="Link preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Bouton annuler */}
        <button 
          className="bg-neutral-600/70 border-t-2 border-neutral-400 px-2 flex items-center justify-center rounded-r-[3px]"
          onClick={onCancelReply}
          aria-label="Cancel reply"
        >
          <XCircle size={20} className="text-[#8696a0] hover:text-white transition-all duration-150 ease-in-out" />
        </button>
      </div>
    </div>
  );
});

export default ReplyCap;
