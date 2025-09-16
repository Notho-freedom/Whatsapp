'use client';

import { useState, useEffect } from 'react';
import { Phone, Video, Mic, MicOff, Volume2, VolumeX, MessageSquare, MoreVertical, PhoneOff, Camera, CameraOff, FlipCamera, ScreenShare, Users, Settings } from "lucide-react";
import { MdFlipCameraIos } from 'react-icons/md';

export default function ActiveCall({ callData, onEndCall, onToggleMute, onToggleVideo, onToggleSpeaker }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

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

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute?.(!isMuted);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-control-changed', { 
      detail: { 
        action: 'mute', 
        value: !isMuted,
        callId: callData?.id 
      } 
    }));
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo?.(!isVideoEnabled);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-control-changed', { 
      detail: { 
        action: 'video', 
        value: !isVideoEnabled,
        callId: callData?.id 
      } 
    }));
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    onToggleSpeaker?.(!isSpeakerOn);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-control-changed', { 
      detail: { 
        action: 'speaker', 
        value: !isSpeakerOn,
        callId: callData?.id 
      } 
    }));
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    
    // Émettre un événement pour notifier l'application
    window.dispatchEvent(new CustomEvent('call-control-changed', { 
      detail: { 
        action: 'screen-share', 
        value: !isScreenSharing,
        callId: callData?.id 
      } 
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#2C2C2C] rounded-tl-xl">
             {/* Call Header */}
       <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-800">
         <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
             <Phone size={12} className="text-white" />
           </div>
           <div>
             <h3 className="text-white font-medium text-xs">
               {callData?.isVideo ? 'Video call' : 'Voice call'}
             </h3>
             <p className="text-gray-400 text-[10px]">{formatDuration(callDuration)}</p>
           </div>
         </div>
         <button 
           className="p-1.5 hover:bg-[#3D3D3D] rounded transition-colors"
           aria-label="More options"
         >
           <MoreVertical size={14} className="text-gray-400" />
         </button>
       </div>

      {/* Video Area */}
      {callData?.isVideo && (
        <div className="flex-1 relative bg-black">
          {/* Main Video */}
          <div className="absolute inset-0">
            <img 
              src={callData?.participant?.avatar || '/api/placeholder/400/300'} 
              alt="Participant"
              className="w-full h-full object-cover"
            />
          </div>

                     {/* Self Video (Picture in Picture) */}
           <div className="absolute top-3 right-3 w-24 h-18 bg-gray-800 rounded overflow-hidden border border-white">
             <img 
               src="/api/placeholder/96/72" 
               alt="You"
               className="w-full h-full object-cover"
             />
             {!isVideoEnabled && (
               <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                 <CameraOff size={16} className="text-gray-400" />
               </div>
             )}
           </div>

                     {/* Call Info Overlay */}
           <div className="absolute top-3 left-3 bg-black/50 rounded px-2 py-1.5">
             <h4 className="text-white font-medium text-xs">{callData?.participant?.name}</h4>
             <p className="text-gray-300 text-[10px]">{formatDuration(callDuration)}</p>
           </div>

                     {/* Screen Share Indicator */}
           {isScreenSharing && (
             <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-black/50 rounded px-2 py-1.5">
               <div className="flex items-center gap-1.5">
                 <ScreenShare size={12} className="text-green-500" />
                 <span className="text-white text-xs">Screen sharing</span>
               </div>
             </div>
           )}
        </div>
      )}

             {/* Voice Call Interface */}
       {!callData?.isVideo && (
         <div className="flex-1 flex flex-col items-center justify-center p-6">
           <div className="text-center mb-6">
             <div className="w-20 h-20 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-3">
               <img 
                 src={callData?.participant?.avatar || '/api/placeholder/64/64'} 
                 alt={callData?.participant?.name}
                 className="w-16 h-16 rounded-full object-cover"
               />
             </div>
             <h3 className="text-lg font-semibold text-white mb-1.5">
               {callData?.participant?.name}
             </h3>
             <p className="text-gray-400 text-sm">
               {callData?.isIncoming ? 'Incoming call...' : 'Calling...'}
             </p>
             <p className="text-gray-500 text-xs mt-1">{formatDuration(callDuration)}</p>
           </div>
         </div>
       )}

             {/* Call Controls */}
       <div className="px-3 py-4 bg-[#2C2C2C] border-t border-neutral-800">
         <div className="flex items-center justify-center gap-3 mb-4">
           {/* Mute Button */}
           <button
             onClick={handleToggleMute}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
               isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
             }`}
             aria-label={isMuted ? 'Unmute' : 'Mute'}
           >
             {isMuted ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-white" />}
           </button>

                     {/* Speaker Button */}
           <button
             onClick={handleToggleSpeaker}
             className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
               isSpeakerOn ? 'bg-[#1DAA61] hover:bg-[#1DAA61]/80' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
             }`}
             aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
           >
             {isSpeakerOn ? <Volume2 size={16} className="text-white" /> : <VolumeX size={16} className="text-white" />}
           </button>

                     {/* Video Toggle (for video calls) */}
           {callData?.isVideo && (
             <button
               onClick={handleToggleVideo}
               className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                 !isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
               }`}
               aria-label={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
             >
               {isVideoEnabled ? <Camera size={16} className="text-white" /> : <CameraOff size={16} className="text-white" />}
             </button>
           )}

                     {/* Screen Share (for video calls) */}
           {callData?.isVideo && (
             <button
               onClick={handleScreenShare}
               className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                 isScreenSharing ? 'bg-[#1DAA61] hover:bg-[#1DAA61]/80' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
               }`}
               aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
             >
               <ScreenShare size={16} className="text-white" />
             </button>
           )}

                     {/* Flip Camera (for video calls) */}
           {callData?.isVideo && (
             <button
               className="w-10 h-10 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-full flex items-center justify-center transition-colors"
               aria-label="Flip camera"
             >
               <MdFlipCameraIos size={16} className="text-white" />
             </button>
           )}

                     {/* End Call Button */}
           <button
             onClick={onEndCall}
             className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
             aria-label="End call"
           >
             <PhoneOff size={16} className="text-white" />
           </button>
        </div>

                            {/* Additional Controls */}
           <div className="flex items-center justify-center gap-4">
             <button 
               className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors"
               onClick={() => {
                 // Ouvrir le chat avec le participant
                 window.dispatchEvent(new CustomEvent('open-chat', { 
                   detail: { userId: callData?.participant?.id } 
                 }));
               }}
             >
               <MessageSquare size={14} />
               <span className="text-[10px]">Message</span>
             </button>
             
             <button 
               className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors"
               onClick={() => {
                 // Ouvrir le sélecteur de participants
                 window.dispatchEvent(new CustomEvent('add-participant', { 
                   detail: { callId: callData?.id } 
                 }));
               }}
             >
               <Users size={14} />
               <span className="text-[10px]">Add participant</span>
             </button>
             
             <button 
               className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors"
               onClick={() => {
                 // Ouvrir les paramètres d'appel
                 window.dispatchEvent(new CustomEvent('open-call-settings', { 
                   detail: { callId: callData?.id } 
                 }));
               }}
             >
               <Settings size={14} />
               <span className="text-[10px]">Settings</span>
             </button>
           </div>
      </div>
    </div>
  );
}
