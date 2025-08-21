'use client';

import { useState, useEffect } from 'react';
import { FaLock, FaWhatsapp, FaPause, FaPlay, FaVolumeUp, FaVolumeMute, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useAppContext } from '@/context/AppContext';

export default function StatusView({ selectedStatus }) {
  const { users, getUserStatuses, markStatusAsViewed } = useAppContext();
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // Trouver l'utilisateur correspondant au statut sélectionné
  const selectedUser = users.find(user => user.id === selectedStatus?.userId);
  
  // Récupérer tous les statuts de l'utilisateur
  const userStatuses = selectedUser ? getUserStatuses(selectedUser.id) : [];
  const currentStatus = userStatuses[currentStatusIndex];

  // Marquer le statut comme vu quand il est sélectionné
  useEffect(() => {
    if (selectedStatus && !selectedStatus.isViewed) {
      markStatusAsViewed(selectedStatus.id);
    }
  }, [selectedStatus, markStatusAsViewed]);

  // Navigation entre les statuts
  const goToNextStatus = () => {
    if (currentStatusIndex < userStatuses.length - 1) {
      setCurrentStatusIndex(currentStatusIndex + 1);
    }
  };

  const goToPrevStatus = () => {
    if (currentStatusIndex > 0) {
      setCurrentStatusIndex(currentStatusIndex - 1);
    }
  };

  // Fonction pour obtenir le fond selon le type de statut
  const getStatusBackground = (status) => {
    switch (status.type) {
      case 'text':
        // Couleurs variées pour les statuts texte
        const textColors = [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
          'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        ];
        const colorIndex = status.id.charCodeAt(status.id.length - 1) % textColors.length;
        return textColors[colorIndex];
      case 'video':
        return '#000000';
      case 'image':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  return (
    <section className="flex-1 relative overflow-hidden">
      {selectedStatus && selectedUser && currentStatus ? (
        // Vue de statut WhatsApp complète
        <div 
          className="absolute inset-0 flex flex-col"
          style={{ background: getStatusBackground(currentStatus) }}
        >
          {/* Header avec info utilisateur et barre de progression */}
          <div className="relative z-20 p-4">
            {/* Barres de progression */}
            <div className="flex gap-1 mb-4">
              {userStatuses.map((_, index) => (
                <div 
                  key={index} 
                  className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
                >
                  <div 
                    className={`h-full bg-white transition-all duration-300 ${
                      index < currentStatusIndex ? 'w-full' : 
                      index === currentStatusIndex ? 'w-1/2' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Info utilisateur */}
            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <p className="text-white font-medium text-sm">{selectedUser.name}</p>
                <p className="text-white/70 text-xs">{currentStatus.time}</p>
              </div>
              
              {/* Contrôles audio/vidéo */}
              {(currentStatus.type === 'video' || currentStatus.type === 'audio') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
                  >
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                  </button>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
                  >
                    {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                  </button>
                </div>
              )}
              
              {/* Menu options */}
              <button className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Contenu principal du statut */}
          <div className="flex-1 flex items-center justify-center relative px-4">
            {/* Navigation gauche */}
            {currentStatusIndex > 0 && (
              <button
                onClick={goToPrevStatus}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
              >
                <FaChevronLeft size={20} />
              </button>
            )}

            {/* Navigation droite */}
            {currentStatusIndex < userStatuses.length - 1 && (
              <button
                onClick={goToNextStatus}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
              >
                <FaChevronRight size={20} />
              </button>
            )}

            {/* Contenu selon le type */}
            {currentStatus.type === 'text' && (
              <div className="text-center max-w-lg mx-auto">
                <p className="text-white text-2xl md:text-3xl font-bold leading-tight">
                  {currentStatus.content}
                </p>
                <div className="mt-4 text-4xl">
                  {currentStatus.preview}
                </div>
              </div>
            )}

            {currentStatus.type === 'image' && (
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
                  alt="Status content"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
                {/* Texte superposé si présent */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-lg font-medium drop-shadow-lg">
                    {currentStatus.content}
                  </p>
                </div>
              </div>
            )}

            {currentStatus.type === 'video' && (
              <div className="relative w-full max-w-sm mx-auto">
                {/* Simuler une vidéo avec une image */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-[9/16]">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop"
                    alt="Video content"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay vidéo */}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Logo TikTok style */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">T</span>
                      </div>
                      <span className="text-sm font-medium">TikTok</span>
                    </div>
                  </div>
                  
                  {/* Texte en bas */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white text-sm font-medium">
                      {currentStatus.content}
                    </p>
                  </div>
                  
                  {/* Bouton play au centre */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        <FaPlay size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStatus.type === 'audio' && (
              <div className="text-center">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaVolumeUp size={40} className="text-white" />
                </div>
                <p className="text-white text-lg font-medium">
                  {currentStatus.content}
                </p>
                <div className="mt-4 w-64 h-1 bg-white/20 rounded-full mx-auto">
                  <div className="w-1/3 h-full bg-white rounded-full" />
                </div>
              </div>
            )}
          </div>

          {/* Footer avec input de réponse */}
          <div className="relative z-20 p-4">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                </svg>
              </button>
              <div className="flex-1 bg-white/10 rounded-full px-4 py-2 text-white placeholder-white/70">
                <input 
                  type="text" 
                  placeholder="Type a message"
                  className="w-full bg-transparent outline-none text-white placeholder-white/70"
                />
              </div>
              <button className="p-2 rounded-full bg-[#1DAA61] text-white hover:bg-[#1DAA61]/80 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Vue par défaut
        <div className="flex-1 bg-whatsapp-chat-bg flex flex-col">
          <div className="absolute inset-0 wa-chat-background pointer-events-none" aria-hidden="true" />
          
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaWhatsapp size={100} className="text-neutral-600" />
              </div>
              <h3 className="text-lg text-white mb-2 font-segoe">
                WhatsApp for Windows
              </h3>
              <p className="text-sm max-w-md text-neutral-400">
                Send and receive messages without keeping your phone online.
                <br />
                Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
              </p>
              
              {users && users.length > 0 && (
                <div className="mt-6 bg-neutral-800/50 rounded-lg p-4 max-w-sm mx-auto">
                  <p className="text-sm text-neutral-300 mb-2">
                    {users.length} contacts disponibles pour les statuts
                  </p>
                  <p className="text-xs text-neutral-400">
                    Cliquez sur un contact dans le panneau gauche pour voir ses statuts
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="pb-12 flex items-center justify-center gap-2 relative z-10">
            <FaLock size={10} className="text-neutral-500" />
            <p className="text-sm text-neutral-500">End-to-end encrypted.</p>
          </div>
        </div>
      )}
    </section>
  );
}
