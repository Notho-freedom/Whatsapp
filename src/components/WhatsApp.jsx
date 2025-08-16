'use client';

import { useState, useEffect } from 'react';
import Titlebar from './Titlebar';
import Sidebar from './Sidebar';
import ChatList from './ChatList';
import ChatHeader from './ChatHeader';
import ChatBody from './chatBody/ChatBody';
import ChatFooter from './ChatFooter';
import { useAppContext } from '@/context/AppContext';

export default function WhatsApp() {
  const [isClient, setIsClient] = useState(false);
  const { 
    selectedChat, 
    messages, 
    sendMessage, 
    selectChat,
    loading,
    error 
  } = useAppContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-whatsapp-dark-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-primary mx-auto mb-4"></div>
          <p className="text-white">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-whatsapp-dark-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erreur: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-whatsapp-primary text-white rounded-md hover:bg-whatsapp-primary-dark transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const handleChatSelect = (chat) => {
    selectChat(chat);
  };

  const handleSendMessage = (text) => {
    if (selectedChat) {
      sendMessage(selectedChat.id, text);
    }
  };

  const currentMessages = selectedChat ? messages[selectedChat.id] || [] : [];

  return (
    <div className="h-screen w-screen flex flex-col bg-[#202020] font-segoe overflow-hidden rounded-md">
      {/* Titlebar */}
      <Titlebar />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Chat List */}
        <ChatList
          onChatSelect={handleChatSelect}
          selectedChatId={selectedChat?.id}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ChatHeader selectedChat={selectedChat} />
          <ChatBody
            selectedChat={selectedChat}
            messages={currentMessages}
          />
          <ChatFooter
            selectedChat={selectedChat}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}
