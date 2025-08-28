'use client';

import { Smile, Paperclip, Mic, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context';
import { useRealtime } from '@/hooks';
import ReplyCap from '../chatBody/ReplyCap';
import AttachmentMenu from './AttachmentMenu';
import EmojiPicker from './EmojiPicker';
import MediaPicker from './MediaPicker';
import CameraCapture from './CameraCapture';
import DocumentPicker from './DocumentPicker';
import ContactPicker from './ContactPicker';
import PollCreator from './PollCreator';
import DrawingBoard from './DrawingBoard';

export default function ChatFooter({ selectedChat, onSendMessage, currentUser }) {
  const [message, setMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  
  // États pour les composants d'attachement
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isCameraCaptureOpen, setIsCameraCaptureOpen] = useState(false);
  const [isDocumentPickerOpen, setIsDocumentPickerOpen] = useState(false);
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);
  const [isPollCreatorOpen, setIsPollCreatorOpen] = useState(false);
  const [isDrawingBoardOpen, setIsDrawingBoardOpen] = useState(false);
  
  const { replyTo, clearReplyTo, users } = useAppContext();
  
  // Hook temps réel pour les indicateurs de frappe
  const currentUserId = currentUser?.id || 'default-user';
  const { setTypingStatus } = useRealtime(currentUserId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat) {
      // Envoyer le message avec la réponse si elle existe
      const messageData = {
        text: message,
        type: 'text',
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

  // Gestion des indicateurs de frappe
  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Mettre à jour l'indicateur de frappe
    if (selectedChat?.id) {
      if (newMessage.length > 0) {
        setTypingStatus(selectedChat.id, true);
      } else {
        setTypingStatus(selectedChat.id, false);
      }
    }
  };

  const handleInputFocus = () => {
    // Indiquer que l'utilisateur commence à taper
    if (selectedChat?.id) {
      setTypingStatus(selectedChat.id, true);
    }
  };

  const handleInputBlur = () => {
    // Arrêter l'indicateur de frappe quand l'utilisateur quitte le champ
    if (selectedChat?.id) {
      setTypingStatus(selectedChat.id, false);
    }
  };

  const handleCancelReply = () => {
    clearReplyTo();
  };

  const handleAttachmentMenuToggle = () => {
    setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
    // Fermer l'emoji picker si ouvert
    if (isEmojiPickerOpen) {
      setIsEmojiPickerOpen(false);
    }
  };

  const handleAttachmentMenuClose = () => {
    setIsAttachmentMenuOpen(false);
  };

  const handleAttachmentOptionSelect = (option) => {
    console.log('Selected attachment option:', option);
    
    // Fermer le menu d'attachement
    setIsAttachmentMenuOpen(false);
    
    // Actions spécifiques selon l'option
    switch (option.action) {
      case 'select-media':
        setIsMediaPickerOpen(true);
        break;
      case 'open-camera':
        setIsCameraCaptureOpen(true);
        break;
      case 'select-document':
        setIsDocumentPickerOpen(true);
        break;
      case 'select-contact':
        setIsContactPickerOpen(true);
        break;
      case 'create-poll':
        setIsPollCreatorOpen(true);
        break;
      case 'open-drawing':
        setIsDrawingBoardOpen(true);
        break;
      default:
        break;
    }
  };

  const handleEmojiPickerToggle = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
    // Fermer le menu d'attachement si ouvert
    if (isAttachmentMenuOpen) {
      setIsAttachmentMenuOpen(false);
    }
  };

  const handleEmojiPickerClose = () => {
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
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
        currentUser={currentUser}
        selectedChat={selectedChat}
        users={users}
      />
      
      {/* Footer principal */}
      <footer className="flex items-center justify-between px-2 py-1 border-t bg-[#2C2C2C] border-neutral-800">
        <div className="relative">
          <button 
            aria-label="Emoji picker" 
            className={`hover:bg-neutral-700/50 p-[9px] mb-[5.4px] transition-colors rounded-md ${
              isEmojiPickerOpen ? 'bg-neutral-700/50' : ''
            }`}
            onClick={handleEmojiPickerToggle}
          >
            <Smile size={19} />
          </button>
          
          {/* Emoji picker */}
          <EmojiPicker
            isOpen={isEmojiPickerOpen}
            onClose={handleEmojiPickerClose}
            onSelectEmoji={handleEmojiSelect}
          />
        </div>
        <div className="relative">
          <button 
            aria-label="Attach file" 
            className={`hover:bg-neutral-700/50 p-[9px] mb-[5.4px] rounded-md transition-colors ${
              isAttachmentMenuOpen ? 'bg-neutral-700/50' : ''
            }`}
            onClick={handleAttachmentMenuToggle}
          >
            <Paperclip size={19} className="rotate-180" />
          </button>
          
          {/* Menu d'attachement */}
          <AttachmentMenu
            isOpen={isAttachmentMenuOpen}
            onClose={handleAttachmentMenuClose}
            onSelectOption={handleAttachmentOptionSelect}
          />
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            rows={1}
            autoFocus
            aria-label="Type a message"
            className="w-full bg-transparent py-2 px-4 text-sm text-white placeholder-gray-400 focus:outline-none font-segoe resize-none hover:bg-neutral-700"
            placeholder={replyTo ? "Reply to a message" : "Type a message"}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        </form>
        <button 
          aria-label={message.trim() ? "Send message" : "Voice message"}
          className={`transition-colors p-[9px] mb-[5.4px] rounded-md hover:bg-neutral-700/50`}
          onClick={message.trim() ? handleSubmit : () => {
            // Démarrer l'enregistrement vocal
            window.dispatchEvent(new CustomEvent('start-voice-recording', { 
              detail: { 
                chatId: selectedChat.id,
                action: 'start'
              } 
            }));
          }}
        >
          {message.trim() ? <Send size={19} className="rotate-[45deg]" /> : <Mic size={19} />}
        </button>
      </footer>

      {/* Composants d'attachement */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        conversationId={selectedChat.id}
        userId={currentUserId}
      />
      
      <CameraCapture
        isOpen={isCameraCaptureOpen}
        onClose={() => setIsCameraCaptureOpen(false)}
        conversationId={selectedChat.id}
        userId={currentUserId}
      />
      
      <DocumentPicker
        isOpen={isDocumentPickerOpen}
        onClose={() => setIsDocumentPickerOpen(false)}
        conversationId={selectedChat.id}
        userId={currentUserId}
      />
      
      <ContactPicker
        isOpen={isContactPickerOpen}
        onClose={() => setIsContactPickerOpen(false)}
        conversationId={selectedChat.id}
        userId={currentUserId}
      />
      
      <PollCreator
        isOpen={isPollCreatorOpen}
        onClose={() => setIsPollCreatorOpen(false)}
        conversationId={selectedChat.id}
        userId={currentUserId}
      />
      
      <DrawingBoard
        isOpen={isDrawingBoardOpen}
        onClose={() => setIsDrawingBoardOpen(false)}
        conversationId={selectedChat.id}
        userId={currentUserId}
      />
    </div>
  );
}
