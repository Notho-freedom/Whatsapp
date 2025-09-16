'use client';

import React, { useState, useEffect } from 'react';
import { 
  Link, 
  ExternalLink, 
  Globe, 
  Video, 
  Image, 
  FileText, 
  ShoppingCart,
  Calendar,
  Search,
  Filter,
  Share,
  Copy,
  Trash2,
  Eye,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';

export default function LinksView() {
  const [links, setLinks] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'title', 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Données d'exemple pour les liens
  useEffect(() => {
    const mockLinks = [
      {
        id: 1,
        title: 'Article sur l\'intelligence artificielle',
        url: 'https://example.com/ai-article',
        type: 'article',
        description: 'Un article intéressant sur les dernières avancées en IA',
        date: '2024-01-15',
        conversation: 'Groupe Tech',
        sender: 'Marie Dupont',
        isBookmarked: true,
        preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop'
      },
      {
        id: 2,
        title: 'Vidéo YouTube - Tutoriel React',
        url: 'https://youtube.com/watch?v=react-tutorial',
        type: 'video',
        description: 'Tutoriel complet pour apprendre React.js',
        date: '2024-01-14',
        conversation: 'Jean Martin',
        sender: 'Jean Martin',
        isBookmarked: false,
        preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop'
      },
      {
        id: 3,
        title: 'Site e-commerce - Boutique en ligne',
        url: 'https://boutique-example.com',
        type: 'shopping',
        description: 'Boutique en ligne avec de nombreux produits',
        date: '2024-01-13',
        conversation: 'Groupe Shopping',
        sender: 'Pierre Dubois',
        isBookmarked: true,
        preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop'
      },
      {
        id: 4,
        title: 'Document PDF - Guide utilisateur',
        url: 'https://example.com/guide-utilisateur.pdf',
        type: 'document',
        description: 'Guide complet d\'utilisation du logiciel',
        date: '2024-01-12',
        conversation: 'Support Client',
        sender: 'Support Team',
        isBookmarked: false,
        preview: null
      },
      {
        id: 5,
        title: 'Galerie photos - Voyage en Europe',
        url: 'https://photos-example.com/europe-trip',
        type: 'gallery',
        description: 'Photos de voyage à travers l\'Europe',
        date: '2024-01-11',
        conversation: 'Groupe Voyage',
        sender: 'Sophie Martin',
        isBookmarked: true,
        preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=300&h=200&fit=crop'
      }
    ];
    setLinks(mockLinks);
  }, []);

  const getLinkIcon = (type) => {
    switch (type) {
      case 'article': return <FileText size={20} className="text-blue-400" />;
      case 'video': return <Video size={20} className="text-red-400" />;
      case 'shopping': return <ShoppingCart size={20} className="text-green-400" />;
      case 'document': return <FileText size={20} className="text-yellow-400" />;
      case 'gallery': return <Image size={20} className="text-purple-400" />;
      default: return <Globe size={20} className="text-gray-400" />;
    }
  };

  const getLinkTypeLabel = (type) => {
    switch (type) {
      case 'article': return 'Article';
      case 'video': return 'Vidéo';
      case 'shopping': return 'Shopping';
      case 'document': return 'Document';
      case 'gallery': return 'Galerie';
      default: return 'Lien';
    }
  };

  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'lien-invalide.com';
    }
  };

  const handleSelectLink = (linkId) => {
    setSelectedLinks(prev => 
      prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinks.length === links.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(links.map(link => link.id));
    }
  };

  const handleDeleteSelected = () => {
    setLinks(prev => prev.filter(link => !selectedLinks.includes(link.id)));
    setSelectedLinks([]);
  };

  const handleBookmarkLink = (linkId) => {
    setLinks(prev => prev.map(link => 
      link.id === linkId ? { ...link, isBookmarked: !link.isBookmarked } : link
    ));
  };

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      // Ici vous pourriez ajouter une notification de succès
      console.log('Lien copié dans le presse-papiers');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleOpenLink = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const filteredAndSortedLinks = links
    .filter(link => {
      const matchesType = filterType === 'all' || link.type === filterType;
      const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           link.conversation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           link.sender.toLowerCase().includes(searchQuery.toLowerCase());
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
          aValue = new Date(a.date);
          bValue = new Date(b.date);
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
        <h2 className="text-xl font-semibold text-white mb-2">Liens partagés</h2>
        <p className="text-gray-400 text-sm">
          Gérez tous les liens partagés dans vos conversations
        </p>
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Barre de recherche */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des liens..."
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
          <option value="article">Articles</option>
          <option value="video">Vidéos</option>
          <option value="shopping">Shopping</option>
          <option value="document">Documents</option>
          <option value="gallery">Galeries</option>
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
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#1DAA61] text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Actions en lot */}
      {selectedLinks.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-700/30 rounded-lg border border-neutral-600">
          <span className="text-white text-sm">
            {selectedLinks.length} lien(s) sélectionné(s)
          </span>
          <button
            onClick={handleSelectAll}
            className="text-[#1DAA61] hover:text-[#1DAA61]/80 text-sm"
          >
            {selectedLinks.length === links.length ? 'Désélectionner tout' : 'Sélectionner tout'}
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
                checked={selectedLinks.length === links.length && links.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
              />
            </div>
            <div className="col-span-5">
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
                Date
                {getSortIcon('date')}
              </button>
            </div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
        </div>
      )}

      {/* Liste des liens */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredAndSortedLinks.map((link) => (
            <div
              key={link.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all ${
                selectedLinks.includes(link.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedLinks.includes(link.id)}
                    onChange={() => handleSelectLink(link.id)}
                    className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                  />
                </div>

                {/* Titre, description et prévisualisation */}
                <div className="col-span-5">
                  <div className="flex gap-3">
                    {/* Prévisualisation */}
                    <div className="w-16 h-12 bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
                      {link.preview ? (
                        <img 
                          src={link.preview} 
                          alt={link.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getLinkIcon(link.type)}
                        </div>
                      )}
                    </div>

                    {/* Contenu textuel */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-sm font-medium truncate">{link.title}</h3>
                        {link.isBookmarked && (
                          <BookmarkCheck size={14} className="text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-300 text-xs line-clamp-2 mb-1">{link.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Globe size={12} />
                        <span className="truncate">{getDomainFromUrl(link.url)}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {link.conversation} • {link.sender}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {getLinkIcon(link.type)}
                    <span className="text-gray-300 text-sm">{getLinkTypeLabel(link.type)}</span>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <span className="text-gray-300 text-sm">
                    {new Date(link.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex gap-2 justify-center">
                  <button 
                    onClick={() => handleOpenLink(link.url)}
                    className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors"
                    title="Ouvrir le lien"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    onClick={() => handleCopyLink(link.url)}
                    className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors"
                    title="Copier le lien"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={() => handleBookmarkLink(link.id)}
                    className={`p-2 rounded transition-colors ${
                      link.isBookmarked 
                        ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30' 
                        : 'bg-neutral-700/50 hover:bg-neutral-600 text-gray-300'
                    }`}
                    title={link.isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    {link.isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Mode grille */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedLinks.map((link) => (
            <div
              key={link.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all cursor-pointer ${
                selectedLinks.includes(link.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
              onClick={() => handleSelectLink(link.id)}
            >
              {/* Checkbox et bookmark */}
              <div className="flex justify-between items-start mb-3">
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(link.id)}
                  onChange={() => handleSelectLink(link.id)}
                  className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookmarkLink(link.id);
                  }}
                  className={`p-1 rounded transition-colors ${
                    link.isBookmarked 
                      ? 'text-yellow-400 hover:bg-yellow-600/20' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {link.isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
              </div>

              {/* Prévisualisation */}
              <div className="w-full h-32 bg-neutral-700 rounded-lg overflow-hidden mb-3">
                {link.preview ? (
                  <img 
                    src={link.preview} 
                    alt={link.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getLinkIcon(link.type)}
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  {getLinkIcon(link.type)}
                  <span className="text-xs text-gray-400">{getLinkTypeLabel(link.type)}</span>
                </div>
                <h3 className="text-white text-sm font-medium line-clamp-2">{link.title}</h3>
                <p className="text-gray-300 text-xs line-clamp-2">{link.description}</p>
                <div className="text-xs text-gray-400 truncate">
                  {getDomainFromUrl(link.url)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(link.date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2 pt-3 border-t border-neutral-700">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLink(link.url);
                  }}
                  className="flex-1 p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-xs rounded transition-colors"
                >
                  <ExternalLink size={12} className="mx-auto mb-1" />
                  Ouvrir
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyLink(link.url);
                  }}
                  className="flex-1 p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-xs rounded transition-colors"
                >
                  <Copy size={12} className="mx-auto mb-1" />
                  Copier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun lien */}
      {filteredAndSortedLinks.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Link size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Aucun lien trouvé</p>
          <p className="text-sm">
            {searchQuery || filterType !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Vous n\'avez pas encore partagé de liens'
            }
          </p>
        </div>
      )}
    </div>
  );
}
