import { Menu, MessageCircle, Phone, CircleCheckBigIcon, Star, Archive, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleTabClick = (tab) => setActiveTab(tab);

  const isActive = (tab) => activeTab === tab;
  const ActiveIndicator = () => (
    <div className="h-4 w-[3px] bg-[#1DAA61] rounded-lg absolute z-10" />
  );

  const SidebarButton = ({ tab, icon: Icon, label, badgeCount, badgeColor = 'bg-[#1DAA61]' }) => (
    <div className="flex items-center">
      {isActive(tab) && <ActiveIndicator />}
      <button
        aria-label={label}
        className={`relative flex items-center ${
          isSidebarOpen 
            ? `w-full px-2 py-1.5 rounded` 
            : 'w-[38px] h-9 justify-center rounded-[4px] hover:bg-whatsapp-dark-700'
        } transition-colors  ${isActive(tab) ? 'bg-whatsapp-dark-700/50' : 'hover:bg-whatsapp-dark-700/50'}`}
        onClick={() => handleTabClick(tab)}
      >
        <Icon size={17} className="text-white" />
        {isSidebarOpen ? (
          <>
            <span className="ml-3 text-white text-sm">{label}</span>
            {badgeCount && (
              <span className={`ml-auto ${badgeColor} text-[70%] font-semibold rounded-full w-4 h-4 flex items-center justify-center ${
                badgeColor === 'bg-[#FF99A4]' ? 'text-black' : 'text-whatsapp-dark-950'
              }`}>
                {badgeCount}
              </span>
            )}
          </>
        ) : (
          badgeCount && (
            <span className={`absolute top-[2px] right-[2px] ${badgeColor} text-[70%] p-2 font-semibold rounded-full w-3.5 h-3.5 flex items-center justify-center ${
              badgeColor === 'bg-[#FF99A4]' ? 'text-black' : 'text-whatsapp-dark-950'
            }`}>
              {badgeCount}
            </span>
          )
        )}
      </button>
    </div>
  );

  return (
    <aside className={`flex flex-col ${isSidebarOpen ? ' bg-[#2C2C2C]/65 backdrop-blur-[30px] w-64 min-w-[256px] absolute z-40 h-full border-r border-neutral-700' : 'w-10 min-w-[50px] bg-[#202020]'} py-6 transition-all duration-100`}>
      {/* Toggle button */}
      <button
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
        className={`flex items-center ${isSidebarOpen ? 'justify-start px-1 ml-1 w-auto' : 'justify-center self-center hover:bg-whatsapp-dark-700'} mb-4 transition-colors rounded-md w-7 h-7`}
      >
        <Menu size={30} className="text-white rounded-md justify-center p-1 self-center hover:bg-whatsapp-dark-700" />
      </button>

      {/* Top icons */}
      <nav className={`flex flex-col ${isSidebarOpen ? 'px-2' : 'pl-[6px]'} space-y-1`}>
        <SidebarButton tab="chats" icon={MessageCircle} label="Chats" badgeCount={2} />
        <SidebarButton tab="calls" icon={Phone} label="Calls" badgeCount={1} badgeColor="bg-[#FF99A4]" />
        <SidebarButton tab="status" icon={CircleCheckBigIcon} label="Status" />
      </nav>

      {/* Bottom icons */}
      <nav className={`flex flex-col ${isSidebarOpen ? 'px-2 mb-2 mt-auto' : 'items-center mt-auto space-y-1'}`} >
        <SidebarButton tab="star" icon={Star} label="Star" badgeCount={1} />
        <SidebarButton tab="archive" icon={Archive} label="Archive" />
        
        {/* Divider */}
        <div className={`${isSidebarOpen ? 'w-full' : 'w-[32px]'} border-t border-gray-700/100 my-1 justify-center`} />

        <SidebarButton tab="settings" icon={Settings} label="Settings" />
        
        {/* Profile with custom avatar */}
        <div className="flex items-center">
          {isActive('profile') && <ActiveIndicator />}
          <button
            aria-label="Profile"
            className={`relative flex items-center ${isSidebarOpen ? 'w-full px-2 py-1.5 rounded' : 'w-7 h-7 justify-center rounded-md'} hover:bg-whatsapp-dark-700 transition-colors ${
              isActive('profile') ? 'bg-whatsapp-dark-700' : ''
            }`}
            onClick={() => handleTabClick('profile')}
          >
            <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden">
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            {isSidebarOpen && <span className="ml-3 text-white text-sm">Profile</span>}
          </button>
        </div>
      </nav>
    </aside>
  );
}