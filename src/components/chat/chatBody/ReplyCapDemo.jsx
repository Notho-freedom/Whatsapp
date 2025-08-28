'use client';

import React, { useState } from 'react';
import ReplyCap from './ReplyCap';
import { FaCrown, FaStar } from 'react-icons/fa';
import { Shield } from 'lucide-react';

export default function ReplyCapDemo() {
  const [replyTo, setReplyTo] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: 'user-1',
    name: 'John Doe',
    picture: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=JD'
  });

  const [selectedChat, setSelectedChat] = useState({
    id: 'chat-1',
    name: 'Alice Smith',
    avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS',
    isGroup: false,
    participants: ['user-1', 'chat-1']
  });

  const [users, setUsers] = useState([
    {
      id: 'user-1',
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=JD'
    },
    {
      id: 'chat-1',
      name: 'Alice Smith',
      avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS'
    },
    {
      id: 'admin-1',
      name: 'Admin User',
      avatar: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=AU',
      isAdmin: true,
      isVerified: true
    },
    {
      id: 'premium-1',
      name: 'Premium User',
      avatar: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=PU',
      isPremium: true
    }
  ]);

  const demoMessages = [
    {
      id: 'msg-1',
      text: 'Salut ! Comment ça va ?',
      sender: 'chat-1',
      senderName: 'Alice Smith',
      senderAvatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
      type: 'text'
    },
    {
      id: 'msg-2',
      text: 'Très bien, merci ! Et toi ?',
      sender: 'me',
      senderName: 'John Doe',
      senderAvatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=JD',
      timestamp: new Date(Date.now() - 3 * 60000).toISOString(), // 3 min ago
      type: 'text'
    },
    {
      id: 'msg-3',
      text: 'Parfait ! Voici une image que j\'ai trouvée',
      sender: 'chat-1',
      senderName: 'Alice Smith',
      senderAvatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(), // 2 min ago
      type: 'text',
      media: [
        {
          type: 'image',
          url: 'https://via.placeholder.com/200x150/10B981/FFFFFF?text=Image'
        }
      ]
    },
    {
      id: 'msg-4',
      text: 'Message audio important',
      sender: 'admin-1',
      senderName: 'Admin User',
      senderAvatar: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=AU',
      timestamp: new Date(Date.now() - 1 * 60000).toISOString(), // 1 min ago
      type: 'audio',
      media: [
        {
          type: 'audio',
          url: 'audio.mp3'
        }
      ],
      isAdmin: true,
      isVerified: true,
      pinned: true
    },
    {
      id: 'msg-5',
      text: 'Document partagé',
      sender: 'premium-1',
      senderName: 'Premium User',
      senderAvatar: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=PU',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(), // 30 min ago
      type: 'document',
      media: [
        {
          type: 'document',
          url: 'document.pdf'
        }
      ],
      isPremium: true,
      reactions: ['👍', '❤️', '👏'],
      replyCount: 3,
      forwardCount: 1
    },
    {
      id: 'msg-6',
      text: 'Lien intéressant',
      sender: 'chat-1',
      senderName: 'Alice Smith',
      senderAvatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS',
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(), // 45 min ago
      type: 'text',
      link: {
        url: 'https://example.com',
        title: 'Example Website',
        thumbnail: 'https://via.placeholder.com/200x150/3B82F6/FFFFFF?text=Link'
      }
    },
    {
      id: 'msg-7',
      text: 'Appel manqué',
      sender: 'admin-1',
      senderName: 'Admin User',
      senderAvatar: 'https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=AU',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
      type: 'call',
      isAdmin: true,
      isVerified: true
    }
  ];

  const handleReplyToMessage = (message) => {
    console.log('Définir la réponse à:', message);
    setReplyTo(message);
  };

  const handleCancelReply = () => {
    console.log('Annuler la réponse');
    setReplyTo(null);
  };

  const getMessageTypeLabel = (message) => {
    if (message.media?.length > 0) return `📎 ${message.media[0].type}`;
    if (message.link) return '🔗 Lien';
    if (message.type === 'call') return '📞 Appel';
    return '💬 Texte';
  };

  const getSenderBadges = (message) => {
    const badges = [];
    if (message.isAdmin) badges.push('👑 Admin');
    if (message.isVerified) badges.push('✅ Vérifié');
    if (message.isPremium) badges.push('⭐ Premium');
    if (message.pinned) badges.push('📌 Épinglé');
    return badges;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">
          🧪 Démonstration ReplyCap Personnalisé
        </h1>
        <p className="text-gray-300">
          Testez le composant ReplyCap avec différentes personnalisations selon le message et son propriétaire
        </p>
      </div>

      {/* ReplyCap - apparaît quand on répond */}
      {replyTo && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">
            📝 Réponse en cours
          </h2>
          <ReplyCap
            replyTo={replyTo}
            onCancelReply={handleCancelReply}
            currentUser={currentUser}
            selectedChat={selectedChat}
            users={users}
          />
        </div>
      )}

      {/* Messages de démonstration */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white mb-2">
          💬 Messages de démonstration
        </h2>
        
        {demoMessages.map((message) => (
          <div
            key={message.id}
            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => handleReplyToMessage(message)}
          >
            <div className="flex items-center gap-3 mb-2">
              {message.senderAvatar && (
                <img
                  src={message.senderAvatar}
                  alt={message.senderName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white">
                    {message.senderName}
                  </h3>
                  {getSenderBadges(message).map((badge, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-600 text-gray-200 rounded-full">
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{message.sender === 'me' ? 'Vous' : 'Contact'}</span>
                  <span>•</span>
                  <span>{getMessageTypeLabel(message)}</span>
                  <span>•</span>
                  <span>{new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 mb-2">{message.text}</p>
            
            {message.media && message.media.length > 0 && (
              <div className="text-sm text-blue-400 mb-2">
                📎 {message.media[0].type}: {message.media[0].url}
              </div>
            )}
            
            {message.link && (
              <div className="text-sm text-blue-400 mb-2">
                🔗 {message.link.title}: {message.link.url}
              </div>
            )}
            
            {/* Statistiques du message */}
            {(message.reactions?.length > 0 || message.replyCount > 0 || message.forwardCount > 0) && (
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                {message.reactions?.length > 0 && (
                  <span>👍 {message.reactions.length} réactions</span>
                )}
                {message.replyCount > 0 && (
                  <span>💬 {message.replyCount} réponses</span>
                )}
                {message.forwardCount > 0 && (
                  <span>↗️ {message.forwardCount} partages</span>
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-2">
              Cliquez pour répondre à ce message
            </div>
          </div>
        ))}
      </div>

      {/* Informations de débogage */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          🔍 Informations de débogage
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div>
            <strong>Utilisateur actuel:</strong> {currentUser.name} ({currentUser.id})
          </div>
          <div>
            <strong>Chat sélectionné:</strong> {selectedChat.name} ({selectedChat.id})
          </div>
          <div>
            <strong>Nombre d'utilisateurs:</strong> {users.length}
          </div>
          <div>
            <strong>Réponse active:</strong> {replyTo ? `Oui - ${replyTo.text?.substring(0, 30)}...` : 'Non'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setReplyTo(null)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🚫 Effacer la réponse
        </button>
        
        <button
          onClick={() => {
            const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
            setReplyTo(randomMessage);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🎲 Réponse aléatoire
        </button>
        
        <button
          onClick={() => {
            const adminMessage = demoMessages.find(m => m.isAdmin);
            setReplyTo(adminMessage);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          👑 Répondre à Admin
        </button>
        
        <button
          onClick={() => {
            const premiumMessage = demoMessages.find(m => m.isPremium);
            setReplyTo(premiumMessage);
          }}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          ⭐ Répondre à Premium
        </button>
      </div>

      {/* Légende des couleurs */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">
          🎨 Légende des couleurs et indicateurs
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-400 rounded"></div>
              <span className="text-gray-300">Vos propres messages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-400 rounded"></div>
              <span className="text-gray-300">Administrateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <span className="text-gray-300">Utilisateurs vérifiés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-gray-300">Utilisateurs premium</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaCrown size={12} className="text-purple-400" />
              <span className="text-gray-300">👑 Admin</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-blue-400" />
              <span className="text-gray-300">✅ Vérifié</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar size={12} className="text-yellow-400" />
              <span className="text-gray-300">⭐ Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <FaStar size={12} className="text-orange-400" />
              <span className="text-gray-300">📌 Épinglé</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
