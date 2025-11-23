'use client';

import { useState, useEffect } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import { useAppContext } from '@/context';
import MessageBubble from './chatBody/MessageBubble';

export default function StarredMessages() {
  const [isClient, setIsClient] = useState(false);
  const { messages, users, toggleMessageStar } = useAppContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Collecter tous les messages favoris
  const starredMessages = [];
  
  Object.entries(messages).forEach(([chatId, chatMessages]) => {
    const user = users.find(u => u.id === chatId);
    if (user) {
      chatMessages.forEach(message => {
        if (message.isStarred) {
          starredMessages.push({
            ...message,
            chatId,
            userName: user.name,
            userAvatar: user.avatar
          });
        }
      });
    }
  });

  // Trier par date (plus récent en premier)
  starredMessages.sort((a, b) => new Date(b.time) - new Date(a.time));

  const handleUnstarMessage = (message) => {
    toggleMessageStar(message.chatId, message.id);
  };

  if (starredMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <FaStar className="text-gray-400 text-2xl" />
        </div>
        <h3 className="text-white text-lg font-semibold mb-2">No starred messages</h3>
        <p className="text-gray-400 text-sm">
          Messages you star will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <FaStar className="text-yellow-500 text-xl" />
          <h2 className="text-white text-lg font-semibold">Starred Messages</h2>
          <span className="bg-gray-700 text-gray-300 text-sm px-2 py-1 rounded-full">
            {starredMessages.length}
          </span>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {starredMessages.map((message) => (
            <div key={`${message.chatId}-${message.id}`} className="bg-gray-800 rounded-lg p-4">
              {/* Message Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={message.userAvatar}
                    alt={message.userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white font-medium text-sm">{message.userName}</h4>
                    <p className="text-gray-400 text-xs">{message.time}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnstarMessage(message)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Unstar message"
                >
                  <FaTimes className="text-gray-400 text-sm" />
                </button>
              </div>

              {/* Message Content */}
              <div className="bg-gray-700 rounded-lg p-3">
                {message.text && (
                  <p className="text-white text-sm leading-relaxed">{message.text}</p>
                )}
                
                {message.media && message.media.length > 0 && (
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs">
                      📎 Media message
                    </p>
                  </div>
                )}

                {message.link && (
                  <div className="mt-2">
                    <p className="text-gray-400 text-xs">
                      🔗 Link message
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
