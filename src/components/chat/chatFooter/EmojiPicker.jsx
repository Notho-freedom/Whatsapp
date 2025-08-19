import { useState, useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

export default function EmojiPicker({ isOpen, onClose, onSelectEmoji }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleEmojiSelect = (emoji) => {
    onSelectEmoji(emoji.native);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="z-50 absolute bottom-14 left-0"
    >
      <Picker
        className="emoji-mart-container"
        data={data}
        onEmojiSelect={handleEmojiSelect}
        theme="dark"
        set="native"
        emojiSize={20}
        previewPosition="none"
      />
    </div>
  );
}
