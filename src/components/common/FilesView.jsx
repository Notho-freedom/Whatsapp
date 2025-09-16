'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  File, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileArchive,
  Download, 
  Share, 
  Trash2, 
  Eye,
  Calendar,
  Search,
  Folder,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react';

export default function FilesView() {
  const [files, setFiles] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'size', 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'

  // Données d'exemple pour les fichiers
  useEffect(() => {
    const mockFiles = [
      {
        id: 1,
        name: 'rapport_2024.pdf',
        type: 'pdf',
        size: 2048576, // 2 MB en bytes
        date: '2024-01-15',
        conversation: 'Groupe Travail',
        sender: 'Marie Dupont',
        isStarred: true
      },
      {
        id: 2,
        name: 'presentation.pptx',
        type: 'presentation',
        size: 15728640, // 15 MB
        date: '2024-01-14',
        conversation: 'Jean Martin',
        sender: 'Jean Martin',
        isStarred: false
      },
      {
        id: 3,
        name: 'budget_2024.xlsx',
        type: 'spreadsheet',
        size: 524288, // 512 KB
        date: '2024-01-13',
        conversation: 'Groupe Finance',
        sender: 'Pierre Dubois',
        isStarred: true
      },
      {
        id: 4,
        name: 'contrat_final.docx',
        type: 'document',
        size: 1048576, // 1 MB
        date: '2024-01-12',
        conversation: 'Avocat Cabinet',
        sender: 'Me. Durand',
        isStarred: false
      },
      {
        id: 5,
        name: 'logo_entreprise.ai',
        type: 'design',
        size: 8388608, // 8 MB
        date: '2024-01-11',
        conversation: 'Designer',
        sender: 'Sophie Design',
        isStarred: true
      }
    ];
    setFiles(mockFiles);
  }, []);

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText size={20} className="text-red-400" />;
      case 'document': return <FileText size={20} className="text-blue-400" />;
      case 'spreadsheet': return <File size={20} className="text-green-400" />;
      case 'presentation': return <File size={20} className="text-orange-400" />;
      case 'design': return <FileImage size={20} className="text-purple-400" />;
      case 'image': return <FileImage size={20} className="text-blue-400" />;
      case 'video': return <FileVideo size={20} className="text-red-400" />;
      case 'audio': return <FileAudio size={20} className="text-green-400" />;
      case 'archive': return <FileArchive size={20} className="text-yellow-400" />;
      default: return <File size={20} className="text-gray-400" />;
    }
  };

  const getFileTypeLabel = (type) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'document': return 'Document Word';
      case 'spreadsheet': return 'Tableur Excel';
      case 'presentation': return 'Présentation PowerPoint';
      case 'design': return 'Fichier de design';
      case 'image': return 'Image';
      case 'video': return 'Vidéo';
      case 'audio': return 'Audio';
      case 'archive': return 'Archive';
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

  const handleSelectFile = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleDeleteSelected = () => {
    setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
    setSelectedFiles([]);
  };

  const handleStarFile = (fileId) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, isStarred: !file.isStarred } : file
    ));
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

  const filteredAndSortedFiles = files
    .filter(file => {
      const matchesType = filterType === 'all' || file.type === filterType;
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.conversation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.sender.toLowerCase().includes(searchQuery.toLowerCase());
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
        <h2 className="text-xl font-semibold text-white mb-2">Fichiers partagés</h2>
        <p className="text-gray-400 text-sm">
          Gérez tous les fichiers partagés dans vos conversations
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
              placeholder="Rechercher des fichiers..."
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
          <option value="pdf">PDF</option>
          <option value="document">Documents Word</option>
          <option value="spreadsheet">Tableurs Excel</option>
          <option value="presentation">Présentations</option>
          <option value="design">Fichiers de design</option>
          <option value="image">Images</option>
          <option value="video">Vidéos</option>
          <option value="audio">Audio</option>
          <option value="archive">Archives</option>
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
      {selectedFiles.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-700/30 rounded-lg border border-neutral-600">
          <span className="text-white text-sm">
            {selectedFiles.length} fichier(s) sélectionné(s)
          </span>
          <button
            onClick={handleSelectAll}
            className="text-[#1DAA61] hover:text-[#1DAA61]/80 text-sm"
          >
            {selectedFiles.length === files.length ? 'Désélectionner tout' : 'Sélectionner tout'}
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
                checked={selectedFiles.length === files.length && files.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
              />
            </div>
            <div className="col-span-4">
              <button
                onClick={() => toggleSort('name')}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Nom du fichier
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

      {/* Liste des fichiers */}
      {viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredAndSortedFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all ${
                selectedFiles.includes(file.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleSelectFile(file.id)}
                    className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                  />
                </div>

                {/* Nom et icône */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-sm font-medium truncate">{file.name}</h3>
                      {file.isStarred && (
                        <button
                          onClick={() => handleStarFile(file.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          ★
                        </button>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {file.conversation} • {file.sender}
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <span className="text-gray-300 text-sm">{getFileTypeLabel(file.type)}</span>
                </div>

                {/* Taille */}
                <div className="col-span-2">
                  <span className="text-gray-300 text-sm">{formatFileSize(file.size)}</span>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <span className="text-gray-300 text-sm">
                    {new Date(file.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex gap-2 justify-center">
                  <button className="p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 rounded transition-colors">
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
          {filteredAndSortedFiles.map((file) => (
            <div
              key={file.id}
              className={`bg-neutral-800/50 rounded-lg p-3 border-2 transition-all cursor-pointer ${
                selectedFiles.includes(file.id) 
                  ? 'border-[#1DAA61] bg-neutral-700/70' 
                  : 'border-transparent hover:border-neutral-600'
              }`}
              onClick={() => handleSelectFile(file.id)}
            >
              {/* Checkbox */}
              <div className="flex justify-end mb-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  className="w-4 h-4 text-[#1DAA61] bg-neutral-700 border-neutral-600 rounded focus:ring-[#1DAA61] focus:ring-2"
                />
              </div>

              {/* Icône du fichier */}
              <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                {getFileIcon(file.type)}
              </div>

              {/* Informations */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-white text-sm font-medium truncate">{file.name}</h3>
                  {file.isStarred && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStarFile(file.id);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 text-sm"
                    >
                      ★
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {getFileTypeLabel(file.type)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(file.date).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {file.conversation}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-700">
                <button className="flex-1 p-2 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-xs rounded transition-colors">
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

      {/* Message si aucun fichier */}
      {filteredAndSortedFiles.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Aucun fichier trouvé</p>
          <p className="text-sm">
            {searchQuery || filterType !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Vous n\'avez pas encore partagé de fichiers'
            }
          </p>
        </div>
      )}
    </div>
  );
}
