import { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  Camera, 
  FileText, 
  User, 
  BarChart3, 
  PenTool,
  X
} from 'lucide-react';

const AttachmentMenu = ({ isOpen, onClose, onSelectOption, position = 'bottom' }) => {
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

  if (!isOpen) return null;

  const attachmentOptions = [
    {
      id: 'photos-videos',
      label: 'Photos & videos',
      icon: Image,
      description: 'Share photos and videos'
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      description: 'Take a photo or video'
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      description: 'Share a document'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: User,
      description: 'Share a contact'
    },
    {
      id: 'poll',
      label: 'Poll',
      icon: BarChart3,
      description: 'Create a poll'
    },
    {
      id: 'drawing',
      label: 'Drawing',
      icon: PenTool,
      description: 'Create a drawing'
    }
  ];

  const handleOptionClick = (optionId) => {
    onSelectOption(optionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div 
        ref={menuRef}
        className={`relative bg-[#2C2C2C] rounded-lg shadow-2xl border border-neutral-700 min-w-[280px] max-w-[320px] animate-[slideUp_0.2s_ease-out] ${
          position === 'top' ? 'mb-2' : 'mt-2'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <h3 className="text-white font-medium text-sm">Share</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-700/50 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Options */}
        <div className="py-2">
          {attachmentOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-700/50 transition-colors text-left group"
              >
                <div className="w-10 h-10 bg-neutral-700/50 rounded-lg flex items-center justify-center group-hover:bg-neutral-600 transition-colors">
                  <IconComponent size={20} className="text-gray-300" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{option.label}</div>
                  <div className="text-gray-400 text-xs">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttachmentMenu;
