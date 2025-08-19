import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import ReplyCap from './chatBody/ReplyCap';
import EmojiPicker from './chatFooter/EmojiPicker';
import AttachmentMenu from './chatFooter/AttachmentMenu';
import VoiceRecorder from './chatFooter/VoiceRecorder';

export default function ChatFooter({ selectedChat, onSendMessage }) {
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimerRef = useRef(null);
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

  // Gestion des emojis
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Gestion des pièces jointes
  const handleAttachmentSelect = (option) => {
    console.log('Option sélectionnée:', option);
    // Ici on peut implémenter la logique pour chaque type de pièce jointe
    switch (option.id) {
      case 'document':
        // Ouvrir le sélecteur de documents
        break;
      case 'camera':
        // Ouvrir l'appareil photo
        break;
      case 'gallery':
        // Ouvrir la galerie
        break;
      case 'audio':
        // Démarrer l'enregistrement audio
        setIsVoiceRecording(true);
        break;
      case 'video':
        // Ouvrir l'enregistrement vidéo
        break;
      case 'contact':
        // Ouvrir la liste des contacts
        break;
      case 'location':
        // Partager la localisation
        break;
      case 'poll':
        // Créer un sondage
        break;
      default:
        break;
    }
  };

  // Gestion de l'enregistrement vocal
  const handleVoiceRecording = (audioBlob) => {
    // Créer un message audio
    const audioMessage = {
      type: 'audio',
      audio: audioBlob,
      duration: 0, // À calculer
      replyTo: replyTo
    };
    onSendMessage(audioMessage);
    clearReplyTo();
  };

  // Gestion du long press pour l'enregistrement vocal
  const handleMicMouseDown = () => {
    if (!message.trim()) {
      longPressTimerRef.current = setTimeout(() => {
        setIsVoiceRecording(true);
        setIsLongPress(true);
      }, 500);
    }
  };

  const handleMicMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPress) {
      setIsVoiceRecording(false);
      setIsLongPress(false);
    }
  };

  const handleMicMouseLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
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
    <div className="relative w-full">
      {/* ReplyCap - apparaît au-dessus du footer quand on répond */}
      <ReplyCap 
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        isMobile={false}
      />
      
      {/* Footer principal */}
      <footer className="flex items-center justify-between px-2 py-1 border-t bg-[#2C2C2C] border-neutral-800">
                 {/* Bouton Emoji */}
         <button 
           aria-label="Emoji picker" 
           className="hover:bg-neutral-700/50 p-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
           onClick={() => setShowEmojiPicker(true)}
           disabled={isVoiceRecording}
         >
           <Smile size={17} className="text-gray-400" />
         </button>
 
         {/* Bouton Pièces jointes */}
         <button 
           aria-label="Attach file" 
           className="hover:bg-neutral-700/50 p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           onClick={() => setShowAttachmentMenu(true)}
           disabled={isVoiceRecording}
         >
           <Paperclip size={17} className="rotate-180 text-gray-400" />
         </button>

                 {/* Zone de saisie */}
         <form onSubmit={handleSubmit} className="flex-1">
           <textarea
             rows={1}
             autoFocus
             aria-label="Type a message"
             className="w-full bg-transparent py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none font-segoe resize-none hover:bg-neutral-700/50 rounded-lg transition-colors"
             placeholder={isVoiceRecording ? "Enregistrement en cours..." : (replyTo ? "Reply to a message" : "Type a message")}
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             onKeyPress={handleKeyPress}
             disabled={isVoiceRecording}
           />
         </form>

                 {/* Bouton Envoyer/Enregistrer */}
         <button 
           aria-label={message.trim() ? "Send message" : "Voice message"}
           className={`transition-colors p-2 rounded-md hover:bg-neutral-700/50 ${
             isLongPress ? 'bg-red-500 hover:bg-red-600' : ''
           }`}
           onClick={message.trim() ? handleSubmit : undefined}
           onMouseDown={!message.trim() ? handleMicMouseDown : undefined}
           onMouseUp={!message.trim() ? handleMicMouseUp : undefined}
           onMouseLeave={!message.trim() ? handleMicMouseLeave : undefined}
         >
           {message.trim() ? (
             <Send size={17} className="rotate-[45deg] text-[#00a884]" />
           ) : (
             <Mic size={17} className={`${isLongPress ? 'text-white' : 'text-gray-400'}`} />
           )}
         </button>
      </footer>

      {/* Composants modaux */}
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
      />

      <AttachmentMenu
        isOpen={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSelectOption={handleAttachmentSelect}
      />

      <VoiceRecorder
        isRecording={isVoiceRecording}
        onStartRecording={() => setIsVoiceRecording(true)}
        onStopRecording={() => setIsVoiceRecording(false)}
        onCancelRecording={() => setIsVoiceRecording(false)}
        onSendRecording={handleVoiceRecording}
      />
    </div>
  );
}
