import { FaLock, FaPhone, FaVideo } from 'react-icons/fa';

export default function SystemMessage({ message }) {
  const getIcon = () => {
    switch (message.systemType) {
      case 'encryption':
        return <FaLock size={10} className="mr-1" />;
      case 'call':
        return <FaPhone size={10} className="mr-1" />;
      case 'video':
        return <FaVideo size={10} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="wa-date-divider">
      <div className="wa-system-message flex items-center">
        {getIcon()}
        <span>{message.text}</span>
      </div>
    </div>
  );
}