'use client';

import { FaLock, FaWhatsapp } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import TypingIndicator from './TypingIndicator';
import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { useAppContext } from '@/context';
import { useRealtime } from '@/hooks';

const ChatBody = memo(function ChatBody({ selectedChat, currentUser }) {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const { messages, markMessagesRead } = useAppContext();

  // Hook temps réel pour les receipts de lecture et indicateurs de frappe
  const currentUserId = currentUser?.id || 'default-user';
  const {
    markMessageAsRead,
    listenToReadReceipts,
    listenToTypingStatus,
    typingUsers,
  } = useRealtime(currentUserId);

  // Optimisation avec useCallback
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Gestion du scroll automatique
  const scrollToBottom = useCallback(
    (smooth = true) => {
      if (scrollRef.current && autoScroll) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    },
    [autoScroll]
  );

  useEffect(() => {
    // Scroll instantané au changement de chat
    scrollToBottom(false);
  }, [selectedChat, scrollToBottom]);

  useEffect(() => {
    // Scroll smooth pour les nouveaux messages
    scrollToBottom(true);
  }, [messages, scrollToBottom]);

  // Marquer les messages comme lus quand on sélectionne un chat
  const selectedChatId = selectedChat?.id;
  const selectedChatMessages = useMemo(() => {
    if (!selectedChatId) return [];
    return messages?.[selectedChatId] || [];
  }, [messages, selectedChatId]);
  const selectedChatLastMessageId =
    selectedChatMessages.length > 0
      ? selectedChatMessages[selectedChatMessages.length - 1]?.id
      : null;

  useEffect(() => {
    const chatId = selectedChatId;
    if (!chatId) return;

    const chatMessages = selectedChatMessages;
    if (chatMessages.length === 0) return;

    // Marquer la conversation comme lue (unread_counts + last_read_at)
    markMessagesRead(chatId);

    // Marquer les messages individuels comme lus dans Firestore (déclenche 'modified' côté expéditeur)
    chatMessages.forEach(message => {
      if (message.sender !== 'me' && !message.read) {
        markMessageAsRead(chatId, message.id);
      }
    });
  }, [selectedChatId, selectedChatMessages, selectedChatLastMessageId, markMessagesRead, markMessageAsRead]);

  // Écouter les receipts de lecture et indicateurs de frappe
  useEffect(() => {
    if (selectedChat?.id) {
      // Écouter les receipts de lecture
      listenToReadReceipts(selectedChat.id);

      // Écouter les indicateurs de frappe
      listenToTypingStatus(selectedChat.id);
    }
  }, [selectedChat?.id, listenToReadReceipts, listenToTypingStatus]);

  // Détection du scroll manuel
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    setAutoScroll(isAtBottom);
  }, []);

  if (!selectedChat) {
    return (
      <section className="flex-1 bg-whatsapp-chat-bg flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaWhatsapp size={100} className="text-neutral-600" />
            </div>
            <h3 className="text-lg text-white mb-2 font-segoe">
              WhatsApp for Windows
            </h3>
            <p className="text-sm max-w-md text-neutral-400">
              Send and receive messages without keeping your phone online.
              <br />
              Use WhatsApp on up to 4 linked devices and 1 phone at the same
              time.
            </p>
          </div>
        </div>
        <div className="pb-12 flex items-center justify-center gap-2">
          <FaLock size={10} className="text-neutral-500" />
          <p className="text-sm text-neutral-500">End-to-end encrypted.</p>
        </div>
      </section>
    );
  }

  // Récupérer les messages du chat sélectionné
  const chatMessages = messages[selectedChat?.id] || [];

  // Grouper les messages par date
  const groupedMessages = groupMessagesByDate(chatMessages);

  // Fonction pour déterminer le type d'attachment d'un message
  const getAttachmentType = msg => {
    if (msg.type === 'system') return 'system';
    if (msg.contact) return 'contact';
    if (msg.poll || msg.metadata?.poll_id) return 'poll';
    if (msg.document) return 'document';
    if (msg.drawing || msg.type === 'drawing') return 'drawing';
    if (msg.type === 'audio' || msg.audio) return 'audio';
    if (msg.media && msg.media.length > 0) return 'media';
    return 'text';
  };

  return (
    <section
      className="flex-1 flex flex-col relative overflow-hidden"
      style={{
        backgroundColor: 'var(--wa-conversation-panel-background)',
        backgroundImage: 'url(o.png)',
        backgroundRepeat: 'repeat', // mosaïque
        backgroundSize: 'auto', // ou "contain" pour garder la taille originale
      }}
      role="main"
      aria-label="Chat messages"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 wa-chat-background pointer-events-none"
        aria-hidden="true"
      />

      {/* Messages container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative z-10"
        style={{
          paddingLeft: isMobile ? '12px' : 'max(9%, 60px)',
          paddingRight: isMobile ? '12px' : 'max(9%, 60px)',
          paddingTop: isMobile ? '12px' : '20px',
          paddingBottom: isMobile ? '12px' : '20px',
          scrollbarGutter: 'stable',
        }}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Message list"
      >
        <div className="flex flex-col">
          {groupedMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#8696a0] text-sm">
                No messages yet. Start a conversation!
              </p>
            </div>
          ) : (
            groupedMessages.map((group, groupIdx) => (
              <div key={`group-${groupIdx}-${group.date}`}>
                {/* Date divider */}
                {group.date && group.date !== 'TODAY' && (
                  <div className="wa-date-divider" role="separator">
                    <span className="wa-date-divider-text">{group.date}</span>
                  </div>
                )}

                {/* Messages */}
                {group.messages.map((msg, idx) => {
                  const isFirstInGroup =
                    idx === 0 ||
                    group.messages[idx - 1]?.sender !== msg.sender ||
                    group.messages[idx - 1]?.type === 'system';
                  const isLastInGroup =
                    idx === group.messages.length - 1 ||
                    group.messages[idx + 1]?.sender !== msg.sender ||
                    group.messages[idx + 1]?.type === 'system';

                  if (msg.type === 'system') {
                    return <SystemMessage key={msg.id} message={msg} />;
                  }

                  // Détecter les groupes d'attachments consécutifs du même type
                  const currentType = getAttachmentType(msg);
                  const prevType =
                    idx > 0 ? getAttachmentType(group.messages[idx - 1]) : null;
                  const nextType =
                    idx < group.messages.length - 1
                      ? getAttachmentType(group.messages[idx + 1])
                      : null;

                  // Vérifier si c'est le même expéditeur
                  const sameSenderAsPrev =
                    idx > 0 && group.messages[idx - 1]?.sender === msg.sender;
                  const sameSenderAsNext =
                    idx < group.messages.length - 1 &&
                    group.messages[idx + 1]?.sender === msg.sender;

                  // Grouper uniquement les attachments non-text du même type et même expéditeur
                  const shouldGroup =
                    currentType !== 'text' && currentType !== 'system';
                  const isStartOfGroup =
                    shouldGroup &&
                    (!sameSenderAsPrev || prevType !== currentType);
                  const isInGroup =
                    shouldGroup && sameSenderAsPrev && prevType === currentType;
                  const continuesInNextMsg =
                    shouldGroup && sameSenderAsNext && nextType === currentType;

                  // Si c'est le début d'un groupe, collecter tous les messages du groupe
                  if (isStartOfGroup && continuesInNextMsg) {
                    const groupedItems = [msg];
                    let j = idx + 1;

                    while (
                      j < group.messages.length &&
                      group.messages[j]?.sender === msg.sender &&
                      getAttachmentType(group.messages[j]) === currentType
                    ) {
                      groupedItems.push(group.messages[j]);
                      j++;
                    }

                    // Créer un message groupé
                    const groupedMessage = {
                      ...msg,
                      id: `grouped-${msg.id}`,
                      [`${currentType}s`]: groupedItems
                        .map(m => {
                          if (currentType === 'contact') return m.contact;
                          if (currentType === 'poll') return m.poll;
                          if (currentType === 'document') return m.document;
                          if (currentType === 'media') return m.media;
                          if (currentType === 'drawing') return m.drawing;
                          return m;
                        })
                        .flat()
                        .filter(Boolean),
                    };

                    // Supprimer les champs individuels
                    delete groupedMessage[currentType];

                    const uniqueKey = `${groupedMessage.id}-${idx}`;
                    return (
                      <MessageBubble
                        key={uniqueKey}
                        message={groupedMessage}
                        isFirstInGroup={isFirstInGroup}
                        isLastInGroup={
                          j === group.messages.length ||
                          group.messages[j]?.sender !== msg.sender
                        }
                        isMobile={isMobile}
                        currentUser={currentUser}
                      />
                    );
                  }

                  // Si c'est dans un groupe (mais pas le début), skip
                  if (isInGroup) {
                    return null;
                  }

                  // Assure une clé unique même si un même id arrive deux fois (optimiste + temps réel)
                  const uniqueKey = `${msg.id}-${idx}`;
                  return (
                    <MessageBubble
                      key={uniqueKey}
                      message={msg}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      isMobile={isMobile}
                      currentUser={currentUser}
                    />
                  );
                })}
              </div>
            ))
          )}

          {/* Indicateur de frappe en temps réel */}
          <TypingIndicator
            typingUsers={typingUsers[selectedChat?.id] || []}
            currentUserId={currentUserId}
          />
        </div>
      </div>

      {/* Scroll to bottom button */}
      {!autoScroll && (
        <button
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-[#202c33] shadow-lg flex items-center justify-center hover:bg-[#2a373f] transition-colors"
          onClick={() => {
            setAutoScroll(true);
            scrollToBottom(true);
          }}
          aria-label="Scroll to bottom"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 13L6 9L7.4 7.6L10 10.2L12.6 7.6L14 9L10 13Z"
              fill="#8696a0"
            />
          </svg>
        </button>
      )}
    </section>
  );
});

// Fonction pour grouper les messages par date
function groupMessagesByDate(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const groups = [];
  let currentGroup = null;
  let lastDate = null;

  messages.forEach(msg => {
    const msgDate = msg.date || 'TODAY';

    if (msgDate !== lastDate) {
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        date: msgDate,
        messages: [],
      };
      lastDate = msgDate;
    }

    if (currentGroup) {
      currentGroup.messages.push(msg);
    }
  });

  if (currentGroup && currentGroup.messages.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

export default ChatBody;
