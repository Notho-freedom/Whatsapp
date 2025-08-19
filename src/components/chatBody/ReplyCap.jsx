import { FaTimes, FaReply } from 'react-icons/fa';
import { memo } from 'react';

const ReplyCap = memo(function ReplyCap({ replyTo, onCancelReply, isMobile }) {
  if (!replyTo) return null;

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getMessagePreview = () => {
    if (replyTo.text) {
      return truncateText(replyTo.text);
    }
    if (replyTo.media && replyTo.media.length > 0) {
      const mediaType = replyTo.media[0].type;
      switch (mediaType) {
        case 'image':
          return '📷 Image';
        case 'video':
          return '🎥 Video';
        case 'audio':
          return '🎵 Audio';
        case 'document':
          return '📄 Document';
        default:
          return '📎 Media';
      }
    }
    if (replyTo.link) {
      return '🔗 Link';
    }
    return 'Message';
  };

  const getSenderName = () => {
    if (replyTo.sender === 'me') {
      return 'You';
    }
    return replyTo.senderName || 'Unknown';
  };

  return (
    <div className="relative w-full bg-[#202c33] border-b border-white/8 animate-[replyCapSlideIn_0.2s_ease-out]">
      {/* Barre de réponse */}
      <div className="flex items-center p-2 min-h-[60px] gap-3">
        {/* Ligne bleue verticale */}
        <div className="w-1 h-full bg-[#00a884] rounded-sm flex-shrink-0" />
        
        {/* Contenu principal */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* En-tête avec nom de l'expéditeur */}
          <div className="flex items-center">
            <div className="flex items-center gap-1.5 text-[#00a884] text-[13px] font-medium">
              <FaReply className="text-xs" />
              <span className="font-semibold">{getSenderName()}</span>
            </div>
          </div>
          
          {/* Aperçu du message */}
          <div className="flex items-center gap-2 min-h-[20px]">
            <div className="flex-1 text-[#d1d7db] text-sm leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
              {getMessagePreview()}
            </div>
            
            {/* Thumbnail pour les médias */}
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
            
            {/* Thumbnail pour les liens */}
            {replyTo.link && replyTo.link.thumbnail && (
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
        
        {/* Bouton de fermeture */}
        <button 
          className="bg-none border-none text-[#8696a0] cursor-pointer p-2 rounded-full flex items-center justify-center transition-all duration-150 ease-in-out flex-shrink-0 hover:bg-white/10 hover:text-[#d1d7db] active:scale-95"
          onClick={onCancelReply}
          aria-label="Cancel reply"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
});

export default ReplyCap;
