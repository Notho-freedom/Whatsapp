'use client';

import React, { useState } from 'react';
import { 
  User, 
  Image, 
  FileText, 
  Link, 
  Calendar, 
  Shield, 
  Database,
  Settings,
  X
} from 'lucide-react';

import { 
  MediaView, 
  FilesView, 
  LinksView, 
  EventsView, 
  EncryptionView 
} from './index';

export default function ProfilePanel({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Aperçu',
      icon: <User size={20} />,
      component: (
        <div className="p-6 bg-[#2c2c2c] h-full overflow-y-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Aperçu du profil</h2>
          
          {/* Informations utilisateur */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={24} className="text-gray-400" />
                )}
              </div>
              <div>
                <h3 className="text-white text-lg font-medium">{user?.name || 'Utilisateur'}</h3>
                <p className="text-gray-400 text-sm">{user?.email || 'email@example.com'}</p>
                <p className="text-gray-400 text-sm">Membre depuis {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'récemment'}</p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600 text-center">
              <div className="text-2xl font-bold text-[#1DAA61] mb-2">127</div>
              <div className="text-gray-400 text-sm">Conversations</div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600 text-center">
              <div className="text-2xl font-bold text-[#1DAA61] mb-2">2.4K</div>
              <div className="text-gray-400 text-sm">Messages</div>
            </div>
            <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600 text-center">
              <div className="text-2xl font-bold text-[#1DAA61] mb-2">89</div>
              <div className="text-gray-400 text-sm">Contacts</div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
            <h3 className="text-white font-medium mb-4">Activité récente</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-[#1DAA61] rounded-full"></div>
                <span className="text-gray-300">Message envoyé à Jean Martin</span>
                <span className="text-gray-400 ml-auto">Il y a 5 min</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-[#1DAA61] rounded-full"></div>
                <span className="text-gray-300">Photo partagée dans Groupe Famille</span>
                <span className="text-gray-400 ml-auto">Il y a 1 heure</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-[#1DAA61] rounded-full"></div>
                <span className="text-gray-300">Appel avec Marie Dupont</span>
                <span className="text-gray-400 ml-auto">Il y a 2 heures</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'media',
      label: 'Médias',
      icon: <Image size={20} />,
      component: <MediaView />
    },
    {
      id: 'files',
      label: 'Fichiers',
      icon: <FileText size={20} />,
      component: <FilesView />
    },
    {
      id: 'links',
      label: 'Liens',
      icon: <Link size={20} />,
      component: <LinksView />
    },
    {
      id: 'events',
      label: 'Événements',
      icon: <Calendar size={20} />,
      component: <EventsView />
    },
    {
      id: 'encryption',
      label: 'Chiffrement',
      icon: <Shield size={20} />,
      component: <EncryptionView />
    },
    {
      id: 'cache',
      label: 'Cache',
      icon: <Database size={20} />,
      component: (
        <div className="p-6 bg-[#2c2c2c] h-full overflow-y-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Gestion du cache</h2>
          
          {/* Statistiques du cache */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
              <h3 className="text-white font-medium mb-3">Cache local</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taille totale</span>
                  <span className="text-white">156.7 MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Conversations</span>
                  <span className="text-white">127</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Médias</span>
                  <span className="text-white">89</span>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
              <h3 className="text-white font-medium mb-3">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taux de réussite</span>
                  <span className="text-green-400">98.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Temps de réponse</span>
                  <span className="text-white">45ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Dernière optimisation</span>
                  <span className="text-white">Il y a 2h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600 mb-6">
            <h3 className="text-white font-medium mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-[#1DAA61] hover:bg-[#1DAA61]/80 text-white rounded-lg transition-colors">
                Optimiser le cache
              </button>
              <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors">
                Vider le cache
              </button>
              <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors">
                Exporter les données
              </button>
            </div>
          </div>

          {/* Historique des optimisations */}
          <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
            <h3 className="text-white font-medium mb-4">Historique des optimisations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg">
                <div>
                  <div className="text-white text-sm">Optimisation automatique</div>
                  <div className="text-gray-400 text-xs">Nettoyage des anciens messages</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm">+15.2 MB libérés</div>
                  <div className="text-gray-400 text-xs">Il y a 2h</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg">
                <div>
                  <div className="text-white text-sm">Compression des images</div>
                  <div className="text-gray-400 text-xs">Optimisation des miniatures</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 text-sm">+8.7 MB libérés</div>
                  <div className="text-gray-400 text-xs">Il y a 6h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-neutral-900 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-xl font-semibold text-white">Profil et paramètres</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Navigation des onglets */}
        <div className="flex border-b border-neutral-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-[#1DAA61] border-b-2 border-[#1DAA61]'
                  : 'text-gray-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu de l'onglet actif */}
        <div className="flex-1 overflow-hidden">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}
