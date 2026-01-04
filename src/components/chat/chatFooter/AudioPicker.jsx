'use client';

import React, { useRef } from 'react';
import { Music, Upload } from 'lucide-react';

const AudioPicker = ({ onAudioSelect, isOpen, onClose }) => {
  const fileInputRef = useRef(null);

  // Extraire la durée du fichier audio
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.round(audio.duration);
        URL.revokeObjectURL(objectUrl);
        resolve(duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      });
      
      audio.src = objectUrl;
    });
  };

  const handleFileSelect = async e => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Vérifier que c'est un fichier audio
      if (file.type.startsWith('audio/')) {
        const reader = new FileReader();
        reader.onload = async event => {
          // Extraire la durée du fichier
          const duration = await getAudioDuration(file);
          
          onAudioSelect({
            name: file.name,
            size: file.size,
            type: file.type,
            url: event.target.result,
            file: file,
            duration: duration, // durée en secondes
          });
        };
        reader.readAsDataURL(file);
      }
    }
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

      {/* Bouton pour ouvrir le sélecteur de fichiers */}
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
