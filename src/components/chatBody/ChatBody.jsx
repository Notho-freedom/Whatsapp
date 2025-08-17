import { FaLock, FaWhatsapp } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import SystemMessage from './SystemMessage';
import mocMessages from './mocMessages';
import { useState } from 'react';

export default function ChatBody({ selectedChat, messages = {} }) {
  const [replyToMessage, setReplyToMessage] = useState(null);

  if (!selectedChat) {
    return (
      <section className="flex-1 bg-whatsapp-chat-bg flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
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
          </div>
        </div>
        <div className="pb-12 flex items-center justify-center gap-2">
          <FaLock size={10} className="text-neutral-500" />
          <p className="text-sm text-neutral-500">End-to-end encrypted.</p>
        </div>
      </section>
    );
  }

  const chatMessages = messages[selectedChat?.id] || mocMessages;

  // Gestion des actions sur les messages
  const handleReply = (message) => {
    setReplyToMessage(message);
    console.log('Répondre à:', message);
  };

  const handleForward = (message) => {
    console.log('Transférer:', message);
    // Ici on pourrait ouvrir un modal pour choisir le destinataire
  };

  const handleStar = (message) => {
    console.log('Marquer comme important:', message);
    // Ici on pourrait mettre à jour le statut starred
  };

  const handleMore = (message) => {
    console.log('Plus d\'options pour:', message);
    // Ici on pourrait afficher un menu contextuel
  };

  return (
    <section
      className="flex-1 overflow-y-auto p-4"
      style={{
        backgroundImage: 'url(https://images5.alphacoders.com/133/thumb-1920-1339662.jpeg)',
        backgroundSize: 'cover',
      }}
    >
      <div className="space-y-1 max-w-4xl mx-auto">
        {chatMessages.map((msg) => {
          // Afficher les messages système différemment
          if (msg.isSystemMessage) {
            return <SystemMessage key={msg.id} message={msg} />;
          }

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              onReply={handleReply}
              onForward={handleForward}
              onStar={handleStar}
              onMore={handleMore}
            />
          );
        })}
      </div>

      {/* Indicateur de réponse - Positionnement amélioré */}
      {replyToMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 max-w-md w-full mx-4 z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-1">
                  Répondre à {replyToMessage.sender === 'me' ? 'vous' : replyToMessage.senderName}
                </div>
                <div className="text-sm text-white line-clamp-2">
                  {replyToMessage.text || (replyToMessage.media ? '📷 Média' : '🔗 Lien')}
                </div>
              </div>
              <button
                onClick={() => setReplyToMessage(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors flex-shrink-0"
                title="Annuler la réponse"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
