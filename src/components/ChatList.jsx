'use client';

import { useState, useEffect, useRef } from 'react';
import { LucideEdit, Pin, BellOff, Star, Search, Mic, Video, Image, FileText, Link, Music, MapPinMinus, SmileIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import Lenis from '@studio-freight/lenis';

export default function ChatList({ onChatSelect, selectedChatId }) {
  const [isClient, setIsClient] = useState(false);
  const { filteredUsers, searchQuery, setSearchQuery } = useAppContext();
  const scrollRef = useRef(null);

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

  // Priorité : pinned > non pinned
  const sortedUsers = [...filteredUsers].sort((a, b) => b.isPinned - a.isPinned);


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
          {chat.lastMessage.type === 'voice' && `Voice message (${chat.lastMessage.duration || '0:23'})`}
          {chat.lastMessage.type === 'video' && `Video (${chat.lastMessage.duration || '1:45'})`}
          {chat.lastMessage.type === 'audio' && `Audio (${chat.lastMessage.duration || '3:12'})`}
          {chat.lastMessage.type === 'document' && `${chat.lastMessage.text} • ${chat.lastMessage.size || '2.4 MB'}`}
          {!['voice', 'video', 'audio', 'document'].includes(chat.lastMessage.type) && chat.lastMessage.text}
        </span>
      </>
    );
  };


  return (
    <div className="h-full flex flex-col pl-1.5">
      {/* Header */}
      <div className="pl-4 pt-4 pr-2 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-xl font-segoe">
            Chats
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="More options"
              className="p-2 rounded-md hover:bg-whatsapp-dark-700 transition-colors"
            >
              <LucideEdit size={16} className="text-gray-200" />
            </button>
            <button
              aria-label="Filter"
              className="p-2 rounded-md hover:bg-whatsapp-dark-700 transition-colors"
            >
              <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-200"
              >
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-[#3D3D3D] text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1DAA61] text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-list"
      >
        <div className="space-y-1">
          {sortedUsers.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#3a3a3a] transition-colors ${
                selectedChatId === chat.id ? 'bg-[#3a3a3a]' : ''
              }`}
            >
              {/* Avatar avec indicateur de statut */}
              <div className="relative flex-shrink-0">
                <img
                  src={chat.avatar || `https://placehold.co/40x40/png?text=${chat.name.charAt(0)}`}
                  alt={`${chat.name} avatar`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {chat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#1DAA61] rounded-full border-2 border-[#2C2C2C]" />
                )}
              </div>

              {/* Contenu du chat */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {chat.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {chat.isPinned && (
                      <Pin size={12} className="text-gray-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {chat.lastMessageTime || '12:00 PM'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-300 text-sm truncate flex-1">
                    {renderLastMessage(chat)}
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {chat.unreadCount > 0 && (
                      <span className="bg-[#1DAA61] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
