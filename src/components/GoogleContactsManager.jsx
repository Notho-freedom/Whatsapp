import React, { useState } from 'react';
import { useGoogleContacts } from '@/hooks/useGoogleContacts';
import { Search, RefreshCw, Download, Users, Mail, Phone, Building, Star, Clock, Filter } from 'lucide-react';

export default function GoogleContactsManager() {
  const {
    contacts,
    filteredContacts,
    isLoading,
    error,
    searchQuery,
    stats,
    lastSync,
    searchContacts,
    refreshContacts,
    syncContacts,
    exportContacts,
    getRecentContacts,
    getFavoriteContacts,
    getContactsByOrganization
  } = useGoogleContacts();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactDetails, setShowContactDetails] = useState(false);

  // Gérer la recherche
  const handleSearch = (e) => {
    const query = e.target.value;
    searchContacts(query);
  };

  // Gérer l'export
  const handleExport = async (format) => {
    const result = await exportContacts(format);
    if (result.success) {
      alert(`Contacts exportés avec succès: ${result.filename}`);
    } else {
      alert(`Erreur lors de l'export: ${result.error}`);
    }
  };

  // Afficher les détails d'un contact
  const showContact = (contact) => {
    setSelectedContact(contact);
    setShowContactDetails(true);
  };

  // Filtrer les contacts par onglet
  const getTabContacts = () => {
    switch (activeTab) {
      case 'recent':
        return getRecentContacts(20);
      case 'favorites':
        return getFavoriteContacts();
      case 'withPhotos':
        return contacts.filter(c => c.primaryPhoto);
      case 'withEmails':
        return contacts.filter(c => c.primaryEmail);
      case 'withPhones':
        return contacts.filter(c => c.primaryPhone);
      default:
        return filteredContacts;
    }
  };

  const tabContacts = getTabContacts();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📱 Gestionnaire de Contacts Google
            </h1>
            <p className="text-gray-600">
              Gérez et synchronisez vos contacts Google avec WhatsApp Clone
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshContacts}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Actualiser</span>
            </button>
            <button
              onClick={() => syncContacts()}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Synchroniser</span>
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-600">Total</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.withPhotos}</div>
              <div className="text-sm text-green-600">Avec photos</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.withEmails}</div>
              <div className="text-sm text-purple-600">Avec emails</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.withPhones}</div>
              <div className="text-sm text-orange-600">Avec téléphones</div>
            </div>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher des contacts..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Dernière synchronisation */}
        {lastSync && (
          <div className="mt-4 text-sm text-gray-500">
            Dernière synchronisation: {lastSync.toLocaleString()}
          </div>
        )}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'all', label: 'Tous', icon: Users, count: filteredContacts.length },
              { id: 'recent', label: 'Récents', icon: Clock, count: getRecentContacts(20).length },
              { id: 'favorites', label: 'Favoris', icon: Star, count: getFavoriteContacts().length },
              { id: 'withPhotos', label: 'Avec photos', icon: Users, count: contacts.filter(c => c.primaryPhoto).length },
              { id: 'withEmails', label: 'Avec emails', icon: Mail, count: contacts.filter(c => c.primaryEmail).length },
              { id: 'withPhones', label: 'Avec téléphones', icon: Phone, count: contacts.filter(c => c.primaryPhone).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Actions d'export */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Exporter les contacts</h3>
          <div className="flex space-x-3">
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des contacts */}
      <div className="bg-white rounded-lg shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des contacts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur lors du chargement</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={refreshContacts}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Réessayer
            </button>
          </div>
        ) : tabContacts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun contact trouvé</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Aucun contact ne correspond à votre recherche' : 'Commencez par synchroniser vos contacts Google'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tabContacts.map(contact => (
              <div
                key={contact.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => showContact(contact)}
              >
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {contact.primaryPhoto ? (
                      <img
                        src={contact.primaryPhoto}
                        alt={contact.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold text-lg">
                          {contact.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informations du contact */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-semibold text-gray-800 truncate">
                        {contact.displayName}
                      </h4>
                      {contact.primaryPhoto && contact.primaryEmail && contact.primaryPhone && (
                        <Star size={16} className="text-yellow-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      {contact.primaryEmail && (
                        <div className="flex items-center space-x-1">
                          <Mail size={14} />
                          <span className="truncate">{contact.primaryEmail}</span>
                        </div>
                      )}
                      {contact.primaryPhone && (
                        <div className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{contact.primaryPhone}</span>
                        </div>
                      )}
                      {contact.organizations[0]?.name && (
                        <div className="flex items-center space-x-1">
                          <Building size={14} />
                          <span className="truncate">{contact.organizations[0].name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex items-center space-x-2">
                    {contact.primaryEmail && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`mailto:${contact.primaryEmail}`);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                        title="Envoyer un email"
                      >
                        <Mail size={16} />
                      </button>
                    )}
                    {contact.primaryPhone && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${contact.primaryPhone}`);
                        }}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                        title="Appeler"
                      >
                        <Phone size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails du contact */}
      {showContactDetails && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails du contact</h2>
                <button
                  onClick={() => setShowContactDetails(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                {selectedContact.primaryPhoto ? (
                  <img
                    src={selectedContact.primaryPhoto}
                    alt={selectedContact.displayName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-3xl">
                      {selectedContact.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedContact.displayName}
                  </h3>
                  {selectedContact.organizations[0]?.title && (
                    <p className="text-gray-600">{selectedContact.organizations[0].title}</p>
                  )}
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="space-y-4">
                {selectedContact.emails.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Mail size={16} />
                      <span>Emails</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedContact.emails.map((email, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>{email.value}</span>
                          <span className="text-sm text-gray-500">{email.formattedType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContact.phones.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Phone size={16} />
                      <span>Téléphones</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedContact.phones.map((phone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>{phone.value}</span>
                          <span className="text-sm text-gray-500">{phone.formattedType}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedContact.organizations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                      <Building size={16} />
                      <span>Organisations</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedContact.organizations.map((org, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{org.name}</div>
                          {org.title && <div className="text-sm text-gray-600">{org.title}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                {selectedContact.primaryEmail && (
                  <button
                    onClick={() => window.open(`mailto:${selectedContact.primaryEmail}`)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail size={16} />
                    <span>Envoyer un email</span>
                  </button>
                )}
                {selectedContact.primaryPhone && (
                  <button
                    onClick={() => window.open(`tel:${selectedContact.primaryPhone}`)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone size={16} />
                    <span>Appeler</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
