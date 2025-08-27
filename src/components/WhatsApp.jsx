'use client';

import React from 'react';
import { 
  Titlebar, 
  Sidebar, 
  Splitter 
} from '@/components/layout';
import { 
  Profile, 
  ProfilePanel, 
  WelcomeScreen,
  ClientOnly,
  Notification,
  CacheManager
} from '@/components/common';
import CacheStats from '@/components/common/CacheStats';
import RealtimeNotification from '@/components/common/RealtimeNotification';
import { 
  StatusCircle, 
  Message 
} from '@/components/ui';
import { 
  GoogleAuth, 
  GoogleAuthDemo, 
  AuthNavigation, 
  GoogleContactsManager 
} from '@/components/auth';
import { 
  ChatList, 
  StarredMessages 
} from '@/components/chat';
import { 
  ChatHeader,
  ChatBody,
  ChatFooter
} from '@/components/chat';
import { 
  StatusPanel, 
  StatusView 
} from '@/components/status';
import { 
  ActiveCall, 
  CallManager, 
  CallPanel, 
  CallScreen, 
  CallWaiting, 
  IncomingCall, 
  OutgoingCall 
} from '@/components/calls';
import { 
  NativeNotificationDemo, 
  NativeContextMenuDemo 
} from '@/features';
import { useAppContext } from '@/context';
import { useGoogleAuth, useEventManager, useTokenRefresh, useTempConversations, useRealtime, useLocalCache } from '@/hooks';

