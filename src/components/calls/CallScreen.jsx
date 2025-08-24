'use client';

import { useState, useEffect } from 'react';
import { Video, Link2, Keypad, Phone, UserPlus, Settings, Search, Clock, Star, MoreVertical, PhoneCall, VideoCall, PhoneOff } from "lucide-react";
import { useAppContext } from '@/context';
import CallManager from './CallManager';
import { MdKeyboard, MdVideocam } from 'react-icons/md';

export default function CallScreen() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [currentCall, setCurrentCall] = useState(null);
  const { users } = useAppContext();

  useEffect(() => {
    setIsClient(true);
    
    // Écouter les événements d'appels depuis le profil ou le chat
    const handleStartCallFromProfile = (event) => {
      const { type, participant, fromProfile, fromChat, chatId } = event.detail;
      
      // Créer l'appel sortant
      setCurrentCall({
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
      });
      
      // Basculer vers l'onglet des appels récents
      setActiveTab('recent');
    };
    
    // Écouter l'événement start-call
    window.addEventListener('start-call', handleStartCallFromProfile);
    
    return () => {
      window.removeEventListener('start-call', handleStartCallFromProfile);
    };
  }, []);

  // Simuler un appel entrant après 5 secondes
  useEffect(() => {
    if (!isClient) return; // Attendre que le client soit prêt
    
    const incomingCallTimer = setTimeout(() => {
      if (!currentCall && users.length > 0) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        setCurrentCall({
          id: Date.now(),
          type: Math.random() > 0.5 ? 'voice' : 'video',
          isVideo: Math.random() > 0.5,
          state: 'incoming',
          participant: randomUser,
          participants: [randomUser],
          startTime: new Date()
        });
      }
    }, 5000);

    return () => clearTimeout(incomingCallTimer);
  }, [isClient, currentCall, users]);

  if (!isClient) {
    return null;
  }

  const handleCreateCall = (type, userId = null) => {
    console.log('Creating call:', type, userId);
    
    // Simuler un appel sortant
    const participant = userId ? users.find(u => u.id === userId) : users[0];
    if (participant) {
      setCurrentCall({
        id: Date.now(),
        type: type,
        isVideo: type === 'video',
        state: 'outgoing',
        participant: participant,
        participants: [participant],
        startTime: new Date()
      });
      
      // Émettre un événement pour notifier l'application
      window.dispatchEvent(new CustomEvent('call-started', { 
        detail: { type, participant } 
      }));
    }
  };

  const handleCreateCallLink = () => {
    console.log('Creating call link');
    
    // Simuler la création d'un lien d'appel
    const callLink = `https://wa.me/call/${Date.now()}`;
    
    // Copier le lien dans le presse-papiers
    if (navigator.clipboard) {
      navigator.clipboard.writeText(callLink).then(() => {
        // Notifier l'utilisateur
        window.dispatchEvent(new CustomEvent('show-notification', { 
          detail: { 
            type: 'success', 
            message: 'Call link copied to clipboard' 
          } 
        }));
      });
    }
  };

  const handleOpenKeypad = () => {
    console.log('Opening keypad');
    
    // Émettre un événement pour ouvrir le pavé numérique
    window.dispatchEvent(new CustomEvent('open-keypad', { 
      detail: { action: 'dial' } 
    }));
  };

  const handleEndCall = (callData) => {
    console.log('Ending call:', callData);
    setCurrentCall(null);
  };

  const handleAcceptCall = (callData) => {
    console.log('Accepting call:', callData);
    setCurrentCall(prev => ({ ...prev, state: 'active' }));
  };

  const handleDeclineCall = (callData) => {
    console.log('Declining call:', callData);
    setCurrentCall(null);
  };

  const CreateCallTab = () => (
    <div className="flex flex-col items-center justify-center flex-1 p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Create a call</h2>
        <p className="text-gray-400 text-sm">Start a voice or video call with your contacts</p>
      </div>

      <div className="grid grid-cols-3 gap-6 max-w-md">
        {/* Voice Call */}
        <button 
          className="flex flex-col items-center gap-3 p-6 hover:bg-neutral-700/50 rounded-xl transition-colors group"
          onClick={() => handleCreateCall('voice')}
        >
          <div className="w-16 h-16 bg-[#3D3D3D] rounded-full flex items-center justify-center group-hover:bg-[#4D4D4D] transition-colors">
            <Phone size={28} className="text-[#1DAA61]" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-white">Voice call</span>
            <p className="text-xs text-gray-400 mt-1">Start an audio call</p>
          </div>
        </button>

        {/* Video Call */}
        <button 
          className="flex flex-col items-center gap-3 p-6 hover:bg-neutral-700/50 rounded-xl transition-colors group"
          onClick={() => handleCreateCall('video')}
        >
          <div className="w-16 h-16 bg-[#3D3D3D] rounded-full flex items-center justify-center group-hover:bg-[#4D4D4D] transition-colors">
            <Video size={28} className="text-[#1DAA61]" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-white">Video call</span>
            <p className="text-xs text-gray-400 mt-1">Start a video call</p>
          </div>
        </button>

        {/* Call Link */}
        <button 
          className="flex flex-col items-center gap-3 p-6 hover:bg-neutral-700/50 rounded-xl transition-colors group"
          onClick={handleCreateCallLink}
        >
          <div className="w-16 h-16 bg-[#3D3D3D] rounded-full flex items-center justify-center group-hover:bg-[#4D4D4D] transition-colors">
            <Link2 size={28} className="text-[#1DAA61]" />
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-white">Call link</span>
            <p className="text-xs text-gray-400 mt-1">Create a call link</p>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="mt-12 max-w-md w-full">
        <div className="grid grid-cols-2 gap-4">
          <button 
            className="flex items-center gap-3 p-4 hover:bg-neutral-700/50 rounded-lg transition-colors"
            onClick={handleOpenKeypad}
          >
            <div className="w-10 h-10 bg-[#3D3D3D] rounded-full flex items-center justify-center">
              <MdKeyboard size={20} className="text-gray-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-white">Keypad</span>
              <p className="text-xs text-gray-400">Dial a number</p>
            </div>
          </button>

          <button 
            className="flex items-center gap-3 p-4 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            onClick={() => {
              // Ouvrir l'interface d'ajout de contact
              window.dispatchEvent(new CustomEvent('add-contact', { 
                detail: { action: 'create' } 
              }));
            }}
          >
            <div className="w-10 h-10 bg-[#3D3D3D] rounded-full flex items-center justify-center">
              <UserPlus size={20} className="text-gray-400" />
            </div>
            <div className="text-left">
              <span className="text-sm font-medium text-white">Add contact</span>
              <p className="text-xs text-gray-400">Create new contact</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const RecentCallsTab = () => {
    // Générer des appels récents basés sur les utilisateurs
    const recentCalls = users.slice(0, 10).map((user, index) => {
      const callTypes = ['incoming', 'outgoing', 'missed', 'video'];
      const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
      const times = ['Just now', '2 minutes ago', '5 minutes ago', '10 minutes ago', '1 hour ago', '2 hours ago', 'Yesterday'];
      const time = times[Math.floor(Math.random() * times.length)];
      const duration = callType === 'missed' ? null : `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        type: callType,
        time,
        duration,
        isVideo: callType === 'video'
      };
    });

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Recent calls</h3>
          
          {recentCalls.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={24} className="text-gray-400" />
              </div>
              <h4 className="text-white font-medium mb-2">No recent calls</h4>
              <p className="text-[#8696a0] text-sm">Your call history will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCalls.map((call) => (
                <div 
                  key={call.id}
                  className="flex items-center justify-between p-3 hover:bg-[#3D3D3D] rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={call.avatar} 
                      alt={call.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="text-white font-medium text-sm">{call.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                                                 <span className={`text-xs ${
                           call.type === 'missed' ? 'text-red-500' : 
                           call.type === 'incoming' ? 'text-[#1DAA61]' : 'text-blue-500'
                         }`}>
                          {call.type === 'missed' ? 'Missed call' : 
                           call.type === 'incoming' ? 'Incoming call' : 'Outgoing call'}
                          {call.duration && ` • ${call.duration}`}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-xs text-gray-400">{call.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                                      <button 
                    className="p-2 hover:bg-[#4D4D4D] rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateCall(call.isVideo ? 'video' : 'voice');
                    }}
                  >
                    {call.isVideo ? (
                      <Video size={16} className="text-[#1DAA61]" />
                    ) : (
                      <Phone size={16} className="text-[#1DAA61]" />
                    )}
                  </button>
                  <button 
                    className="p-2 hover:bg-[#4D4D4D] rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateCall('video');
                    }}
                  >
                    <Video size={16} className="text-gray-400" />
                  </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Si un appel est en cours, afficher le CallManager
  if (currentCall) {
    return (
      <CallManager
        callData={currentCall}
        onEndCall={handleEndCall}
        onAcceptCall={handleAcceptCall}
        onDeclineCall={handleDeclineCall}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0b0e11]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Calls</h2>
          <div className="flex items-center gap-1">
            <Phone size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">({users.length})</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            onClick={() => handleCreateCall('voice')}
            aria-label="New voice call"
          >
            <PhoneCall size={18} className="text-gray-400" />
          </button>
          <button 
            className="p-2 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            onClick={() => handleCreateCall('video')}
            aria-label="New video call"
          >
            <MdVideocam size={18} className="text-gray-400" />
          </button>
          <button 
            className="p-2 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            aria-label="More options"
            onClick={() => {
              // Ouvrir le menu des options d'appel
              window.dispatchEvent(new CustomEvent('open-call-options', { 
                detail: { action: 'show-menu' } 
              }));
            }}
          >
            <MoreVertical size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-neutral-800 bg-[#2C2C2C]">
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'create' 
              ? 'text-white border-b-2 border-[#1DAA61]' 
              : 'text-[#8696a0] hover:text-[#e9edef]'
          }`}
          onClick={() => setActiveTab('create')}
        >
          Create call
        </button>
        <button
          className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'recent' 
              ? 'text-white border-b-2 border-[#1DAA61]' 
              : 'text-[#8696a0] hover:text-[#e9edef]'
          }`}
          onClick={() => setActiveTab('recent')}
        >
          Recent calls
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {currentCall ? (
          <CallManager
            callData={currentCall}
            onEndCall={handleEndCall}
            onAcceptCall={handleAcceptCall}
            onDeclineCall={handleDeclineCall}
          />
        ) : (
          activeTab === 'create' ? <CreateCallTab /> : <RecentCallsTab />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center justify-between">
          <button 
            className="flex items-center gap-2 text-[#8696a0] hover:text-[#e9edef] transition-colors"
            onClick={() => {
              // Ouvrir le pavé numérique
              window.dispatchEvent(new CustomEvent('open-keypad', { 
                detail: { action: 'dial' } 
              }));
            }}
          >
            <MdKeyboard size={16} />
            <span className="text-sm">Keypad</span>
          </button>
          
          <button 
            className="flex items-center gap-2 text-[#8696a0] hover:text-[#e9edef] transition-colors"
            onClick={() => {
              // Ouvrir les paramètres d'appel
              window.dispatchEvent(new CustomEvent('open-call-settings', { 
                detail: { action: 'open' } 
              }));
            }}
          >
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
