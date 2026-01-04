'use client';

import React, { useRef } from 'react';
import { Music } from 'lucide-react';

const AudioPicker = ({ onAudioSelect, isOpen, onClose }) => {
  const fileInputRef = useRef(null);

  const getAudioDuration = file => {
    return new Promise(resolve => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);

      audio.addEventListener('loadedmetadata', () => {
        const seconds = Math.round(audio.duration);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const duration = `${minutes}:${String(secs).padStart(2, '0')}`;
        URL.revokeObjectURL(objectUrl);
        resolve(duration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        resolve('0:00');
      });

      audio.src = objectUrl;
    });
  };

  const formatFileSize = bytes => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleFileSelect = async e => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = async event => {
          const duration = await getAudioDuration(file);
          const size = formatFileSize(file.size);
          const timestamp = new Date().toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          });

          // Générer une forme d'onde simulée
          const waveform = Array.from(
            { length: 35 },
            () => Math.random() * 0.7 + 0.3
          );

          onAudioSelect({
            url: event.target.result,
            duration: duration,
            size: size,
            timestamp: timestamp,
            waveform: waveform,
            quality: '128 kbps',
          });
        };
        reader.readAsDataURL(file);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div
        onClick={handleClick}
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '2px dashed rgba(6,207,156,0.5)',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
          e.currentTarget.style.borderColor = 'rgba(6,207,156,0.8)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(6,207,156,0.5)';
        }}
      >
        <Music size={32} style={{ color: 'var(--wa-highlight)' }} />
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: '0 0 4px 0',
              fontWeight: '600',
              color: 'var(--wa-primary-strong)',
            }}
          >
            Ajouter des fichiers audio
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Cliquez ou glissez-déposez
          </p>
        </div>
      </div>
    </>
  );
};

export default AudioPicker;
