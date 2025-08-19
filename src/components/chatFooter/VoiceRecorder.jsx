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
    <>
      {isRecording && !audioBlob && (
        // Barre d'enregistrement rouge style WhatsApp
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-3 flex items-center justify-between animate-[slideUp_0.2s_ease-out] z-50">
          {/* Bouton Supprimer */}
          <button
            onClick={handleCancelRecording}
            className="p-2 hover:bg-red-600 rounded-full transition-colors"
          >
            <Trash2 size={20} className="text-white" />
          </button>
          
          {/* Indicateur d'enregistrement et timer */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-mono text-lg font-medium">
              {formatTime(recordingTime)}
            </span>
          </div>
          
          {/* Bouton Pause/Arrêt et Envoyer */}
          <div className="flex items-center gap-2">
            <button
              onClick={stopRecording}
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
            >
              <Square size={20} className="text-white" />
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}
      
      {audioBlob && (
        // Modal d'aperçu audio
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3C4043] rounded-2xl shadow-2xl w-full max-w-sm animate-[slideUp_0.2s_ease-out]">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#00a884] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic size={24} className="text-white" />
                </div>
                
                {audioUrl && (
                  <audio 
                    controls 
                    className="w-full mb-4 rounded-lg"
                    src={audioUrl}
                  >
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                )}
                
                <p className="text-white text-sm mb-6">
                  Durée: {formatTime(recordingTime)}
                </p>
                
                {/* Contrôles d'envoi */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleCancelRecording}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  
                  <button
                    onClick={handleSendRecording}
                    className="px-6 py-2 bg-[#00a884] hover:bg-[#00a884]/80 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send size={16} />
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
