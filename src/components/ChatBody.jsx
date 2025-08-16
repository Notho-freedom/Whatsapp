import { FaWhatsapp } from 'react-icons/fa';
import Message from './Message';

export default function ChatBody({ selectedChat, messages = [] }) {
  if (!selectedChat) {
    return (
      <section className="flex-1 bg-whatsapp-chat-bg flex items-center justify-center">
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
      </section>
    );
  }
  const moc = [
    {
      id: 'm1',
      sender: 'Alice',
      senderName: 'Alice',
      text: 'Salut, ça va ?',
      time: '14:02',
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'Oui et toi ?',
      time: '14:03',
      read: true,
    },
    {
      id: 'm3',
      sender: 'Alice',
      senderName: 'Alice',
      text: 'Super ! Tu fais quoi ?',
      time: '14:04',
    },
    {
      id: 'm4',
      sender: 'me',
      text: 'Je bosse sur un clone WhatsApp 😏',
      time: '14:05',
      read: true,
      replyTo: {
        sender: 'Alice',
        senderName: 'Alice',
        text: 'Super ! Tu fais quoi ?',
      },
    },
    {
      id: 'm5',
      sender: 'Alice',
      senderName: 'Alice',
      text: 'Haha génial ! Tu me montres quand ?',
      time: '14:06',
    },
  ];
  const chatMessages = messages[selectedChat.id] || moc;

  return (
    <section
      className="flex-1 overflow-y-auto p-4"
      style={{
        backgroundImage:
          'url(/cloud.jpg)', // fond WhatsApp
        backgroundSize: 'cover',
      }}
    >
      <div className="space-y-2">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[75%] rounded-lg px-3 py-2 text-sm shadow relative"
              style={{
                backgroundColor:
                  message.sender === 'me' ? '#005C4B' : '#202C33',
                color: '#EDEDED',
                borderTopRightRadius: message.sender === 'me' ? '0px' : '8px',
                borderTopLeftRadius: message.sender !== 'me' ? '0px' : '8px',
              }}
            >
              {message.replyTo && (
                <div className="mb-1 px-2 py-1 bg-black/20 rounded border-l-4 border-green-500 text-xs text-gray-300">
                  <span className="font-semibold">
                    {message.replyTo.sender === 'me' ? 'Vous' : message.replyTo.senderName}
                  </span>
                  <div className="truncate">{message.replyTo.text}</div>
                </div>
              )}

              <p className="whitespace-pre-wrap">{message.text}</p>

              <div className="flex justify-end mt-1 space-x-1 text-[10px] text-gray-400">
                <span>{message.time}</span>
                {message.sender === 'me' && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className={`w-4 h-4 ${message.read ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    <path d="M0 13l2-2 5 5L22 1l2 2L7 20z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
