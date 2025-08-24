'use client';

import React from 'react';
import GoogleAuth from './GoogleAuth';
import { useGoogleAuth } from '@/hooks';

export default function GoogleAuthDemo() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    refreshUserInfo,
    hasPermission,
    getUserInfo,
    isLoggedIn,
    displayName,
    userEmail,
    userAvatar
  } = useGoogleAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🔐 Démonstration de l'Authentification Google
          </h1>
          <p className="text-gray-600 text-lg">
            Testez l'authentification Google sans formulaire - Connexion automatique et enregistrement en cas d'erreur
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Composant d'authentification */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Authentification Google
            </h2>
            <GoogleAuth />
          </div>

          {/* Informations sur le composant */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Fonctionnalités
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ <strong>Connexion automatique</strong> - Tente d'abord la connexion</li>
              <li>🔄 <strong>Enregistrement automatique</strong> - Lance l'enregistrement en cas d'erreur</li>
              <li>💾 <strong>Persistance</strong> - Sauvegarde le token dans le localStorage</li>
              <li>🔒 <strong>Sécurisé</strong> - Validation des tokens avec l'API Google</li>
              <li>🎯 <strong>Sans formulaire</strong> - Interface Google native uniquement</li>
              <li>📱 <strong>Responsive</strong> - S'adapte à tous les écrans</li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🚀 Comment ça marche</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. L'utilisateur clique sur "Se connecter avec Google"</li>
                <li>2. Le composant tente d'abord la connexion</li>
                <li>3. Si la connexion échoue, il lance automatiquement l'enregistrement</li>
                <li>4. Le token est sauvegardé et l'utilisateur est connecté</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Configuration requise */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            ⚙️ Configuration Requise
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Variables d'environnement</h4>
              <div className="bg-yellow-100 p-3 rounded text-sm font-mono">
                NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Console Google Cloud</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Créer un projet Google Cloud</li>
                <li>• Activer l'API Google+</li>
                <li>• Créer des identifiants OAuth 2.0</li>
                <li>• Ajouter les origines autorisées</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Utilisateur connecté
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎉 Authentification Réussie !
        </h1>
        <p className="text-gray-600 text-lg">
          Bienvenue, {displayName} ! Vous êtes maintenant connecté avec Google.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profil utilisateur */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            👤 Profil Utilisateur
          </h2>
          
          <div className="flex items-center gap-4 mb-6">
            <img
              src={userAvatar}
              alt={displayName}
              className="w-20 h-20 rounded-full border-4 border-green-500"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{displayName}</h3>
              <p className="text-gray-600">{userEmail}</p>
              {user?.isNewUser && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-2">
                  Nouveau compte créé
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID Google:</span>
              <span className="font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Statut:</span>
              <span className="text-green-600 font-semibold">Connecté</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Permissions:</span>
              <span className="text-blue-600">
                {hasPermission('read') ? 'Lecture' : 'Aucune'} / {hasPermission('write') ? 'Écriture' : 'Aucune'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions disponibles */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🎮 Actions Disponibles
          </h2>
          
          <div className="space-y-3">
            <button
              onClick={refreshUserInfo}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔄 Rafraîchir les informations
            </button>
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-profile-settings'))}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ⚙️ Paramètres du profil
            </button>
            
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('test-notification'))}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              🔔 Tester les notifications
            </button>
            
            <button
              onClick={logout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              🚪 Se déconnecter
            </button>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">✅ Événements émis</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <code>google-auth-success</code> - Connexion réussie</li>
              <li>• <code>google-auth-logout</code> - Déconnexion</li>
              <li>• <code>google-auth-error</code> - Erreur d'authentification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Informations techniques */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🔧 Informations Techniques
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Hook useGoogleAuth</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• État d'authentification global</li>
              <li>• Gestion automatique des événements</li>
              <li>• Validation des tokens</li>
              <li>• Rafraîchissement des données</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Composant GoogleAuth</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Interface utilisateur complète</li>
              <li>• Gestion des erreurs intelligente</li>
              <li>• Fallback automatique vers l'enregistrement</li>
              <li>• Design responsive et moderne</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
