import { FaCheck, FaCheckDouble, FaReply, FaShare, FaStar } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import MediaGroup from './MediaGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';

export default function MessageBubble({ message, onReply, onForward, onStar, onMore }) {
  const isMe = message.sender === 'me';
  const isForwarded = message.forwarded;
  const isStarred = message.starred;
  const hasReactions = message.reactions && message.reactions.length > 0;

  // Calcul de la largeur maximale selon le contenu et la taille de l'écran
  const getMaxWidth = () => {
    // Largeurs de base plus compactes
    const baseWidths = {
      media: {
        1: 'max-w-[240px] sm:max-w-[280px] lg:max-w-[320px]',
        2: 'max-w-[200px] sm:max-w-[240px] lg:max-w-[280px]',
        3: 'max-w-[180px] sm:max-w-[200px] lg:max-w-[240px]',
        4: 'max-w-[160px] sm:max-w-[180px] lg:max-w-[220px]',
        5: 'max-w-[140px] sm:max-w-[160px] lg:max-w-[200px]',
        6: 'max-w-[120px] sm:max-w-[140px] lg:max-w-[180px]',
        7: 'max-w-[110px] sm:max-w-[130px] lg:max-w-[170px]',
        8: 'max-w-[100px] sm:max-w-[120px] lg:max-w-[160px]',
        default: 'max-w-[90px] sm:max-w-[110px] lg:max-w-[150px]'
      },
      link: 'max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]',
      text: 'max-w-[60%] sm:max-w-[65%] lg:max-w-[70%]'
    };

    if (message.media && message.media.length > 0) {
      const count = message.media.length;
      return baseWidths.media[count] || baseWidths.media.default;
    }
    
    if (message.link) return baseWidths.link;
    return baseWidths.text;
  };

  // Gestion des checkmarks multiples (jusqu'à 4 comme dans l'image)
  const getReadStatus = () => {
    if (!isMe) return null;
    
    if (message.read) {
      // Plus de checkmarks pour montrer différents états
      if (message.readCount === 4) {
        return (
          <div className="checkmarks-container">
            <FaCheckDouble className="text-blue-400 w-2.5 h-2.5" />
            <FaCheckDouble className="text-blue-400 w-2.5 h-2.5" />
          </div>
        );
      } else if (message.readCount === 3) {
        return (
          <div className="checkmarks-container">
            <FaCheckDouble className="text-blue-400 w-2.5 h-2.5" />
            <FaCheck className="text-blue-400 w-2.5 h-2.5" />
          </div>
        );
      } else if (message.readCount === 2) {
        return (
          <div className="checkmarks-container">
            <FaCheck className="text-blue-400 w-2.5 h-2.5" />
            <FaCheck className="text-blue-400 w-2.5 h-2.5" />
          </div>
        );
      } else {
        return <FaCheckDouble className="text-blue-400 w-2.5 h-2.5" />;
      }
    } else {
      return <FaCheck className="text-gray-400 w-2.5 h-2.5" />;
    }
  };

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1 group`}>
      <div className="relative">
        {/* Avatar pour les messages reçus - Taille réduite */}
        {!isMe && (
          <div className="absolute -left-8 top-0 w-6 h-6 rounded-full avatar flex items-center justify-center text-white text-xs font-semibold">
            {message.senderName ? message.senderName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        {/* Message principal */}
        <div
          className={`${getMaxWidth()} rounded-lg px-2.5 py-1.5 text-sm shadow-sm relative transition-all duration-200 hover:shadow-md message-bubble`}
          style={{
            backgroundColor: isMe ? '#005C4B' : '#202C33',
            color: '#EDEDED',
            borderTopRightRadius: isMe ? 0 : 6,
            borderTopLeftRadius: isMe ? 6 : 0,
            borderBottomRightRadius: isMe ? 6 : 0,
            borderBottomLeftRadius: isMe ? 0 : 6,
          }}
        >
          {/* Header avec forwarded/starred - Taille réduite */}
          {(isForwarded || isStarred) && (
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-400">
              {isForwarded && (
                <div className="flex items-center gap-1">
                  <FaShare className="w-2.5 h-2.5" />
                  <span>Transféré</span>
                </div>
              )}
              {isStarred && (
                <div className="flex items-center gap-1">
                  <FaStar className="w-2.5 h-2.5 text-yellow-400" />
                  <span>Message important</span>
                </div>
              )}
            </div>
          )}

          {/* Reply - Taille réduite */}
          {message.replyTo && (
            <div 
              className="reply-container mb-1.5 px-1.5 py-1 text-xs text-gray-300 cursor-pointer"
              onClick={() => onReply && onReply(message.replyTo)}
            >
              <div className="flex items-center gap-1 mb-1">
                <FaReply className="w-2.5 h-2.5" />
                <span className="font-semibold">
                  {message.replyTo.sender === 'me' ? 'Vous' : message.replyTo.senderName}
                </span>
              </div>
              <div className="truncate max-w-[140px] sm:max-w-[160px] lg:max-w-[180px]">
                {message.replyTo.text && (
                  <span className="text-gray-300">{message.replyTo.text}</span>
                )}
                {message.replyTo.media && (
                  <span className="text-gray-400">📷 Média</span>
                )}
                {message.replyTo.link && (
                  <span className="text-gray-400">🔗 Lien</span>
                )}
              </div>
            </div>
          )}

          {/* Media */}
          {message.media && <MediaGroup media={message.media} />}

          {/* Texte */}
          {message.text && (
            <p className="whitespace-pre-wrap leading-relaxed text-sm">
              {message.text}
            </p>
          )}

          {/* Preview Link */}
          {message.link && <PreviewLink link={message.link} />}

          {/* Footer avec time, status et actions - Taille réduite */}
          <div className="flex justify-between items-center mt-1 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Time */}
              <span className="timestamp text-[9px]">
                {message.time}
              </span>
              
              {/* Status pour les messages envoyés */}
              {isMe && getReadStatus()}
            </div>

            {/* Actions (visible au hover) - Taille réduite */}
            <div className="flex items-center gap-0.5 message-actions">
              <button
                onClick={() => onReply && onReply(message)}
                className="p-0.5 hover:bg-black/20 rounded transition-colors"
                title="Répondre"
              >
                <FaReply className="w-2.5 h-2.5 text-gray-400" />
              </button>
              
              <button
                onClick={() => onForward && onForward(message)}
                className="p-0.5 hover:bg-black/20 rounded transition-colors"
                title="Transférer"
              >
                <FaShare className="w-2.5 h-2.5 text-gray-400" />
              </button>
              
              <button
                onClick={() => onStar && onStar(message)}
                className={`p-0.5 hover:bg-black/20 rounded transition-colors ${
                  isStarred ? 'text-yellow-400' : 'text-gray-400'
                }`}
                title={isStarred ? 'Retirer des favoris' : 'Marquer comme important'}
              >
                <FaStar className="w-2.5 h-2.5" />
              </button>
              
              <button
                onClick={() => onMore && onMore(message)}
                className="p-0.5 hover:bg-black/20 rounded transition-colors"
                title="Plus d'options"
              >
                <BsThreeDotsVertical className="w-2.5 h-2.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Reactions */}
        {hasReactions && (
          <div className="mt-1">
            <ReactionBar reactions={message.reactions} />
          </div>
        )}
      </div>
    </div>
  );
}
