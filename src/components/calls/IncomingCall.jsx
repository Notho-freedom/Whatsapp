'use client';

import { useState, useEffect } from 'react';
import { Phone, Video, PhoneOff, MessageSquare, Volume2, VolumeX } from "lucide-react";

export default function IncomingCall({ callData, onAccept, onDecline, onMessage }) {
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-control-changed', { 
      detail: { 
        action: 'speaker', 
        value: !isSpeakerOn,
        callId: callData?.id 
      } 
    }));
  };

  const handleAcceptCall = () => {
    onAccept?.(callData);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-accepted', { 
      detail: { 
        callData,
        timestamp: new Date()
      } 
    }));
  };

  const handleDeclineCall = () => {
    onDecline?.(callData);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-declined', { 
      detail: { 
        callData,
        timestamp: new Date()
      } 
    }));
  };

  const handleMessage = () => {
    onMessage?.(callData);
    
    // Ouvrir le chat avec l'appelant
    window.dispatchEvent(new CustomEvent('open-chat', { 
      detail: { 
        userId: callData?.participant?.id,
        action: 'reply-to-call'
      } 
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#2C2C2C] rounded-tl-xl">
             {/* Call Header */}
       <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800">
         <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
             <Phone size={12} className="text-white" />
           </div>
           <div>
             <h3 className="text-white font-medium text-xs">
               {callData?.isVideo ? 'Incoming video call' : 'Incoming call'}
             </h3>
             <p className="text-gray-400 text-[10px]">{formatDuration(callDuration)}</p>
           </div>
         </div>
       </div>

             {/* Main Content */}
       <div className="flex-1 flex flex-col items-center justify-center p-6">
         <div className="text-center mb-6">
           {/* Avatar */}
           <div className="w-24 h-24 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-4 relative">
             <img 
               src={callData?.participant?.avatar || '/default-avatar.jpg'} 
               alt={callData?.participant?.name}
               className="w-20 h-20 rounded-full object-cover"
             />
             {/* Call Type Indicator */}
             <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
               {callData?.isVideo ? (
                 <Video size={12} className="text-white" />
               ) : (
                 <Phone size={12} className="text-white" />
               )}
             </div>
           </div>

                     {/* Caller Info */}
           <h2 className="text-xl font-semibold text-white mb-1.5">
             {callData?.participant?.name}
           </h2>
           <p className="text-gray-400 text-sm mb-1">
             {callData?.participant?.phone}
           </p>
           <p className="text-gray-500 text-xs">
             {callData?.isVideo ? 'Incoming video call' : 'Incoming call'}
           </p>
         </div>

                 {/* Call Controls */}
         <div className="flex items-center justify-center gap-4 mb-6">
           {/* Speaker Toggle */}
           <button
             onClick={handleToggleSpeaker}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
               isSpeakerOn ? 'bg-[#1DAA61] hover:bg-[#1DAA61]/80' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
             }`}
             aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
           >
             {isSpeakerOn ? <Volume2 size={16} className="text-white" /> : <VolumeX size={16} className="text-white" />}
           </button>

                     {/* Message Button */}
           <button
             onClick={handleMessage}
             className="w-10 h-10 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-full flex items-center justify-center transition-colors"
             aria-label="Reply with message"
           >
             <MessageSquare size={16} className="text-white" />
           </button>
         </div>

                 {/* Accept/Decline Buttons */}
         <div className="flex items-center justify-center gap-6">
           {/* Decline Button */}
           <button
             onClick={handleDeclineCall}
             className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
             aria-label="Decline call"
           >
             <PhoneOff size={20} className="text-white" />
           </button>

                     {/* Accept Button */}
           <button
             onClick={handleAcceptCall}
             className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
             aria-label="Accept call"
           >
             {callData?.isVideo ? (
               <Video size={20} className="text-white" />
             ) : (
               <Phone size={20} className="text-white" />
             )}
           </button>
         </div>

                 {/* Call Actions */}
         <div className="mt-6 flex items-center justify-center gap-4">
           <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
             <span className="text-[10px]">Decline</span>
           </button>
           
           <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
             <span className="text-[10px]">Reply</span>
           </button>
           
           <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
             <span className="text-[10px]">Accept</span>
           </button>
         </div>
       </div>

             {/* Call Info Footer */}
       <div className="px-3 py-2 border-t border-neutral-800 bg-[#2C2C2C]">
         <div className="text-center">
           <p className="text-[#8696a0] text-[10px]">
             Swipe up to answer, down to decline
           </p>
         </div>
       </div>
    </div>
  );
}
