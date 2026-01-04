'use client';

import { useState, useEffect, useRef } from 'react';
import {
  LucideEdit,
  Pin,
  BellOff,
  Star,
  Search,
  Mic,
  Video,
  Phone,
  Image,
  FileText,
  Link,
  Music,
  MapPinMinus,
  SmileIcon,
} from 'lucide-react';
import { BsCheck2All } from 'react-icons/bs';
import { useAppContext } from '@/context';
import { StatusCircle } from '@/components/ui';
import Avatar from '@/components/ui/Avatar';
import Lenis from '@studio-freight/lenis';
import { useChatContextMenu } from '@/hooks';
import { useGoogleContacts } from '@/hooks';
import { useAutoAvatarPreloader } from '@/hooks';
import { userService } from '@/utils';
import { API_ENDPOINTS } from '@/utils/config';
import { generateConversationId } from '@/utils/conversationHelper';
import ContactList from './ContactList';

export default function ChatList({
  onChatSelect,
  selectedChatId,
  onStatusSelect,
}) {
  const [isClient, setIsClient] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [notification, setNotification] = useState(null);
  const {
    filteredUsers,
    contacts: appContacts,
    searchQuery,
    setSearchQuery,
    addUser,
    currentUser,
    markMessagesRead,
  } = useAppContext();
  const {
    contacts: googleContacts,
    isLoading: contactsLoading,
    error: contactsError,
  } = useGoogleContacts();
  const [showFirebaseUsers, setShowFirebaseUsers] = useState(false);
  const [firebaseUsers, setFirebaseUsers] = useState([]);
  const [firebaseLoading, setFirebaseLoading] = useState(false);
  // Hook temps réel pour la présence et les notifications
  const scrollRef = useRef(null);

  // Préchargement automatique des avatars
  useAutoAvatarPreloader(filteredUsers, 'chats');
  useAutoAvatarPreloader(googleContacts, 'contacts');

  // Hook pour les menus contextuels natifs d'Electron
  const nativeChatMenu = useChatContextMenu((actionId, data) => {
    console.log('Action de menu contextuel de chat:', actionId, data);
    // Ici vous pouvez ajouter la logique pour les actions de chat
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        const fuser = await userService.getAllUsers();
        setFirebaseUsers(fuser);
      } catch (err) {
        console.error(
          'Erreur lors du chargement des utilisateurs Firebase:',
          err
        );
      }
    }
    loadUsers();
  }, []);

  useEffect(() => {
    setIsClient(true);

    if (scrollRef.current) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: true,
        wrapper: scrollRef.current,
        content: scrollRef.current.children[0],
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }
  }, []);

  if (!isClient) {
    return null;
  }

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
  };

  // Fonction pour créer une conversation avec un contact
  const createConversationWithContact = contact => {
    console.log('✅ Selecting Firebase user for conversation:', contact);

    if (!currentUser || !currentUser.id) {
      setNotification({
        type: 'error',
        message: 'Utilisateur courant non défini.',
        timestamp: new Date(),
      });
      return;
    }

    // Pour les utilisateurs Firebase, utiliser directement leur ID (email)
    const recipientId = contact.id || contact.email;
    const recipientName =
      contact.displayName || contact.name || contact.email || 'Utilisateur';
    const recipientAvatar =
      contact.photoURL || contact.avatar || '/default-avatar.png';

    if (!recipientId) {
      setNotification({
        type: 'error',
        message: 'ID utilisateur Firebase manquant',
        timestamp: new Date(),
      });
      return;
    }

    // ⭐ IMPORTANT: Générer l'ID de conversation dès maintenant avec la même logique
    // que dans sendMessage() pour éviter les doublons de tuiles
    const conversationId = generateConversationId(currentUser.id, recipientId);

    // Create a temporary chat object for UI display
    // Store conversationId (not recipientId) to ensure consistency
    const tempChat = {
      id: conversationId, // ⭐ Utiliser l'ID déterministe comme ID principal
      conversationId: conversationId, // Garder aussi cette propriété pour la cohérence
      recipientId: recipientId, // ID du destinataire pour sendMessage
      name: recipientName,
      avatar: recipientAvatar,
      description: `Conversation avec ${recipientName}`,
      participants: [currentUser.id, recipientId],
      participants_info: {
        [currentUser.id]: {
          name: currentUser.name || currentUser.displayName || 'Moi',
          avatar:
            currentUser.avatar || currentUser.photoURL || '/default-avatar.png',
        },
        [recipientId]: {
          name: recipientName,
          avatar: recipientAvatar,
        },
      },
      isTemporary: true, // Mark as temporary until first message
      isNewConversation: true,
      lastMessage: null,
      unreadCount: 0,
      isPinned: false,
      isMuted: false,
      isTyping: false,
    };

    console.log('🎯 Chat temporaire créé avec utilisateur Firebase:', {
      conversationId,
      recipientId,
      recipientName,
      tempChat,
    });

    // Just select the chat (no Firebase call yet)
    // The conversation will be created in Firebase when the first message is sent
    onChatSelect(tempChat);
    setShowContacts(false);
    setShowFirebaseUsers(false);

    setNotification({
      type: 'info',
      message: `Ouverture de la conversation avec ${recipientName}`,
      timestamp: new Date(),
    });
    setTimeout(() => setNotification(null), 2000);
  };

  // Priorité : pinned > non pinned, puis par temps
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // D'abord par statut épinglé
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    // Ensuite par temps (plus récent en premier)
    const timeA = new Date(a.lastMessageTime || 0);
    const timeB = new Date(b.lastMessageTime || 0);
    return timeB - timeA;
  });

  const MessageIcon = ({ type }) => {
    const iconProps = { size: 14, className: 'text-gray-400 mr-1' };

    switch (type) {
      case 'voice':
        return <Mic {...iconProps} />;
      case 'video':
        return <Video {...iconProps} />;
      case 'image':
        return <Image {...iconProps} />;
      case 'document':
        return <FileText {...iconProps} />;
      case 'link':
        return <Link {...iconProps} />;
      case 'audio':
        return <Music {...iconProps} />;
      case 'location':
        return <MapPinMinus {...iconProps} />;
      case 'sticker':
        return <SmileIcon {...iconProps} />;
      default:
        return null;
    }
  };

  const renderLastMessage = chat => {
    if (chat.isTyping) {
      return (
        <span className="text-[#1DAA61] truncate w-[100%]">
          {chat.name} is typing...
        </span>
      );
    }

    // Vérifier si lastMessage existe (pour les nouveaux chats temporaires)
    if (!chat.lastMessage) {
      return (
        <span className="text-gray-400 truncate italic">Aucun message</span>
      );
    }

    const isSentByMe =
      !!chat.lastMessage?.sender && chat.lastMessage.sender === currentUser?.id;

    const getLastMessageAtMs = value => {
      if (!value) return null;
      if (value instanceof Date) return value.getTime();
      if (typeof value === 'number') return value;
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
    };

    const lastMessageAtMs = getLastMessageAtMs(chat.lastMessageAt);
    const otherReadAtMs = getLastMessageAtMs(
      chat.lastReadAt?.[chat.otherParticipantId]
    );
    const isReadByOther =
      isSentByMe &&
      lastMessageAtMs !== null &&
      otherReadAtMs !== null &&
      otherReadAtMs >= lastMessageAtMs;

    return (
      <>
        {isSentByMe && (
          <BsCheck2All
            className={`mr-1 ${
              isReadByOther ? 'text-[#53bdeb]' : 'text-gray-400'
            }`}
            size={16}
          />
        )}
        <MessageIcon type={chat.lastMessage.type} />
        <span className="truncate">
          {(chat.lastMessage.type === 'voice' ||
            chat.lastMessage.type === 'voices') &&
            `Voice message (${chat.lastMessage.duration || '0:23'})`}
          {(chat.lastMessage.type === 'video' ||
            chat.lastMessage.type === 'videos') &&
            `Video (${chat.lastMessage.duration || '1:45'})`}
          {(chat.lastMessage.type === 'audio' ||
            chat.lastMessage.type === 'audios') &&
            `Audio (${chat.lastMessage.duration || '3:12'})`}
          {(chat.lastMessage.type === 'document' ||
            chat.lastMessage.type === 'documents') &&
            `${chat.lastMessage.text} • ${chat.lastMessage.size || '2.4 MB'}`}
          {!['voice', 'video', 'audio', 'document'].includes(
            chat.lastMessage.type
          ) && chat.lastMessage.text}
        </span>
      </>
    );
  };

  return (
    <div className="h-full flex flex-col pl-1.5 relative">
      {/* Notification */}
      {notification && (
        <div
          className={`absolute top-4 left-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {notification.type === 'success' ? '✅ ' : '❌ '}
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="pl-4 pt-4 pr-2 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-xl font-segoe">
            {showContacts ? 'Contacts' : showFirebaseUsers ? 'Users' : 'Chats'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="New chat"
              className={`p-2 rounded-md transition-colors ${
                showContacts
                  ? 'bg-whatsapp-dark-700 text-white'
                  : 'hover:bg-whatsapp-dark-700 text-gray-200'
              }`}
              onClick={() => setShowContacts(!showContacts)}
            >
              <LucideEdit size={16} className="text-gray-200" />
            </button>
            <button
              aria-label="Firebase users"
              className={`p-2 rounded-md transition-colors ${
                showFirebaseUsers
                  ? 'bg-whatsapp-dark-700 text-white'
                  : 'hover:bg-whatsapp-dark-700 text-gray-200'
              }`}
              onClick={() => {
                setShowContacts(false);
                setShowFirebaseUsers(v => !v);
              }}
            >
              <span role="img" aria-label="firebase">
                🔥
              </span>
            </button>
            <button
              aria-label="Filter chats"
              className="p-2 rounded-md hover:bg-whatsapp-dark-700 transition-colors"
              onClick={() => {
                // Ouvrir le filtre des chats
                window.dispatchEvent(
                  new CustomEvent('filter-chats', {
                    detail: { action: 'open' },
                  })
                );
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-gray-200"
              >
                <path d="M4 7H20" strokeWidth="2" strokeLinecap="round" />
                <path d="M6 12H18" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 17H16" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            className="w-full max-h-8 bg-[#3D3D3D] text-white placeholder-gray-200 placeholder:text-sm py-2 pl-8 pr-3 rounded-[0.30rem] border-b border-white/50 backdrop-blur-lg focus:outline-none focus:ring-none focus:border-b-2 focus:border-[#1DAA61] focus:bg-[#202020]"
            placeholder={
              showContacts
                ? 'Rechercher des contacts'
                : 'Search or start a new chat'
            }
            type="text"
            onChange={handleSearchChange}
            value={searchQuery}
          />
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/3 text-gray-200 text-xs rotate-90 weigth-thin"
          />
        </div>
      </div>

      {/* Chat List avec Lenis */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-1 chat-list">
        <div>
          {showContacts ? (
            <ContactList
              users={googleContacts}
              onSelect={createConversationWithContact}
              emptyMessage="Aucun contact trouvé"
              loading={contactsLoading}
            />
          ) : showFirebaseUsers ? (
            <ContactList
              users={firebaseUsers}
              onSelect={createConversationWithContact}
              emptyMessage="Aucun utilisateur Firebase trouvé"
              loading={firebaseLoading}
            />
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DAA61] mt-[45%]"></div>
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>Aucune conversation trouvée</p>
            </div>
          ) : (
            sortedUsers.map(chat => (
              <div
                key={chat.id}
                onClick={() => {
                  onChatSelect(chat);

                  // Marquer les messages comme lus
                  if (chat.unreadCount > 0) {
                    markMessagesRead(chat.id);
                  }

                  // Émettre un événement pour notifier l'application
                  window.dispatchEvent(
                    new CustomEvent('chat-selected', {
                      detail: {
                        chat,
                        timestamp: new Date(),
                      },
                    })
                  );
                }}
                className={`flex items-center gap-3 p-2 mt-1 cursor-pointer rounded-lg hover:bg-neutral-700/50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-neutral-700' : ''
                }`}
                onContextMenu={e => {
                  // Menu contextuel natif Electron (priorité)
                  if (nativeChatMenu.isElectron) {
                    nativeChatMenu.handleContextMenu(e, {
                      chatId: chat.id,
                      name: chat.name,
                      isPinned: chat.isPinned,
                      isMuted: chat.isMuted,
                      unreadCount: chat.unreadCount,
                      lastMessage: chat.lastMessage,
                    });
                  }
                }}
              >
                {/* Avatar avec cercles de statuts */}
                <div
                  className={`relative w-14 h-14`}
                  onClick={e => {
                    e.stopPropagation(); // Empêcher le clic sur le chat
                    if (
                      chat.statuses &&
                      chat.statuses.length > 0 &&
                      onStatusSelect
                    ) {
                      // Naviguer vers les statuts de cet utilisateur
                      onStatusSelect({
                        ...chat.statuses[0],
                        userId: chat.id,
                        user: chat,
                      });
                    }
                  }}
                >
                  <StatusCircle
                    statusCircles={chat.statusCircles}
                    size="default"
                  >
                    <Avatar
                      src={chat.avatar}
                      alt={`${chat.name} profile picture`}
                      name={chat.name}
                      size={48}
                      className="w-full h-full p-0.5"
                    />
                  </StatusCircle>
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm font-segoe truncate flex items-center gap-1">
                      {chat.name}
                    </h3>
                    <span
                      className={`text-xs w-[35%] pl-2 text-right text-nowrap ${
                        chat.unreadCount > 0
                          ? 'text-[#1DAA61]'
                          : 'text-gray-300'
                      }`}
                    >
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    {/* Texte (occupe tout l'espace restant) */}
                    <div className="flex items-center flex-1 min-w-0">
                      <p className="text-sm text-gray-300 truncate flex items-center">
                        {renderLastMessage(chat)}
                      </p>
                    </div>

                    {/* Icônes + badge alignés à droite */}
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      {/* Boutons d'appel */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          window.dispatchEvent(
                            new CustomEvent('start-call', {
                              detail: {
                                type: 'voice',
                                participant: chat,
                                fromChatList: true,
                                timestamp: new Date(),
                              },
                            })
                          );
                        }}
                        className="p-1 hover:bg-neutral-600 rounded transition-colors"
                        aria-label={`Appeler ${chat.name}`}
                      >
                        <Phone
                          size={12}
                          className="text-gray-400 hover:text-[#1DAA61]"
                        />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          window.dispatchEvent(
                            new CustomEvent('start-call', {
                              detail: {
                                type: 'video',
                                participant: chat,
                                fromChatList: true,
                                timestamp: new Date(),
                              },
                            })
                          );
                        }}
                        className="p-1 hover:bg-neutral-600 rounded transition-colors"
                        aria-label={`Appel vidéo ${chat.name}`}
                      >
                        <Video
                          size={12}
                          className="text-gray-400 hover:text-[#1DAA61]"
                        />
                      </button>

                      {chat.isPinned && (
                        <Pin size={12} className="text-gray-400" />
                      )}
                      {chat.isMuted && (
                        <BellOff size={12} className="text-gray-500" />
                      )}

                      {chat.unreadCount > 0 && (
                        <span className="bg-[#1DAA61] text-whatsapp-dark-950 text-[11px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
