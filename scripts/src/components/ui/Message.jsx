import { Check, CheckCheck } from 'lucide-react';

export default function Message({ message }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Check size={14} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-whatsapp-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] px-3 py-2 rounded-lg ${
          message.isFromUser
            ? 'bg-whatsapp-primary text-white rounded-br-md'
            : 'bg-whatsapp-dark-700 text-white rounded-bl-md'
        }`}
      >
        <p className="text-sm break-words" style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}>
          {message.text}
        </p>
        
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          message.isFromUser ? 'text-white/70' : 'text-gray-400'
        }`}>
          <span className="text-xs">
            {formatTime(message.timestamp)}
          </span>
          {message.isFromUser && getStatusIcon(message.status)}
        </div>
      </div>
    </div>
  );
}
