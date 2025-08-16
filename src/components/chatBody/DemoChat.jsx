import { useState } from 'react';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import mocMessages from './mocMessages';

export default function DemoChat() {
  const [selectedMessageType, setSelectedMessageType] = useState('all');
  const [showActions, setShowActions] = useState(true);

  const messageTypes = [
    { id: 'all', label: 'Tous les messages', filter: () => true },
    { id: 'text', label: 'Messages texte', filter: (msg) => msg.text && !msg.media && !msg.link },
    { id: 'media', label: 'Médias', filter: (msg) => msg.media && msg.media.length > 0 },
    { id: 'links', label: 'Liens', filter: (msg) => msg.link },
    { id: 'replies', label: 'Réponses', filter: (msg) => msg.replyTo },
    { id: 'reactions', label: 'Réactions', filter: (msg) => msg.reactions && msg.reactions.length > 0 },
    { id: 'forwarded', label: 'Transférés', filter: (msg) => msg.forwarded },
    { id: 'starred', label: 'Importants', filter: (msg) => msg.starred },
  ];

  const filteredMessages = mocMessages.filter(messageTypes.find(t => t.id === selectedMessageType).filter);

  const handleReply = (message) => {
    console.log('Répondre à:', message);
  };

  const handleForward = (message) => {
    console.log('Transférer:', message);
  };

  const handleStar = (message) => {
    console.log('Marquer comme important:', message);
  };

  const handleMore = (message) => {
    console.log('Plus d\'options pour:', message);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header de démonstration */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            🚀 Démonstration des Bulles WhatsApp
          </h1>
          <p className="text-gray-300 mb-4">
            Cette démonstration montre tous les cas de figure des bulles de messages WhatsApp, 
            identiques à la version officielle desktop.
          </p>
          
          {/* Filtres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {messageTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedMessageType(type.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedMessageType === type.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={showActions}
                onChange={(e) => setShowActions(e.target.checked)}
                className="rounded"
              />
              Afficher les actions (hover)
            </label>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="space-y-4">
            {filteredMessages.map((msg) => {
              if (msg.isSystemMessage) {
                return <SystemMessage key={msg.id} message={msg} />;
              }

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onReply={showActions ? handleReply : undefined}
                  onForward={showActions ? handleForward : undefined}
                  onStar={showActions ? handleStar : undefined}
                  onMore={showActions ? handleMore : undefined}
                />
              );
            })}
          </div>

          {filteredMessages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Aucun message trouvé pour ce filtre.
            </div>
          )}
        </div>

        {/* Légende */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">📋 Fonctionnalités implémentées</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">✅ Messages texte</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Texte simple avec emojis</li>
                <li>• Texte long avec retour à la ligne</li>
                <li>• Messages envoyés vs reçus</li>
                <li>• Indicateurs de lecture</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">✅ Médias</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Images uniques et groupées (1-6)</li>
                <li>• Vidéos avec contrôles</li>
                <li>• Audio avec barre de progression</li>
                <li>• Documents avec icônes</li>
                <li>• Légendes sur les médias</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">✅ Liens et previews</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Prévisualisation des liens</li>
                <li>• Images de preview</li>
                <li>• Icônes par domaine</li>
                <li>• Titres et descriptions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">✅ Fonctionnalités avancées</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Réponses aux messages</li>
                <li>• Messages transférés</li>
                <li>• Messages importants</li>
                <li>• Réactions avec emojis</li>
                <li>• Messages système</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
