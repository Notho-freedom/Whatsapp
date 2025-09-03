'use client';

import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Video, 
  Music, 
  File, 
  Download, 
  Share, 
  Trash2, 
  Eye,
  Calendar,
  Filter,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Heart,
  MessageCircle
} from 'lucide-react';

export default function MediaView() {
  const [mediaItems, setMediaItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'size', 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);

  // Données d'exemple pour les médias
  useEffect(() => {
    const mockMedia = [
      {
        id: 1,
        type: 'image',
        name: 'Photo_2024_01.jpg',
        size: 2048576, // 2 MB
        date: '2024-01-15',
        conversation: 'Groupe Famille',
        sender: 'Marie Dupont',
        url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&h=150&fit=crop',
        isLiked: true,
        likes: 3,
        comments: 2,
        dimensions: '1920x1080'
      },
      {
        id: 2,
        type: 'video',
        name: 'video_2024_01.mp4',
        size: 15728640, // 15 MB
        date: '2024-01-14',
        conversation: 'Jean Martin',
        sender: 'Jean Martin',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&h=150&fit=crop',
        isLiked: false,
        likes: 1,
        comments: 0,
        dimensions: '1280x720',
        duration: '00:01:30'
      },
      {
        id: 3,
        type: 'audio',
        name: 'audio_message.mp3',
        size: 524288, // 512 KB
        date: '2024-01-13',
        conversation: 'Groupe Travail',
        sender: 'Pierre Dubois',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        thumbnail: null,
        isLiked: true,
        likes: 2,
        comments: 1,
        duration: '00:00:45'
      },
      {
        id: 4,
        type: 'image',
        name: 'screenshot.png',
        size: 1048576, // 1 MB
        date: '2024-01-12',
        conversation: 'Support Client',
        sender: 'Support Team',
        url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&h=150&fit=crop',
        isLiked: false,
        likes: 0,
        comments: 0,
        dimensions: '1366x768'
      },
      {
        id: 5,
        type: 'video',
        name: 'presentation.mp4',
        size: 31457280, // 30 MB
        date: '2024-01-11',
        conversation: 'Groupe Formation',
        sender: 'Sophie Martin',
        url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=150&h=150&fit=crop',
        isLiked: true,
        likes: 5,
        comments: 3,
        dimensions: '1920x1080',
        duration: '00:05:20'
      }
    ];
    setMediaItems(mockMedia);
  }, []);

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={20} className="text-blue-400" />;
      case 'video': return <Video size={20} className="text-red-400" />;
      case 'audio': return <Music size={20} className="text-green-400" />;
      default: return <File size={20} className="text-gray-400" />;
    }
  };

  const getMediaTypeLabel = (type) => {
    switch (type) {
      case 'image': return 'Image';
      case 'video': return 'Vidéo';
      case 'audio': return 'Audio';
      default: return 'Fichier';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSelectMedia = (mediaId) => {
    setSelectedItems(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === mediaItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(mediaItems.map(item => item.id));
    }
  };

  const handleDeleteSelected = () => {
    setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const handleLikeMedia = (mediaId) => {
    setMediaItems(prev => prev.map(item => 
      item.id === mediaId ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 } : item
    ));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    setVolume(volume > 0 ? 0 : 0.7);
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

  const filteredAndSortedMedia = mediaItems
    .filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.conversation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sender.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
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
        <h2 className="text-xl font-semibold text-white mb-2">Médias partagés</h2>
        <p className="text-gray-400 text-sm">
          Gérez tous les médias partagés dans vos conversations
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
              placeholder="Rechercher des médias..."
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
          <option value="image">Images</option>
          <option value="video">Vidéos</option>
          <option value="audio">Audio</option>
        </select>

        {/* Mode d'affichage */}
        <div className="flex bg-neutral-700/50 rounded-lg p-1">
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
        </div>
      </div>

      {/* Actions en lot */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-700/30 rounded-lg border border-neutral-600">
          <span className="text-white text-sm">
            {selectedItems.length} média(s) sélectionné(s)
          </span>
          <button
            onClick={handleSelectAll}
            className="text-[#1DAA61] hover:text-[#1DAA61]/80 text-sm"
          >
            {selectedItems.length === mediaItems.length ? 'Désélectionner tout' : 'Sélectionner tout'}
          </button>
          <div className="flex gap-2 ml-auto">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded transition-colors">
              <Download size={14} />
              Télécharger
            </button>
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
                checked={selectedItems.length === mediaItems.length && mediaItems.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
              />
            </div>
            <div className="col-span-4">
              <button
                onClick={() => toggleSort('name')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Média et informations
                {getSortIcon('name')}
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
                onClick={() => toggleSort('size')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Taille
                {getSortIcon('size')}
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
            <div className="col-span-1 text-center">Actions</div>
          </div>
        </div>
      )}

      {/* Liste des médias */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredAndSortedMedia.map((item) => (
            <div
              key={item.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all ${
                selectedItems.includes(item.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectMedia(item.id)}
                    className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                  />
                </div>

                {/* Média et informations */}
                <div className="col-span-4">
                  <div className="flex gap-3">
                    {/* Miniature */}
                    <div className="w-16 h-12 bg-neutral-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {getMediaIcon(item.type)}
                        </div>
                      )}
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={16} className="text-white" />
                        </div>
                      )}
                      {item.type === 'audio' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Music size={16} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* Contenu textuel */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-sm font-medium truncate">{item.name}</h3>
                        <button
                          onClick={() => handleLikeMedia(item.id)}
                          className={`text-sm ${item.isLiked ? 'text-red-400' : 'text-gray-400'}`}
                        >
                          ♥
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <span>{item.likes} j'aime</span>
                        <span>•</span>
                        <span>{item.comments} commentaires</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {item.conversation} • {item.sender}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    {getMediaIcon(item.type)}
                    <span className="text-gray-300 text-sm">{getMediaTypeLabel(item.type)}</span>
                  </div>
                </div>

                {/* Taille */}
                <div className="col-span-2">
                  <span className="text-gray-300 text-sm">{formatFileSize(item.size)}</span>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <span className="text-gray-300 text-sm">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex gap-2 justify-center">
                  <button 
                    onClick={() => setSelectedMedia(item)}
                    className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors"
                    title="Voir le média"
                  >
                    <Eye size={14} />
                  </button>
                  <button className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors">
                    <Download size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Mode grille */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedMedia.map((item) => (
            <div
              key={item.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all cursor-pointer ${
                selectedItems.includes(item.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
              onClick={() => handleSelectMedia(item.id)}
            >
              {/* Checkbox et like */}
              <div className="flex justify-between items-start mb-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectMedia(item.id)}
                  className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeMedia(item.id);
                  }}
                  className={`text-lg ${item.isLiked ? 'text-red-400' : 'text-gray-400'}`}
                >
                  ♥
                </button>
              </div>

              {/* Miniature */}
              <div className="w-full h-32 bg-neutral-700 rounded-lg overflow-hidden mb-3 relative">
                {item.thumbnail ? (
                  <img 
                    src={item.thumbnail} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {getMediaIcon(item.type)}
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play size={24} className="text-white" />
                  </div>
                )}
                {item.type === 'audio' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Music size={24} className="text-white" />
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  {getMediaIcon(item.type)}
                  <span className="text-xs text-gray-400">{getMediaTypeLabel(item.type)}</span>
                </div>
                <h3 className="text-white text-sm font-medium line-clamp-2">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{item.likes} j'aime</span>
                  <span>•</span>
                  <span>{item.comments} commentaires</span>
                </div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(item.size)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2 pt-3 border-t border-neutral-700">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMedia(item);
                  }}
                  className="flex-1 p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-xs rounded transition-colors"
                >
                  <Eye size={12} className="mx-auto mb-1" />
                  Voir
                </button>
                <button className="flex-1 p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-xs rounded transition-colors">
                  <Download size={12} className="mx-auto mb-1" />
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun média */}
      {filteredAndSortedMedia.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Image size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Aucun média trouvé</p>
          <p className="text-sm">
            {searchQuery || filterType !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Vous n\'avez pas encore partagé de médias'
            }
          </p>
        </div>
      )}

      {/* Modal de visualisation des médias */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Bouton fermer */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 p-2 bg-neutral-800/50 hover:bg-neutral-700 text-white rounded-lg transition-colors z-10"
            >
              ✕
            </button>

            {/* Contenu du média */}
            <div className="max-w-4xl w-full max-h-full">
              {selectedMedia.type === 'image' && (
                <div className="text-center">
                  <img 
                    src={selectedMedia.url} 
                    alt={selectedMedia.name}
                    className="max-w-full max-h-full object-contain mx-auto"
                  />
                  <div className="mt-4 text-white text-center">
                    <h3 className="text-lg font-medium mb-2">{selectedMedia.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {selectedMedia.dimensions} • {formatFileSize(selectedMedia.size)}
                    </p>
                  </div>
                </div>
              )}

              {selectedMedia.type === 'video' && (
                <div className="text-center">
                  <video 
                    src={selectedMedia.url} 
                    controls
                    className="max-w-full max-h-full mx-auto"
                    poster={selectedMedia.thumbnail}
                  />
                  <div className="mt-4 text-white text-center">
                    <h3 className="text-lg font-medium mb-2">{selectedMedia.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {selectedMedia.dimensions} • {selectedMedia.duration} • {formatFileSize(selectedMedia.size)}
                    </p>
                  </div>
                </div>
              )}

              {selectedMedia.type === 'audio' && (
                <div className="text-center">
                  <div className="w-64 h-64 bg-neutral-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Music size={64} className="text-gray-400" />
                  </div>
                  <audio 
                    src={selectedMedia.url} 
                    controls
                    className="w-full max-w-md mx-auto"
                  />
                  <div className="mt-4 text-white text-center">
                    <h3 className="text-lg font-medium mb-2">{selectedMedia.name}</h3>
                    <p className="text-gray-300 text-sm">
                      {selectedMedia.duration} • {formatFileSize(selectedMedia.size)}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-4 mt-6">
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white rounded-lg transition-colors">
                  <Download size={16} />
                  Télécharger
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white rounded-lg transition-colors">
                  <Share size={16} />
                  Partager
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white rounded-lg transition-colors">
                  <Maximize2 size={16} />
                  Plein écran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
