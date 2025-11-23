'use client';

import React, { useState, useEffect } from 'react';
import { useGoogleAuth } from '@/hooks';

export default function WelcomeScreen({ onContinue }) {
  const { user } = useGoogleAuth();
  const [showWelcome, setShowWelcome] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Afficher l'écran de bienvenue pendant 3 secondes
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setShowWelcome(false);
        onContinue();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  if (!showWelcome) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-500 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <img
            src={user?.picture}
            alt={user?.name}
            className="w-24 h-24 rounded-full border-4 border-green-500 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue, {user?.name} ! 👋
          </h1>
          <p className="text-gray-600">
            Vous êtes maintenant connecté à WhatsApp Clone
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Prêt à discuter avec vos contacts</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span>Notifications natives activées</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <span>Interface optimisée pour Electron</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="animate-pulse text-green-500">
            Redirection automatique dans quelques secondes...
          </div>
        </div>
      </div>
    </div>
  );
}
