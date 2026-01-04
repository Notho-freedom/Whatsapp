"use client";

import React, { useState, useEffect } from 'react';
import { User, Search, X, UserPlus, Phone, Mail } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import { useContacts } from '@/hooks/useContacts';

const ContactPicker = ({ isOpen, onClose, conversationId, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isSharing, setIsSharing] = useState(false);
  
  const { shareContact } = useAttachments(conversationId, userId);
  const { contacts, searchContacts, isLoading } = useContacts();

  const [filteredContacts, setFilteredContacts] = useState([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchContacts(searchQuery);
      setFilteredContacts(results);
    } else {
      setFilteredContacts(contacts || []);
    }
  }, [searchQuery, contacts, searchContacts]);

  const handleContactSelect = (contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts(prev => [...prev, contact]);
    }
  };

  const handleShareContacts = async () => {
    if (selectedContacts.length === 0) return;

    setIsSharing(true);
    try {
      for (const contact of selectedContacts) {
        const contactData = {
          first_name: contact.first_name || contact.name?.split(' ')[0] || '',
          last_name: contact.last_name || contact.name?.split(' ').slice(1).join(' ') || '',
          phone_number: contact.phone_number || contact.phone || '',
          email: contact.email || '',
          profile_picture_url: contact.profile_picture_url || contact.avatar || ''
        };
        
        await shareContact(contactData);
      }
      
      console.log(`${selectedContacts.length} contact(s) partagé(s) avec succès`);
      onClose();
      setSelectedContacts([]);
    } catch (error) {
      console.error('Erreur partage contacts:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const isContactSelected = (contact) => {
    return selectedContacts.some(c => c.id === contact.id);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div style={{ backgroundColor: 'var(--wa-panel)', color: 'var(--wa-primary-strong)', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Partager des contacts</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Barre de recherche */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Rechercher des contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'var(--wa-primary-strong)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Contacts sélectionnés */}
          {selectedContacts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Contacts sélectionnés:</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedContacts.map((contact) => (
                  <div key={contact.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(6,207,156,0.15)', border: '1px solid rgba(6,207,156,0.3)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <User size={16} style={{ color: 'var(--wa-highlight)', marginRight: '8px' }} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>
                        {contact.first_name} {contact.last_name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleContactSelect(contact)}
                      style={{ background: 'none', border: 'none', color: 'var(--wa-highlight)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des contacts */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontWeight: '500', marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Contacts disponibles:</h4>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--wa-highlight)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto', marginBottom: '12px' }}></div>
                <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '14px' }}>Chargement des contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Aucun contact trouvé
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '256px', overflowY: 'auto' }}>
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactSelect(contact)}
                    style={{
                      padding: '12px',
                      border: isContactSelected(contact) ? '1px solid var(--wa-highlight)' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: isContactSelected(contact) ? 'rgba(6,207,156,0.15)' : 'transparent',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isContactSelected(contact)) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isContactSelected(contact)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <User size={20} style={{ color: 'rgba(255,255,255,0.5)', marginRight: '12px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: '500', margin: '0 0 4px 0', fontSize: '14px' }}>
                            {contact.first_name} {contact.last_name}
                          </p>
                          {contact.phone_number && (
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '2px 0', display: 'flex', alignItems: 'center' }}>
                              <Phone size={12} style={{ marginRight: '6px' }} />
                              {contact.phone_number}
                            </p>
                          )}
                          {contact.email && (
                            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '2px 0', display: 'flex', alignItems: 'center' }}>
                              <Mail size={12} style={{ marginRight: '6px' }} />
                              {contact.email}
                            </p>
                          )}
                        </div>
                      </div>
                      {isContactSelected(contact) && (
                        <div style={{ width: '20px', height: '20px', backgroundColor: 'var(--wa-highlight)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '12px' }}>
                          <UserPlus size={12} style={{ color: '#0d1419' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.7)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleShareContacts}
            disabled={selectedContacts.length === 0 || isSharing}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedContacts.length === 0 || isSharing ? 'rgba(6,207,156,0.5)' : 'var(--wa-highlight)',
              color: '#0d1419',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedContacts.length === 0 || isSharing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              opacity: selectedContacts.length === 0 || isSharing ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (selectedContacts.length > 0 && !isSharing) {
                e.currentTarget.style.backgroundColor = '#05b8a0';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedContacts.length > 0 && !isSharing) {
                e.currentTarget.style.backgroundColor = 'var(--wa-highlight)';
              }
            }}
          >
            {isSharing ? (
              <>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #0d1419', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }}></div>
                Partage en cours...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Partager ({selectedContacts.length})
              </>
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ContactPicker;
