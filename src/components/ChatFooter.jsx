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
    <footer className="flex items-center justify-between px-2 py-1 border-t bg-[#2C2C2C] border-neutral-800">
      <button 
        aria-label="Emoji picker" 
        className="hover:bg-neutral-700/50 p-[9px] mb-[5.4px] transition-colors rounded-md"
      >
        <Smile size={19} />
      </button>
      <button 
        aria-label="Attach file" 
        className="hover:bg-neutral-700/50 p-[9px] mb-[5.4px] rounded-md transition-colors"
      >
        <Paperclip size={19} className="rotate-180" />
      </button>
      <form onSubmit={handleSubmit} className="flex-1">
        <textarea
          rows={1}
          autoFocus
          aria-label="Type a message"
          className="w-full bg-transparent py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none font-segoe resize-none hover:bg-neutral-700"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </form>
      <button 
        aria-label={message.trim() ? "Send message" : "Voice message"}
        className={`transition-colors p-[9px] mb-[5.4px] rounded-md hover:bg-neutral-700/50`}
        onClick={message.trim() ? handleSubmit : () => {}}
      >
        {message.trim() ? <Send size={19} className="rotate-[45deg]" /> : <Mic size={19} />}
      </button>
    </footer>
  );
}
