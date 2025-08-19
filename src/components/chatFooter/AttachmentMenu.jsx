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
    id: 'photos_videos',
    icon: Image,
    label: 'Photos & videos',
    color: '#8B5CF6'
  },
  {
    id: 'camera',
    icon: Camera,
    label: 'Camera',
    color: '#F59E0B'
  },
  {
    id: 'document',
    icon: File,
    label: 'Document',
    color: '#3B82F6'
  },
  {
    id: 'contact',
    icon: User,
    label: 'Contact',
    color: '#10B981'
  },
  {
    id: 'poll',
    icon: BarChart3,
    label: 'Poll',
    color: '#EF4444'
  },
  {
    id: 'drawing',
    icon: FileText,
    label: 'Drawing',
    color: '#F97316'
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
    <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
      <div 
        ref={menuRef}
        className="bg-[#3C4043] rounded-t-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.2s_ease-out] mx-4 mb-4"
      >
        {/* Options Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {ATTACHMENT_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="flex flex-col items-center gap-3 p-4 hover:bg-white/10 rounded-xl transition-all group"
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: option.color }}
                  >
                    <IconComponent 
                      size={24} 
                      className="text-white"
                    />
                  </div>
                  <p className="text-white text-sm font-medium text-center leading-tight">{option.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
