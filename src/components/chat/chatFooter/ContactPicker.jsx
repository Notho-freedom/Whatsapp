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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Partager des contacts</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contacts sélectionnés */}
        {selectedContacts.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Contacts sélectionnés:</h4>
            <div className="space-y-2">
              {selectedContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center">
                    <User size={16} className="text-blue-500 mr-2" />
                    <span className="text-sm font-medium">
                      {contact.first_name} {contact.last_name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleContactSelect(contact)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liste des contacts */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Contacts disponibles:</h4>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Chargement des contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Aucun contact trouvé
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isContactSelected(contact)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User size={20} className="text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.phone_number && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Phone size={14} className="mr-1" />
                            {contact.phone_number}
                          </p>
                        )}
                        {contact.email && (
                          <p className="text-sm text-gray-500 flex items-center">
                            <Mail size={14} className="mr-1" />
                            {contact.email}
                          </p>
                        )}
                      </div>
                    </div>
                    {isContactSelected(contact) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <UserPlus size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleShareContacts}
            disabled={selectedContacts.length === 0 || isSharing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
          >
            {isSharing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Partage en cours...
              </>
            ) : (
              <>
                <UserPlus size={16} className="mr-2" />
                Partager ({selectedContacts.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPicker;
