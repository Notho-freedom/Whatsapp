'use client';

import React from 'react';
import { User, Phone, Mail, Download } from 'lucide-react';

const ContactItem = ({ contact, isMobile = false }) => {
  if (!contact) return null;

  const firstName = contact.first_name || contact.names?.[0]?.givenName || '';
  const lastName = contact.last_name || contact.names?.[0]?.familyName || '';
  const displayName =
    contact.displayName || `${firstName} ${lastName}`.trim() || 'Sans nom';
  const phone =
    contact.phone_number ||
    contact.primaryPhone ||
    contact.phones?.[0]?.value ||
    '';
  const email =
    contact.email || contact.primaryEmail || contact.emails?.[0]?.value || '';
  const avatar =
    contact.profile_picture_url ||
    contact.primaryPhoto ||
    contact.photos?.[0]?.url ||
    '';

  const handleDownloadVCard = () => {
    // Créer un vCard
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${displayName}
N:${lastName};${firstName};;;
${phone ? `TEL:${phone}` : ''}
${email ? `EMAIL:${email}` : ''}
END:VCARD`;

    // Télécharger le fichier
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcard)
    );
    element.setAttribute('download', `${displayName}.vcf`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        maxWidth: '280px',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
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
          <User size={24} style={{ color: 'rgba(255,255,255,0.5)' }} />
        )}
      </div>

      {/* Contact Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: '600',
            fontSize: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--wa-primary-strong)',
          }}
        >
          {displayName}
        </p>

        {phone && (
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Phone size={12} style={{ flexShrink: 0 }} />
            {phone}
          </p>
        )}

        {email && (
          <p
            style={{
              margin: '2px 0 0 0',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <Mail size={12} style={{ flexShrink: 0 }} />
            {email}
          </p>
        )}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownloadVCard}
        style={{
          backgroundColor: 'var(--wa-highlight)',
          color: '#0d1419',
          border: 'none',
          borderRadius: '6px',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = '#05b8a0';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'var(--wa-highlight)';
        }}
        title="Télécharger le contact"
      >
        <Download size={16} />
      </button>
    </div>
  );
};

export default ContactItem;
