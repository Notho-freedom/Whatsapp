import { FaLock, FaWhatsapp } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useAppContext } from '@/context/AppContext';

const ChatBody = memo(function ChatBody({ selectedChat }) {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const { messages, markMessagesRead } = useAppContext();

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
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [autoScroll]);

  useEffect(() => {
    // Scroll instantané au changement de chat
    scrollToBottom(false);
  }, [selectedChat, scrollToBottom]);

  useEffect(() => {
    // Scroll smooth pour les nouveaux messages
    scrollToBottom(true);
  }, [messages, scrollToBottom]);

  // Marquer les messages comme lus quand on sélectionne un chat
  useEffect(() => {
    if (selectedChat && messages[selectedChat.id]) {
      markMessagesRead(selectedChat.id);
    }
  }, [selectedChat, messages, markMessagesRead]);

  // Détection du scroll manuel
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setAutoScroll(isAtBottom);
  }, []);

  if (!selectedChat) {
    return (
      <section className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--wa-conversation-panel-background)' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="w-[240px] h-[140px] sm:w-[320px] sm:h-[188px] mx-auto mb-6 sm:mb-8 opacity-40">
              <img 
                src="/bgl.png" 
                alt="WhatsApp Logo" 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
            <h1 className="text-[24px] sm:text-[32px] font-light text-[#e9edef] mb-2">
              WhatsApp for Windows
            </h1>
            <p className="text-[12px] sm:text-[14px] text-[#8696a0] leading-[18px] sm:leading-[20px] max-w-[400px] sm:max-w-[500px] mx-auto">
              Send and receive messages without keeping your phone online.
            </p>
            <p className="text-[12px] sm:text-[14px] text-[#8696a0] leading-[18px] sm:leading-[20px] max-w-[400px] sm:max-w-[500px] mx-auto">
              Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
            </p>
          </div>
        </div>
        <div className="py-5 sm:py-7 flex items-center justify-center gap-1">
          <FaLock size={isMobile ? 10 : 12} className="text-[#8696a0]" />
          <p className="text-[11px] sm:text-[12px] text-[#8696a0]">End-to-end encrypted</p>
        </div>
      </section>
    );
  }

  // Récupérer les messages du chat sélectionné
  const chatMessages = messages[selectedChat?.id] || [];

  // Grouper les messages par date
  const groupedMessages = groupMessagesByDate(chatMessages);

  return (
    <section 
      className="flex-1 flex flex-col relative overflow-hidden" 
      style={{ backgroundColor: 'var(--wa-conversation-panel-background)' }}
      role="main"
      aria-label="Chat messages"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 wa-chat-background pointer-events-none" aria-hidden="true" />
      
      {/* Messages container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative z-10"
        style={{ 
          paddingLeft: isMobile ? '12px' : 'max(9%, 60px)',
          paddingRight: isMobile ? '12px' : 'max(9%, 60px)',
          paddingTop: isMobile ? '12px' : '20px',
          paddingBottom: isMobile ? '12px' : '20px',
          scrollbarGutter: 'stable' 
        }}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Message list"
      >
        <div className="flex flex-col">
          {groupedMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#8696a0] text-sm">No messages yet. Start a conversation!</p>
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
                  const isFirstInGroup = idx === 0 || 
                    group.messages[idx - 1]?.sender !== msg.sender ||
                    group.messages[idx - 1]?.type === 'system';
                  const isLastInGroup = idx === group.messages.length - 1 || 
                    group.messages[idx + 1]?.sender !== msg.sender ||
                    group.messages[idx + 1]?.type === 'system';
                  
                  if (msg.type === 'system') {
                    return <SystemMessage key={msg.id} message={msg} />;
                  }
                  
                  return (
                    <MessageBubble 
                      key={msg.id} 
                      message={msg}
                      isFirstInGroup={isFirstInGroup}
                      isLastInGroup={isLastInGroup}
                      isMobile={isMobile}
                    />
                  );
                })}
              </div>
            ))
          )}
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
            <path d="M10 13L6 9L7.4 7.6L10 10.2L12.6 7.6L14 9L10 13Z" fill="#8696a0"/>
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
        messages: []
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