export default function WhatsApp() {
  const [isClient, setIsClient] = React.useState(false);
  const [chatListWidth, setChatListWidth] = React.useState(300); // Largeur initiale pour 25%
  const [selectedStatus, setSelectedStatus] = React.useState(null); // État pour le statut sélectionné
  const [profileActiveTab, setProfileActiveTab] = React.useState('overview'); // État pour l'onglet actif du profil

  
  // Initialiser le gestionnaire d'événements seulement côté client
  const eventManager = useEventManager();
  
  // Hook d'authentification Google
  const { user, isAuthenticated, isLoading: authLoading } = useGoogleAuth();
  
  // Hook de rafraîchissement automatique des tokens
  useTokenRefresh();
  
  // Hook pour gérer les conversations temporaires
  const { loadTempConversations, cleanupOldConversations } = useTempConversations();
  
  // Hook pour les fonctionnalités temps réel
  const currentUserId = user?.uid || 'default-user';
  const { 
    updatePresence, 
    listenToUserPresence, 
    setTypingStatus,
    markMessageAsRead,
    sendNotification,
    presence,
    typingUsers,
    notifications
  } = useRealtime(currentUserId);

  // Hook pour la gestion du cache local
  const {
    isInitialized: cacheInitialized,
    cacheStats,
    syncWithCache,
    preloadData,
    getAllConversations,
    getMessages,
    getLastMessages
  } = useLocalCache();
  
  // État pour gérer les phases de chargement
  const [loadingPhase, setLoadingPhase] = React.useState(1); // 1: Cache local, 2: Synchronisation
  const [isSyncing, setIsSyncing] = React.useState(false);
  
  const { 
    selectedChat, 
    sendMessage, 
    selectChat,
    loading,
    error,
    activeTab,
    setActiveTab,
    users,
    getUserStatuses,
    actions
  } = useAppContext();

  React.useEffect(() => {
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

  // Charger les conversations temporaires au démarrage
  React.useEffect(() => {
    if (isClient && isAuthenticated) {
      // Charger les conversations temporaires
      loadTempConversations();
      
      // DÉSACTIVÉ: Nettoyer les anciennes conversations temporaires
      // cleanupOldConversations();
    }
  }, [isClient, isAuthenticated, loadTempConversations]);

  // Gestion de la présence et des fonctionnalités temps réel
  React.useEffect(() => {
    if (isAuthenticated && currentUserId) {
      // Mettre à jour la présence en ligne
      updatePresence('online');
    }
  }, [isAuthenticated, currentUserId, updatePresence]);

  // Écouter la présence des autres utilisateurs (séparé pour éviter les boucles)
  React.useEffect(() => {
    if (isAuthenticated && currentUserId && users.length > 0) {
      users.forEach(user => {
        if (user.id !== currentUserId) {
          listenToUserPresence(user.id);
        }
      });
    }
  }, [isAuthenticated, currentUserId, users.length, listenToUserPresence]);

  // Stratégie de chargement en deux phases : Cache local d'abord, puis synchronisation
  React.useEffect(() => {
    if (cacheInitialized && isAuthenticated) {
      // PHASE 1 : Chargement instantané depuis le cache local
      console.log('🚀 Phase 1 : Chargement depuis le cache local...');
      setLoadingPhase(1);
      
              // Charger les conversations depuis le cache local
        const cachedConversations = getAllConversations();
        if (cachedConversations.length > 0) {
          console.log(`📦 ${cachedConversations.length} conversations chargées depuis le cache local`);
          // Transformer les conversations en utilisateurs pour la compatibilité avec le contexte
          const transformedConversations = cachedConversations.map(conv => ({
            id: conv.id,
            name: conv.name || 'Conversation',
            avatar: conv.avatar || '/default-avatar.png',
            lastMessage: conv.lastMessage || '',
            lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
            unreadCount: conv.unreadCount || 0,
            isConversation: true
          }));
          
          // Mettre à jour l'état avec les conversations transformées
          actions.setUsers(transformedConversations);
          
          // Charger les derniers messages pour chaque conversation (optimisé)
          cachedConversations.forEach(conv => {
            const lastMessages = getLastMessages(conv.id, 5); // 5 derniers messages optimisés
            if (lastMessages.length > 0) {
              actions.setMessages(conv.id, lastMessages);
              console.log(`📝 ${lastMessages.length} derniers messages chargés pour ${conv.id}`);
            }
          });
        
        // Marquer la phase 1 comme terminée
        setLoadingPhase(2);
      }
      
      // PHASE 2 : Synchronisation furtive en arrière-plan
      console.log('🔄 Phase 2 : Lancement de la synchronisation furtive...');
      setIsSyncing(true);
      
      setTimeout(() => {
        // Synchroniser les utilisateurs avec le cache
        if (users.length > 0) {
          syncWithCache(users, 'users');
        }
        
        // Précharger et synchroniser les données
        preloadData().finally(() => {
          setIsSyncing(false);
          console.log('✅ Synchronisation furtive terminée');
        });
      }, 100); // Délai minimal pour laisser l'interface se charger
    }
  }, [cacheInitialized, isAuthenticated, users, syncWithCache, preloadData, getAllConversations, getMessages, actions]);



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

  // Indicateur de chargement intelligent avec phases
  const LoadingIndicator = ({ phase = 1, isSyncing = false }) => (
    <div className="absolute top-0 left-0 right-0 z-50 bg-whatsapp-primary/90 text-white py-2 px-4 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        {phase === 1 ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Chargement depuis le cache local...</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Synchronisation furtive en cours...</span>
            {isSyncing && <span className="text-xs opacity-75">(arrière-plan)</span>}
          </>
        )}
      </div>
    </div>
  );

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
        sendMessage(selectedChat.id, { text: messageData, type: 'text' });
      } else {
        // Nouveau format avec replyTo
        sendMessage(selectedChat.id, messageData, messageData.replyTo);
      }
    }
  };

  const handleSplitterResize = (newWidth) => {
    setChatListWidth(newWidth);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#202020] font-segoe overflow-hidden rounded-md relative">
      {/* Indicateur de chargement intelligent avec phases */}
      {loading && <LoadingIndicator phase={loadingPhase} isSyncing={isSyncing} />}
      
      {/* Titlebar */}
      <Titlebar />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar currentUser={user} />

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
              currentUser={user}
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
          {activeTab === 'profile' && <ProfilePanel 
                activeTab={profileActiveTab} 
                onTabChange={setProfileActiveTab} 
              />}
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
              <ChatBody selectedChat={selectedChat} currentUser={user} />
              <ChatFooter
                selectedChat={selectedChat}
                onSendMessage={handleSendMessage}
                currentUser={user}
              />
            </>
          )}
          {activeTab === 'calls' && <CallScreen />}
          {activeTab === 'status' && <StatusView selectedStatus={selectedStatus} onNextUser={handleNextUser} />}
          {activeTab === 'star' && <StarredMessages />}
          {activeTab === 'profile' && <Profile activeTab={profileActiveTab} />}
        </div>
      </div>

      {/* Notifications temps réel */}
      <RealtimeNotification 
        notifications={notifications}
        onDismiss={(notificationId) => {
          console.log('Notification fermée:', notificationId);
        }}
      />

      {/* Statistiques du cache (en mode développement) */}
      {process.env.NODE_ENV === 'development' && <CacheStats />}

      {/* Gestionnaire de cache local intégré dans ProfilePanel */}

    </div>
  );
}
