import { Minus, Square, X } from 'lucide-react';

export default function Titlebar() {
  return (
    <header className="flex items-center justify-between bg-whatsapp-dark-900 px-3 h-10 text-xs text-white select-none">
      <div className="flex items-center space-x-2 py-6">
        <img 
          alt="WhatsApp logo green circle with white phone icon" 
          className="w-6 h-6" 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        />
        <span className="font-normal font-segoe">
          WhatsApp
        </span>
      </div>
      <div className="flex items-center space-x-2 text-[10px] font-semibold">
        <button 
          aria-label="Minimize" 
          className="w-4 h-4 flex items-center justify-center hover:bg-gray-600 rounded-sm transition-colors"
        >
          <Minus size={12} />
        </button>
        <button 
          aria-label="Maximize" 
          className="w-4 h-4 flex items-center justify-center hover:bg-gray-600 rounded-sm transition-colors"
        >
          <Square size={12} />
        </button>
        <button 
          aria-label="Close" 
          className="w-4 h-4 flex items-center justify-center hover:bg-red-600 rounded-sm transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </header>
  );
}
