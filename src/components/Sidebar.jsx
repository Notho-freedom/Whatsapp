import { Menu, MessageCircle, Phone, Circle, Star, Archive, Settings, UserCircle } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, toggleSidebar } = useAppContext();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <aside className="flex flex-col bg-whatsapp-dark-900 w-10 min-w-[50px] py-6">
      {/* Toggle button top */}
      <button
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className="mb-4 flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 self-center transition-colors"
      >
        <Menu size={20} className="text-gray-400" />
      </button>

      {/* Top icons vertical */}
      <nav className="flex flex-col items-center space-y-6">
        <button
          aria-label="Chats"
          className={`relative flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'chats' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('chats')}
        >
          <MessageCircle
            size={20}
            className={activeTab === 'chats' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
          <span className="absolute -top-1 -right-1 bg-whatsapp-primary text-[8px] font-semibold rounded-full w-3.5 h-3.5 flex items-center justify-center text-whatsapp-dark-950">
            2
          </span>
        </button>

        <button
          aria-label="Calls"
          className={`relative flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'calls' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('calls')}
        >
          <Phone
            size={20}
            className={activeTab === 'calls' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
          <span className="absolute -top-1 -right-1 bg-red-400 text-[8px] font-semibold rounded-full w-3.5 h-3.5 flex items-center justify-center text-white">
            1
          </span>
        </button>

        <button
          aria-label="Status"
          className={`flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'status' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('status')}
        >
          <Circle
            size={20}
            className={activeTab === 'status' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
        </button>
      </nav>

      {/* Bottom icons vertical */}
      <nav className="flex flex-col items-center space-y-6 mt-auto">
        <button
          aria-label="Star"
          className={`relative flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'star' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('star')}
        >
          <Star
            size={20}
            className={activeTab === 'star' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
          <span className="absolute -top-1 -right-1 bg-whatsapp-primary text-[8px] font-semibold rounded-full w-3.5 h-3.5 flex items-center justify-center text-whatsapp-dark-950">
            1
          </span>
        </button>

        <button
          aria-label="Archive"
          className={`flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'archive' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('archive')}
        >
          <Archive
            size={20}
            className={activeTab === 'archive' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
        </button>

        <button
          aria-label="Settings"
          className={`flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'settings' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('settings')}
        >
          <Settings
            size={20}
            className={activeTab === 'settings' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
        </button>

        <button
          aria-label="Profile"
          className={`flex items-center justify-center w-7 h-7 rounded-md hover:bg-whatsapp-dark-700 transition-colors ${
            activeTab === 'profile' ? 'bg-whatsapp-dark-700' : ''
          }`}
          onClick={() => handleTabClick('profile')}
        >
          <UserCircle
            size={20}
            className={activeTab === 'profile' ? 'text-whatsapp-primary' : 'text-gray-400'}
          />
        </button>
      </nav>
    </aside>
  );
}
