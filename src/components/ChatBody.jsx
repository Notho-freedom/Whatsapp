'use client';

import { useEffect, useRef } from 'react';
import Message from './Message';

export default function ChatBody({ selectedChat, messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedChat) {
    return (
      <div className="flex-1 bg-whatsapp-dark-950 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-whatsapp-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold mb-2 font-segoe">
            WhatsApp Desktop
          </h3>
          <p className="text-sm">
            Sélectionnez un chat pour commencer à discuter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-whatsapp-dark-950 overflow-y-auto">
      <div className="p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>Aucun message dans cette conversation</p>
            <p className="text-sm mt-2">Commencez la conversation !</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
