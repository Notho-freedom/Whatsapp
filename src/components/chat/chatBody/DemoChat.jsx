'use client';

import { useState, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import { useAppContext } from '@/context';

export default function DemoChat({ selectedChat, isMobile = false }) {
  const { messages } = useAppContext();
  const [groupedMessages, setGroupedMessages] = useState([]);

  useEffect(() => {
    if (selectedChat && messages[selectedChat.id]) {
      const chatMessages = messages[selectedChat.id];
      const grouped = groupMessagesByDate(chatMessages);
      setGroupedMessages(grouped);
    }
  }, [selectedChat, messages]);

  const groupMessagesByDate = (chatMessages) => {
    const groups = [];
    let currentGroup = [];
    let currentDate = null;

    chatMessages.forEach((message, index) => {
      const messageDate = message.date;
      const isFirstInGroup = index === 0 || messageDate !== currentDate;
      const isLastInGroup = index === chatMessages.length - 1 || 
                           (index < chatMessages.length - 1 && chatMessages[index + 1].date !== messageDate);

      if (isFirstInGroup && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      }

      currentGroup.push({
        ...message,
        isFirstInGroup,
        isLastInGroup
      });

      currentDate = messageDate;

      if (isLastInGroup) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    });

    return groups;
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-whatsapp-chat-bg">
        <div className="text-center text-white">
          <p>Sélectionnez un chat pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-whatsapp-chat-bg overflow-hidden">
      {/* En-tête du chat */}
      <div className="bg-whatsapp-chat-header px-4 py-3 border-b border-whatsapp-border">
        <h2 className="text-white font-medium">{selectedChat.name}</h2>
        <p className="text-whatsapp-text-secondary text-sm">
          {selectedChat.lastMessage ? (
            selectedChat.lastMessage.type === 'audio' ? 
              `🎵 Message vocal (${selectedChat.lastMessage.duration || '0:00'})` :
              selectedChat.lastMessage.text
          ) : 'Aucun message'}
        </p>
      </div>

      {/* Corps du chat */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {group.map((message, messageIndex) => {
              if (message.type === 'system') {
                return (
                  <SystemMessage
                    key={message.id}
                    message={message}
                    isMobile={isMobile}
                  />
                );
              }

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isFirstInGroup={message.isFirstInGroup}
                  isLastInGroup={message.isLastInGroup}
                  isMobile={isMobile}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Indicateur de test pour les messages audio */}
      <div className="bg-whatsapp-chat-footer px-4 py-2 border-t border-whatsapp-border">
        <div className="text-center text-whatsapp-text-secondary text-xs">
          <p>💡 Test des messages audio : Cliquez sur les icônes de lecture pour tester</p>
          <p>🎵 {groupedMessages.flat().filter(m => m.media?.some(media => media.type === 'audio')).length} messages audio disponibles</p>
        </div>
      </div>
    </div>
  );
}
