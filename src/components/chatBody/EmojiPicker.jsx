import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Smile, Heart, Flag, Car, Lightbulb, Utensils, Activity } from 'lucide-react';

const EmojiPicker = ({ isOpen, onClose, onSelectEmoji, position = 'bottom' }) => {
  const [activeTab, setActiveTab] = useState('emoji');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('recent');
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
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

  if (!isOpen) return null;

  const tabs = [
    { id: 'emoji', label: 'Emoji' },
    { id: 'gifs', label: 'GIFs' },
    { id: 'stickers', label: 'Stickers' }
  ];

  const categories = [
    { id: 'recent', icon: Clock, label: 'Recent' },
    { id: 'smileys', icon: Smile, label: 'Smileys & people' },
    { id: 'animals', icon: '🐻', label: 'Animals & Nature' },
    { id: 'food', icon: Utensils, label: 'Food & Drink' },
    { id: 'activity', icon: Activity, label: 'Activity' },
    { id: 'travel', icon: Car, label: 'Travel & Places' },
    { id: 'objects', icon: Lightbulb, label: 'Objects' },
    { id: 'symbols', icon: Heart, label: 'Symbols' },
    { id: 'flags', icon: Flag, label: 'Flags' }
  ];

  // Emojis par catégorie
  const emojiData = {
    recent: ['😂', '👋', '😊', '😄', '😐', '👉', '😥', '😅', '😆', '😈', '😊'],
    smileys: ['😍', '🤔', '😎', '🤓', '😢', '😭', '😠', '😡', '😤', '😴', '🤤', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😵', '🤯', '🤠', '🥳', '🥴', '🥺', '🤡', '🤖', '👻', '👽', '👾', '🤖'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞'],
    activity: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋'],
    objects: ['💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🪚', '🔩', '⚙️'],
    symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎'],
    flags: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏴‍☠️', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩', '🇦🇩']
  };

  const handleEmojiClick = (emoji) => {
    onSelectEmoji(emoji);
  };

  const renderEmojiGrid = (category) => {
    const emojis = emojiData[category] || [];
    return (
      <div className="grid grid-cols-8 gap-1 p-2">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleEmojiClick(emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-neutral-700/50 rounded transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div 
        ref={pickerRef}
        className={`relative bg-[#2C2C2C] rounded-lg shadow-2xl border border-neutral-700 w-full max-w-[400px] max-h-[500px] animate-[slideUp_0.2s_ease-out] ${
          position === 'top' ? 'mb-2' : 'mt-2'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-700">
          <h3 className="text-white font-medium text-sm">Emoji</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-700/50 rounded transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-white bg-neutral-700/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-neutral-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search emojis"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-neutral-700/50 border-b-2 border-[#1DAA61] text-white placeholder-gray-400 text-sm focus:outline-none rounded-t"
            />
          </div>
        </div>

        {/* Emoji Content */}
        <div className="flex-1 overflow-hidden">
          {/* Category Navigation */}
          <div className="flex justify-center gap-1 p-2 border-b border-neutral-700">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                  activeCategory === category.id
                    ? 'bg-neutral-700/50'
                    : 'hover:bg-neutral-700/30'
                }`}
              >
                {typeof category.icon === 'string' ? (
                  <span className="text-sm">{category.icon}</span>
                ) : (
                  <category.icon size={16} className="text-gray-300" />
                )}
              </button>
            ))}
          </div>

          {/* Emoji Grid */}
          <div className="max-h-[300px] overflow-y-auto">
            {activeCategory === 'recent' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Recent</div>
                {renderEmojiGrid('recent')}
              </div>
            )}
            
            {activeCategory === 'smileys' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Smileys & people</div>
                {renderEmojiGrid('smileys')}
              </div>
            )}

            {activeCategory === 'animals' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Animals & Nature</div>
                {renderEmojiGrid('animals')}
              </div>
            )}

            {activeCategory === 'food' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Food & Drink</div>
                {renderEmojiGrid('food')}
              </div>
            )}

            {activeCategory === 'activity' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Activity</div>
                {renderEmojiGrid('activity')}
              </div>
            )}

            {activeCategory === 'travel' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Travel & Places</div>
                {renderEmojiGrid('travel')}
              </div>
            )}

            {activeCategory === 'objects' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Objects</div>
                {renderEmojiGrid('objects')}
              </div>
            )}

            {activeCategory === 'symbols' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Symbols</div>
                {renderEmojiGrid('symbols')}
              </div>
            )}

            {activeCategory === 'flags' && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Flags</div>
                {renderEmojiGrid('flags')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
