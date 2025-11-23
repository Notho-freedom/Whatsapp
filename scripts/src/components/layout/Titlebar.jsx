import { Minus, Square, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useGoogleAuth } from '@/hooks';

export default function Titlebar() {
  const { user, isAuthenticated, logout } = useGoogleAuth();

  return (
    <header
      className="flex items-center justify-between h-10 px-3 text-xs text-white select-none bg-[#202020]"
      style={{ WebkitAppRegion: 'drag' }} // <- zone draggable par défaut
    >
      {/* Zone gauche : draggable */}
      <div className="flex items-center px-0 py-6 space-x-3 absolute z-[100]">
        <FaWhatsapp className="w-6 h-6 text-green-500" />
        <span className="tracking-wide text-white font-segoe">
          WhatsApp
        </span>
      </div>

      {/* Zone centrale : utilisateur connecté */}
      {isAuthenticated && user && (
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <img
            src={user.picture}
            alt={user.name}
            className="w-5 h-5 rounded-full border border-white/20"
          />
          <span className="text-white/80 text-xs">
            {user.name}
          </span>
        </div>
      )}

      {/* Zone droite : pas draggable */}
      <div
        className="flex items-center text-[10px] top-0 absolute right-0"
        style={{ WebkitAppRegion: 'no-drag' }} // <- on exclut les boutons
      >
        <button
          aria-label="Minimize"
          className="flex items-center justify-center w-12 h-8 transition-colors hover:bg-whatsapp-dark-700/80"
        >
          <Minus size={12} />
        </button>
        <button
          aria-label="Maximize"
          className="flex items-center justify-center w-12 h-8 transition-colors hover:bg-whatsapp-dark-700/80"
        >
          <Square size={12} />
        </button>
        <button
          aria-label="Close"
          className="flex items-center justify-center w-12 h-8 transition-colors hover:bg-red-600"
        >
          <X size={12} />
        </button>
      </div>
    </header>
  );
}
