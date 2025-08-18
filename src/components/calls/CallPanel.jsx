import { useState, useEffect } from 'react';
import { Search, Phone, Video, Link2, Keypad, MoreVertical, PhoneCall, Settings, ArrowUpRight, ArrowDownLeft, X } from "lucide-react";
import { useAppContext } from '@/context/AppContext';
import { MdKeyboard, MdVideocam } from 'react-icons/md';

export default function CallPanel() {
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { users } = useAppContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  // Générer des données d'appels récents basées sur les utilisateurs
  const generateRecentCalls = () => {
    const callTypes = ['incoming', 'outgoing', 'missed'];
    const times = ['Just now', '2 minutes ago', '5 minutes ago', '10 minutes ago', '1 hour ago', '2 hours ago', 'Yesterday', '2 days ago'];
    
    return users.slice(0, 15).map((user, index) => {
      const callType = callTypes[Math.floor(Math.random() * callTypes.length)];
      const isVideo = Math.random() > 0.7; // 30% de chance d'être un appel vidéo
      const time = times[Math.floor(Math.random() * times.length)];
      const duration = callType === 'missed' ? null : `${Math.floor(Math.random() * 10) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
      const missedCount = callType === 'missed' ? Math.floor(Math.random() * 3) + 1 : 0;
      
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        type: callType,
        time,
        duration,
        missedCount,
        isVideo: isVideo
      };
    });
  };

  const recentCalls = generateRecentCalls();

  // Filtrer les appels selon la recherche
  const filteredCalls = recentCalls.filter(call =>
    call.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.phone.includes(searchQuery)
  );

  const getCallIcon = (call) => {
    if (call.type === 'missed') {
      return <X size={16} className="text-red-500" />;
    }
    
    if (call.isVideo) {
      return <Video size={16} className="text-green-500" />;
    }
    
    return call.status === 'incoming' ? 
      <ArrowDownLeft size={16} className="text-green-500" /> : 
      <ArrowUpRight size={16} className="text-blue-500" />;
  };

  const getCallStatusText = (call) => {
    if (call.type === 'missed') {
      return `Missed call${call.missedCount > 1 ? ` (${call.missedCount})` : ''}`;
    }
    
    const direction = call.type === 'incoming' ? 'Incoming' : 'Outgoing';
    const type = call.isVideo ? 'video call' : 'call';
    const duration = call.duration ? ` • ${call.duration}` : '';
    
    return `${direction} ${type}${duration}`;
  };

  const getCallStatusColor = (call) => {
    if (call.type === 'missed') return 'text-red-500';
    if (call.type === 'incoming') return 'text-green-500';
    return 'text-blue-500';
  };

  const handleCreateCall = (type, userId = null) => {
    console.log(`Creating ${type} call${userId ? ` with ${userId}` : ''}`);
    // Ici on pourrait implémenter la logique d'appel
  };

  const handleCallAction = (call) => {
    const callType = call.isVideo ? 'video' : 'voice';
    handleCreateCall(callType, call.id);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0e11]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">Calls</h2>
          <div className="flex items-center gap-1">
            <Phone size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">({recentCalls.length})</span>
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
          >
            <MoreVertical size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start a new call"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#3D3D3D] text-white placeholder-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1DAA61]"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-neutral-800">
        <div className="grid grid-cols-3 gap-3">
          <button 
            className="flex flex-col items-center gap-2 p-3 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            onClick={() => handleCreateCall('voice')}
          >
            <div className="w-12 h-12 bg-[#3D3D3D] rounded-full flex items-center justify-center">
              <Phone size={20} className="text-[#1DAA61]" />
            </div>
            <span className="text-xs text-gray-300">Voice call</span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-2 p-3 hover:bg-[#3D3D3D] rounded-lg transition-colors"
            onClick={() => handleCreateCall('video')}
          >
            <div className="w-12 h-12 bg-[#3D3D3D] rounded-full flex items-center justify-center">
              <Video size={20} className="text-[#1DAA61]" />
            </div>
            <span className="text-xs text-gray-300">Video call</span>
          </button>
          
          <button 
            className="flex flex-col items-center gap-2 p-3 hover:bg-[#3D3D3D] rounded-lg transition-colors"
          >
            <div className="w-12 h-12 bg-[#3D3D3D] rounded-full flex items-center justify-center">
              <Link2 size={20} className="text-[#1DAA61]" />
            </div>
            <span className="text-xs text-gray-300">Create call link</span>
          </button>
        </div>
      </div>

      {/* Recent Calls */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recent</h3>
        </div>
        
                  {filteredCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-[#3D3D3D] rounded-full flex items-center justify-center mb-4">
                <Phone size={24} className="text-gray-400" />
              </div>
              <h4 className="text-white font-medium mb-2">No recent calls</h4>
              <p className="text-[#8696a0] text-sm">Your call history will appear here</p>
            </div>
        ) : (
          <div className="space-y-1">
            {filteredCalls.map((call) => (
                              <div 
                  key={call.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#3D3D3D] cursor-pointer transition-colors"
                  onClick={() => handleCallAction(call)}
                >
                {/* User Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative">
                    <img 
                      src={call.avatar} 
                      alt={call.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* Call Type Indicator */}
                    <div className="absolute -bottom-1 -right-1 bg-[#111B21] rounded-full p-0.5">
                      {getCallIcon(call)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-medium text-sm truncate">
                        {call.name}
                      </h4>
                      {call.isVideo && (
                        <Video size={12} className="text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${getCallStatusColor(call)}`}>
                        {getCallStatusText(call)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{call.time}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button 
                    className="p-2 hover:bg-[#4D4D4D] rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateCall(call.isVideo ? 'video' : 'voice', call.id);
                    }}
                    aria-label={`Call ${call.name}`}
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
                      handleCreateCall('video', call.id);
                    }}
                    aria-label={`Video call ${call.name}`}
                  >
                    <Video size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <MdKeyboard size={16} />
            <span className="text-sm">Keypad</span>
          </button>
          
          <button className="flex items-center gap-2 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
