'use client';

import { useState, useEffect, useRef } from 'react';
import { LucideEdit, Pin, BellOff, Star, Search, Mic, Video, Image, FileText, Link, Music, MapPinMinus, SmileIcon } from 'lucide-react';
import { useAppContext } from '@/context';
import { StatusCircle } from '@/components/ui';
import Lenis from '@studio-freight/lenis';
import { useChatContextMenu } from '@/hooks';
import { useGoogleContacts } from '@/hooks';
import { useContacts } from '@/hooks';
import { useRealtime } from '@/hooks';
import apiInterceptor from '@/utils/apiInterceptor';
import { API_ENDPOINTS } from '@/utils/config';

export default function ChatList({ onChatSelect, selectedChatId, onStatusSelect, currentUser }) {
  const [isClient, setIsClient] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [notification, setNotification] = useState(null);
  const { filteredUsers, contacts: appContacts, searchQuery, setSearchQuery, addUser } = useAppContext();
  const { contacts: googleContacts, isLoading: contactsLoading, error: contactsError } = useGoogleContacts();
  const { createContact, fetchContacts } = useContacts();
  
  // Hook temps réel pour la présence et les notifications
  const currentUserId = 'default-user'; // À remplacer par l'ID utilisateur réel
  const { presence, notifications, sendNotification } = useRealtime(currentUserId);
  const scrollRef = useRef(null);
  
  // Hook pour les menus contextuels natifs d'Electron
  const nativeChatMenu = useChatContextMenu((actionId, data) => {
    console.log('Action de menu contextuel de chat:', actionId, data);
    // Ici vous pouvez ajouter la logique pour les actions de chat
  });

  useEffect(() => {
    setIsClient(true);

    if (scrollRef.current) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Fonction pour créer une conversation avec un contact
  const createConversationWithContact = async (contact) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      const token = localStorage.getItem('accessToken');
      if (!token) {
              // Si pas d'authentification, créer un chat temporaire dans la base de données
      try {
        const response = await fetch(API_ENDPOINTS.CONVERSATIONS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'individual',
            name: contact.displayName || contact.name || 'Nouveau contact',
            avatar_url: contact.photos?.[0]?.url || '/default-avatar.png',
            description: `Conversation avec ${contact.displayName || contact.name || 'Nouveau contact'}`,
            created_by: currentUser?.id || 1,
            is_temporary: true,
            custom_settings: JSON.stringify({ 
              isTemporary: true, 
              contact: contact 
            })
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la création de la conversation temporaire');
        }

        const data = await response.json();
        const tempConversation = data.conversation;

          const fallbackChat = {
            id: tempConversation.id,
            name: tempConversation.name,
            avatar: tempConversation.avatar_url || tempConversation.avatar || '/default-avatar.png',
            lastMessage: {
              text: 'Nouvelle conversation',
              type: 'text',
              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            },
            lastMessageTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            isTyping: false,
            contact: tempConversation.custom_settings?.contact || tempConversation.contact,
            isNewConversation: true,
            isTemporary: true
          };

          // Ajouter le chat temporaire à la liste
          addUser(fallbackChat);
          onChatSelect(fallbackChat);
          setShowContacts(false);

          setNotification({
            type: 'success',
            message: `Conversation temporaire créée avec ${fallbackChat.name}`,
            timestamp: new Date()
          });
          setTimeout(() => setNotification(null), 3000);

          return;
        } catch (error) {
          console.error('❌ Erreur lors de la création de la conversation temporaire:', error);
          
          // Fallback en cas d'erreur
          const fallbackChat = {
            id: `temp-${Date.now()}`,
            name: contact.displayName || contact.name || 'Nouveau contact',
            avatar: contact.photos?.[0]?.url || '/default-avatar.png',
            lastMessage: {
              text: 'Nouvelle conversation',
              type: 'text',
              time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            },
            lastMessageTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            unreadCount: 0,
            isPinned: false,
            isMuted: false,
            isTyping: false,
            contact: contact,
            isNewConversation: true,
            isTemporary: true
          };

          addUser(fallbackChat);
          onChatSelect(fallbackChat);
          setShowContacts(false);
        }
      }

      // Créer un contact temporaire directement
      const newContact = {
        id: `temp-contact-${Date.now()}`,
        first_name: contact.displayName?.split(' ')[0] || contact.name?.split(' ')[0] || 'Contact',
        last_name: contact.displayName?.split(' ').slice(1).join(' ') || contact.name?.split(' ').slice(1).join(' ') || '',
        email: contact.emails?.[0]?.value || '',
        phone: contact.phones?.[0]?.value || '',
        avatar_url: contact.photos?.[0]?.url || '/default-avatar.png',
        is_favorite: false,
        labels: [],
        notes: '',
        company: '',
        job_title: '',
        birthday: null,
        address: '',
        website: '',
        isTemporary: true
      };

      // Créer une conversation temporaire avec ce contact
                      const response = await fetch(API_ENDPOINTS.CONVERSATIONS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'individual',
            name: contact.displayName || contact.name || 'Nouveau contact',
            avatar_url: contact.photos?.[0]?.url || '/default-avatar.png',
            description: `Conversation avec ${contact.displayName || contact.name || 'Nouveau contact'}`,
            created_by: currentUser?.id || 1,
            is_temporary: true,
            custom_settings: JSON.stringify({ 
              isTemporary: true, 
              contact: newContact 
            })
          })
        });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la conversation temporaire');
      }

      const { conversation } = await response.json();

      // Créer un objet chat pour l'interface
      const newChat = {
        id: conversation.id,
        name: conversation.name || contact.displayName || contact.name,
        avatar: conversation.avatar_url || contact.photos?.[0]?.url || '/default-avatar.png',
        lastMessage: {
          text: 'Nouvelle conversation',
          type: 'text',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        },
        lastMessageTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isTyping: false,
        contact: newContact,
        isNewConversation: true
      };

      // Ajouter le nouveau chat à la liste des conversations
      addUser(newChat);

      // Sélectionner le nouveau chat
      onChatSelect(newChat);

      // Fermer la vue contacts et revenir aux chats
      setShowContacts(false);

      // Émettre un événement pour notifier l'application
      window.dispatchEvent(new CustomEvent('conversation-created', { 
        detail: { 
          conversation: newChat,
          contact: newContact,
          timestamp: new Date()
        } 
      }));

      console.log('✅ Conversation créée avec succès:', newChat);

      // Afficher une notification de succès
      setNotification({
        type: 'success',
        message: `Conversation créée avec ${newChat.name}`,
        timestamp: new Date()
      });

      // Masquer la notification après 3 secondes
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation temporaire:', error);
      
      // Fallback: créer un chat temporaire en mémoire
      const fallbackChat = {
        id: `temp-${Date.now()}`,
        name: contact.displayName || contact.name || 'Nouveau contact',
        avatar: contact.photos?.[0]?.url || '/default-avatar.png',
        lastMessage: {
          text: 'Nouvelle conversation',
          type: 'text',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        },
        lastMessageTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isTyping: false,
        contact: contact,
        isNewConversation: true,
        isTemporary: true
      };

      // Ajouter le chat temporaire à la liste
      addUser(fallbackChat);
      onChatSelect(fallbackChat);
      setShowContacts(false);

      // Afficher une notification d'erreur
      setNotification({
        type: 'error',
        message: `Conversation temporaire créée (mode fallback)`,
        timestamp: new Date()
      });
      setTimeout(() => setNotification(null), 3000);
    }
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
    const iconProps = { size: 14, className: "text-gray-400 mr-1" };
    
    switch(type) {
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

  const renderLastMessage = (chat) => {
    if (chat.isTyping) {
      return <span className="text-[#1DAA61] truncate w-[100%]">{chat.name} is typing...</span>;
    }
    
    return (
      <>
        <MessageIcon type={chat.lastMessage.type} />
        <span className="truncate">
          {((chat.lastMessage.type === 'voice') || (chat.lastMessage.type === 'voices')) && `Voice message (${chat.lastMessage.duration || '0:23'})`}
          {((chat.lastMessage.type === 'video') || (chat.lastMessage.type === 'videos')) && `Video (${chat.lastMessage.duration || '1:45'})`}
          {((chat.lastMessage.type === 'audio') || (chat.lastMessage.type === 'audios')) && `Audio (${chat.lastMessage.duration || '3:12'})`}
          {((chat.lastMessage.type === 'document') || (chat.lastMessage.type === 'documents')) && `${chat.lastMessage.text} • ${chat.lastMessage.size || '2.4 MB'}`}
          {!['voice', 'video', 'audio', 'document'].includes(chat.lastMessage.type) && chat.lastMessage.text}
        </span>
      </>
    );
  };


  return (
    <div className="h-full flex flex-col pl-1.5 relative">
      {/* Notification */}
      {notification && (
        <div className={`absolute top-4 left-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
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
            {showContacts ? 'Contacts' : 'Chats'}
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
              aria-label="Filter chats"
              className="p-2 rounded-md hover:bg-whatsapp-dark-700 transition-colors"
              onClick={() => {
                // Ouvrir le filtre des chats
                window.dispatchEvent(new CustomEvent('filter-chats', { 
                  detail: { action: 'open' } 
                }));
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
                <path d="M4 7H20" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 12H18" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 17H16" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          
          <input 
            className="w-full max-h-8 bg-[#3D3D3D] text-white placeholder-gray-200 placeholder:text-sm py-2 pl-8 pr-3 rounded-[0.30rem] border-b border-white/50 backdrop-blur-lg focus:outline-none focus:ring-none focus:border-b-2 focus:border-[#1DAA61] focus:bg-[#202020]" 
            placeholder={showContacts ? "Rechercher des contacts" : "Search or start a new chat"} 
            type="text"
            onChange={handleSearchChange}
            value={searchQuery}
          />
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/3 text-gray-200 text-xs rotate-90 weigth-thin" />
        </div>
      </div>

      {/* Chat List avec Lenis */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-1 chat-list">
        <div>
          {showContacts ? (
            // Mode Contacts
            contactsLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1DAA61] mx-auto mb-2"></div>
                <p>Chargement des contacts...</p>
              </div>
            ) : contactsError ? (
              <div className="p-4 text-center text-gray-400">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <p className="text-red-300 mb-2">Erreur lors du chargement des contacts</p>
                <p className="text-sm text-gray-500">Utilisation de contacts de démonstration</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 px-4 py-2 bg-[#1DAA61] text-white rounded-lg hover:bg-[#1DAA61]/80 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            ) : googleContacts && googleContacts.length > 0 ? (
              googleContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => createConversationWithContact(contact)}
                  className="flex items-center gap-3 p-2 mt-1 cursor-pointer rounded-lg hover:bg-neutral-700/50 transition-colors"
                >
                  {/* Avatar du contact */}
                  <div className="relative">
                    <img
                      src={contact.photos?.[0]?.url || '/default-avatar.png'}
                      alt={`${contact.displayName || contact.name} profile picture`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>

                  {/* Info du contact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold text-sm font-segoe truncate">
                        {contact.displayName || contact.name || 'Contact sans nom'}
                      </h3>
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-gray-300 truncate">
                        {contact.phones?.[0]?.value || contact.emails?.[0]?.value || 'Aucune information'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400">
                <p>Aucun contact trouvé</p>
              </div>
            )
          ) : (
            // Mode Chats
            filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1DAA61] mx-auto mb-2"></div>
                <p>Chargement des conversations...</p>
              </div>
            ) : sortedUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>Aucune conversation trouvée</p>
              </div>
            ) : (
              sortedUsers.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  onChatSelect(chat);
                  
                  // Émettre un événement pour notifier l'application
                  window.dispatchEvent(new CustomEvent('chat-selected', { 
                    detail: { 
                      chat,
                      timestamp: new Date()
                    } 
                  }));
                }}
                className={`flex items-center gap-3 p-2 mt-1 cursor-pointer rounded-lg hover:bg-neutral-700/50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-neutral-700' : ''
                }`}
                onContextMenu={(e) => {
                  // Menu contextuel natif Electron (priorité)
                  if (nativeChatMenu.isElectron) {
                    nativeChatMenu.handleContextMenu(e, {
                      chatId: chat.id,
                      name: chat.name,
                      isPinned: chat.isPinned,
                      isMuted: chat.isMuted,
                      unreadCount: chat.unreadCount,
                      lastMessage: chat.lastMessage
                    });
                  }
                }}
              >
                {/* Avatar avec cercles de statuts */}
                <div 
                  className={`relative w-14 h-14`}
                  onClick={(e) => {
                    e.stopPropagation(); // Empêcher le clic sur le chat
                    if (chat.statuses && chat.statuses.length > 0 && onStatusSelect) {
                      // Naviguer vers les statuts de cet utilisateur
                      onStatusSelect({
                        ...chat.statuses[0],
                        userId: chat.id,
                        user: chat
                      });
                    }
                  }}
                >
                  <StatusCircle statusCircles={chat.statusCircles} size="default">
                    <img
                      src={chat.avatar}
                      alt={`${chat.name} profile picture`}
                      className="w-full h-full p-0.5 rounded-full object-cover"
                    />
                  </StatusCircle>
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm font-segoe truncate flex items-center gap-1">
                      {chat.name}
                    </h3>
                    <span className={`text-xs w-[35%] pl-2 text-right text-nowrap ${chat.unreadCount > 0 ? 'text-[#1DAA61]' : 'text-gray-300'}`}>
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
                    {chat.isPinned && <Pin size={12} className="text-gray-400" />}
                    {chat.isMuted && <BellOff size={12} className="text-gray-500" />}

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
          )
        )}
        </div>
      </div>
    </div>
  );
}
