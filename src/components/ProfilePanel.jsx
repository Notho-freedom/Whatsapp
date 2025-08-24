import React from 'react';
import { 
  Info, 
  Shield, 
  Users, 
  Calendar, 
  Link, 
  FileText, 
  Image,
  Settings
} from 'lucide-react';

const ProfilePanel = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: Info },
    { id: 'media', label: 'Médias', icon: Image },
    { id: 'files', label: 'Fichiers', icon: FileText },
    { id: 'links', label: 'Liens', icon: Link },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'encryption', label: 'Chiffrement', icon: Shield },
    { id: 'groups', label: 'Groupes', icon: Users }
  ];

  return (
    <div className="w-full rounded-tl-xl bg-transparent border-r border-neutral-700/50 h-full">
      {/* Header du panel */}
      <div className="p-4 border-b border-neutral-700 rounded-tl-xl bg-transparent">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-[#1DAA61]" />
          <h3 className="text-sm font-medium text-white">My Profil</h3>
        </div>
      </div>

      {/* Navigation des onglets */}
      <nav className="p-1.5">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-3 rounded-md transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-neutral-700/50 text-white border-l-2 border-[#1DAA61]'
                  : 'text-gray-300 hover:bg-neutral-700/50'
              }`}
            >
              <IconComponent size={17} />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer du panel */}
      <div className="absolute bottom-0 left-0 w-48 p-3 border-t border-neutral-700 bg-[#202020]">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Profil WhatsApp Clone
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
