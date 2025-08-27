import React from 'react';
import { 
  Info, 
  Shield, 
  Users, 
  Calendar, 
  Link, 
  FileText, 
  Image,
  Settings,
  Monitor, // For General
  Key,     // For Account
  MessageCircle, // For Chats
  Video,   // For Video & voice
  Bell,    // For Notifications
  Pencil,  // For Personalization
  HardDrive, // For Storage
  Keyboard, // For Shortcuts
  HelpCircle, // For Help
  Database // For Cache
} from 'lucide-react';

const ProfilePanel = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: Info },
    { id: 'media', label: 'Médias', icon: Image },
    { id: 'files', label: 'Fichiers', icon: FileText },
    { id: 'links', label: 'Liens', icon: Link },
    { id: 'events', label: 'Événements', icon: Calendar },
    { id: 'encryption', label: 'Chiffrement', icon: Shield },
    { id: 'groups', label: 'Groupes', icon: Users },
    //separateur
    { id: 'separator' },
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'account', label: 'Account', icon: Key },
    { id: 'chats', label: 'Chats', icon: MessageCircle },
    { id: 'video_voice', label: 'Video & voice', icon: Video },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'personalization', label: 'Personalization', icon: Pencil },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'cache', label: 'Cache', icon: Database },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
    { id: 'separator' },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];
  return (
    <div className="w-full rounded-tl-xl bg-transparent h-full overflow-y-auto">
      {/* Header du panel */}
      <div className="p-4 rounded-tl-xl bg-[#2C2C2C] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-[#1DAA61]" />
          <h3 className="text-sm font-medium text-white">My Profil</h3>
        </div>
      </div>

      {/* Navigation des onglets */}
      <nav className="p-1.5">
        {tabs.map((tab, index) => {
          if (tab.id === 'separator') {
            return <div key={`separator-${index}`} className="w-[90%] mx-auto h-px bg-neutral-700/50 my-2"></div>;
          }
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-3 my-1 rounded-md transition-colors text-left ${
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

    </div>
  );
};

export default ProfilePanel;
