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
     if (call.type === 'incoming') return 'text-[#1DAA61]';
     return 'text-blue-500';
   };

  const handleCreateCall = (type, userId = null) => {
    console.log(`Creating ${type} call${userId ? ` with ${userId}` : ''}`);
    
    // Simuler la création d'un appel
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        // Créer un appel sortant
        const callData = {
          id: Date.now(),
          type: type,
          isVideo: type === 'video',
          state: 'outgoing',
          participant: user,
          participants: [user],
          startTime: new Date()
        };
        
        // Émettre un événement personnalisé pour notifier l'application
        window.dispatchEvent(new CustomEvent('create-call', { 
          detail: callData 
        }));
      }
    } else {
      // Appel sans utilisateur spécifique - ouvrir l'écran de création d'appel
      window.dispatchEvent(new CustomEvent('open-call-screen', { 
        detail: { type } 
      }));
    }
  };

  const handleCallAction = (call) => {
    const callType = call.isVideo ? 'video' : 'voice';
    handleCreateCall(callType, call.id);
  };

  const handleCallHistory = (call) => {
    // Ouvrir le chat avec cet utilisateur
    window.dispatchEvent(new CustomEvent('open-chat', { 
      detail: { userId: call.id } 
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0e11]">
      {/* Header */}
       <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-[#2C2C2C]">
         <div className="flex items-center gap-2">
           <h2 className="text-base font-semibold text-white">Calls</h2>
           <div className="flex items-center gap-1">
             <Phone size={14} className="text-gray-400" />
             <span className="text-[10px] text-gray-400">({recentCalls.length})</span>
           </div>
         </div>
         <div className="flex items-center gap-1.5">
           <button 
             className="p-1.5 hover:bg-[#3D3D3D] rounded transition-colors"
             onClick={() => handleCreateCall('voice')}
             aria-label="New voice call"
           >
             <PhoneCall size={16} className="text-gray-400" />
           </button>
           <button 
             className="p-1.5 hover:bg-[#3D3D3D] rounded transition-colors"
             onClick={() => handleCreateCall('video')}
             aria-label="New video call"
           >
             <MdVideocam size={16} className="text-gray-400" />
           </button>
           <button 
             className="p-1.5 hover:bg-[#3D3D3D] rounded transition-colors"
             aria-label="More options"
           >
             <MoreVertical size={16} className="text-gray-400" />
           </button>
         </div>
      </div>

             {/* Search Bar */}
       <div className="px-3 py-2 border-b border-neutral-800">
         <div className="relative">
           <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start a new call"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-[#3D3D3D] text-white placeholder-gray-200 rounded pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#1DAA61]"
          />
        </div>
      </div>

                           {/* Favorites Section */}
        <div className="px-3 py-2 border-b border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-400">Favorites</h3>
            <button 
              className="text-[10px] text-[#1DAA61] hover:text-[#1DAA61]/80 transition-colors"
              onClick={() => {
                // Ouvrir plus de favoris
                window.dispatchEvent(new CustomEvent('open-favorites', { 
                  detail: { action: 'show-all' } 
                }));
              }}
            >
              More
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {users.slice(0, 3).map((user) => (
              <button
                key={user.id}
                className="flex flex-col items-center gap-1.5 min-w-[70px] p-2 hover:bg-[#3D3D3D] rounded transition-colors"
                onClick={() => handleCreateCall('voice', user.id)}
              >
                <div className="relative">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#1DAA61] rounded-full flex items-center justify-center">
                    <Phone size={8} className="text-white" />
                  </div>
                </div>
                <span className="text-[10px] text-white truncate w-full text-center">{user.name}</span>
              </button>
            ))}
          </div>
        </div>

               {/* Quick Actions */}
        <div className="px-3 py-2 border-b border-neutral-800">
         <div className="grid grid-cols-3 gap-2">
           <button 
             className="flex flex-col items-center gap-1.5 p-2 hover:bg-[#3D3D3D] rounded transition-colors"
             onClick={() => handleCreateCall('voice')}
           >
             <div className="w-10 h-10 bg-[#3D3D3D] rounded-full flex items-center justify-center">
               <Phone size={16} className="text-[#1DAA61]" />
             </div>
             <span className="text-[10px] text-gray-300">Voice call</span>
           </button>
           
           <button 
             className="flex flex-col items-center gap-1.5 p-2 hover:bg-[#3D3D3D] rounded transition-colors"
             onClick={() => handleCreateCall('video')}
           >
             <div className="w-10 h-10 bg-[#3D3D3D] rounded-full flex items-center justify-center">
               <Video size={16} className="text-[#1DAA61]" />
             </div>
             <span className="text-[10px] text-gray-300">Video call</span>
           </button>
           
           <button 
             className="flex flex-col items-center gap-1.5 p-2 hover:bg-[#3D3D3D] rounded transition-colors"
             onClick={() => {
               // Créer un lien d'appel
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
             }}
           >
             <div className="w-10 h-10 bg-[#3D3D3D] rounded-full flex items-center justify-center">
               <Link2 size={16} className="text-[#1DAA61]" />
             </div>
             <span className="text-[10px] text-gray-300">Create call link</span>
           </button>
         </div>
      </div>

             {/* Recent Calls */}
      <div className="flex-1 overflow-y-auto">
         <div className="px-3 py-1.5">
           <h3 className="text-xs font-medium text-gray-400 mb-1.5">Recent</h3>
         </div>
        
                                     {filteredCalls.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-6 text-center">
               <div className="w-12 h-12 bg-[#3D3D3D] rounded-full flex items-center justify-center mb-3">
                 <Phone size={18} className="text-gray-400" />
               </div>
               <h4 className="text-white font-medium mb-1.5 text-sm">No recent calls</h4>
               <p className="text-[#8696a0] text-xs">Your call history will appear here</p>
             </div>
         ) : (
           <div className="space-y-0.5">
             {filteredCalls.map((call) => (
                               <div 
                   key={call.id}
                   className="flex items-center justify-between px-3 py-2 hover:bg-[#3D3D3D] cursor-pointer transition-colors"
                   onClick={() => handleCallHistory(call)}
                 >
                 {/* User Info */}
                 <div className="flex items-center gap-2 flex-1 min-w-0">
                   <div className="relative">
                     <img 
                       src={call.avatar} 
                       alt={call.name}
                       className="w-10 h-10 rounded-full object-cover"
                     />
                     {/* Call Type Indicator */}
                     <div className="absolute -bottom-0.5 -right-0.5 bg-[#0b0e11] rounded-full p-0.5">
                       {getCallIcon(call)}
                     </div>
                   </div>
                  
                                     <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-1.5">
                       <h4 className="text-white font-medium text-xs truncate">
                         {call.name}
                       </h4>
                       {call.isVideo && (
                         <Video size={10} className="text-gray-400 flex-shrink-0" />
                       )}
                     </div>
                     <div className="flex items-center gap-1.5 mt-0.5">
                       <span className={`text-[10px] ${getCallStatusColor(call)}`}>
                         {getCallStatusText(call)}
                  </span>
                       <span className="text-gray-400">•</span>
                       <span className="text-[10px] text-gray-400">{call.time}</span>
                     </div>
                   </div>
                </div>

                                 {/* Action Buttons */}
                 <div className="flex items-center gap-1">
                   <button 
                     className="p-1.5 hover:bg-[#4D4D4D] rounded-full transition-colors"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleCreateCall(call.isVideo ? 'video' : 'voice', call.id);
                     }}
                     aria-label={`Call ${call.name}`}
                   >
                     {call.isVideo ? (
                       <Video size={14} className="text-[#1DAA61]" />
                     ) : (
                       <Phone size={14} className="text-[#1DAA61]" />
                     )}
                   </button>
                   
                   <button 
                     className="p-1.5 hover:bg-[#4D4D4D] rounded-full transition-colors"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleCreateCall('video', call.id);
                     }}
                     aria-label={`Video call ${call.name}`}
                   >
                     <Video size={14} className="text-gray-400" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

             {/* Footer Actions */}
       <div className="px-3 py-2 border-t border-neutral-800 bg-[#2C2C2C]">
         <div className="flex items-center justify-between">
           <button 
             className="flex items-center gap-1.5 text-[#8696a0] hover:text-[#e9edef] transition-colors"
             onClick={() => {
               // Ouvrir le pavé numérique
               window.dispatchEvent(new CustomEvent('open-keypad', { 
                 detail: { action: 'dial' } 
               }));
             }}
           >
             <MdKeyboard size={14} />
             <span className="text-xs">Keypad</span>
           </button>
           
           <button 
             className="flex items-center gap-1.5 text-[#8696a0] hover:text-[#e9edef] transition-colors"
             onClick={() => {
               // Ouvrir les paramètres d'appel
               window.dispatchEvent(new CustomEvent('open-call-settings', { 
                 detail: { action: 'open' } 
               }));
             }}
           >
             <Settings size={14} />
             <span className="text-xs">Settings</span>
           </button>
         </div>
       </div>
      </div>
  );
}
