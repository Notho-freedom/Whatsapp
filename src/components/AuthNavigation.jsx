import React from 'react';
import Link from 'next/link';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

export default function AuthNavigation() {
  const { user, isAuthenticated, logout } = useGoogleAuth();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-green-600">
              WhatsApp Clone
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Accueil
            </Link>
            <Link href="/auth" className="text-gray-700 hover:text-green-600 transition-colors">
              Authentification
            </Link>
            <Link href="/contacts" className="text-gray-700 hover:text-green-600 transition-colors">
              Contacts
            </Link>
            <Link href="/demo" className="text-gray-700 hover:text-green-600 transition-colors">
              Démonstrations
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <img
                  src={user?.picture}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border-2 border-green-500"
                />
                <span className="text-gray-700 font-medium">{user?.name}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
