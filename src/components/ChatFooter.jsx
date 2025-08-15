'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';

export default function ChatFooter({ selectedChat, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      onSendMessage(message);
      setMessage('');
      // Focus sur le textarea après envoi
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize du textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (!selectedChat) {
    return (
      <div className="bg-whatsapp-dark-800 border-t border-gray-700 p-4">
        <div className="text-center text-gray-400">
          <p>Sélectionnez un chat pour commencer à discuter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-whatsapp-dark-800 border-t border-gray-700 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Bouton emoji */}
        <button
          type="button"
          aria-label="Emoji"
          className="p-2 rounded-full hover:bg-whatsapp-dark-700 transition-colors flex-shrink-0"
        >
          <Smile size={20} className="text-gray-400" />
        </button>

        {/* Bouton pièce jointe */}
        <button
          type="button"
          aria-label="Pièce jointe"
          className="p-2 rounded-full hover:bg-whatsapp-dark-700 transition-colors flex-shrink-0"
        >
          <Paperclip size={20} className="text-gray-400" />
        </button>

        {/* Zone de saisie */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Tapez un message"
            className="w-full bg-whatsapp-dark-700 text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-whatsapp-primary min-h-[44px] max-h-[120px]"
            rows={1}
            style={{ 
              fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
              lineHeight: '1.4'
            }}
          />
        </div>

        {/* Bouton d'envoi ou microphone */}
        {message.trim() ? (
          <button
            type="submit"
            aria-label="Envoyer"
            className="p-2 rounded-full bg-whatsapp-primary hover:bg-whatsapp-primary-dark transition-colors flex-shrink-0"
          >
            <Send size={20} className="text-white" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Microphone"
            className="p-2 rounded-full hover:bg-whatsapp-dark-700 transition-colors flex-shrink-0"
          >
            <Mic size={20} className="text-gray-400" />
          </button>
        )}
      </form>
    </div>
  );
}
