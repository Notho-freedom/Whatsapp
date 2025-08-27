'use client';

import { useEffect, useState } from 'react';

const TypingIndicator = ({ typingUsers, currentUserId }) => {
  const [dots, setDots] = useState(0);

  // Animation des points
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, []); // Dépendances vides pour éviter les boucles

  // Filtrer les utilisateurs qui tapent (exclure l'utilisateur actuel)
  const otherTypingUsers = typingUsers.filter(user => user.userId !== currentUserId);

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const typingUser = otherTypingUsers[0];
  const dotsArray = Array.from({ length: dots }, (_, i) => i);

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="font-segoe">
        {typingUser.userId} est en train d'écrire
        {dotsArray.map((_, index) => (
          <span key={index} className="animate-pulse">.</span>
        ))}
      </span>
    </div>
  );
};

export default TypingIndicator;
