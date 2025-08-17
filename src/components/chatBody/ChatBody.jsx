import { FaLock, FaWhatsapp } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import mocMessages from './mocMessages';
import { useEffect, useRef, useState } from 'react';

export default function ChatBody({ selectedChat, messages = {} }) {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat, messages]);

  if (!selectedChat) {
    return (
      <section className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--wa-conversation-panel-background)' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="w-[240px] h-[140px] sm:w-[320px] sm:h-[188px] mx-auto mb-6 sm:mb-8 opacity-40">
              <img src="/bgl.png" alt="WhatsApp" className="w-full h-full object-contain" />
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

  const chatMessages = messages[selectedChat?.id] || mocMessages;

  // Grouper les messages par date
  const groupedMessages = groupMessagesByDate(chatMessages);

  return (
    <section className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundImage: 'url(https://images5.alphacoders.com/133/thumb-1920-1339662.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 wa-chat-background pointer-events-none" />
      
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
      >
        <div className="flex flex-col">
          {groupedMessages.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date divider */}
              {group.date && group.date !== 'TODAY' && (
                <div className="wa-date-divider">
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
          ))}
        </div>
      </div>
    </section>
  );
}

// Fonction pour grouper les messages par date
function groupMessagesByDate(messages) {
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
    
    currentGroup.messages.push(msg);
  });

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}
