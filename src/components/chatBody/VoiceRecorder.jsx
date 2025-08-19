import { useState, useEffect, useRef } from 'react';
import { Trash2, Pause, Send, Square } from 'lucide-react';

const VoiceRecorder = ({ isRecording, onStop, onSend, onCancel }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (!isRecording) {
      setRecordingTime(0);
      setIsPaused(false);
    }
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };

  const handleSend = () => {
    onSend();
  };

  const handleCancel = () => {
    onCancel();
  };

  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-[#202c33] border-t border-neutral-800">
      {/* Delete/Cancel Button */}
      <button
        onClick={handleCancel}
        className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors"
        aria-label="Cancel recording"
      >
        <Trash2 size={18} className="text-white" />
      </button>

      {/* Recording Indicator */}
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />

      {/* Timer */}
      <span className="text-white text-sm font-medium min-w-[2rem]">
        {formatTime(recordingTime)}
      </span>

      {/* Progress Bar */}
      <div className="flex-1 flex items-center gap-1">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < Math.floor((recordingTime % 20) / 1)
                ? 'bg-white'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Pause/Resume Button */}
      <button
        onClick={handlePauseToggle}
        className="p-2 hover:bg-neutral-700/50 rounded-full transition-colors"
        aria-label={isPaused ? "Resume recording" : "Pause recording"}
      >
        {isPaused ? (
          <Square size={18} className="text-white" />
        ) : (
          <Pause size={18} className="text-white" />
        )}
      </button>

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-[#1DAA61] hover:bg-[#1DAA61]/80 text-white rounded-lg transition-colors flex items-center gap-2"
        aria-label="Send voice message"
      >
        <Send size={16} className="rotate-[45deg]" />
        <span className="text-sm font-medium">Send</span>
      </button>
    </div>
  );
};

export default VoiceRecorder;
