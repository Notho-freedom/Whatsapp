'use client';

import { FaAngleDown, FaStar, FaSmile } from 'react-icons/fa';
import MediaGroup, { AudioMessage } from './MediaGroup';
import DocumentItem from './DocumentItem';
import PollItem from './PollItem';
import ContactGroup from './ContactGroup';
import PreviewLink from './PreviewLink';
import ReactionBar from './ReactionBar';
import MessageContextMenu from './MessageContextMenu';
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useAppContext } from '@/context';
import { downloadMedia, viewMedia, shareMedia } from '@/utils';
import { showSuccess, showError, showInfo } from '@/utils';
import { useMessageContextMenu } from '@/hooks';
import { BsCheck2All } from 'react-icons/bs';

const MessageBubble = memo(
  function MessageBubble({
    message,
    isFirstInGroup,
    isLastInGroup,
    isMobile,
    currentUser,
  }) {
    const isMe = message.sender === 'me';
    const messageRef = useRef(null);
    const longPressTimer = useRef(null);
    const [contextMenu, setContextMenu] = useState({
      isOpen: false,
      position: null,
    });
    const {
      addReactionToMessage,
      removeReactionFromMessage,
      deleteMessage,
      selectedChat,
      setReplyTo,
      toggleMessageStar,
      toggleChatPin,
      users,
    } = useAppContext();

    // Récupérer les informations de l'utilisateur pour l'avatar
    const getUserInfo = useCallback(() => {
      if (isMe) {
        // Pour l'utilisateur actuel, utiliser l'utilisateur connecté
        return {
          name: currentUser?.name || 'Me',
          avatar: currentUser?.picture || null,
        };
      } else {
        // Pour les autres utilisateurs, récupérer depuis la liste des utilisateurs
        if (selectedChat && users.length > 0) {
          const user = users.find(u => u.id === selectedChat.id);
          if (user) {
            return {
              name: user.name,
              avatar: user.avatar,
            };
          }
        }
        // Fallback si pas d'utilisateur trouvé
        return {
          name: message.senderName || 'Contact',
          avatar: null,
        };
      }
    }, [isMe, selectedChat, users, message.senderName, currentUser]);

    // Gestionnaires d'actions avec notifications améliorées
    const handleReplyMessage = useCallback(
      async messageData => {
        try {
          console.log('Reply to message:', messageData);

          // Enrichir les données du message avec les informations utilisateur
          const enrichedMessageData = {
            ...messageData,
            senderName: messageData.senderName || getUserInfo().name,
            senderAvatar: messageData.senderAvatar || getUserInfo().avatar,
            // S'assurer que l'ID de l'expéditeur est correct
            sender: messageData.sender || (isMe ? 'me' : messageData.senderId),
            // Ajouter des informations supplémentaires si disponibles
            timestamp: messageData.timestamp || new Date().toISOString(),
            messageType: messageData.type || 'text',
          };

          console.log('Enriched message data for reply:', enrichedMessageData);

          // Définir le message auquel on répond
          setReplyTo(enrichedMessageData);
          showInfo('Reply', 'Réponse activée - tapez votre message');
        } catch (error) {
          console.error('Erreur lors de la réponse:', error);
          showError('Erreur', 'Erreur lors de la réponse au message');
        }
      },
      [setReplyTo, getUserInfo, isMe]
    );

    const handleForwardMessage = useCallback(async messageData => {
      try {
        console.log('Forward message:', messageData);
        showInfo('Forward', 'Fonction de transfert en cours de développement');
      } catch (error) {
        console.error('Erreur lors du transfert:', error);
        showError('Erreur', 'Erreur lors du transfert du message');
      }
    }, []);

    const handleCopyMessage = useCallback(async text => {
      try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied', 'Message copié dans le presse-papiers');
      } catch (error) {
        console.error('Erreur lors de la copie:', error);
        showError('Erreur', 'Erreur lors de la copie du message');
      }
    }, []);

    const handleViewMedia = useCallback(async media => {
      try {
        console.log('View media:', media);
        const result = await viewMedia(media);
        if (result.success) {
          showSuccess('Media', result.message || 'Média affiché avec succès');
        } else {
          showError(
            'Erreur',
            result.error || "Erreur lors de l'affichage du média"
          );
        }
      } catch (error) {
        console.error("Erreur lors de l'affichage du média:", error);
        showError('Erreur', "Erreur lors de l'affichage du média");
      }
    }, []);

    const handleSaveMedia = useCallback(async media => {
      try {
        console.log('Save media:', media);
        const result = await downloadMedia(media);
        if (result.success) {
          showSuccess(
            'Download',
            result.message || 'Média téléchargé avec succès'
          );
        } else {
          showError('Erreur', result.error || 'Erreur lors du téléchargement');
        }
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        showError('Erreur', 'Erreur lors du téléchargement du média');
      }
    }, []);

    const handleShareMedia = useCallback(async media => {
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

    const drawingUrl =
      message?.drawing?.image_url ||
      message?.drawing?.imageUrl ||
      message?.drawing?.url ||
      null;

    // Traiter les dessins comme des images (même système que message.media)
    const computedMedia = (() => {
      const base = Array.isArray(message?.media) ? message.media : [];
      if (!drawingUrl) return base;
      // Éviter les doublons si handleDrawingCreation a déjà injecté media
      const alreadyThere = base.some(m => {
        const url = m?.url || m?.file_url || m?.downloadURL || m?.fileUrl;
        return url === drawingUrl;
      });
      if (alreadyThere) return base;
      return [
        ...base,
        {
          type: 'image',
          url: drawingUrl,
          original_name: message?.drawing?.title || 'Dessin',
          source: 'drawing',
        },
      ];
    })();

    const hasMedia = computedMedia.length > 0;
    const isDrawingMessage = message?.type === 'drawing' || !!drawingUrl;
    const isPollMessage = message?.type === 'poll' || !!message?.poll;

    const handleStarMessage = useCallback(
      async messageData => {
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
      },
      [selectedChat, toggleMessageStar]
    );

    const handlePinMessage = useCallback(
      async messageData => {
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
          console.error("Erreur lors de l'épinglage:", error);
          showError('Erreur', "Erreur lors de l'épinglage de la conversation");
        }
      },
      [selectedChat, toggleChatPin]
    );

    const handleDeleteMessage = useCallback(
      async messageData => {
        try {
          if (selectedChat && messageData.id) {
            deleteMessage(selectedChat.id, messageData.id);
            showSuccess('Deleted', 'Message supprimé avec succès');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          showError('Erreur', 'Erreur lors de la suppression du message');
        }
      },
      [selectedChat, deleteMessage]
    );

    const handleAddReaction = useCallback(
      reaction => {
        if (selectedChat && message.id) {
          console.log(
            'Adding reaction:',
            reaction,
            'to message:',
            message.id,
            'in chat:',
            selectedChat.id
          );
          addReactionToMessage(selectedChat.id, message.id, reaction);
          showInfo('Reaction', `Réaction ${reaction} ajoutée`);
        } else {
          console.error(
            'Cannot add reaction: missing selectedChat or message.id',
            { selectedChat, messageId: message.id }
          );
          showError('Erreur', "Impossible d'ajouter la réaction");
        }
      },
      [selectedChat, message.id, addReactionToMessage]
    );

    const handleRemoveReaction = useCallback(
      reaction => {
        if (selectedChat && message.id) {
          removeReactionFromMessage(selectedChat.id, message.id, reaction);
        }
      },
      [selectedChat, message.id, removeReactionFromMessage]
    );

    // Fonction pour ouvrir le menu contextuel
    const openContextMenu = useCallback((e, messageData) => {
      e.preventDefault();
      e.stopPropagation();

      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
      });
    }, []);

    // Fonction pour fermer le menu contextuel
    const closeContextMenu = useCallback(() => {
      setContextMenu({ isOpen: false, position: null });
    }, []);

    // Gestionnaire d'actions du menu contextuel
    const handleMenuAction = useCallback(
      (action, data) => {
        switch (action) {
          case 'reply':
            handleReplyMessage(data);
            break;
          case 'forward':
            handleForwardMessage(data);
            break;
          case 'copy':
            handleCopyMessage(data);
            break;
          case 'star':
            handleStarMessage(data);
            break;
          case 'pin':
            handlePinMessage(data);
            break;
          case 'delete':
            handleDeleteMessage(data);
            break;
          case 'view-media':
            handleViewMedia(data);
            break;
          case 'save-media':
            handleSaveMedia(data);
            break;
          case 'share-media':
            handleShareMedia(data);
            break;
          case 'view-link':
            handleViewMedia({ type: 'link', url: data.url });
            break;
          default:
            console.log('Action non reconnue:', action);
        }
      },
      [
        handleReplyMessage,
        handleForwardMessage,
        handleCopyMessage,
        handleStarMessage,
        handlePinMessage,
        handleDeleteMessage,
        handleViewMedia,
        handleSaveMedia,
        handleShareMedia,
      ]
    );

    // Hook pour les menus contextuels natifs d'Electron
    const nativeMessageMenu = useMessageContextMenu(handleMenuAction);

    // Gestion du long press sur mobile
    const handleLongPressStart = useCallback(() => {
      if (!isMobile) return;

      longPressTimer.current = setTimeout(() => {
        // Positionner le menu au centre de l'écran sur mobile
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        setContextMenu({
          isOpen: true,
          position: { x: centerX, y: centerY },
        });

        // Vibration feedback si disponible
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    }, [isMobile]);

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

    const isAudioMessage = message?.type === 'audio';

    // Debug audio messages
    if (isAudioMessage) {
      console.log('🎵 MessageBubble audio:', {
        id: message.id,
        type: message.type,
        audio: message.audio,
        hasAudio: !!message.audio,
        messageKeys: Object.keys(message),
      });
    }

    return (
      <div
        className={`flex ${
          isMe ? 'justify-end' : 'justify-start'
        } mb-[2px] group`}
        ref={messageRef}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        onTouchMove={handleLongPressEnd}
        onTouchCancel={handleLongPressEnd}
      >
        <div className="relative flex items-start max-w-[75%] md:max-w-[80%]">
          {/* Message tail pour le premier message d'un groupe */}
          {isFirstInGroup && (
            <div
              className={`wa-message-tail ${
                isMe ? 'wa-message-tail-self' : 'wa-message-tail-others'
              }`}
            />
          )}

          {/* Message bubble */}
          <div
            className={`wa-message-bubble ${
              isMe ? 'wa-message-bubble-self' : 'wa-message-bubble-others'
            } 
            hover:shadow-lg transition-shadow cursor-pointer relative`}
            style={{
              borderTopRightRadius: isMe && isFirstInGroup ? 0 : 7.5,
              borderTopLeftRadius: !isMe && isFirstInGroup ? 0 : 7.5,
            }}
            onContextMenu={e => {
              // Menu contextuel natif Electron (priorité)
              if (nativeMessageMenu && nativeMessageMenu.isElectron) {
                nativeMessageMenu.handleContextMenu(e, {
                  messageId: message.id,
                  text: message.text,
                  timestamp: message.time,
                  sender: message.sender,
                  isStarred: message.isStarred,
                  media: computedMedia,
                  link: message.link,
                });
              } else {
                // Fallback vers le menu contextuel HTML existant
                openContextMenu(e, message);
              }
            }}
            role="article"
            aria-label={`Message from ${
              isMe ? 'you' : message.senderName || 'contact'
            }`}
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
                  backgroundColor: isMe
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.06)',
                  borderColor: isMe ? '#06cf9c' : '#8696a0',
                }}
                role="blockquote"
              >
                <div
                  className="text-[12px] sm:text-[13px] font-medium mb-[2px]"
                  style={{ color: isMe ? '#06cf9c' : '#53bdeb' }}
                >
                  {message.replyTo.sender === 'me'
                    ? 'You'
                    : message.replyTo.senderName || 'Unknown'}
                </div>
                <div className="text-[#d1d7db] text-[13px] sm:text-[14px] line-clamp-3">
                  {message.replyTo.text ||
                    (message.replyTo.media ? 'Media' : 'Message')}
                </div>
              </div>
            )}

            {/* Media */}
            {hasMedia && (
              <MediaGroup
                media={computedMedia}
                isMe={isMe}
                isMobile={isMobile}
                messageId={message.id}
                userInfo={getUserInfo()}
                onAudioStateChange={audioState => {
                  // Ici on pourrait mettre à jour l'état global des messages audio
                  console.log('Audio state changed:', audioState);
                }}
              />
            )}

            {/* Document */}
            {message.document && (
              <DocumentItem
                document={message.document}
                isMobile={isMobile}
                isMe={isMe}
              />
            )}

            {/* Poll */}
            {isPollMessage && (
              <PollItem
                poll={message.poll}
                pollId={message.poll?.id || message.metadata?.poll_id}
                chatId={selectedChat?.id}
                messageId={message.id}
                isMobile={isMobile}
              />
            )}

            {/* Contact */}
            {(message.contact || message.contacts) && (
              <ContactGroup
                contacts={
                  message.contacts ||
                  (Array.isArray(message.contact)
                    ? message.contact
                    : [message.contact])
                }
                isMobile={isMobile}
              />
            )}

            {/* Link preview */}
            {message.link && <PreviewLink link={message.link} />}

            {/* Text message */}
            {(message.text &&
              (!isDrawingMessage || message.text !== '🎨 Dessin créé') &&
              (!message.poll ||
                !String(message.text).startsWith('📊 Sondage:')) &&
              !message.contact) ||
              (message.text.includes('Contact partagé:') && (
                <div className="wa-message-text">
                  <span>{message.text}</span>
                  {/* Spacer for metadata */}
                  <span
                    className="inline-block"
                    style={{ width: message.edited ? '85px' : '74px' }}
                  ></span>
                </div>
              ))}

            {/* Message metadata (time + status) */}
            <div className="wa-message-meta">
              {message.edited && (
                <span className="text-[10px] sm:text-[11px] mr-1">edited</span>
              )}
              <span className="wa-message-time">{message.time || 'now'}</span>
              {isMe && (
                <span
                  className="wa-message-status ml-1"
                  aria-label={message.read ? 'Read' : 'Delivered'}
                >
                  {message.read ? (
                    <BsCheck2All
                      className="text-[#53bdeb]"
                      style={{
                        width: isMobile ? '14px' : '20px',
                        height: isMobile ? '10px' : '15px',
                      }}
                    />
                  ) : (
                    <BsCheck2All
                      className="text-[#8b9a9f]"
                      style={{
                        width: isMobile ? '14px' : '20px',
                        height: isMobile ? '10px' : '15px',
                      }}
                    />
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

            {/* Audio message */}
            {isAudioMessage && message.audio && (
              <AudioMessage
                audio={message.audio}
                isMe={isMe}
                isMobile={isMobile}
                messageId={message.id}
                userInfo={getUserInfo()}
                onAudioStart={() => {
                  console.log('Audio started:', message.audio);
                }}
                onAudioStateChange={audioState => {
                  console.log('Audio state changed:', audioState);
                }}
              />
            )}
          </div>

          {/* Options chevron on hover - Desktop only */}
          {!isMobile && (
            <button
              className={`absolute flex items-center p-1.5 gap-1 rounded-full top-[8px] ${
                isMe ? '-left-[25%]' : '-right-[25%]'
              } 
              opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 text-xs bg-neutral-900/50 hover:bg-neutral-900/70`}
              onClick={e => {
                // Menu contextuel natif Electron (priorité)
                if (nativeMessageMenu && nativeMessageMenu.isElectron) {
                  nativeMessageMenu.handleContextMenu(e, {
                    messageId: message.id,
                    text: message.text,
                    timestamp: message.time,
                    sender: message.sender,
                    isStarred: message.isStarred,
                    media: computedMedia,
                    link: message.link,
                  });
                } else {
                  // Fallback vers le menu contextuel HTML existant
                  openContextMenu(e, message);
                }
              }}
              aria-label="Message options"
            >
              <FaAngleDown size={16} className="" />
              <FaSmile size={16} className="" />
            </button>
          )}
        </div>

        {/* Menu contextuel */}
        <MessageContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          message={message}
          isMe={isMe}
          onClose={closeContextMenu}
          onAction={handleMenuAction}
          onAddReaction={handleAddReaction}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Optimisation des re-renders
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.isFirstInGroup === nextProps.isFirstInGroup &&
      prevProps.isLastInGroup === nextProps.isLastInGroup &&
      prevProps.isMobile === nextProps.isMobile
    );
  }
);

export default MessageBubble;
