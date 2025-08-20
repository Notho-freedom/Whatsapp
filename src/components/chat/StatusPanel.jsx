'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function StatusPanel({ onStatusSelect, selectedStatus }) {
  const { users } = useAppContext();
  
  // Générer des vrais statuts pour les utilisateurs
  const generateRealStatuses = () => {
    if (!users || users.length === 0) return [];
    
    // Prendre les 9 premiers utilisateurs pour les statuts
    const statusUsers = users.slice(0, 9);
    
    // Vrais types de statuts avec contenu réel
    const realStatusTypes = [
      {
        type: 'image',
        content: 'Photo de vacances à la plage',
        preview: '🏖️',
        time: 'Just now'
      },
      {
        type: 'video',
        content: 'Vidéo de mon chat qui dort',
        preview: '🐱',
        time: 'Today, 2:28 PM'
      },
      {
        type: 'text',
        content: 'Super journée aujourd\'hui ! ☀️',
        preview: '☀️',
        time: '8 minutes ago'
      },
      {
        type: 'image',
        content: 'Nouveau restaurant testé hier soir',
        preview: '🍽️',
        time: 'Today, 1:15 PM'
      },
      {
        type: 'audio',
        content: 'Message vocal - 0:23',
        preview: '🎵',
        time: 'Today, 12:30 PM'
      },
      {
        type: 'text',
        content: 'En route pour le travail 🚗',
        preview: '🚗',
        time: 'Today, 11:45 AM'
      },
      {
        type: 'image',
        content: 'Mon nouveau bureau installé',
        preview: '💻',
        time: 'Today, 10:20 AM'
      },
      {
        type: 'text',
        content: 'Bon matin tout le monde ! 🌅',
        preview: '🌅',
        time: 'Today, 9:15 AM'
      },
      {
        type: 'video',
        content: 'Tutoriel de cuisine - 2:15',
        preview: '👨‍🍳',
        time: 'Today, 8:30 AM'
      }
    ];
    
    return statusUsers.map((user, index) => {
      const statusData = realStatusTypes[index] || realStatusTypes[0];
      
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        time: statusData.time,
        hasUnreadStatus: Math.random() > 0.3, // 70% de chance d'avoir un statut non consulté
        statusType: statusData.type,
        statusContent: statusData.content,
        statusPreview: statusData.preview,
        // Informations supplémentaires pour l'intégration
        statusId: `status_${user.id}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expire dans 24h
        isPublic: Math.random() > 0.5,
        viewCount: Math.floor(Math.random() * 50) + 1,
        reactions: generateRandomReactions()
      };
    });
  };

  // Générer des réactions aléatoires pour les statuts
  const generateRandomReactions = () => {
    const possibleReactions = ['👍', '❤️', '😊', '😮', '😢', '🙏', '😂', '😍', '🤔', '👏'];
    const count = Math.floor(Math.random() * 4) + 1;
    const reactions = {};
    
    for (let i = 0; i < count; i++) {
      const reaction = possibleReactions[Math.floor(Math.random() * possibleReactions.length)];
      reactions[reaction] = Math.floor(Math.random() * 10) + 1;
    }
    
    return reactions;
  };

  const statuses = generateRealStatuses();

  const handleStatusClick = (status) => {
    if (onStatusSelect) {
      onStatusSelect(status);
    }
  };

  return (
    <div className="h-full bg-[#2C2C2C] border-r border-neutral-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800">
        <h2 className="text-white font-semibold text-xl font-segoe">
          Status
        </h2>
      </div>

      {/* My status */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              alt="My status"
              className="w-12 h-12 rounded-full"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#1DAA61] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1DAA61]/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">My status</p>
            <p className="text-gray-400 text-sm">Just now</p>
          </div>
        </div>
      </div>

      {/* Recent updates */}
      <div className="p-4 border-b border-neutral-800">
        <h3 className="text-gray-400 text-sm font-medium mb-3">Recent updates</h3>
        <div className="space-y-3">
          {statuses.map((status) => (
            <div
              key={status.id}
              onClick={() => handleStatusClick(status)}
              className={`flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                selectedStatus?.id === status.id ? 'bg-neutral-700/50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={status.avatar}
                  alt={`${status.name} status`}
                  className="w-12 h-12 rounded-full"
                />
                {status.hasUnreadStatus && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1DAA61] rounded-full border-2 border-[#2C2C2C]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{status.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{status.time}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{status.statusPreview}</span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{status.statusType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
