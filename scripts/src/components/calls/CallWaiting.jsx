'use client';

import { useState, useEffect } from 'react';
import { Phone, Video, PhoneOff, Volume2, VolumeX, Clock, UserPlus } from "lucide-react";

export default function CallWaiting({ callData, onEndCall, onToggleMute, onToggleVideo, onToggleSpeaker, onAddParticipant }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState('Waiting for others to join...');

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Simuler les changements de message d'attente
    const messageTimer = setTimeout(() => {
      setWaitingMessage('Still waiting...');
    }, 10000);

    return () => {
      clearInterval(timer);
      clearTimeout(messageTimer);
    };
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute?.(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo?.(!isVideoEnabled);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    onToggleSpeaker?.(!isSpeakerOn);
  };

  const handleEndCall = () => {
    onEndCall?.(callData);
  };

  const handleAddParticipant = () => {
    onAddParticipant?.(callData);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0e11]">
      {/* Call Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <Clock size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">
              {callData?.isVideo ? 'Video call' : 'Voice call'}
            </h3>
            <p className="text-gray-400 text-xs">{formatDuration(callDuration)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8">
          {/* Waiting Icon */}
          <div className="w-32 h-32 bg-[#3D3D3D] rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-center">
              <Clock size={48} className="text-yellow-500 mx-auto mb-2" />
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>

          {/* Call Info */}
          <h2 className="text-2xl font-semibold text-white mb-2">
            {callData?.isVideo ? 'Video call' : 'Voice call'}
          </h2>
          <p className="text-gray-400 text-sm mb-1">
            {callData?.participants?.length || 1} participant(s)
          </p>
          <p className="text-yellow-400 text-sm">
            {waitingMessage}
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
          </button>

          {/* Video Toggle (for video calls) */}
          {callData?.isVideo && (
            <button
              onClick={handleToggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                !isVideoEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
              }`}
              aria-label={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
            >
              {isVideoEnabled ? <Video size={20} className="text-white" /> : <Video size={20} className="text-red-500" />}
            </button>
          )}

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

          {/* Add Participant */}
          <button
            onClick={handleAddParticipant}
            className="w-12 h-12 bg-[#3D3D3D] hover:bg-[#4D4D4D] rounded-full flex items-center justify-center transition-colors"
            aria-label="Add participant"
          >
            <UserPlus size={20} className="text-white" />
          </button>
        </div>

        {/* End Call Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={handleEndCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            aria-label="End call"
          >
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>

        {/* Call Actions */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">Mute</span>
          </button>
          
          {callData?.isVideo && (
            <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
              <span className="text-xs">Video</span>
            </button>
          )}
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">Speaker</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">Add</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <span className="text-xs">End</span>
          </button>
        </div>
      </div>

      {/* Call Info Footer */}
      <div className="px-4 py-3 border-t border-neutral-800 bg-[#2C2C2C]">
        <div className="text-center">
          <p className="text-[#8696a0] text-xs">
            Waiting for others to join the call
          </p>
        </div>
      </div>
    </div>
  );
}
