import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReplyCap from './chatBody/ReplyCap';
import AttachmentMenu from './chatBody/AttachmentMenu';
import EmojiPicker from './chatBody/EmojiPicker';
import VoiceRecorder from './chatBody/VoiceRecorder';

export default function ChatFooter({ selectedChat, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { replyTo, clearReplyTo } = useAppContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      // Envoyer le message avec la réponse si elle existe
      const messageData = {
        text: message,
        replyTo: replyTo
      };
      onSendMessage(messageData);
      setMessage('');
      // Effacer l'état de réponse après envoi
      clearReplyTo();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCancelReply = () => {
    clearReplyTo();
  };

  const handleAttachmentOption = (optionId) => {
    console.log('Selected attachment option:', optionId);
    // Gérer les différentes options d'attachement
    switch (optionId) {
      case 'photos-videos':
        // Ouvrir le sélecteur de photos/vidéos
        window.dispatchEvent(new CustomEvent('open-media-picker', { 
          detail: { type: 'photos-videos' } 
        }));
        break;
      case 'camera':
        // Ouvrir la caméra
        window.dispatchEvent(new CustomEvent('open-camera', { 
          detail: { type: 'photo' } 
        }));
        break;
      case 'document':
        // Ouvrir le sélecteur de documents
        window.dispatchEvent(new CustomEvent('open-document-picker', { 
          detail: { type: 'document' } 
        }));
        break;
      case 'contact':
        // Ouvrir le sélecteur de contacts
        window.dispatchEvent(new CustomEvent('open-contact-picker', { 
          detail: { type: 'contact' } 
        }));
        break;
      case 'poll':
        // Ouvrir le créateur de sondage
        window.dispatchEvent(new CustomEvent('open-poll-creator', { 
          detail: { type: 'poll' } 
        }));
        break;
      case 'drawing':
        // Ouvrir l'éditeur de dessin
        window.dispatchEvent(new CustomEvent('open-drawing-editor', { 
          detail: { type: 'drawing' } 
        }));
        break;
      default:
        break;
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleSendVoiceMessage = () => {
    // Envoyer le message vocal
    const voiceMessage = {
      type: 'audio',
      duration: 30, // Durée simulée
      url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    };
    onSendMessage(voiceMessage);
    setIsRecording(false);
  };

  const handleCancelRecording = () => {
    setIsRecording(false);
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
    <div className="relative w-full">
      {/* ReplyCap - apparaît au-dessus du footer quand on répond */}
      <ReplyCap 
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        isMobile={false}
      />
      
      {/* Footer principal */}
      <footer className="flex items-center justify-between px-2 py-1 border-t bg-[#2C2C2C] border-neutral-800">
        <button 
          aria-label="Emoji picker" 
          className={`hover:bg-neutral-700/50 p-[9px] mb-[5.4px] transition-colors rounded-md ${
            isEmojiPickerOpen ? 'bg-neutral-700/50' : ''
          }`}
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
        >
          <Smile size={19} />
        </button>
        <button 
          aria-label="Attach file" 
          className={`hover:bg-neutral-700/50 p-[9px] mb-[5.4px] rounded-md transition-colors ${
            isAttachmentMenuOpen ? 'bg-neutral-700/50' : ''
          }`}
          onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
        >
          <Paperclip size={19} className="rotate-180" />
        </button>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            rows={1}
            autoFocus
            aria-label="Type a message"
            className="w-full bg-transparent py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none font-segoe resize-none hover:bg-neutral-700"
            placeholder={replyTo ? "Reply to a message" : "Type a message"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </form>
        <button 
          aria-label={message.trim() ? "Send message" : "Voice message"}
          className={`transition-colors p-[9px] mb-[5.4px] rounded-md hover:bg-neutral-700/50`}
          onClick={message.trim() ? handleSubmit : handleStartRecording}
        >
          {message.trim() ? <Send size={19} className="rotate-[45deg]" /> : <Mic size={19} />}
        </button>
      </footer>

      {/* Attachment Menu */}
      <AttachmentMenu
        isOpen={isAttachmentMenuOpen}
        onClose={() => setIsAttachmentMenuOpen(false)}
        onSelectOption={handleAttachmentOption}
        position="bottom"
      />

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onSelectEmoji={handleEmojiSelect}
        position="bottom"
      />

      {/* Voice Recorder */}
      <VoiceRecorder
        isRecording={isRecording}
        onStop={handleStopRecording}
        onSend={handleSendVoiceMessage}
        onCancel={handleCancelRecording}
      />
    </div>
  );
}
