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
  };

  const handleAcceptCall = () => {
    onAccept?.(callData);
  };

  const handleDeclineCall = () => {
    onDecline?.(callData);
  };

  const handleMessage = () => {
    onMessage?.(callData);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0e11]">
      {/* Call Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <Phone size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">
              {callData?.isVideo ? 'Incoming video call' : 'Incoming call'}
            </h3>
            <p className="text-gray-400 text-xs">{formatDuration(callDuration)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="w-32 h-32 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <img 
              src={callData?.participant?.avatar || '/default-avatar.jpg'} 
              alt={callData?.participant?.name}
              className="w-28 h-28 rounded-full object-cover"
            />
            {/* Call Type Indicator */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              {callData?.isVideo ? (
                <Video size={16} className="text-white" />
              ) : (
                <Phone size={16} className="text-white" />
              )}
            </div>
          </div>

          {/* Caller Info */}
          <h2 className="text-2xl font-semibold text-white mb-2">
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
        <div className="flex items-center justify-center gap-6 mb-8">
          {/* Speaker Toggle */}
          <button
            onClick={handleToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerOn ? 'bg-[#1DAA61] hover:bg-[#1DAA61]/80' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
            }`}
            aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
          >
            {isSpeakerOn ? <Volume2 size={20} className="text-white" /> : <VolumeX size={20} className="text-white" />}
          </button>

          {/* Message Button */}
          <button
            onClick={handleMessage}
            className="w-12 h-12 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-full flex items-center justify-center transition-colors"
            aria-label="Reply with message"
          >
            <MessageSquare size={20} className="text-white" />
          </button>
        </div>

        {/* Accept/Decline Buttons */}
        <div className="flex items-center justify-center gap-8">
          {/* Decline Button */}
          <button
            onClick={handleDeclineCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            aria-label="Decline call"
          >
            <PhoneOff size={24} className="text-white" />
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAcceptCall}
            className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
            aria-label="Accept call"
          >
            {callData?.isVideo ? (
              <Video size={24} className="text-white" />
            ) : (
              <Phone size={24} className="text-white" />
            )}
          </button>
        </div>

        {/* Call Actions */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">Decline</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">Reply</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">Accept</span>
          </button>
        </div>
      </div>

      {/* Call Info Footer */}
      <div className="px-4 py-3 border-t border-neutral-800 bg-[#2C2C2C]">
        <div className="text-center">
          <p className="text-[#8696a0] text-xs">
            Swipe up to answer, down to decline
          </p>
        </div>
      </div>
    </div>
  );
}
