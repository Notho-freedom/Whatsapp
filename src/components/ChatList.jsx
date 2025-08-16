'use client';

import { useState, useEffect, useRef } from 'react';
import { LucideEdit } from 'lucide-react';
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
        content: scrollRef.current.children[0], // Le premier enfant = contenu scrollable
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

  return (
    <div className="w-1/3 scroll-behavior-smooth rounded-l-xl ml-12 bg-[#2C2C2C] border-r border-neutral-800 flex flex-col pl-1.5">
      {/* Header */}
      <div className="pl-4 pt-4 pr-2">
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
            className="w-full max-h-8 bg-[#3D3D3D] text-white placeholder-gray-300 placeholder:text-sm py-2 pl-8 pr-3 rounded-[0.30rem] border-b border-white/50 backdrop-blur-lg focus:outline-none focus:ring-none focus:border-b-2 focus:border-[#1DAA61] focus:bg-[#202020]" 
            placeholder="Search or start a new chat" 
            type="text"
            onChange={handleSearchChange}
            value={searchQuery}
          />
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/3 text-gray-400 text-xs rotate-90 weigth-thin"></i>
        </div>
      </div>

      {/* Chat List avec Lenis wrapper */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-1">
        <div>
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <p>Aucune conversation trouvée</p>
            </div>
          ) : (
            filteredUsers.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`flex items-center gap-3 p-4 cursor-pointer rounded-lg hover:bg-neutral-700/50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-neutral-700/50' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={chat.avatar}
                    className={`w-12 h-12 rounded-full object-cover ${chat.online ? 'border-2 border-[#1DAA61] p-[1px]' : ''}`}
                  />
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm font-segoe truncate">
                      {chat.name}
                    </h3>
                    <span className={`text-xs w-[35%] pl-2 text-right text-nowrap ${chat.unreadCount > 0 ? 'text-[#1DAA61]' : 'text-gray-300'}`}>
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-300 text-sm truncate max-w-[80%]">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <span className="bg-[#1DAA61] text-whatsapp-dark-950 text-[11px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
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
