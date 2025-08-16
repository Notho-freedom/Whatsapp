import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ChatFooter({ selectedChat, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isClient) {
    return (
      <footer className="flex items-center gap-3 px-4 py-2 border-t border-gray-700 bg-whatsapp-chat-header">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Chargement...</div>
        </div>
      </footer>
    );
  }

  if (!selectedChat) {
    return null;
  }

  return (
    <footer className="flex items-center gap-3 px-4 py-2 border-t border-whatsapp-dark-950 bg-whatsapp-dark-800">
      <button 
        aria-label="Emoji picker" 
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Smile size={20} />
      </button>
      <button 
        aria-label="Attach file" 
        className="text-gray-400 hover:text-white transition-colors"
      >
        <Paperclip size={20} />
      </button>
      <form onSubmit={handleSubmit} className="flex-1">
        <input 
          aria-label="Type a message"
          className="w-full bg-transparent rounded-full py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none font-segoe"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </form>
      <button 
        aria-label={message.trim() ? "Send message" : "Voice message"}
        className={`transition-colors ${
          message.trim() 
            ? 'text-whatsapp-primary hover:text-white' 
            : 'text-gray-400 hover:text-white'
        }`}
        onClick={message.trim() ? handleSubmit : () => {}}
      >
        {message.trim() ? <Send size={20} /> : <Mic size={20} />}
      </button>
    </footer>
  );
}
