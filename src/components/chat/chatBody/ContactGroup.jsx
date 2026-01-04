'use client';

import React, { useState } from 'react';
import ContactItem from './ContactItem';
import { User } from 'lucide-react';

const ContactGroup = ({ contacts, isMobile = false }) => {
  const [showAll, setShowAll] = useState(false);

  if (!contacts || contacts.length === 0) return null;

  const isSingle = contacts.length === 1;

  // Si un seul contact, afficher ContactItem normal
  if (isSingle) {
    return <ContactItem contact={contacts[0]} isMobile={isMobile} />;
  }

  // Si plusieurs contacts et pas encore étendu, afficher la vue compacte
  if (!showAll) {
    const MAX_AVATARS = 5;
    const displayContacts = contacts.slice(0, MAX_AVATARS);
    const remainingCount = contacts.length - MAX_AVATARS;

    return (
      <div
        onClick={() => setShowAll(true)}
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          maxWidth: '280px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
        }}
      >
        {/* Avatars empilés */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {displayContacts.map((contact, index) => {
            const firstName =
              contact.first_name || contact.names?.[0]?.givenName || '';
            const lastName =
              contact.last_name || contact.names?.[0]?.familyName || '';
            const displayName =
              contact.displayName ||
              `${firstName} ${lastName}`.trim() ||
              'Sans nom';
            const avatar =
              contact.profile_picture_url ||
              contact.primaryPhoto ||
              contact.photos?.[0]?.url ||
              '';

            return (
              <div
                key={contact.id || index}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '2px solid var(--wa-panel)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginLeft: index > 0 ? '-10px' : '0',
                  zIndex: MAX_AVATARS - index,
                  flexShrink: 0,
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <User size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
                )}
              </div>
            );
          })}

          {/* Indicateur "+X" si plus de contacts */}
          {remainingCount > 0 && (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--wa-highlight)',
                color: '#0d1419',
                border: '2px solid var(--wa-panel)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '700',
                marginLeft: '-12px',
                zIndex: 0,
                flexShrink: 0,
              }}
            >
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue étendue - afficher tous les contacts
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '320px',
      }}
    >
      {contacts.map((contact, index) => (
        <ContactItem
          key={contact.id || index}
          contact={contact}
          isMobile={isMobile}
        />
      ))}

      {/* Bouton pour replier */}
      <button
        className='text-green-500 rounded-none p-0 hover:bg-transparent'
        onClick={() => setShowAll(false)}
        style={{
          padding: '8px',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        Réduire
      </button>
    </div>
  );
};

export default ContactGroup;
