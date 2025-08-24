import { Menu, MessageCircle, Phone, CircleCheckBigIcon, Star, Archive, Settings, CircleDivide, CircleDashedIcon, LucideMessageCircleDashed, CircleSlashed, CircleDashed, CircleDotDashed, CircleGauge, CircleOffIcon, MessageCircleReply, MessageCircleMore, MessageCircleWarningIcon, LucideMessageCircle, CirclePlayIcon } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useState, useMemo } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useTheme } from '@/utils/themeManager';

export default function Sidebar() {
  const { activeTab, setActiveTab, messages } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { getThemeStyles } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Émettre un événement pour notifier l'application du changement d'onglet
    window.dispatchEvent(new CustomEvent('tab-changed', { 
      detail: { 
        tab,
        timestamp: new Date()
      } 
    }));
    
    // Actions spécifiques selon l'onglet
    switch (tab) {
      case 'calls':
        // Ouvrir l'écran des appels
        window.dispatchEvent(new CustomEvent('open-calls', { 
          detail: { action: 'show' } 
        }));
        break;
      case 'status':
        // Ouvrir l'écran des statuts
        window.dispatchEvent(new CustomEvent('open-status', { 
          detail: { action: 'show' } 
        }));
        break;
      case 'star':
        // Ouvrir les messages favoris
        window.dispatchEvent(new CustomEvent('open-starred', { 
          detail: { action: 'show' } 
        }));
        break;
      case 'archive':
        // Ouvrir les chats archivés
        window.dispatchEvent(new CustomEvent('open-archived', { 
          detail: { action: 'show' } 
        }));
        break;
      case 'settings':
        // Ouvrir les paramètres
        window.dispatchEvent(new CustomEvent('open-settings', { 
          detail: { action: 'show' } 
        }));
        break;
      case 'profile':
        // Ouvrir le profil
        window.dispatchEvent(new CustomEvent('open-profile', { 
          detail: { action: 'show' } 
        }));
        break;
      default:
        break;
    }
  };

  // Compter les messages favoris
  const starredMessagesCount = useMemo(() => {
    let count = 0;
    Object.values(messages).forEach(chatMessages => {
      chatMessages.forEach(message => {
        if (message.isStarred) {
          count++;
        }
      });
    });
    return count===0 ? null : count;
  }, [messages]);

  const isActive = (tab) => activeTab === tab;
  const ActiveIndicator = () => (
    <div 
      className="h-4 w-[3px] rounded-lg absolute left-0"
      style={getThemeStyles('sidebar.indicator.active', { backgroundColor: '#1DAA61' })}
    />
  );

  const SidebarButton = ({ tab, icon: Icon, label, badgeCount, badgeColor = 'bg-[#1DAA61]', status = false }) => {
    // Déterminer la couleur du badge basée sur le thème
    const getBadgeStyles = () => {
      if (badgeColor === 'bg-[#1DAA61]') {
        return getThemeStyles('sidebar.badges.green', { backgroundColor: '#1DAA61' });
      } else if (badgeColor === 'bg-[#FF99A4]') {
        return getThemeStyles('sidebar.badges.pink', { backgroundColor: '#FF99A4' });
      }
      return {};
    };

    const getBadgeTextStyles = () => {
      if (badgeColor === 'bg-[#1DAA61]') {
        return getThemeStyles('sidebar.badges.text.green', { color: '#0a0a0a' });
      } else if (badgeColor === 'bg-[#FF99A4]') {
        return getThemeStyles('sidebar.badges.text.pink', { color: '#000000' });
      }
      return {};
    };

    return (
      <div className="flex items-center relative">
        {isActive(tab) && <ActiveIndicator />}
        <button
          aria-label={label}
          className={`relative flex items-center ${
            isSidebarOpen 
              ? 'w-full px-2 py-1.5 rounded' 
              : 'w-[38px] justify-center rounded-[4px]'
          } transition-colors h-9`}
          style={{
            ...(isActive(tab) 
              ? getThemeStyles('sidebar.buttons.background.active', { backgroundColor: 'rgba(68, 68, 68, 0.5)' })
              : getThemeStyles('sidebar.buttons.background.default', { backgroundColor: 'transparent' })
            )
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = getThemeStyles('sidebar.buttons.background.hover', { backgroundColor: 'rgba(68, 68, 68, 0.5)' }).backgroundColor;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = isActive(tab) 
              ? getThemeStyles('sidebar.buttons.background.active', { backgroundColor: 'rgba(68, 68, 68, 0.5)' }).backgroundColor
              : getThemeStyles('sidebar.buttons.background.default', { backgroundColor: 'transparent' }).backgroundColor;
          }}
          onClick={() => handleTabClick(tab)}
        >
          {tab === 'status' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" className={`${isSidebarOpen ? 'ml-1' : ''} rotate-[38deg]`} style={getThemeStyles('sidebar.buttons.icon', { color: '#ffffff' })}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="18 3"/>
                  <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
            </svg>) 
        : <Icon size={17} className={`${isSidebarOpen ? 'ml-1' : ''}`} style={getThemeStyles('sidebar.buttons.icon', { color: '#ffffff' })} />}
          {isSidebarOpen ? (
            <>
              <span className="ml-3 text-sm" style={getThemeStyles('sidebar.buttons.text', { color: '#ffffff' })}>{label}</span>
              {badgeCount && (
                <span 
                  className={`ml-auto text-[70%] font-semibold rounded-full ${status ? 'w-1.5 h-1.5' : 'w-4 h-4'} flex items-center justify-center`}
                  style={{
                    ...getBadgeStyles(),
                    ...getBadgeTextStyles()
                  }}
                >
                  {!status && badgeCount}
                </span>
              )}
            </>
          ) : (
            badgeCount && (
              <span 
                className={`absolute text-[70%] font-semibold rounded-full ${status ? 'top-[5px] right-[6px] w-1.5 h-1.5' : ' top-[2px] right-[2px] w-3.5 h-3.5 p-2'} flex items-center justify-center`}
                style={{
                  ...getBadgeStyles(),
                  ...getBadgeTextStyles()
                }}
              >
                {!status && badgeCount}
              </span>
            )
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Version réduite toujours visible */}
      <div 
        className="fixed left-0 top-0 h-full w-8 min-w-[50px] z-30 flex flex-col"
        style={getThemeStyles('sidebar.background.reduced', { backgroundColor: '#202020' })}
      >
        
        <div className="py-6 flex flex-col flex-1 mt-7">
          <button
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            className="flex items-center justify-center self-center mb-3 rounded-md w-10 h-10 mx-auto"
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = getThemeStyles('sidebar.buttons.background.hover', { backgroundColor: 'rgba(68, 68, 68, 0)' }).backgroundColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Menu size={27} className="p-1" style={getThemeStyles('sidebar.buttons.icon', { color: '#ffffff' })} />
          </button>
          
          {/* Icônes du haut */}
          <nav className="flex flex-col px-1 space-y-1">
            <SidebarButton tab="chats" icon={MessageCircle} label="Chats" badgeCount={2} />
            <SidebarButton tab="calls" icon={Phone} label="Calls" badgeColor="bg-[#FF99A4]" />
            <SidebarButton tab="status" icon={CirclePlayIcon} label="Status" status={true} badgeCount={1}/>
          </nav>
          
          {/* Icônes du bas poussées vers le bas */}
          <nav className="flex flex-col px-1 mt-auto space-y-[6.5px] -mb-4">
            <SidebarButton tab="star" icon={Star} label="Star" badgeCount={starredMessagesCount} />
            <SidebarButton tab="archive" icon={Archive} label="Archive" badgeCount={1} />

            <div 
              className="w-[90%] self-center border-t my-1 px-0.5"
              style={getThemeStyles('sidebar.separator', { borderTopColor: '#404040' })}
            />

            <SidebarButton tab="settings" icon={Settings} label="Settings" />
            <div className="flex items-center relative">
                  {isActive('profile') && <ActiveIndicator />}
                  <button
                    aria-label="Profile"
                    className="relative flex items-center w-full px-2 py-1.5 rounded"
                    style={getThemeStyles('sidebar.buttons.text', { color: '#ffffff' })}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = getThemeStyles('sidebar.buttons.background.hover', { backgroundColor: 'rgba(68, 68, 68, 0.5)' }).backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handleTabClick('profile')}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
                      style={getThemeStyles('sidebar.profile.avatar', { backgroundColor: 'rgba(64, 64, 64, 0.95)' })}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={getThemeStyles('sidebar.profile.icon', { color: '#9ca3af' })}>
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
          <div 
            className="fixed rounded-r-lg left-0 top-0 h-full w-54 min-w-[235px] z-50 border-r flex flex-col backdrop-blur-xl"
            style={{
              ...getThemeStyles('sidebar.background.extended', { backgroundColor: 'rgba(44, 44, 44, 0.8)' }),
              ...getThemeStyles('sidebar.border.right', { borderRightColor: '#404040' }),
              backdropFilter: `blur(${getThemeStyles('sidebar.background.backdrop', { backdropFilter: '30px' })})`
            }}
          >
            
            <div className="py-6 flex flex-col flex-1 relative mt-7">
              <button
                aria-label="Toggle sidebar"
                onClick={toggleSidebar}
                className="flex items-center justify-center px-1 mb-3 rounded-md w-10 h-10 ml-1"
                style={{
                  ...getThemeStyles('sidebar.buttons.background.default', { backgroundColor: 'transparent' }),
                }}
              >
                <Menu size={27} className="p-1" style={getThemeStyles('sidebar.buttons.icon', { color: '#ffffff' })} />
              </button>

              <nav className="flex flex-col px-1 space-y-1">
                <SidebarButton tab="chats" icon={MessageCircle} label="Chats" badgeCount={2} />
                <SidebarButton tab="calls" icon={Phone} label="Calls" badgeColor="bg-[#FF99A4]" />
                <SidebarButton tab="status" icon={CircleCheckBigIcon} label="Status" status={true} badgeCount={1} />
              </nav>

              <nav className="flex flex-col px-1 mt-auto space-y-[6.5px] -mb-4">
                <SidebarButton tab="star" icon={Star} label="Starred messages" badgeCount={starredMessagesCount} />
                <SidebarButton tab="archive" icon={Archive} label="Archived chats" badgeCount={1} />
                
                <div 
                  className="w-full border-t my-1 px-0.5"
                  style={getThemeStyles('sidebar.separator', { borderTopColor: '#404040' })}
                />

                <SidebarButton tab="settings" icon={Settings} label="Settings" />
                
                <div className="flex items-center relative">
                  {isActive('profile') && <ActiveIndicator />}
                  <button
                    aria-label="Profile"
                    className="relative flex items-center w-full px-2 py-1.5 rounded"
                    style={getThemeStyles('sidebar.buttons.text', { color: '#ffffff' })}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = getThemeStyles('sidebar.buttons.background.hover', { backgroundColor: 'rgba(68, 68, 68, 0.5)' }).backgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                    onClick={() => handleTabClick('profile')}
                  >
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
                      style={getThemeStyles('sidebar.profile.avatar', { backgroundColor: 'rgba(68, 68, 68, 0.5)' })}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={getThemeStyles('sidebar.profile.icon', { color: '#9ca3af' })}>
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-3 text-sm" style={getThemeStyles('sidebar.buttons.text', { color: '#ffffff' })}>Profile</span>
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