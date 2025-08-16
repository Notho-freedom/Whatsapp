import { Minus, Square, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function Titlebar() {
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
