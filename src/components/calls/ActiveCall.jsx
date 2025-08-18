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
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo?.(!isVideoEnabled);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    onToggleSpeaker?.(!isSpeakerOn);
  };

  const handleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0e11]">
      {/* Call Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-[#2C2C2C]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Phone size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">
              {callData?.isVideo ? 'Video call' : 'Voice call'}
            </h3>
            <p className="text-gray-400 text-xs">{formatDuration(callDuration)}</p>
          </div>
        </div>
        <button 
          className="p-2 hover:bg-[#2A2F32] rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Video Area */}
      {callData?.isVideo && (
        <div className="flex-1 relative bg-black">
          {/* Main Video */}
          <div className="absolute inset-0">
            <img 
              src={callData?.participant?.avatar || '/default-avatar.jpg'} 
              alt="Participant"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Self Video (Picture in Picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            <img 
              src="/self-avatar.jpg" 
              alt="You"
              className="w-full h-full object-cover"
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <CameraOff size={24} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Call Info Overlay */}
          <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2">
            <h4 className="text-white font-medium text-sm">{callData?.participant?.name}</h4>
            <p className="text-gray-300 text-xs">{formatDuration(callDuration)}</p>
          </div>

          {/* Screen Share Indicator */}
          {isScreenSharing && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <ScreenShare size={16} className="text-green-500" />
                <span className="text-white text-sm">Screen sharing</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice Call Interface */}
      {!callData?.isVideo && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[#202C33] rounded-full flex items-center justify-center mx-auto mb-4">
              <img 
                src={callData?.participant?.avatar || '/default-avatar.jpg'} 
                alt={callData?.participant?.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
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
      <div className="px-4 py-6 bg-[#2C2C2C] border-t border-neutral-800">
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Mute Button */}
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} className="text-white" /> : <Mic size={20} className="text-white" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={handleToggleSpeaker}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isSpeakerOn ? 'bg-[#1DAA61] hover:bg-[#1DAA61]/80' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
            }`}
            aria-label={isSpeakerOn ? 'Turn off speaker' : 'Turn on speaker'}
          >
            {isSpeakerOn ? <Volume2 size={20} className="text-white" /> : <VolumeX size={20} className="text-white" />}
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
              {isVideoEnabled ? <Camera size={20} className="text-white" /> : <CameraOff size={20} className="text-white" />}
            </button>
          )}

          {/* Screen Share (for video calls) */}
          {callData?.isVideo && (
            <button
              onClick={handleScreenShare}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isScreenSharing ? 'bg-[#1DAA61] hover:bg-[#1DAA61]/80' : 'bg-[#3D3D3D] hover:bg-[#4D4D4D]'
              }`}
              aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
            >
              <ScreenShare size={20} className="text-white" />
            </button>
          )}

          {/* Flip Camera (for video calls) */}
          {callData?.isVideo && (
            <button
              className="w-12 h-12 bg-[#2A2F32] hover:bg-[#3A3F42] rounded-full flex items-center justify-center transition-colors"
              aria-label="Flip camera"
            >
              <MdFlipCameraIos size={20} className="text-white" />
            </button>
          )}

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            aria-label="End call"
          >
            <PhoneOff size={20} className="text-white" />
          </button>
        </div>

        {/* Additional Controls */}
        <div className="flex items-center justify-center gap-6">
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <MessageSquare size={16} />
            <span className="text-xs">Message</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <Users size={16} />
            <span className="text-xs">Add participant</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#8696a0] hover:text-[#e9edef] transition-colors">
            <Settings size={16} />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
