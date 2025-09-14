import React from 'react';
import Avatar from '@/components/ui/Avatar';

export default function ContactList({
  users,
  onSelect,
  emptyMessage,
  loading,
  avatarSize = 48,
  renderItem,
}) {
  if (loading) {
    return (
      <div className="p-4 text-center text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1DAA61] mx-auto mb-2"></div>
        <p>Chargement...</p>
      </div>
    );
  }
  if (!users || users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }
  return users.map(contact =>
    renderItem ? (
      renderItem(contact)
    ) : (
      <div
        key={contact.id}
        onClick={() => onSelect(contact)}
        className="flex items-center gap-3 p-2 mt-1 cursor-pointer rounded-lg hover:bg-neutral-700/50 transition-colors"
      >
        <Avatar
          src={contact.photos?.[0]?.url || contact.avatar}
          alt={`${contact.displayName || contact.name} profile picture`}
          name={contact.displayName || contact.name || 'Contact'}
          size={avatarSize}
          className={`w-${avatarSize / 4} h-${avatarSize / 4}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm font-segoe truncate">
              {contact.displayName || contact.name || 'Contact sans nom'}
            </h3>
          </div>
          <div className="flex items-center mt-1">
            <p className="text-sm text-gray-300 truncate">
              {contact.phones?.[0]?.value ||
                contact.emails?.[0]?.value ||
                contact.email ||
                contact.phone ||
                'Aucune information'}
            </p>
          </div>
        </div>
      </div>
    )
  );
}
