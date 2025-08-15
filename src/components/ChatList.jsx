'use client';

import { useState, useEffect } from 'react';
import { Search, MoreVertical, Filter } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function ChatList({ onChatSelect, selectedChatId }) {
  const [isClient, setIsClient] = useState(false);
  const { filteredUsers, searchQuery, setSearchQuery } = useAppContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="w-2/5 bg-whatsapp-dark-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg font-segoe">
            Chats
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Filter"
              className="p-2 rounded-md hover:bg-whatsapp-dark-700 transition-colors"
            >
              <Filter size={16} className="text-gray-400" />
            </button>
            <button
              aria-label="More options"
              className="p-2 rounded-md hover:bg-whatsapp-dark-700 transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher ou démarrer une nouvelle conversation"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-whatsapp-dark-700 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-primary"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 p-1 overflow-y-auto h-50 scrollbar-thin scrollbar-thumb-whatsapp-dark-700 scrollbar-track-whatsapp-dark-800">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <p>Aucune conversation trouvée</p>
          </div>
        ) : (
          filteredUsers.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer rounded-lg hover:bg-whatsapp-dark-600/20 transition-colors ${
                selectedChatId === chat.id ? 'bg-whatsapp-dark-700' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={`${chat.name} profile`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-whatsapp-dark-800"></div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-sm font-segoe truncate">
                    {chat.name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {chat.lastMessageTime}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-400 text-sm truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="bg-whatsapp-primary text-whatsapp-dark-950 text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
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
  );
}