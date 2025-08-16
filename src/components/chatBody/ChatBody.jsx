import { FaLock, FaWhatsapp } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import mocMessages from './mocMessages';

export default function ChatBody({ selectedChat, messages = {} }) {
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

  return (
    <section
      className="flex-1 overflow-y-auto p-4"
      style={{
        backgroundImage: 'url(/cloud.jpg)',
        backgroundSize: 'cover',
      }}
    >
      <div className="space-y-2">
        {chatMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </section>
  );
}
