import { useState, useEffect } from 'react';
import ActiveCall from './ActiveCall';
import IncomingCall from './IncomingCall';
import OutgoingCall from './OutgoingCall';
import CallWaiting from './CallWaiting';

export default function CallManager({ callData, onEndCall, onAcceptCall, onDeclineCall }) {
  const [callState, setCallState] = useState('incoming'); // incoming, outgoing, active, waiting
  const [callInfo, setCallInfo] = useState(callData);

  useEffect(() => {
    if (callData) {
      setCallInfo(callData);
      setCallState(callData.state || 'incoming');
    }
  }, [callData]);

  const handleAcceptCall = (data) => {
    setCallState('active');
    onAcceptCall?.(data);
  };

  const handleDeclineCall = (data) => {
    setCallState(null);
    onDeclineCall?.(data);
  };

  const handleEndCall = (data) => {
    setCallState(null);
    onEndCall?.(data);
  };

  const handleCancelCall = (data) => {
    setCallState(null);
    onEndCall?.(data);
  };

  const handleToggleMute = (isMuted) => {
    console.log('Toggle mute:', isMuted);
  };

  const handleToggleVideo = (isVideoEnabled) => {
    console.log('Toggle video:', isVideoEnabled);
  };

  const handleToggleSpeaker = (isSpeakerOn) => {
    console.log('Toggle speaker:', isSpeakerOn);
  };

  const handleAddParticipant = (data) => {
    console.log('Add participant to call:', data);
  };

  const handleMessage = (data) => {
    console.log('Send message to:', data);
  };

  // Si pas d'appel actif, ne rien afficher
  if (!callState || !callInfo) {
    return null;
  }

  // Rendu conditionnel selon l'état de l'appel
  switch (callState) {
    case 'incoming':
      return (
        <IncomingCall
          callData={callInfo}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
          onMessage={handleMessage}
        />
      );

    case 'outgoing':
      return (
        <OutgoingCall
          callData={callInfo}
          onCancel={handleCancelCall}
          onToggleSpeaker={handleToggleSpeaker}
        />
      );

    case 'active':
      return (
        <ActiveCall
          callData={callInfo}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleSpeaker={handleToggleSpeaker}
        />
      );

    case 'waiting':
      return (
        <CallWaiting
          callData={callInfo}
          onEndCall={handleEndCall}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleSpeaker={handleToggleSpeaker}
          onAddParticipant={handleAddParticipant}
        />
      );

    default:
      return null;
  }
}
