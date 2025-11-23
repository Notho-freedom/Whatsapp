"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, Image, X, RotateCcw } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';

const CameraCapture = ({ isOpen, onClose, conversationId, userId }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mode, setMode] = useState('photo'); // 'photo' ou 'video'
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  const { capturePhoto: savePhoto, recordVideo } = useAttachments(conversationId, userId);

  useEffect(() => {
    if (isOpen && !isCameraActive) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: mode === 'video'
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      setError('Impossible d\'accéder à la caméra');
      console.error('Erreur caméra:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takePhoto = async () => {
    if (!videoRef.current || !isCameraActive) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      setCapturedImage(URL.createObjectURL(blob));
      setIsCameraActive(false);
    }, 'image/jpeg');
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      setCapturedImage(URL.createObjectURL(blob));
      setIsRecording(false);
      setIsCameraActive(false);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSave = async () => {
    if (!capturedImage) return;

    try {
      if (mode === 'photo') {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        await savePhoto(blob, { source: 'camera' });
      } else {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        await recordVideo(blob, { source: 'camera' });
      }
      
      onClose();
      setCapturedImage(null);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'photo' ? 'Capture Photo' : 'Enregistrement Vidéo'}
          </h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Sélecteur de mode */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setMode('photo')}
            className={`px-4 py-2 rounded ${
              mode === 'photo' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Image size={16} className="inline mr-2" />
            Photo
          </button>
          <button
            onClick={() => setMode('video')}
            className={`px-4 py-2 rounded ${
              mode === 'video' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Video size={16} className="inline mr-2" />
            Vidéo
          </button>
        </div>

        {/* Vue caméra */}
        {!capturedImage && isCameraActive && (
          <div className="relative mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-gray-900 rounded"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              {mode === 'photo' ? (
                <button
                  onClick={takePhoto}
                  className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-100"
                >
                  <Camera size={24} className="text-gray-800" />
                </button>
              ) : (
                <>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="bg-red-500 p-3 rounded-full shadow-lg hover:bg-red-600"
                    >
                      <Video size={24} className="text-white" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="bg-gray-500 p-3 rounded-full shadow-lg hover:bg-gray-600"
                    >
                      <div className="w-6 h-6 bg-white rounded" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Image/Video capturée */}
        {capturedImage && (
          <div className="mb-4">
            <div className="relative">
              {mode === 'photo' ? (
                <img
                  src={capturedImage}
                  alt="Photo capturée"
                  className="w-full h-64 object-cover rounded"
                />
              ) : (
                <video
                  src={capturedImage}
                  controls
                  className="w-full h-64 rounded"
                />
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
              >
                <RotateCcw size={16} className="mr-2" />
                Reprendre
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sauvegarder
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
