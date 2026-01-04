'use client';

import { useEffect, useState, useMemo } from 'react';

const TypingIndicator = ({ typingUsers, currentUserId }) => {
  const [dots, setDots] = useState(0);

  // Filtrer les utilisateurs qui tapent (exclure l'utilisateur actuel) - stable avec useMemo
  const otherTypingUsers = useMemo(
    () => typingUsers.filter(user => user.userId !== currentUserId),
    [typingUsers, currentUserId]
  );

  // Animation des points - seulement si quelqu'un tape
  useEffect(() => {
    if (otherTypingUsers.length === 0) {
      return; // Pas d'interval si personne ne tape
    }

    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4);
    }, 500);

    return () => clearInterval(interval);
  }, [otherTypingUsers.length]); // Trigger seulement si nombre de typeurs change

  if (otherTypingUsers.length === 0) {
    return null;
  }

  const typingUser = otherTypingUsers[0];
  const dotsArray = Array.from({ length: dots }, (_, i) => i);

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
          style={{ animationDelay: '0.1s' }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
          style={{ animationDelay: '0.2s' }}
        ></div>
      </div>
      <span className="font-segoe">
        {typingUser.userId} est en train d'écrire
        {dotsArray.map((_, index) => (
          <span key={index} className="animate-pulse">
            .
          </span>
        ))}
      </span>
    </div>
  );
};

export default TypingIndicator;
