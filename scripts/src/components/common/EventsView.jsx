'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Bell,
  BellOff,
  Share,
  ExternalLink
} from 'lucide-react';

export default function EventsView() {
  const [events, setEvents] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'title', 'type'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'calendar'
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Données d'exemple pour les événements
  useEffect(() => {
    const mockEvents = [
      {
        id: 1,
        title: 'Réunion équipe projet',
        type: 'meeting',
        description: 'Réunion hebdomadaire pour discuter de l\'avancement du projet',
        date: '2024-01-20',
        time: '14:00',
        duration: '1h',
        location: 'Salle de conférence A',
        participants: ['Marie Dupont', 'Jean Martin', 'Pierre Dubois'],
        isAllDay: false,
        isRecurring: true,
        recurrence: 'weekly',
        reminder: '15min',
        conversation: 'Groupe Travail',
        sender: 'Marie Dupont',
        status: 'upcoming'
      },
      {
        id: 2,
        title: 'Anniversaire Sophie',
        type: 'personal',
        description: 'Célébration de l\'anniversaire de Sophie',
        date: '2024-01-25',
        time: '19:00',
        duration: '3h',
        location: 'Restaurant Le Gourmet',
        participants: ['Sophie Martin', 'Marie Dupont', 'Jean Martin'],
        isAllDay: false,
        isRecurring: true,
        recurrence: 'yearly',
        reminder: '1h',
        conversation: 'Groupe Amis',
        sender: 'Sophie Martin',
        status: 'upcoming'
      },
      {
        id: 3,
        title: 'Formation React.js',
        type: 'training',
        description: 'Formation sur les nouvelles fonctionnalités de React 18',
        date: '2024-01-18',
        time: '09:00',
        duration: '6h',
        location: 'Centre de formation Tech',
        participants: ['Pierre Dubois', 'Marie Dupont'],
        isAllDay: false,
        isRecurring: false,
        recurrence: null,
        reminder: '30min',
        conversation: 'Groupe Formation',
        sender: 'Pierre Dubois',
        status: 'completed'
      },
      {
        id: 4,
        title: 'Vacances d\'été',
        type: 'vacation',
        description: 'Vacances en famille à la mer',
        date: '2024-07-15',
        time: '00:00',
        duration: '14j',
        location: 'Bretagne, France',
        participants: ['Marie Dupont', 'Famille'],
        isAllDay: true,
        isRecurring: false,
        recurrence: null,
        reminder: '1j',
        conversation: 'Groupe Famille',
        sender: 'Marie Dupont',
        status: 'upcoming'
      },
      {
        id: 5,
        title: 'Conférence Tech',
        type: 'conference',
        description: 'Conférence annuelle sur les nouvelles technologies',
        date: '2024-02-15',
        time: '08:00',
        duration: '8h',
        location: 'Palais des Congrès',
        participants: ['Marie Dupont', 'Jean Martin', 'Pierre Dubois'],
        isAllDay: false,
        isRecurring: true,
        recurrence: 'yearly',
        reminder: '2h',
        conversation: 'Groupe Tech',
        sender: 'Jean Martin',
        status: 'upcoming'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users size={20} className="text-blue-400" />;
      case 'personal': return <Calendar size={20} className="text-green-400" />;
      case 'training': return <Users size={20} className="text-purple-400" />;
      case 'vacation': return <Calendar size={20} className="text-yellow-400" />;
      case 'conference': return <Users size={20} className="text-orange-400" />;
      default: return <Calendar size={20} className="text-gray-400" />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'meeting': return 'Réunion';
      case 'personal': return 'Personnel';
      case 'training': return 'Formation';
      case 'vacation': return 'Vacances';
      case 'conference': return 'Conférence';
      default: return 'Événement';
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'text-green-400';
      case 'ongoing': return 'text-blue-400';
      case 'completed': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getEventStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return 'À venir';
      case 'ongoing': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const formatEventDate = (date, time) => {
    const eventDate = new Date(`${date}T${time}`);
    const now = new Date();
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Passé';
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Demain';
    if (diffDays <= 7) return `Dans ${diffDays} jours`;
    return eventDate.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSelectEvent = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map(event => event.id));
    }
  };

  const handleDeleteSelected = () => {
    setEvents(prev => prev.filter(event => !selectedEvents.includes(event.id)));
    setSelectedEvents([]);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />;
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.conversation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'date':
        default:
          aValue = new Date(`${a.date}T${a.time}`);
          bValue = new Date(`${b.date}T${b.time}`);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="p-6 bg-[#2c2c2c] h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Événements partagés</h2>
            <p className="text-gray-400 text-sm">
              Gérez tous les événements partagés dans vos conversations
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1DAA61] hover:bg-[#1DAA61]/80 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
            Créer un événement
          </button>
        </div>
      </div>

      {/* Formulaire de création (simplifié) */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-neutral-800/50 rounded-lg border border-neutral-600">
          <h3 className="text-white font-medium mb-3">Créer un nouvel événement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titre de l'événement"
              className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
            />
            <select className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#1DAA61]">
              <option value="">Type d'événement</option>
              <option value="meeting">Réunion</option>
              <option value="personal">Personnel</option>
              <option value="training">Formation</option>
              <option value="vacation">Vacances</option>
              <option value="conference">Conférence</option>
            </select>
            <input
              type="date"
              className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#1DAA61]"
            />
            <input
              type="time"
              className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#1DAA61]"
            />
            <input
              type="text"
              placeholder="Lieu"
              className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
            />
            <textarea
              placeholder="Description"
              rows={2}
              className="px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-[#1DAA61] hover:bg-[#1DAA61]/80 text-white rounded-lg transition-colors">
              Créer
            </button>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Contrôles */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Barre de recherche */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des événements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
            />
          </div>
        </div>

        {/* Filtres par type */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:border-[#1DAA61]"
        >
          <option value="all">Tous les types</option>
          <option value="meeting">Réunions</option>
          <option value="personal">Personnel</option>
          <option value="training">Formations</option>
          <option value="vacation">Vacances</option>
          <option value="conference">Conférences</option>
        </select>

        {/* Mode d'affichage */}
        <div className="flex bg-neutral-700/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#1DAA61] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="w-4 h-4 space-y-1">
              <div className="w-full h-1 bg-current rounded-sm"></div>
              <div className="w-full h-1 bg-current rounded-sm"></div>
              <div className="w-full h-1 bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded ${viewMode === 'calendar' ? 'bg-[#1DAA61] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedEvents.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-700/30 rounded-lg border border-neutral-600">
          <span className="text-white text-sm">
            {selectedEvents.length} événement(s) sélectionné(s)
          </span>
          <button
            onClick={handleSelectAll}
            className="text-[#1DAA61] hover:text-[#1DAA61]/80 text-sm"
          >
            {selectedEvents.length === events.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </button>
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded transition-colors">
              <Share size={14} />
              Partager
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              <Trash2 size={14} />
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* En-têtes de colonnes (mode liste) */}
      {viewMode === 'list' && (
        <div className="bg-neutral-800/50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-12 gap-4 text-xs text-gray-400 font-medium">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedEvents.length === events.length && events.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
              />
            </div>
            <div className="col-span-4">
              <button
                onClick={() => toggleSort('title')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Titre et description
                {getSortIcon('title')}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => toggleSort('type')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Type
                {getSortIcon('type')}
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => toggleSort('date')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Date et heure
                {getSortIcon('date')}
              </button>
            </div>
            <div className="col-span-3 text-center">Actions</div>
          </div>
        </div>
      )}

      {/* Liste des événements */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredAndSortedEvents.map((event) => (
            <div
              key={event.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all ${
                selectedEvents.includes(event.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={() => handleSelectEvent(event.id)}
                    className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                  />
                </div>

                {/* Titre, description et informations */}
                <div className="col-span-4">
                  <div className="flex gap-3">
                    {/* Icône du type */}
                    <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>

                    {/* Contenu textuel */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-sm font-medium truncate">{event.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full bg-neutral-700 ${getEventStatusColor(event.status)}`}>
                          {getEventStatusLabel(event.status)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs line-clamp-2 mb-1">{event.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin size={12} />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {event.conversation} • {event.sender}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    <span className="text-gray-300 text-sm">{getEventTypeLabel(event.type)}</span>
                  </div>
                </div>

                {/* Date et heure */}
                <div className="col-span-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-300 text-sm">
                      <Calendar size={12} />
                      <span>{formatEventDate(event.date, event.time)}</span>
                    </div>
                    {!event.isAllDay && (
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock size={10} />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-3 flex gap-2 justify-center">
                  <button className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors">
                    <Edit size={14} />
                  </button>
                  <button className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors">
                    <Share size={14} />
                  </button>
                  <button className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors">
                    <Bell size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Mode calendrier (simplifié) */
        <div className="bg-neutral-800/50 rounded-lg p-6">
          <div className="text-center text-gray-400">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Vue calendrier</p>
            <p className="text-sm">Cette fonctionnalité sera développée prochainement</p>
          </div>
        </div>
      )}

      {/* Message si aucun événement */}
      {filteredAndSortedEvents.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Aucun événement trouvé</p>
          <p className="text-sm">
            {searchQuery || filterType !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Vous n\'avez pas encore partagé d\'événements'
            }
          </p>
        </div>
      )}
    </div>
  );
}
