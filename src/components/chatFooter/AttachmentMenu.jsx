import { useState, useRef, useEffect } from 'react';
import { 
  Image, 
  Camera, 
  FileText, 
  Music, 
  MapPin, 
  User, 
  BarChart3, 
  Sticker,
  File,
  Video,
  Mic,
  Image as Gallery,
  Folder
} from 'lucide-react';

const ATTACHMENT_OPTIONS = [
  {
    id: 'document',
    icon: File,
    label: 'Document',
    description: 'Partager un document',
    color: '#00a884'
  },
  {
    id: 'camera',
    icon: Camera,
    label: 'Appareil photo',
    description: 'Prendre une photo',
    color: '#00a884'
  },
  {
    id: 'gallery',
    icon: Gallery,
    label: 'Galerie',
    description: 'Choisir une photo',
    color: '#00a884'
  },
  {
    id: 'audio',
    icon: Mic,
    label: 'Audio',
    description: 'Enregistrer un message vocal',
    color: '#00a884'
  },
  {
    id: 'video',
    icon: Video,
    label: 'Vidéo',
    description: 'Enregistrer une vidéo',
    color: '#00a884'
  },
  {
    id: 'contact',
    icon: User,
    label: 'Contact',
    description: 'Partager un contact',
    color: '#00a884'
  },
  {
    id: 'location',
    icon: MapPin,
    label: 'Localisation',
    description: 'Partager ma localisation',
    color: '#00a884'
  },
  {
    id: 'poll',
    icon: BarChart3,
    label: 'Sondage',
    description: 'Créer un sondage',
    color: '#00a884'
  }
];

export default function AttachmentMenu({ isOpen, onClose, onSelectOption }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') onClose();
      });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleOptionClick = (option) => {
    onSelectOption(option);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div 
        ref={menuRef}
        className="bg-[#202c33] rounded-t-lg shadow-2xl w-full max-w-sm animate-[slideUp_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-medium">Pièces jointes</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {ATTACHMENT_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="flex flex-col items-center gap-2 p-4 hover:bg-white/10 rounded-lg transition-colors group"
                >
                                     <div 
                     className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                     style={{ backgroundColor: `${option.color}20` }}
                   >
                                         <IconComponent 
                       size={20} 
                       style={{ color: option.color }}
                     />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-xs font-medium">{option.label}</p>
                    <p className="text-gray-400 text-xs mt-1">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 text-white bg-[#00a884] hover:bg-[#00a884]/80 rounded-lg transition-colors font-medium"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
