'use client';

import React, { useState, useEffect } from 'react';
import { User, Search, X, UserPlus, Phone, Mail } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import { useGoogleContacts } from '@/hooks/useGoogleContacts';

const ContactPicker = ({ isOpen, onClose, conversationId, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

  const { shareContact } = useAttachments(conversationId, userId);
  const {
    contacts,
    searchContacts: searchGoogleContacts,
    isLoading,
    filteredContacts: googleFilteredContacts,
  } = useGoogleContacts();

  const [filteredContacts, setFilteredContacts] = useState([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchGoogleContacts(searchQuery);
      setFilteredContacts(googleFilteredContacts);
    } else {
      setFilteredContacts(contacts || []);
    }
  }, [searchQuery, contacts, googleFilteredContacts, searchGoogleContacts]);

  const handleContactSelect = contact => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts(prev => [...prev, contact]);
    }
  };

  const isContactSelected = contact => {
    return selectedContacts.some(c => c.id === contact.id);
  };

  const handleShareContacts = async () => {
    if (selectedContacts.length === 0) return;

    setIsSharing(true);
    try {
      for (const contact of selectedContacts) {
        // Extraire le prénom et nom du displayName ou des champs names
        let firstName = '';
        let lastName = '';

        if (contact.names && contact.names.length > 0) {
          firstName = contact.names[0].givenName || '';
          lastName = contact.names[0].familyName || '';
        } else {
          const parts = (contact.displayName || contact.name || '').split(' ');
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }

        const contactData = {
          first_name: firstName || contact.first_name || '',
          last_name: lastName || contact.last_name || '',
          phone_number:
            contact.primaryPhone || contact.phone_number || contact.phone || '',
          email: contact.primaryEmail || contact.email || '',
          profile_picture_url:
            contact.primaryPhoto ||
            contact.profile_picture_url ||
            contact.avatar ||
            '',
        };

        await shareContact(contactData);
      }

      console.log(
        `${selectedContacts.length} contact(s) partagé(s) avec succès`
      );
      onClose();
      setSelectedContacts([]);
    } catch (error) {
      console.error('Erreur partage contacts:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--wa-panel)',
          color: 'var(--wa-primary-strong)',
          borderRadius: '12px',
          width: '430px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>
            Envoyer des contacts
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '0px',
              display: 'flex',
              alignItems: 'center',
              width: '32px',
              height: '32px',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.4)',
              }}
            />
            <input
              type="text"
              placeholder="Rechercher un nom ou un numéro"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '42px',
                paddingRight: '14px',
                paddingTop: '9px',
                paddingBottom: '9px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '20px',
                color: 'var(--wa-primary-strong)',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* Contacts Section Header */}
        <div
          style={{
            padding: '12px 20px 8px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
          }}
        >
          Contacts
        </div>

        {/* Contacts List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '2px solid var(--wa-highlight)',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite',
                }}
              ></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
              }}
            >
              Aucun contact trouvé
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => handleContactSelect(contact)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: isContactSelected(contact)
                    ? 'rgba(6,207,156,0.2)'
                    : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isContactSelected(contact)) {
                    e.currentTarget.style.backgroundColor =
                      'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = isContactSelected(
                    contact
                  )
                    ? 'rgba(6,207,156,0.2)'
                    : 'transparent';
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isContactSelected(contact)
                      ? 'var(--wa-highlight)'
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  {isContactSelected(contact) && (
                    <div
                      style={{
                        width: '3px',
                        height: '7px',
                        border: 'solid #0d1419',
                        borderWidth: '0 2px 2px 0',
                        transform: 'rotate(45deg)',
                      }}
                    ></div>
                  )}
                </div>

                {/* Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    marginRight: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}
                >
                  {contact.primaryPhoto ||
                  contact.profile_picture_url ||
                  contact.avatar ? (
                    <img
                      src={
                        contact.primaryPhoto ||
                        contact.profile_picture_url ||
                        contact.avatar
                      }
                      alt={contact.displayName || contact.name || 'contact'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <User
                      size={20}
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    />
                  )}
                </div>

                {/* Contact Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: '500',
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {contact.displayName ||
                      contact.name ||
                      `${contact.first_name || ''} ${
                        contact.last_name || ''
                      }`.trim() ||
                      'Sans nom'}
                  </p>
                  {(contact.primaryPhone ||
                    contact.phone_number ||
                    contact.phone) && (
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.5)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {contact.primaryPhone ||
                        contact.phone_number ||
                        contact.phone}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Share Button */}
        {selectedContacts.length > 0 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={handleShareContacts}
              disabled={isSharing}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isSharing
                  ? 'rgba(6,207,156,0.5)'
                  : 'var(--wa-highlight)',
                color: '#0d1419',
                border: 'none',
                borderRadius: '6px',
                cursor: isSharing ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!isSharing) {
                  e.currentTarget.style.backgroundColor = '#05b8a0';
                }
              }}
              onMouseLeave={e => {
                if (!isSharing) {
                  e.currentTarget.style.backgroundColor = 'var(--wa-highlight)';
                }
              }}
            >
              {isSharing ? (
                <>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2px solid #0d1419',
                      borderTopColor: 'transparent',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  ></div>
                  Envoi en cours...
                </>
              ) : (
                `Envoyer (${selectedContacts.length})`
              )}
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: transparent;
          }
          div::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.3);
          }
        `}</style>
      </div>
    </div>
  );
};

export default ContactPicker;
