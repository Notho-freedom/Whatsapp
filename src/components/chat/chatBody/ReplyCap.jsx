import { FaReply, FaUser, FaCrown, FaStar, FaCheck, FaCheckDouble, FaClock } from 'react-icons/fa';
import { memo } from 'react';
import { XCircle, MessageCircle, Image, Video, FileText, Link, Mic, Phone, Shield } from 'lucide-react';

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
    // Priorité au texte du message
    if (replyTo.text) return truncateText(replyTo.text);

    // Ensuite les médias avec des descriptions plus détaillées
    if (replyTo.media && replyTo.media.length > 0) {
      const mediaType = replyTo.media[0].type;
      switch (mediaType) {
        case 'image': return '📷 Image';
        case 'video': return '🎥 Vidéo';
        case 'audio': return '🎵 Message vocal';
        case 'document': return '📄 Document';
        case 'file': return '📎 Fichier';
        default: return `📎 ${mediaType}`;
      }
    }

    // Liens
    if (replyTo.link) {
      if (replyTo.link.title) return `🔗 ${truncateText(replyTo.link.title, 40)}`;
      return '🔗 Lien';
    }

    // Appels
    if (replyTo.type === 'call') return '📞 Appel';

    // Messages système
    if (replyTo.type === 'system') return 'ℹ️ Message système';

    // Fallback intelligent basé sur le type
    if (replyTo.type) return `💬 ${replyTo.type}`;
    
    return '💬 Message';
  };

  const getSenderName = () => {
    // Si c'est l'utilisateur actuel qui a envoyé le message
    if (replyTo.sender === 'me' || replyTo.sender === currentUser?.id) {
      return currentUser?.name || 'Vous';
    }

    // Si on a un nom directement dans replyTo
    if (replyTo.senderName) {
      return replyTo.senderName;
    }

    // Chercher dans la liste des utilisateurs
    const senderUser = users?.find(u => u.id === replyTo.sender);
    if (senderUser) {
      return senderUser.name;
    }

    // Fallback si l'expéditeur est l'ID du chat sélectionné (pour les chats individuels)
    if (replyTo.sender === selectedChat?.id) {
      return selectedChat?.name;
    }

    return 'Unknown';
  };

  const getSenderAvatar = () => {
    // Si c'est l'utilisateur actuel qui a envoyé le message
    if (replyTo.sender === 'me' || replyTo.sender === currentUser?.id) {
      return currentUser?.picture || currentUser?.avatar || 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=Vous';
    }
    
    if (replyTo.senderAvatar) {
      return replyTo.senderAvatar;
    }
    const senderUser = users?.find(u => u.id === replyTo.sender);
    if (senderUser) {
      return senderUser.avatar || senderUser.picture;
    }
    if (replyTo.sender === selectedChat?.id) {
      return selectedChat?.avatar;
    }
    return 'https://via.placeholder.com/40x40/CCCCCC/FFFFFF?text=NA';
  };

  const isOwnMessage = replyTo.sender === 'me' || replyTo.sender === currentUser?.id;
  const isGroupChat = selectedChat?.isGroup || selectedChat?.participants?.length > 2;
  const isAdmin = replyTo.isAdmin || replyTo.role === 'admin';
  const isVerified = replyTo.isVerified || replyTo.verified;
  const isPremium = replyTo.isPremium || replyTo.premium;
  
  const senderName = getSenderName();
  const senderAvatar = getSenderAvatar();

  // Couleurs personnalisées selon le type de message et l'expéditeur
  const getBorderColor = () => {
    if (isOwnMessage) return 'border-green-400';
    if (isAdmin) return 'border-purple-400';
    if (isVerified) return 'border-blue-400';
    if (isPremium) return 'border-yellow-400';
    return 'border-green-500';
  };

  const getBackgroundColor = () => {
    if (isOwnMessage) return 'bg-green-900/20';
    if (isAdmin) return 'bg-purple-900/20';
    if (isVerified) return 'bg-blue-900/20';
    if (isPremium) return 'bg-yellow-900/20';
    return 'bg-neutral-600/70';
  };

  const getTextColor = () => {
    if (isOwnMessage) return 'text-green-400';
    if (isAdmin) return 'text-purple-400';
    if (isVerified) return 'text-blue-400';
    if (isPremium) return 'text-yellow-400';
    return 'text-[#00a884]';
  };

  // Icône selon le type de message
  const getMessageIcon = () => {
    if (replyTo.media && replyTo.media.length > 0) {
      const mediaType = replyTo.media[0].type;
      switch (mediaType) {
        case 'image': return <Image size={12} className="text-blue-400" />;
        case 'video': return <Video size={12} className="text-red-400" />;
        case 'audio': return <Mic size={12} className="text-green-400" />;
        case 'document': return <FileText size={12} className="text-orange-400" />;
        default: return <FileText size={12} className="text-gray-400" />;
      }
    }
    if (replyTo.link) return <Link size={12} className="text-blue-400" />;
    if (replyTo.type === 'call') return <Phone size={12} className="text-green-400" />;
    return <MessageCircle size={12} className="text-gray-400" />;
  };

  // Indicateurs de statut
  const getStatusIndicators = () => {
    const indicators = [];
    
    if (isAdmin) {
      indicators.push(
        <div key="admin" className="flex items-center gap-1 text-purple-400" title="Administrateur">
          <FaCrown size={10} />
        </div>
      );
    }
    
    if (isVerified) {
      indicators.push(
        <div key="verified" className="flex items-center gap-1 text-blue-400" title="Vérifié">
          <Shield size={10} />
        </div>
      );
    }
    
    if (isPremium) {
      indicators.push(
        <div key="premium" className="flex items-center gap-1 text-yellow-400" title="Premium">
          <FaStar size={10} />
        </div>
      );
    }
    
    if (replyTo.pinned) {
      indicators.push(
        <div key="pinned" className="flex items-center gap-1 text-orange-400" title="Épinglé">
          <FaStar size={10} />
        </div>
      );
    }
    
    return indicators;
  };

  // Timestamp formaté
  const getFormattedTime = () => {
    if (!replyTo.timestamp) return null;
    
    const date = new Date(replyTo.timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Aperçu des médias avec thumbnails réduits
  const getMediaPreview = () => {
    if (!replyTo.media || replyTo.media.length === 0) return null;

    const media = replyTo.media[0];
    
    // Pour les images, essayer de montrer un aperçu réduit
    if (media.type === 'image' && media.url) {
      return (
        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
          <img 
            src={media.url} 
            alt="Aperçu image"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden text-base text-[#8696a0] items-center justify-center w-full h-full">
            📷
          </div>
        </div>
      );
    }

    // Pour les autres types de médias, utiliser des icônes avec couleurs
    const getMediaIcon = () => {
      switch (media.type) {
        case 'video': return <Video size={16} className="text-red-400" />;
        case 'audio': return <Mic size={16} className="text-green-400" />;
        case 'document': return <FileText size={16} className="text-orange-400" />;
        case 'file': return <FileText size={16} className="text-blue-400" />;
        default: return <FileText size={16} className="text-gray-400" />;
      }
    };

    return (
      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
        {getMediaIcon()}
      </div>
    );
  };

  // Aperçu des liens avec thumbnails
  const getLinkPreview = () => {
    if (!replyTo.link) return null;

    return (
      <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
        {replyTo.link.thumbnail ? (
          <img 
            src={replyTo.link.thumbnail} 
            alt="Aperçu lien"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`text-base text-[#8696a0] items-center justify-center w-full h-full ${replyTo.link.thumbnail ? 'hidden' : 'flex'}`}>
          🔗
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full bg-[#2c2c2c] animate-[replyCapSlideIn_0.2s_ease-out]">
      {/* Barre de réponse */}
      <div className="flex items-stretch p-1 pr-2 pt-2 ml-[14.5%]">
        {/* Ligne verticale personnalisée */}
        <div className={`w-1 ${getBorderColor()} rounded-l-2xl flex-shrink-0`} />
        
        {/* Contenu principal */}
        <div className={`flex-1 ${getBackgroundColor()} pl-2 min-w-0 flex flex-col justify-center gap-1 border-t-2 rounded-tl-[3px] ${getBorderColor()}`}>
          
          {/* En-tête avec nom, avatar et indicateurs */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <FaReply className={`text-xs shrink-0 ${getTextColor()}`} />
              
              {/* Avatar de l'expéditeur */}
              {senderAvatar ? (
                <img 
                  src={senderAvatar} 
                  alt={senderName}
                  className="w-4 h-4 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-4 h-4 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                  <FaUser size={10} className="text-white" />
                </div>
              )}
              
              <span className={`font-semibold truncate ${getTextColor()}`}>
                {isOwnMessage ? 'Vous' : senderName}
              </span>
              
              {/* Indicateurs de statut */}
              {getStatusIndicators()}
            </div>
            
            {/* Timestamp */}
            {getFormattedTime() && (
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <FaClock size={8} />
                <span>{getFormattedTime()}</span>
              </div>
            )}
          </div>
          
          {/* Aperçu du message avec icône et thumb */}
          <div className="flex items-center gap-2">
            {/* Icône du type de message */}
            <div className="flex-shrink-0">
              {getMessageIcon()}
            </div>
            
            {/* Aperçu du contenu */}
            <div className="flex-1 text-[#d1d7db] text-sm leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
              {getMessagePreview()}
            </div>
            
            {/* Thumbnail pour media ou lien */}
            {getMediaPreview() || getLinkPreview()}
          </div>
          
          {/* Informations supplémentaires si disponibles */}
          {(replyTo.reactions?.length > 0 || replyTo.replyCount > 0 || replyTo.forwardCount > 0) && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {replyTo.reactions?.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>👍 {replyTo.reactions.length}</span>
                </div>
              )}
              {replyTo.replyCount > 0 && (
                <div className="flex items-center gap-1">
                  <FaReply size={8} />
                  <span>{replyTo.replyCount}</span>
                </div>
              )}
              {replyTo.forwardCount > 0 && (
                <div className="flex items-center gap-1">
                  <span>↗️ {replyTo.forwardCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Bouton annuler */}
        <button 
          className={`${getBackgroundColor()} border-t-2 ${getBorderColor()} px-2 flex items-center justify-center rounded-r-[3px]`}
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
