'use client';

import React, { useState } from 'react';
import ReplyCap from './ReplyCap';

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
    avatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS'
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
    }
  ]);

  const demoMessages = [
    {
      id: 'msg-1',
      text: 'Salut ! Comment ça va ?',
      sender: 'chat-1',
      senderName: 'Alice Smith',
      senderAvatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS',
      timestamp: new Date().toISOString(),
      type: 'text'
    },
    {
      id: 'msg-2',
      text: 'Très bien, merci ! Et toi ?',
      sender: 'me',
      senderName: 'John Doe',
      senderAvatar: 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=JD',
      timestamp: new Date().toISOString(),
      type: 'text'
    },
    {
      id: 'msg-3',
      text: 'Parfait ! Voici une image que j\'ai trouvée',
      sender: 'chat-1',
      senderName: 'Alice Smith',
      senderAvatar: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=AS',
      timestamp: new Date().toISOString(),
      type: 'text',
      media: [
        {
          type: 'image',
          url: 'https://via.placeholder.com/200x150/10B981/FFFFFF?text=Image'
        }
      ]
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-4">
          🧪 Démonstration ReplyCap
        </h1>
        <p className="text-gray-300">
          Testez le composant ReplyCap avec différentes données utilisateur
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
              <div>
                <h3 className="font-medium text-white">
                  {message.senderName}
                </h3>
                <p className="text-sm text-gray-400">
                  {message.sender === 'me' ? 'Vous' : 'Contact'}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-2">{message.text}</p>
            
            {message.media && message.media.length > 0 && (
              <div className="text-sm text-blue-400">
                📎 {message.media[0].type}: {message.media[0].url}
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
        <div className="space-y-2 text-sm text-gray-300">
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
      <div className="mt-6 flex gap-3">
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
      </div>
    </div>
  );
}
