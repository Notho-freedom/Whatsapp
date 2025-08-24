import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  LogOut, 
  User, 
  Phone, 
  MessageCircle, 
  Bell,
  BellOff,
  Star,
  Share,
  QrCode,
  Download,
  Play,
  Music
} from 'lucide-react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function Profile({ activeTab = 'overview' }) {
  const { user, logout } = useGoogleAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedAbout, setEditedAbout] = useState('I\'d love to change the world, but they won\'t give me the source code.');
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [disappearingMessages, setDisappearingMessages] = useState(false);
  const [advancedPrivacy, setAdvancedPrivacy] = useState(false);
  const [notificationTone, setNotificationTone] = useState('default');

  // Mettre à jour les valeurs d'édition quand l'utilisateur change
  useEffect(() => {
    if (user) {
      setEditedName(user.name || '');
    }
  }, [user]);

  // Gérer la sauvegarde du nom
  const handleSaveName = () => {
    if (editedName.trim()) {
      // Ici tu peux ajouter la logique pour sauvegarder le nom
      console.log('Nouveau nom sauvegardé:', editedName);
    }
    setIsEditingName(false);
  };

  // Gérer la sauvegarde de la bio
  const handleSaveAbout = () => {
    if (editedAbout.trim()) {
      // Ici tu peux ajouter la logique pour sauvegarder la bio
      console.log('Nouvelle bio sauvegardée:', editedAbout);
    }
    setIsEditingAbout(false);
  };

  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
  };

  // Gérer les toggles
  const handleMuteToggle = () => setIsMuted(!isMuted);
  const handleFavoriteToggle = () => setIsFavorite(!isFavorite);
  const handleDisappearingMessagesToggle = () => setDisappearingMessages(!disappearingMessages);
  const handleAdvancedPrivacyToggle = () => setAdvancedPrivacy(!advancedPrivacy);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <User size={48} className="mx-auto mb-4" />
          <p>Aucun utilisateur connecté</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 overflow-y-auto bg-[#0b1419]">
      {activeTab === 'overview' && (
        <div className="p-6 bg-[#0b1419]">
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#1DAA61] shadow-lg">
                <img
                  src={user.picture || '/default-avatar.png'}
                  alt={`${user.name} profile picture`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
              <button
                onClick={() => setIsEditingName(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#1DAA61] rounded-full hover:bg-[#1DAA61]/80 transition-colors"
                aria-label="Modifier le profil"
              >
                <Edit3 size={14} className="text-white" />
              </button>
            </div>
            
            {/* User Name Section */}
            <div className="mb-2">
              {isEditingName ? (
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-xl font-bold text-white bg-transparent border-b-2 border-[#1DAA61] focus:outline-none text-center"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-[#1DAA61] hover:text-[#1DAA61]/80 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditedName(user.name || '');
                      setIsEditingName(false);
                    }}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <h1 className="text-xl font-bold text-white">{user.name || 'Utilisateur'}</h1>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{user.email || 'email@example.com'}</p>
            
            {/* Action Buttons */}
            <div className="flex gap-2 justify-center mb-6">
              <button className="flex items-center gap-1.5 px-3 py-2 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors">
                <MessageCircle size={16} className="text-gray-300" />
                <span className="text-gray-300 text-sm">Messages</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors">
                <Phone size={16} className="text-gray-300" />
                <span className="text-gray-300 text-sm">Appels</span>
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-0 bg-neutral-800/50 rounded-md p-3 mb-4">
            {/* About/Status */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <span className="text-gray-300 text-sm">À propos</span>
              <div className="flex items-center gap-2">
                {isEditingAbout ? (
                  <div className="flex items-center gap-2">
                    <textarea
                      value={editedAbout}
                      onChange={(e) => setEditedAbout(e.target.value)}
                      className="text-sm text-gray-300 bg-transparent border-b border-gray-600 focus:outline-none resize-none w-48"
                      rows={2}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveAbout}
                      className="text-[#1DAA61] hover:text-[#1DAA61]/80 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditedAbout('I\'d love to change the world, but they won\'t give me the source code.');
                        setIsEditingAbout(false);
                      }}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-gray-300 text-sm italic">{editedAbout}</span>
                    <button
                      onClick={() => setIsEditingAbout(true)}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-300 text-sm">Numéro de téléphone</span>
              <span className="text-white text-sm">+357 95 184406</span>
            </div>
          </div>

          {/* Disappearing Messages */}
          <div className="mb-4 bg-neutral-800/50 rounded-md p-3">
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
          <div className="mb-4 bg-neutral-800/50 rounded-md p-3">
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
          <div className="mb-4 bg-neutral-800/50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Notifications silencieuses</span>
              <button
                onClick={handleMuteToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors"
              >
                {isMuted ? (
                  <>
                    <BellOff size={13} className="text-gray-300" />
                    <span className="text-gray-300 text-sm">Désactivé</span>
                  </>
                ) : (
                  <>
                    <Bell size={13} className="text-gray-300" />
                    <span className="text-gray-300 text-sm">Activer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Notification Tone */}
          <div className="mb-4 bg-neutral-800/50 rounded-md p-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Son de notification</span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 bg-neutral-700/50 hover:bg-white/10 rounded transition-colors">
                  <Play size={11} className="text-gray-300" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700/50 hover:bg-white/10 rounded-md transition-colors">
                  <Music size={13} className="text-gray-300" />
                  <span className="text-gray-300 text-sm">Par défaut</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-4 pt-4 border-t border-neutral-700">
            <button
              onClick={handleFavoriteToggle}
              className={`flex-1 py-2 px-3 rounded-md transition-colors text-sm ${
                isFavorite
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-neutral-700/50 hover:bg-white/10 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Star size={13} />
                <span>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
              </div>
            </button>
            
            <button className="flex-1 py-2 px-3 bg-neutral-700/50 hover:bg-white/10 text-gray-300 rounded-md transition-colors text-sm">
              <div className="flex items-center justify-center gap-1.5">
                <Share size={13} />
                <span>Partager le profil</span>
              </div>
            </button>
          </div>

          {/* Logout Section */}
          <div className="bg-neutral-800/50 rounded-md p-4">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Se déconnecter
            </button>
            <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
              L'historique des chats sur cet ordinateur sera effacé lors de la déconnexion.
            </p>
          </div>
        </div>
      )}

      {/* Placeholder pour les autres onglets */}
      {activeTab !== 'overview' && (
        <div className="p-6 bg-[#0b1419] flex items-center justify-center h-full">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">Onglet {activeTab}</p>
            <p className="text-sm">Contenu en cours de développement</p>
          </div>
        </div>
      )}
    </div>
  );
}
