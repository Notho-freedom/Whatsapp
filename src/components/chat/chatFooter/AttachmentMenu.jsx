'use client';

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

export default function AttachmentMenu({ isOpen, onClose, onSelectOption }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const attachmentOptions = [
    {
      id: 'photos-videos',
      label: 'Photos & videos',
      icon: Image,
      action: 'select-media'
    },
    {
      id: 'camera',
      label: 'Camera',
      icon: Camera,
      action: 'open-camera'
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      action: 'select-document'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: User,
      action: 'select-contact'
    },
    {
      id: 'poll',
      label: 'Poll',
      icon: BarChart3,
      action: 'create-poll'
    },
    {
      id: 'drawing',
      label: 'Drawing',
      icon: PenTool,
      action: 'open-drawing'
    }
  ];

  const handleOptionClick = (option) => {
    onSelectOption(option);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="z-50 absolute bottom-full mb-2 w-48 px-1 rounded-lg bg-[#2C2C2C] border-1 border-neutral-800 shadow-lg text-white font-normal animate-in slide-in-from-bottom-2 duration-200"
      style={{ fontSize: '14px', lineHeight: '1.4' }}
    >
      <ul className="py-1">
        {attachmentOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <li
              key={option.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-[#3a3f42] rounded-md cursor-pointer transition-colors"
              onClick={() => handleOptionClick(option)}
            >
              <IconComponent size={18} className="text-white" />
              <span>{option.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
