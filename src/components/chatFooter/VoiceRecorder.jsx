import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Trash2, Send, Square } from 'lucide-react';

export default function VoiceRecorder({ isRecording, onStartRecording, onStopRecording, onCancelRecording, onSendRecording }) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      startRecording();
    } else if (!isRecording && mediaRecorderRef.current) {
      stopRecording();
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      
      mediaRecorder.start();
      startTimer();
      
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      onCancelRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    stopTimer();
  };

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendRecording = () => {
    if (audioBlob) {
      onSendRecording(audioBlob);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }
  };

  const handleCancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    onCancelRecording();
  };

  if (!isRecording && !audioBlob) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-[#202c33] rounded-t-lg shadow-2xl w-full max-w-md animate-[slideUp_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-medium">
            {audioBlob ? 'Message vocal' : 'Enregistrement en cours...'}
          </h3>
          <button
            onClick={handleCancelRecording}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

                 {/* Content */}
         <div className="p-6">
           {!audioBlob ? (
             // Enregistrement en cours
             <div className="text-center">
               <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                 <Mic size={24} className="text-white" />
               </div>
               <p className="text-white text-base font-medium mb-2">
                 {formatTime(recordingTime)}
               </p>
               <p className="text-gray-400 text-xs">
                 Relâchez pour envoyer, glissez pour annuler
               </p>
               
               {/* Contrôles d'enregistrement */}
               <div className="flex items-center justify-center gap-3 mt-4">
                 <button
                   onClick={handleCancelRecording}
                   className="p-2 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
                 >
                   <Trash2 size={16} className="text-white" />
                 </button>
                 
                 <button
                   onClick={stopRecording}
                   className="p-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                 >
                   <Square size={20} className="text-white" />
                 </button>
               </div>
             </div>
           ) : (
                         // Aperçu audio
             <div className="text-center">
               <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center mx-auto mb-4">
                 <Mic size={24} className="text-white" />
               </div>
               
               {audioUrl && (
                 <audio 
                   controls 
                   className="w-full mb-3"
                   src={audioUrl}
                 >
                   Votre navigateur ne supporte pas l'élément audio.
                 </audio>
               )}
               
               <p className="text-white text-xs mb-3">
                 Durée: {formatTime(recordingTime)}
               </p>
               
               {/* Contrôles d'envoi */}
               <div className="flex items-center justify-center gap-3">
                 <button
                   onClick={handleCancelRecording}
                   className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                 >
                   Annuler
                 </button>
                 
                 <button
                   onClick={handleSendRecording}
                   className="px-4 py-1.5 bg-[#00a884] hover:bg-[#00a884]/80 text-white rounded-lg transition-colors flex items-center gap-1.5 text-sm"
                 >
                   <Send size={14} />
                   Envoyer
                 </button>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
