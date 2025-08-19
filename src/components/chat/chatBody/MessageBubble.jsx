import { FaCheck, FaCheckDouble, FaAngleDown, FaReply, FaStar, FaThumbtack, FaTrash, FaCopy, FaForward, FaDownload, FaShare, FaEye } from 'react-icons/fa';
import MediaGroup from './MediaGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { showContextMenu, downloadMedia, viewMedia, shareMedia, createMessageMenuItems } from '@/utils/electronUtils';
import { showSuccess, showError, showInfo } from '@/utils/notificationUtils';

const MessageBubble = memo(function MessageBubble({ message, isFirstInGroup, isLastInGroup, isMobile }) {
  const isMe = message.sender === 'me';
  const messageRef = useRef(null);
  const longPressTimer = useRef(null);
  const { addReactionToMessage, removeReactionFromMessage, deleteMessage, selectedChat, setReplyTo, toggleMessageStar, toggleChatPin } = useAppContext();

  // Gestionnaires d'actions avec notifications améliorées
  const handleReplyMessage = useCallback(async (messageData) => {
    try {
      console.log('Reply to message:', messageData);
      // Définir le message auquel on répond
      setReplyTo(messageData);
      showInfo('Reply', 'Réponse activée - tapez votre message');
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      showError('Erreur', 'Erreur lors de la réponse au message');
    }
  }, [setReplyTo]);

  const handleForwardMessage = useCallback(async (messageData) => {
    try {
      console.log('Forward message:', messageData);
      showInfo('Forward', 'Fonction de transfert en cours de développement');
    } catch (error) {
      console.error('Erreur lors du transfert:', error);
      showError('Erreur', 'Erreur lors du transfert du message');
    }
  }, []);

  const handleCopyMessage = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess('Copied', 'Message copié dans le presse-papiers');
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      showError('Erreur', 'Erreur lors de la copie du message');
    }
  }, []);

  const handleViewMedia = useCallback(async (media) => {
    try {
      console.log('View media:', media);
      const result = await viewMedia(media);
      if (result.success) {
        showSuccess('Media', result.message || 'Média affiché avec succès');
      } else {
        showError('Erreur', result.error || 'Erreur lors de l\'affichage du média');
      }
    } catch (error) {
      console.error('Erreur lors de l\'affichage du média:', error);
      showError('Erreur', 'Erreur lors de l\'affichage du média');
    }
  }, []);

  const handleSaveMedia = useCallback(async (media) => {
    try {
      console.log('Save media:', media);
      const result = await downloadMedia(media);
      if (result.success) {
        showSuccess('Download', result.message || 'Média téléchargé avec succès');
      } else {
        showError('Erreur', result.error || 'Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showError('Erreur', 'Erreur lors du téléchargement du média');
    }
  }, []);

  const handleShareMedia = useCallback(async (media) => {
    try {
      console.log('Share media:', media);
      const result = await shareMedia(media);
      if (result.success) {
        showSuccess('Shared', result.message || 'Média partagé avec succès');
      } else {
        showError('Erreur', result.error || 'Erreur lors du partage');
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      showError('Erreur', 'Erreur lors du partage du média');
    }
  }, []);

  const handleStarMessage = useCallback(async (messageData) => {
    try {
      if (selectedChat && messageData.id) {
        toggleMessageStar(selectedChat.id, messageData.id);
        const isStarred = messageData.isStarred;
        if (isStarred) {
          showSuccess('Unstarred', 'Message retiré des favoris');
        } else {
          showSuccess('Starred', 'Message ajouté aux favoris');
        }
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error);
      showError('Erreur', 'Erreur lors du marquage du message');
    }
  }, [selectedChat, toggleMessageStar]);

  const handlePinMessage = useCallback(async (messageData) => {
    try {
      if (selectedChat) {
        toggleChatPin(selectedChat.id);
        const isPinned = selectedChat.isPinned;
        if (isPinned) {
          showSuccess('Unpinned', 'Conversation désépinglée');
        } else {
          showSuccess('Pinned', 'Conversation épinglée');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'épinglage:', error);
      showError('Erreur', 'Erreur lors de l\'épinglage de la conversation');
    }
  }, [selectedChat, toggleChatPin]);

  const handleDeleteMessage = useCallback(async (messageData) => {
    try {
      if (selectedChat && messageData.id) {
        deleteMessage(selectedChat.id, messageData.id);
        showSuccess('Deleted', 'Message supprimé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur', 'Erreur lors de la suppression du message');
    }
  }, [selectedChat, deleteMessage]);

  const handleAddReaction = useCallback((reaction) => {
    if (selectedChat && message.id) {
      addReactionToMessage(selectedChat.id, message.id, reaction);
    }
  }, [selectedChat, message.id, addReactionToMessage]);

  const handleRemoveReaction = useCallback((reaction) => {
    if (selectedChat && message.id) {
      removeReactionFromMessage(selectedChat.id, message.id, reaction);
    }
  }, [selectedChat, message.id, removeReactionFromMessage]);

  // Fonction pour ouvrir le menu contextuel natif
  const showNativeContextMenu = useCallback(async (e, messageData) => {
    e.preventDefault();
    
    try {
      // Créer les gestionnaires d'actions
      const handlers = {
        handleReplyMessage,
        handleForwardMessage,
        handleCopyMessage,
        handleViewMedia,
        handleSaveMedia,
        handleShareMedia,
        handleStarMessage,
        handlePinMessage,
        handleDeleteMessage
      };
      
      // Créer les items du menu
      const menuItems = createMessageMenuItems(messageData, handlers, isMe);
      
      // Afficher le menu contextuel
      const result = await showContextMenu(menuItems, e.clientX, e.clientY);
      
      if (result && result.success) {
        console.log('Menu contextuel affiché avec succès');
      } else if (result && result.error) {
        console.error('Erreur du menu contextuel:', result.error);
        showError('Erreur', 'Erreur lors de l\'affichage du menu contextuel');
      }
    } catch (error) {
      console.error('Erreur lors de l\'affichage du menu contextuel:', error);
      showError('Erreur', 'Erreur lors de l\'affichage du menu contextuel');
    }
  }, [isMe, handleReplyMessage, handleForwardMessage, handleCopyMessage, handleViewMedia, handleSaveMedia, handleShareMedia, handleStarMessage, handlePinMessage, handleDeleteMessage]);

  // Gestion du long press sur mobile
  const handleLongPressStart = useCallback(() => {
    if (!isMobile) return;
    
    longPressTimer.current = setTimeout(() => {
      showNativeContextMenu({ 
        preventDefault: () => {}, 
        clientX: 0, 
        clientY: 0 
      }, message);
      
      // Vibration feedback si disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, [isMobile, showNativeContextMenu, message]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  return (
      <div 
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-[2px] group`}
        ref={messageRef}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
      onTouchMove={handleLongPressEnd}
      onTouchCancel={handleLongPressEnd}
      >
      <div className="relative flex items-start max-w-[75%] md:max-w-[80%]">
          {/* Message tail pour le premier message d'un groupe */}
          {isFirstInGroup && (
            <div className={`wa-message-tail ${isMe ? 'wa-message-tail-self' : 'wa-message-tail-others'}`} />
          )}

          {/* Message bubble */}
          <div
            className={`wa-message-bubble ${isMe ? 'wa-message-bubble-self' : 'wa-message-bubble-others'} 
            hover:shadow-lg transition-shadow cursor-pointer relative`}
            style={{
              borderTopRightRadius: isMe && isFirstInGroup ? 0 : 7.5,
              borderTopLeftRadius: !isMe && isFirstInGroup ? 0 : 7.5,
            }}
          onContextMenu={(e) => showNativeContextMenu(e, message)}
          role="article"
          aria-label={`Message from ${isMe ? 'you' : message.senderName || 'contact'}`}
        >
          {/* Étoile pour les messages favoris */}
          {message.isStarred && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 z-10">
              <FaStar size={8} className="text-white" />
            </div>
          )}

            {/* Message forwarded label */}
            {message.forwarded && (
            <div className="text-[#8696a0] text-[12px] sm:text-[13px] mb-[2px]">
                Forwarded
              </div>
            )}

            {/* Reply */}
            {message.replyTo && (
              <div 
              className="mb-[3px] p-[5px] sm:p-[6px] rounded-[7.5px] border-l-[4px] cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: isMe ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isMe ? '#06cf9c' : '#8696a0'
                }}
              role="blockquote"
              >
              <div className="text-[12px] sm:text-[13px] font-medium mb-[2px]" style={{ color: isMe ? '#06cf9c' : '#53bdeb' }}>
                {message.replyTo.sender === 'me' ? 'You' : message.replyTo.senderName || 'Unknown'}
                </div>
              <div className="text-[#d1d7db] text-[13px] sm:text-[14px] line-clamp-3">
                {message.replyTo.text || (message.replyTo.media ? 'Media' : 'Message')}
                </div>
              </div>
            )}

            {/* Media */}
          {message.media && message.media.length > 0 && (
            <MediaGroup media={message.media} isMe={isMe} isMobile={isMobile} />
          )}

            {/* Link preview */}
            {message.link && <PreviewLink link={message.link} />}

            {/* Text message */}
            {message.text && (
              <div className="wa-message-text">
                <span>{message.text}</span>
                {/* Spacer for metadata */}
                <span className="inline-block" style={{ width: message.edited ? '85px' : '74px' }}></span>
              </div>
            )}

            {/* Message metadata (time + status) */}
            <div className="wa-message-meta">
            {message.edited && <span className="text-[10px] sm:text-[11px] mr-1">edited</span>}
            <span className="wa-message-time">{message.time || 'now'}</span>
              {isMe && (
              <span className="wa-message-status ml-1" aria-label={message.read ? 'Read' : 'Delivered'}>
                  {message.read ? (
                  <FaCheckDouble className="text-[#53bdeb]" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '10px' : '11px' }} />
                  ) : (
                  <FaCheckDouble className="text-[#8b9a9f]" style={{ width: isMobile ? '14px' : '16px', height: isMobile ? '10px' : '11px' }} />
                  )}
                </span>
              )}
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
            <ReactionBar 
              reactions={message.reactions} 
              isMobile={isMobile}
              onAddReaction={handleAddReaction}
              onRemoveReaction={handleRemoveReaction}
            />
            )}
          </div>

        {/* Options chevron on hover - Desktop only */}
        {!isMobile && (
          <button 
            className={`absolute top-[8px] ${isMe ? '-left-[28px]' : '-right-[28px]'} 
              opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded hover:bg-[#2a373f]`}
            onClick={(e) => showNativeContextMenu(e, message)}
            aria-label="Message options"
          >
            <FaAngleDown size={18} className="text-[#8696a0] hover:text-[#d1d7db]" />
            </button>
          )}
      </div>
        </div>
  );
}, (prevProps, nextProps) => {
  // Optimisation des re-renders
  return prevProps.message.id === nextProps.message.id &&
         prevProps.isFirstInGroup === nextProps.isFirstInGroup &&
         prevProps.isLastInGroup === nextProps.isLastInGroup &&
         prevProps.isMobile === nextProps.isMobile;
});

export default MessageBubble;
