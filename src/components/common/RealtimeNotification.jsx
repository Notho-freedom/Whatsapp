'use client';

import { useEffect, useState } from 'react';
import { X, MessageCircle, Phone, Video } from 'lucide-react';

const RealtimeNotification = ({ notifications, onDismiss }) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      setVisibleNotifications(prev => [...prev, latestNotification]);

      // Auto-dismiss après 5 secondes
      const timer = setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.filter(n => n.id !== latestNotification.id)
        );
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleDismiss = (notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    if (onDismiss) {
      onDismiss(notificationId);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle size={16} />;
      case 'call':
        return <Phone size={16} />;
      case 'video':
        return <Video size={16} />;
      default:
        return <MessageCircle size={16} />;
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-[#202c33] border border-[#2a373f] rounded-lg p-4 shadow-lg max-w-sm animate-slide-in"
          style={{
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-[#00a884]">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-xs text-[#8696a0] mb-2">
                {notification.message}
              </p>
              <p className="text-xs text-[#667781]">
                {new Date(notification.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(notification.id)}
              className="flex-shrink-0 text-[#8696a0] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RealtimeNotification;
