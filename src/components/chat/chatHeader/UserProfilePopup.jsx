import { useState, useEffect, useRef } from 'react';
import { 
  FaTimes, 
  FaPhone, 
  FaVideo,
  FaEllipsisH,
  FaEdit,
  FaStar,
  FaBell,
  FaBellSlash,
  FaLock,
  FaUserPlus,
  FaExclamationTriangle,
  FaShare,
  FaQrcode,
  FaDownload,
  FaShieldAlt,
  FaUsers,
  FaCalendarAlt,
  FaLink,
  FaFileAlt,
  FaImage,
  FaPlay,
  FaMusic
} from 'react-icons/fa';
import {
  Info, 
  Shield, 
  Users, 
  Calendar, 
  Link, 
  FileText, 
  Image,
} from 'lucide-react';

const UserProfilePopup = ({ user, isOpen, onClose, onSearch, onEdit }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [advancedPrivacy, setAdvancedPrivacy] = useState(false);
  const [notificationTone, setNotificationTone] = useState('default');
  
  const popupRef = useRef(null);

  // Fermer le popup en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
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

  if (!isOpen || !user) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleBlockToggle = () => {
    setIsBlocked(!isBlocked);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleDisappearingMessagesToggle = () => {
    setDisappearingMessages(!disappearingMessages);
  };

  const handleAdvancedPrivacyToggle = () => {
    setAdvancedPrivacy(!advancedPrivacy);
  };

  const handleNotificationToneChange = (tone) => {
    setNotificationTone(tone);
  };

  const getLastSeenText = () => {
    if (user.lastSeen) {
      const now = new Date();
      const lastSeen = new Date(user.lastSeen);
      const diffInHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'En ligne';
      if (diffInHours < 24) return `Il y a ${diffInHours}h`;
      if (diffInHours < 48) return 'Hier';
      return lastSeen.toLocaleDateString('fr-FR');
    }
    return 'Jamais';
  };

  const getStatusText = () => {
    if (isBlocked) return 'Ce contact vous a bloqué';
    return user.status || 'Aucun statut';
  };

  const getStatusColor = () => {
    if (isBlocked) return 'text-red-400';
    return 'text-gray-300';
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        ref={popupRef}
        className="bg-[#111b21] rounded-lg shadow-2xl w-full max-w-[800px] max-h-[600px] overflow-hidden animate-[slideIn_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700 bg-[#2C2C2C]">
          <h2 className="text-base font-semibold text-white">Profil du contact</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
            aria-label="Fermer"
          >
            <FaTimes size={16} className="text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(600px-64px)]">
          {/* Sidebar Navigation */}
          <div className="w-48 bg-[#202020] border-r border-neutral-700">
            <nav className="p-1.5">
              {[
                { id: 'overview', label: 'Aperçu', icon: Info },
                { id: 'media', label: 'Médias', icon: Image },
                { id: 'files', label: 'Fichiers', icon: FileText },
                { id: 'links', label: 'Liens', icon: Link },
                { id: 'events', label: 'Événements', icon: Calendar },
                { id: 'encryption', label: 'Chiffrement', icon: Shield },
                { id: 'groups', label: 'Groupes', icon: Users }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-neutral-700/50 text-white'
                        : 'text-gray-300 hover:bg-neutral-700/50'
                    }`}
                  >
                    <IconComponent size={17} />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6 bg-[#0b1419]">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-3">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt={user.name}
                      className="w-20 h-20 rounded-full object-cover border-3 border-[#1DAA61]"
                    />
                    <button
                      onClick={onEdit}
                      className="absolute bottom-0 right-0 p-1.5 bg-[#1DAA61] rounded-full hover:bg-[#1DAA61]/80 transition-colors"
                      aria-label="Modifier le profil"
                    >
                      <FaEdit size={14} className="text-white" />
                    </button>
                  </div>
                  
                  <h1 className="text-xl font-bold text-white mb-1">{user.name}</h1>
                  <p className="text-gray-300 text-sm mb-4">{user.company || '~Aucune entreprise'}</p>
                  
                  {/* Call Buttons */}
                  <div className="flex gap-2 justify-center mb-6">
                    <button
                      onClick={() => {
                        // Démarrer un appel vidéo
                        window.dispatchEvent(new CustomEvent('start-call', { 
                          detail: { 
                            type: 'video',
                            participant: user,
                            fromProfile: true,
                            timestamp: new Date(),
                            chatId: user.id
                          } 
                        }));
                        
                        // Émettre aussi un événement spécifique pour l'appel vidéo
                        window.dispatchEvent(new CustomEvent('video-call-started', { 
                          detail: { 
                            participant: user,
                            fromProfile: true,
                            timestamp: new Date()
                          } 
                        }));
                        
                        // Fermer le popup de profil
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors"
                    >
                      <FaVideo size={16} className="text-gray-300" />
                      <span className="text-gray-300 text-sm">Vidéo</span>
                    </button>
                    <button
                      onClick={() => {
                        // Démarrer un appel vocal
                        window.dispatchEvent(new CustomEvent('start-call', { 
                          detail: { 
                            type: 'voice',
                            participant: user,
                            fromProfile: true,
                            timestamp: new Date(),
                            chatId: user.id
                          } 
                        }));
                        
                        // Émettre aussi un événement spécifique pour l'appel vocal
                        window.dispatchEvent(new CustomEvent('voice-call-started', { 
                          detail: { 
                            participant: user,
                            fromProfile: true,
                            timestamp: new Date()
                          } 
                        }));
                        
                        // Fermer le popup de profil
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors"
                    >
                      <FaPhone size={16} className="text-gray-300" />
                      <span className="text-gray-300 text-sm">Appel</span>
                    </button>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-0 bg-neutral-800/50 rounded-md p-3">
                  {/* Last Seen */}
                  <div className="flex items-center justify-between py-3 border-b border-neutral-700">
                    <span className="text-gray-300 text-sm">Dernière connexion</span>
                    <span className="text-white text-sm">{getLastSeenText()}</span>
                  </div>

                  {/* About/Status */}
                  <div className="flex items-center justify-between py-3 border-b border-neutral-700">
                    <span className="text-gray-300 text-sm">À propos</span>
                    <span className={`${getStatusColor()}`}>{getStatusText()}</span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-300 text-sm">Numéro de téléphone</span>
                    <span className="text-white text-sm">{user.phone || '+237 6 79 34 97 60'}</span>
                  </div>
                </div>

                {/* Disappearing Messages */}
                <div className="mt-4 bg-neutral-800/50 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Messages éphémères</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{disappearingMessages ? 'Activé' : 'Désactivé'}</span>
                      <button
                        onClick={handleDisappearingMessagesToggle}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          disappearingMessages ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            disappearingMessages ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Chat Privacy */}
                <div className="mt-3 bg-neutral-800/50 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Confidentialité avancée du chat</span>
                    <button
                      onClick={handleAdvancedPrivacyToggle}
                      disabled
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        advancedPrivacy ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                      } opacity-50 cursor-not-allowed`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          advancedPrivacy ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    Ce paramètre ne peut être modifié que sur votre téléphone.
                  </p>
                  <button className="text-[#1DAA61] text-sm hover:underline">
                    En savoir plus
                  </button>
                </div>

                {/* Mute Notifications */}
                <div className="mt-3 bg-neutral-800/50 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Notifications silencieuses</span>
                    <button
                      onClick={handleMuteToggle}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors"
                    >
                      {isMuted ? (
                        <>
                          <FaBellSlash size={13} className="text-gray-300" />
                          <span className="text-gray-300 text-sm">Désactivé</span>
                        </>
                      ) : (
                        <>
                          <FaBell size={13} className="text-gray-300" />
                          <span className="text-gray-300 text-sm">Activer</span>
                        </>
                      )}
                      <FaEllipsisH size={11} className="text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Notification Tone */}
                <div className="mt-3 bg-neutral-800/50 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Son de notification</span>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 bg-neutral-700/50 hover:bg-white/10 rounded transition-colors">
                        <FaPlay size={11} className="text-gray-300" />
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors">
                        <FaMusic size={13} className="text-gray-300" />
                        <span className="text-gray-300 text-sm">Par défaut</span>
                        <FaEllipsisH size={11} className="text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-700">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                      isFavorite
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-neutral-700/50 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <FaStar size={13} />
                      <span>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleBlockToggle}
                    className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                      isBlocked
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-neutral-700/50 hover:bg-white/10 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {isBlocked ? <FaUserPlus size={13} /> : <FaLock size={13} />}
                      <span>{isBlocked ? 'Débloquer' : 'Bloquer'}</span>
                    </div>
                  </button>
                  
                  <button
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <FaExclamationTriangle size={13} />
                      <span>Signaler le contact</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="p-4 bg-[#0b1419]">
                <h3 className="text-lg font-semibold text-white mb-4">Médias partagés</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-neutral-800/50 rounded-md flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
                      <FaImage size={20} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="p-4 bg-[#0b1419]">
                <h3 className="text-lg font-semibold text-white mb-4">Fichiers partagés</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-neutral-800/50 rounded-md hover:bg-white/10 transition-colors">
                      <FaFileAlt size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="text-white text-sm">Document_{i}.pdf</p>
                        <p className="text-gray-400 text-xs">2.{i} MB</p>
                      </div>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <FaDownload size={14} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'links' && (
              <div className="p-4 bg-[#0b1419]">
                <h3 className="text-lg font-semibold text-white mb-4">Liens partagés</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-neutral-800/50 rounded-md hover:bg-white/10 transition-colors">
                      <div className="flex items-start gap-2">
                        <div className="w-12 h-12 bg-neutral-700/50 rounded flex items-center justify-center flex-shrink-0">
                          <FaLink size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm mb-1">Lien partagé {i}</p>
                          <p className="text-gray-400 text-xs">https://example{i}.com</p>
                          <p className="text-gray-400 text-xs mt-1">Partagé il y a {i} jour{i > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="p-4 bg-[#0b1419]">
                <h3 className="text-lg font-semibold text-white mb-4">Événements partagés</h3>
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-3 bg-neutral-800/50 rounded-md hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt size={16} className="text-gray-400" />
                        <div>
                          <p className="text-white text-sm">Événement {i}</p>
                          <p className="text-gray-400 text-xs">Date: {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'encryption' && (
              <div className="p-4 bg-[#0b1419]">
                <h3 className="text-lg font-semibold text-white mb-4">Chiffrement</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-neutral-800/50 border border-[#1DAA61]/20 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <FaShieldAlt size={16} className="text-[#1DAA61]" />
                      <span className="text-[#1DAA61] font-medium text-sm">Messages chiffrés de bout en bout</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Vos messages sont protégés par le chiffrement de bout en bout, ce qui signifie qu'ils restent entre vous et le destinataire.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-neutral-800/50 border border-[#53bdeb]/20 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <FaQrcode size={16} className="text-[#53bdeb]" />
                      <span className="text-[#53bdeb] font-medium text-sm">Code de sécurité</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      Comparez ce code avec votre contact pour vérifier que vos conversations sont sécurisées.
                    </p>
                    <div className="p-3 bg-neutral-700/50 rounded text-center">
                      <code className="text-[#53bdeb] font-mono text-base">123-456-789</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              <div className="p-4 bg-[#0b1419]">
                <h3 className="text-lg font-semibold text-white mb-4">Groupes en commun</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-neutral-800/50 rounded-md hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 bg-neutral-700/50 rounded-full flex items-center justify-center">
                        <FaUsers size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Groupe {i}</p>
                        <p className="text-gray-400 text-xs">{10 + i} membres</p>
                      </div>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <FaShare size={14} className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePopup;
