import { Menu, MessageCircle, Phone, CircleCheckBigIcon, Star, Archive, Settings, CircleDivide, CircleDashedIcon, LucideMessageCircleDashed, CircleSlashed, CircleDashed, CircleDotDashed, CircleGauge, CircleOffIcon, MessageCircleReply, MessageCircleMore, MessageCircleWarningIcon, LucideMessageCircle, CirclePlayIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Sidebar() {
  const { activeTab, setActiveTab } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleTabClick = (tab) => setActiveTab(tab);

  const isActive = (tab) => activeTab === tab;
  const ActiveIndicator = () => (
    <div className="h-4 w-[3px] bg-[#1DAA61] rounded-lg absolute left-0" />
  );

  const SidebarButton = ({ tab, icon: Icon, label, badgeCount, badgeColor = 'bg-[#1DAA61]', status = false }) => (
    <div className="flex items-center relative">
      {isActive(tab) && <ActiveIndicator />}
      <button
        aria-label={label}
        className={`relative flex items-center ${
          isSidebarOpen 
            ? 'w-full px-2 py-1.5 rounded hover:bg-whatsapp-dark-700/50' 
            : 'w-[38px] justify-center rounded-[4px]'
        } transition-colors h-9 ${isActive(tab) ? 'bg-whatsapp-dark-700/50' : ' hover:bg-whatsapp-dark-700/50'}`}
        onClick={() => handleTabClick(tab)}
      >
        {tab === 'status' ? (
          <svg width="18" height="18" viewBox="0 0 24 24" className={`${isSidebarOpen ? 'ml-1' : ''} text-white rotate-[38deg]`}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="18 3"/>
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
          </svg>) 
    : <Icon size={17} className={`${isSidebarOpen ? 'ml-1' : ''} text-white`} />}
        {isSidebarOpen ? (
          <>
            <span className="ml-3 text-white text-sm">{label}</span>
            {badgeCount && (
              <span className={`ml-auto ${badgeColor} text-[70%] font-semibold rounded-full ${status ? 'w-1.5 h-1.5' : 'w-4 h-4'} flex items-center justify-center ${
                badgeColor === 'bg-[#FF99A4]' ? 'text-black' : 'text-whatsapp-dark-950'
              }`}>
                {!status && badgeCount}
              </span>
            )}
          </>
        ) : (
          badgeCount && (
            <span className={`absolute ${badgeColor} text-[70%] font-semibold rounded-full  ${status ? 'top-[5px] right-[6px] w-1.5 h-1.5' : ' top-[2px] right-[2px] w-3.5 h-3.5 p-2'} flex items-center justify-center ${
              badgeColor === 'bg-[#FF99A4]' ? 'text-black' : 'text-whatsapp-dark-950'
            }`}>
              {!status && badgeCount}
            </span>
          )
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* Version réduite toujours visible */}
      <div className="fixed left-0 top-0 h-full w-8 min-w-[50px] bg-[#202020] z-30 flex flex-col">
        
        <div className="py-6 flex flex-col flex-1 mt-7">
          <button
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            className="flex items-center justify-center self-center mb-3 rounded-md w-10 h-10 hover:bg-whatsapp-dark-700 mx-auto"
          >
            <Menu size={27} className="text-white p-1" />
          </button>
          
          {/* Icônes du haut */}
          <nav className="flex flex-col px-1 space-y-1">
            <SidebarButton tab="chats" icon={MessageCircle} label="Chats" badgeCount={2} />
            <SidebarButton tab="calls" icon={Phone} label="Calls" badgeColor="bg-[#FF99A4]" />
            <SidebarButton tab="status" icon={CirclePlayIcon} label="Status" status={true} badgeCount={1}/>
          </nav>
          
          {/* Icônes du bas poussées vers le bas */}
          <nav className="flex flex-col px-1 mt-auto space-y-[6.5px] -mb-4">
            <SidebarButton tab="star" icon={Star} label="Star" />
            <SidebarButton tab="archive" icon={Archive} label="Archive" badgeCount={1} />

            <div className="w-[90%] self-center border-t border-neutral-700 my-1 px-0.5" />

            <SidebarButton tab="settings" icon={Settings} label="Settings" />
            <div className="flex items-center relative">
                  {isActive('profile') && <ActiveIndicator />}
                  <button
                    aria-label="Profile"
                    className="relative flex items-center w-full px-2 py-1.5 rounded hover:bg-whatsapp-dark-700/50"
                    onClick={() => handleTabClick('profile')}
                  >
                    <div className="w-6 h-6 rounded-full bg-neutral-700/95 flex items-center justify-center overflow-hidden">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Version étendue avec logo WhatsApp visible */}
      {isSidebarOpen && (
        <>
          
          {/* Panneau latéral */}
          <div className="fixed rounded-r-lg left-0 top-0 h-full w-54 min-w-[235px] bg-[#2C2C2C]/80 backdrop-blur-[30px] z-50 border-r border-neutral-700 flex flex-col">
            
            <div className="py-6 flex flex-col flex-1 relative mt-7">
              <button
                aria-label="Toggle sidebar"
                onClick={toggleSidebar}
                className="flex items-center justify-start px-1 ml-1 mb-3 rounded-md w-10 h-10 hover:bg-whatsapp-dark-700/50">
                <Menu size={27} className="text-white p-1" />
              </button>

              <nav className="flex flex-col px-1 space-y-1">
                <SidebarButton tab="chats" icon={MessageCircle} label="Chats" badgeCount={2} />
                <SidebarButton tab="calls" icon={Phone} label="Calls" badgeColor="bg-[#FF99A4]" />
                <SidebarButton tab="status" icon={CircleCheckBigIcon} label="Status" status={true} badgeCount={1} />
              </nav>

              <nav className="flex flex-col px-1 mt-auto space-y-[6.5px] -mb-4">
                <SidebarButton tab="star" icon={Star} label="Starred messages" />
                <SidebarButton tab="archive" icon={Archive} label="Archived chats" badgeCount={1} />
                
                <div className="w-full border-t border-neutral-700 my-1 px-0.5" />

                <SidebarButton tab="settings" icon={Settings} label="Settings" />
                
                <div className="flex items-center relative">
                  {isActive('profile') && <ActiveIndicator />}
                  <button
                    aria-label="Profile"
                    className="relative flex items-center w-full px-2 py-1.5 rounded hover:bg-whatsapp-dark-700/50"
                    onClick={() => handleTabClick('profile')}
                  >
                    <div className="w-6 h-6 rounded-full bg-neutral-700/95 flex items-center justify-center overflow-hidden">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-3 text-white text-sm">Profile</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}