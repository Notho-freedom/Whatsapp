'use client';

import React from 'react';
import { 
  Titlebar, 
  Sidebar, 
  Splitter 
} from '@/components/layout';
import { 
  Profile, 
  ProfilePanel
} from '@/components/common';
import CacheStats from '@/components/common/CacheStats';
import RealtimeNotification from '@/components/common/RealtimeNotification';
import { AvatarCacheStats } from '@/components/common';
import {
  GoogleAuth
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
  CallPanel, 
  CallScreen,
  CallManager
} from '@/components/calls';
import { useAppContext } from '@/context';
import { useGoogleAuth, useEventManager, useTokenRefresh, useTempConversations, useRealtime, useLocalCache } from '@/hooks';

export default function WhatsApp() {
  const [isClient, setIsClient] = React.useState(false);
  const [chatListWidth, setChatListWidth] = React.useState(300); // Largeur initiale pour 25%
  const [selectedStatus, setSelectedStatus] = React.useState(null); // État pour le statut sélectionné
  const [profileActiveTab, setProfileActiveTab] = React.useState('overview'); // État pour l'onglet actif du profil
  const [activeCall, setActiveCall] = React.useState(null); // État pour l'appel actif
  const user = localStorage.getItem('userData') || null;
  
  // Initialiser le gestionnaire d'événements seulement côté client
  const eventManager = useEventManager();
  
  // Hook d'authentification Google
  const { isAuthenticated, isLoading: authLoading } = useGoogleAuth();

  
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
    getLastMessages
  } = useLocalCache();

  // État pour gérer les phases de chargement
  const [loadingPhase, setLoadingPhase] = React.useState(1); // 1: Cache local, 2: Synchronisation
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncErrors, setSyncErrors] = React.useState([]);
  const [localLoading, setLocalLoading] = React.useState(false);
  const [conversationsLoading, setConversationsLoading] = React.useState(false);
  const [contactsLoading, setContactsLoading] = React.useState(false);
  const [statusesLoading, setStatusesLoading] = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState({
    conversations: 0,
    contacts: 0,
    statuses: 0,
    messages: 0
  });

  // Fonction pour vérifier la synchronisation avec Firebase (discrètement)
  const checkFirebaseSync = React.useCallback(async () => {
    try {
      // Vérifier uniquement si nécessaire (pas à chaque action)
      const timeSinceLastCheck = Date.now() - (window.lastSyncCheck || 0);
      if (timeSinceLastCheck < 60000) { // 1 minute entre vérifications
        return;
      }
      
      window.lastSyncCheck = Date.now();
      console.log('🔍 Vérification discrète de la synchronisation...');
      
      // Importer le service intelligent
      const smartCacheService = require('@/utils/smartCacheService').default;
      
      // Vérifier les statistiques de performance
      const stats = smartCacheService.getPerformanceStats();
      
      if (stats.sync.queueSize > 0) {
        console.log(`📊 ${stats.sync.queueSize} éléments en attente de synchronisation`);
      }
      
      // Vérifier les erreurs de synchronisation
      if (stats.sync.isSyncing && stats.sync.queueSize === 0) {
        console.log('✅ Synchronisation en cours, tout semble normal');
      }
      
    } catch (error) {
      console.warn('⚠️ Erreur lors de la vérification de synchronisation:', error);
    }
  }, []);

  // Fonction pour forcer la synchronisation (manuellement)
  const forceSync = React.useCallback(async () => {
    try {
      setIsSyncing(true);
      setSyncErrors([]);
      
      console.log('🔄 Synchronisation forcée en cours...');
      
      // Importer le service intelligent
      const smartCacheService = require('@/utils/smartCacheService').default;
      
      // Forcer le traitement de la queue
      await smartCacheService.processSyncQueue();
      
      console.log('✅ Synchronisation forcée terminée');
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error);
      setSyncErrors([error.message]);
    } finally {
      setIsSyncing(false);
    }
  }, []);
  
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
    
    // Gestionnaires d'événements pour les appels
    const handleStartCall = (event) => {
      const { type, participant, fromProfile, fromChat, chatId } = event.detail;
      
      // Créer l'appel sortant
      const callData = {
        id: Date.now(),
        type: type,
        isVideo: type === 'video',
        state: 'outgoing',
        participant: participant,
        participants: [participant],
        startTime: new Date(),
        fromProfile,
        fromChat,
        chatId
      };
      
      setActiveCall(callData);
      setActiveTab('calls');
    };

    const handleIncomingCall = (event) => {
      const callData = event.detail;
      setActiveCall(callData);
    };

    const handleCallEnded = (event) => {
      setActiveCall(null);
    };

    const handleCallAccepted = (event) => {
      const callData = event.detail;
      setActiveCall(prev => ({ ...prev, state: 'active' }));
    };

    const handleCallDeclined = (event) => {
      setActiveCall(null);
    };
    
    // Écouter les événements d'appels
    window.addEventListener('start-call', handleStartCall);
    window.addEventListener('incoming-call', handleIncomingCall);
    window.addEventListener('call-ended', handleCallEnded);
    window.addEventListener('call-accepted', handleCallAccepted);
    window.addEventListener('call-declined', handleCallDeclined);
    
    return () => {
      window.removeEventListener('resize', calculateInitialWidth);
      window.removeEventListener('start-call', handleStartCall);
      window.removeEventListener('incoming-call', handleIncomingCall);
      window.removeEventListener('call-ended', handleCallEnded);
      window.removeEventListener('call-accepted', handleCallAccepted);
      window.removeEventListener('call-declined', handleCallDeclined);
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

  // Vérification périodique de la synchronisation (moins fréquente)
  React.useEffect(() => {
    if (cacheInitialized && isAuthenticated) {
      // Vérifier la synchronisation toutes les 2 minutes (au lieu de 30 secondes)
      const syncInterval = setInterval(checkFirebaseSync, 120000);
      
      // Vérification initiale après un délai
      const initialCheck = setTimeout(checkFirebaseSync, 10000);
      
      return () => {
        clearInterval(syncInterval);
        clearTimeout(initialCheck);
      };
    }
  }, [cacheInitialized, isAuthenticated, checkFirebaseSync]);

  // Stratégie de chargement asynchrone et non-bloquante
  React.useEffect(() => {
    if (cacheInitialized && isAuthenticated) {
      setLoadingPhase(1);
      setIsSyncing(false);
      console.log('🚀 Phase 1 : Chargement asynchrone depuis le cache local...');

      // Charger les conversations de manière asynchrone et non-bloquante
      const loadConversationsAsync = async () => {
        try {
          // Utiliser requestIdleCallback pour ne pas bloquer le rendu
          if (window.requestIdleCallback) {
            window.requestIdleCallback(async () => {
              await loadConversationsFromCache();
            }, { timeout: 1000 });
          } else {
            // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
            setTimeout(async () => {
              await loadConversationsFromCache();
            }, 100);
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors du chargement asynchrone:', error);
        }
      };

      // Charger les contacts et statuts en parallèle
      const loadContactsAndStatuses = async () => {
        try {
          await Promise.all([
            loadContacts(),
            loadStatuses()
          ]);
        } catch (error) {
          console.warn('⚠️ Erreur lors du chargement des contacts/statuts:', error);
        }
      };

      loadConversationsAsync();
      loadContactsAndStatuses();

      // PHASE 2 : Synchronisation discrète en arrière-plan
      const syncTimer = setTimeout(async () => {
        setLoadingPhase(2);
        setIsSyncing(true);
        console.log('☁️ Phase 2 : Synchronisation discrète en arrière-plan...');
        
        try {
          // Utiliser requestIdleCallback pour la synchronisation
          if (window.requestIdleCallback) {
            window.requestIdleCallback(async () => {
              await performBackgroundSync();
            }, { timeout: 2000 });
          } else {
            await performBackgroundSync();
          }
        } catch (error) {
          console.warn('⚠️ Erreur lors de la synchronisation discrète:', error);
        } finally {
          setIsSyncing(false);
          setLocalLoading(false);
        }
      }, 1000); // Délai réduit pour une meilleure réactivité

      return () => clearTimeout(syncTimer);
    }
  }, [cacheInitialized, isAuthenticated]);

  // Fonction pour charger les conversations depuis le cache (non-bloquante)
  const loadConversationsFromCache = React.useCallback(async () => {
    try {
      setConversationsLoading(true);
      setLoadingProgress(prev => ({ ...prev, conversations: 0 }));
      
      const cachedConversations = getAllConversations();
      if (cachedConversations.length > 0) {
        console.log(`📦 ${cachedConversations.length} conversations chargées depuis le cache local`);
        
        // Traitement par lots pour éviter de bloquer l'interface
        const batchSize = 10;
        for (let i = 0; i < cachedConversations.length; i += batchSize) {
          const batch = cachedConversations.slice(i, i + batchSize);
          
          // Traiter le lot de manière asynchrone
          await new Promise(resolve => {
            if (window.requestIdleCallback) {
              window.requestIdleCallback(() => {
                processConversationBatch(batch);
                resolve();
              }, { timeout: 100 });
            } else {
              setTimeout(() => {
                processConversationBatch(batch);
                resolve();
              }, 10);
            }
          });
          
          // Mettre à jour le progrès
          const progress = Math.min(100, ((i + batchSize) / cachedConversations.length) * 100);
          setLoadingProgress(prev => ({ ...prev, conversations: progress }));
        }
        
        setLoadingProgress(prev => ({ ...prev, conversations: 100 }));
      } else {
        console.log('🤷 Aucune conversation trouvée dans le cache local.');
        setLoadingProgress(prev => ({ ...prev, conversations: 100 }));
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  }, [getAllConversations]);

  // Fonction pour traiter un lot de conversations
  const processConversationBatch = React.useCallback((conversations) => {
    const transformedConversations = conversations.map(conv => ({
      id: conv.id,
      name: conv.name || 'Conversation inconnue',
      lastMessage: conv.lastMessage,
      timestamp: conv.timestamp,
      unreadCount: conv.unreadCount || 0,
      isGroup: conv.isGroup || false,
      participants: conv.participants || [],
      avatar: conv.avatar || '',
    }));
    
    actions.setUsers(transformedConversations);

    // Charger les derniers messages de manière asynchrone
    conversations.forEach(conv => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => {
          const lastMessages = getLastMessages(conv.id, 5);
          if (lastMessages.length > 0) {
            actions.setMessages(conv.id, lastMessages);
          }
        }, { timeout: 50 });
      } else {
        setTimeout(() => {
          const lastMessages = getLastMessages(conv.id, 5);
          if (lastMessages.length > 0) {
            actions.setMessages(conv.id, lastMessages);
          }
        }, 10);
      }
    });
  }, [actions, getLastMessages]);

  // Fonction pour charger les contacts
  const loadContacts = React.useCallback(async () => {
    try {
      setContactsLoading(true);
      setLoadingProgress(prev => ({ ...prev, contacts: 0 }));
      
      // Simuler le chargement des contacts (à remplacer par l'appel réel)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour le progrès
      setLoadingProgress(prev => ({ ...prev, contacts: 100 }));
      console.log('✅ Contacts chargés');
      
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  // Fonction pour charger les statuts
  const loadStatuses = React.useCallback(async () => {
    try {
      setStatusesLoading(true);
      setLoadingProgress(prev => ({ ...prev, statuses: 0 }));
      
      // Simuler le chargement des statuts (à remplacer par l'appel réel)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mettre à jour le progrès
      setLoadingProgress(prev => ({ ...prev, statuses: 100 }));
      console.log('✅ Statuts chargés');
      
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des statuts:', error);
    } finally {
      setStatusesLoading(false);
    }
  }, []);

  // Fonction pour la synchronisation en arrière-plan
  const performBackgroundSync = React.useCallback(async () => {
    try {
      const smartCacheService = require('@/utils/smartCacheService').default;
      await smartCacheService.preloadData();
      console.log('✅ Synchronisation discrète terminée.');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la synchronisation:', error);
    }
  }, []);



  if (!isClient) {
    return null;
  }

  // Afficher l'authentification Google si l'utilisateur n'est pas connecté
  if (!isAuthenticated && !authLoading) {
    return (
          <GoogleAuth />
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

  // Gestionnaires d'appels
  const handleEndCall = (callData) => {
    setActiveCall(null);
  };

  const handleAcceptCall = (callData) => {
    setActiveCall(prev => ({ ...prev, state: 'active' }));
  };

  const handleDeclineCall = (callData) => {
    setActiveCall(null);
  };

  // Indicateur de chargement intelligent avec phases et progrès détaillé
  const LoadingIndicator = ({ phase = 1, isSyncing = false }) => {
    const totalProgress = Math.round(
      (loadingProgress.conversations + loadingProgress.contacts + loadingProgress.statuses) / 3
    );
    
    return (
      <div className="absolute top-0 left-0 right-0 z-50 bg-whatsapp-primary/90 text-white py-2 px-4">
        <div className="flex flex-col space-y-2">
          {/* Barre de progrès principale */}
          <div className="flex items-center justify-center space-x-2">
            {phase === 1 ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">Chargement depuis le cache local... {totalProgress}%</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Synchronisation furtive en cours...</span>
                {isSyncing && <span className="text-xs opacity-75">(arrière-plan)</span>}
              </>
            )}
          </div>
          
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#202020] font-segoe overflow-hidden rounded-md relative">
      {/* Indicateur de chargement intelligent avec phases */}
      {(loading || conversationsLoading || contactsLoading || statusesLoading) && (
        <LoadingIndicator phase={loadingPhase} isSyncing={isSyncing} />
      )}
      
      {/* Indicateur de synchronisation Firebase */}
      {syncErrors.length > 0 && (
        <div className="absolute top-16 left-0 right-0 z-40 bg-yellow-600/90 text-white py-2 px-4 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse">⚠️</div>
            <span>{syncErrors.length} erreur(s) de synchronisation détectée(s)</span>
            <button 
              onClick={forceSync}
              className="ml-2 px-3 py-1 bg-yellow-700 hover:bg-yellow-800 rounded text-xs"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
      
      {/* Indicateur de synchronisation en cours */}
      {isSyncing && (
        <div className="absolute top-20 left-0 right-0 z-40 bg-blue-600/90 text-white py-2 px-4 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Synchronisation avec Firebase en cours...</span>
          </div>
        </div>
      )}
      
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
                user={user}
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
      {process.env.NODE_ENV === 'development' && (
        <>
          <CacheStats />
          <AvatarCacheStats />
        </>
      )}

      {/* Gestionnaire de cache local intégré dans ProfilePanel */}

      {/* CallManager pour gérer les appels actifs */}
      {activeCall && (
        <CallManager
          callData={activeCall}
          onEndCall={handleEndCall}
          onAcceptCall={handleAcceptCall}
          onDeclineCall={handleDeclineCall}
        />
      )}

      
    </div>
  );
}
