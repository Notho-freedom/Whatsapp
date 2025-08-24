'use client';

import { useState, useEffect } from 'react';
import Titlebar from './Titlebar';
import Sidebar from './Sidebar';
import ChatList from './chat/ChatList';
import ChatHeader from './chat/chatHeader/ChatHeader';
import ChatBody from './chat/chatBody/ChatBody';
import ChatFooter from './chat/chatFooter/ChatFooter';
import Splitter from './Splitter';
import StarredMessages from './chat/StarredMessages';
import { useAppContext } from '@/context/AppContext';
import CallPanel from './calls/CallPanel';
import CallScreen from './calls/CallScreen';
import StatusPanel from './status/StatusPanel';
import StatusView from './status/StatusView';
import { useEventManager } from '@/hooks/useEventManager';
import ClientOnly from './ClientOnly';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import GoogleAuth from './GoogleAuth';
import WelcomeScreen from './WelcomeScreen';

export default function WhatsApp() {
  const [isClient, setIsClient] = useState(false);
  const [chatListWidth, setChatListWidth] = useState(300); // Largeur initiale pour 25%
  const [selectedStatus, setSelectedStatus] = useState(null); // État pour le statut sélectionné
  const [showWelcome, setShowWelcome] = useState(false); // État pour l'écran de bienvenue
  
  // Initialiser le gestionnaire d'événements seulement côté client
  const eventManager = useEventManager();
  
  // Hook d'authentification Google
  const { user, isAuthenticated, isLoading: authLoading } = useGoogleAuth();
  
  const { 
    selectedChat, 
    sendMessage, 
    selectChat,
    loading,
    error,
    activeTab,
    setActiveTab,
    users,
    getUserStatuses
  } = useAppContext();

  useEffect(() => {
    setIsClient(true);
    
    // Calculer la largeur initiale basée sur 25% de la largeur de l'écran
    const calculateInitialWidth = () => {
      const screenWidth = window.innerWidth;
      const sidebarWidth = 48; // Largeur de la sidebar
      const availableWidth = screenWidth - sidebarWidth;
      const initialWidth = Math.max(270, Math.min(400, availableWidth * 0.25));
      setChatListWidth(initialWidth);
    };
    
    calculateInitialWidth();
    window.addEventListener('resize', calculateInitialWidth);
    
    // Gestionnaire d'événements pour les appels
    const handleStartCall = (event) => {
      // Rediriger vers l'onglet "Appels"
      setActiveTab('calls');
    };
    
    // Écouter les événements d'appels
    window.addEventListener('start-call', handleStartCall);
    
    return () => {
      window.removeEventListener('resize', calculateInitialWidth);
      window.removeEventListener('start-call', handleStartCall);
    };
  }, [setActiveTab]);

  // Effet pour afficher l'écran de bienvenue après la connexion
  useEffect(() => {
    if (isAuthenticated && user && !showWelcome) {
      setShowWelcome(true);
    }
  }, [isAuthenticated, user, showWelcome]);

  if (!isClient) {
    return null;
  }

  // Afficher l'authentification Google si l'utilisateur n'est pas connecté
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              WhatsApp Clone
            </h1>
            <p className="text-gray-600">
              Connectez-vous pour commencer à discuter
            </p>
          </div>
          <GoogleAuth />
        </div>
      </div>
    );
  }

  // Afficher le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
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

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  // Fonction pour passer au prochain utilisateur avec des statuts
  const handleNextUser = () => {
    if (!selectedStatus) return;
    
    const usersWithStatuses = users.filter(user => 
      user.statuses && user.statuses.length > 0
    );
    
    const currentUserIndex = usersWithStatuses.findIndex(user => 
      user.id === selectedStatus.userId
    );
    
    if (currentUserIndex < usersWithStatuses.length - 1) {
      const nextUser = usersWithStatuses[currentUserIndex + 1];
      const nextUserStatuses = getUserStatuses(nextUser.id);
      if (nextUserStatuses.length > 0) {
        handleStatusSelect({
          ...nextUserStatuses[0],
          user: nextUser
        });
      }
    }
  };

  // Fonction pour naviguer vers les statuts depuis la chatlist
  const handleStatusFromChatList = (statusData) => {
    // Changer vers l'onglet status
    setActiveTab('status');
    // Sélectionner le statut
    handleStatusSelect(statusData);
  };

  const handleSendMessage = (messageData) => {
    if (selectedChat) {
      // Si messageData est une chaîne (ancien format), la convertir
      if (typeof messageData === 'string') {
        sendMessage(selectedChat.id, messageData);
      } else {
        // Nouveau format avec replyTo
        sendMessage(selectedChat.id, messageData.text, messageData.replyTo);
      }
    }
  };

  const handleSplitterResize = (newWidth) => {
    setChatListWidth(newWidth);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#202020] font-segoe overflow-hidden rounded-md">
      {/* Titlebar */}
      <Titlebar />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Chat List avec largeur fixe */}
        <div 
          className="ml-12 rounded-tl-xl flex-shrink-0 bg-[#2C2C2C] border-r border-neutral-800 chat-list-container"
          style={{ width: `${chatListWidth}px`, minWidth: `270px` }}
        >
          {activeTab === 'chats' && (
            <ChatList
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
              onStatusSelect={handleStatusFromChatList}
            />
          )}
          {activeTab === 'calls' && <CallPanel />}
          {activeTab === 'star' && <StarredMessages />}
          {activeTab === 'status' && (
            <StatusPanel 
              onStatusSelect={handleStatusSelect}
              selectedStatus={selectedStatus}
            />
          )}
        </div>

        {/* Splitter */}
        <Splitter
          onResize={handleSplitterResize}
          minWidth={270}
          maxWidth={400}
          initialWidth={chatListWidth}
        />

        {/* Chat Area - prend le reste de l'espace */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e11]">
          {activeTab === 'chats' && (
            <>
              <ChatHeader selectedChat={selectedChat} />
              <ChatBody selectedChat={selectedChat} />
              <ChatFooter
                selectedChat={selectedChat}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
          {activeTab === 'calls' && <CallScreen />}
          {activeTab === 'status' && <StatusView selectedStatus={selectedStatus} onNextUser={handleNextUser} />}
          {activeTab === 'star' && <StarredMessages />}
        </div>
      </div>

      {/* Écran de bienvenue après connexion */}
      {showWelcome && (
        <WelcomeScreen onContinue={() => setShowWelcome(false)} />
      )}

    </div>
  );
}
