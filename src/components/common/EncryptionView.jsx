'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Settings
} from 'lucide-react';

export default function EncryptionView() {
  const [encryptionStatus, setEncryptionStatus] = useState({
    isEnabled: true,
    isVerified: true,
    lastVerified: '2024-01-15T10:30:00Z',
    algorithm: 'AES-256-GCM',
    keySize: 256,
    provider: 'Web Crypto API'
  });

  const [securitySettings, setSecuritySettings] = useState({
    autoLock: true,
    autoLockDelay: 5, // minutes
    requirePassword: true,
    biometricAuth: false,
    twoFactorAuth: false,
    backupEncryption: true
  });

  const [securityLog, setSecurityLog] = useState([
    {
      id: 1,
      action: 'Chiffrement activé',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success',
      details: 'Chiffrement AES-256-GCM activé avec succès'
    },
    {
      id: 2,
      action: 'Vérification de sécurité',
      timestamp: '2024-01-14T15:45:00Z',
      status: 'success',
      details: 'Vérification de l\'intégrité des clés réussie'
    },
    {
      id: 3,
      action: 'Tentative d\'accès non autorisé',
      timestamp: '2024-01-13T09:20:00Z',
      status: 'warning',
      details: 'Tentative de connexion depuis un appareil non reconnu'
    },
    {
      id: 4,
      action: 'Mise à jour des clés',
      timestamp: '2024-01-12T14:15:00Z',
      status: 'success',
      details: 'Rotation des clés de chiffrement effectuée'
    }
  ]);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} className="text-green-400" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'error': return <XCircle size={16} className="text-red-400" />;
      default: return <Info size={16} className="text-blue-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleEncryption = () => {
    if (!encryptionStatus.isEnabled) {
      setShowPasswordModal(true);
    } else {
      setEncryptionStatus(prev => ({ ...prev, isEnabled: false }));
    }
  };

  const handlePasswordSubmit = () => {
    if (newPassword === confirmPassword && newPassword.length >= 8) {
      setEncryptionStatus(prev => ({ 
        ...prev, 
        isEnabled: true,
        lastVerified: new Date().toISOString()
      }));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleVerifyEncryption = () => {
    // Simulation de vérification
    setEncryptionStatus(prev => ({ 
      ...prev, 
      lastVerified: new Date().toISOString()
    }));
    
    // Ajouter une entrée au journal
    const newLogEntry = {
      id: Date.now(),
      action: 'Vérification de sécurité',
      timestamp: new Date().toISOString(),
      status: 'success',
      details: 'Vérification de l\'intégrité des clés réussie'
    };
    setSecurityLog(prev => [newLogEntry, ...prev]);
  };

  const handleExportKeys = () => {
    // Simulation d'export des clés
    console.log('Export des clés de chiffrement...');
  };

  const handleImportKeys = () => {
    // Simulation d'import des clés
    console.log('Import des clés de chiffrement...');
  };

  const handleClearLog = () => {
    setSecurityLog([]);
  };

  return (
    <div className="p-6 bg-[#2c2c2c] h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">Sécurité et chiffrement</h2>
        <p className="text-gray-400 text-sm">
          Gérez la sécurité de vos conversations et le chiffrement des données
        </p>
      </div>

      {/* Statut du chiffrement */}
      <div className="mb-6">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Statut du chiffrement</h3>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${encryptionStatus.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                {encryptionStatus.isEnabled ? 'Activé' : 'Désactivé'}
              </span>
              <button
                onClick={handleToggleEncryption}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  encryptionStatus.isEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {encryptionStatus.isEnabled ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Algorithme</span>
                <span className="text-white text-sm font-mono">{encryptionStatus.algorithm}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Taille de clé</span>
                <span className="text-white text-sm">{encryptionStatus.keySize} bits</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Fournisseur</span>
                <span className="text-white text-sm">{encryptionStatus.provider}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Vérifié le</span>
                <span className="text-white text-sm">
                  {formatTimestamp(encryptionStatus.lastVerified)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Statut</span>
                <div className="flex items-center gap-2">
                  {encryptionStatus.isVerified ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <XCircle size={16} className="text-red-400" />
                  )}
                  <span className={`text-sm ${encryptionStatus.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                    {encryptionStatus.isVerified ? 'Vérifié' : 'Non vérifié'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleVerifyEncryption}
                className="w-full px-3 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white text-sm rounded transition-colors"
              >
                <RefreshCw size={14} className="inline mr-2" />
                Vérifier maintenant
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de sécurité */}
      <div className="mb-6">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Paramètres de sécurité</h3>
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-sm rounded transition-colors"
            >
              <Settings size={14} />
              {showAdvancedSettings ? 'Masquer' : 'Avancé'}
            </button>
          </div>

          <div className="space-y-4">
            {/* Verrouillage automatique */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm">Verrouillage automatique</span>
                <p className="text-gray-400 text-xs">Verrouiller l\'appareil après inactivité</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={securitySettings.autoLockDelay}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, autoLockDelay: parseInt(e.target.value) }))}
                  className="px-2 py-1 bg-neutral-700/50 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-[#1DAA61]"
                >
                  <option value={1}>1 min</option>
                  <option value={5}>5 min</option>
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 heure</option>
                </select>
                <button
                  onClick={() => setSecuritySettings(prev => ({ ...prev, autoLock: !prev.autoLock }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    securitySettings.autoLock ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      securitySettings.autoLock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Mot de passe requis */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm">Mot de passe requis</span>
                <p className="text-gray-400 text-xs">Demander un mot de passe pour déverrouiller</p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, requirePassword: !prev.requirePassword }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.requirePassword ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.requirePassword ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Authentification biométrique */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm">Authentification biométrique</span>
                <p className="text-gray-400 text-xs">Utiliser l\'empreinte digitale ou Face ID</p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, biometricAuth: !prev.biometricAuth }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.biometricAuth ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.biometricAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Authentification à deux facteurs */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm">Authentification à deux facteurs</span>
                <p className="text-gray-400 text-xs">Code de vérification supplémentaire</p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: !prev.twoFactorAuth }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.twoFactorAuth ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Chiffrement des sauvegardes */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white text-sm">Chiffrement des sauvegardes</span>
                <p className="text-gray-400 text-xs">Chiffrer les données de sauvegarde</p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({ ...prev, backupEncryption: !prev.backupEncryption }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.backupEncryption ? 'bg-[#1DAA61]' : 'bg-neutral-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.backupEncryption ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des clés */}
      <div className="mb-6">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
          <h3 className="text-white font-medium mb-4">Gestion des clés de chiffrement</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportKeys}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white text-sm rounded transition-colors"
            >
              <Download size={16} />
              Exporter les clés
            </button>
            <button
              onClick={handleImportKeys}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white text-sm rounded transition-colors"
            >
              <Upload size={16} />
              Importer des clés
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600 text-white text-sm rounded transition-colors">
              <Plus size={16} />
              Générer de nouvelles clés
            </button>
          </div>
        </div>
      </div>

      {/* Journal de sécurité */}
      <div className="mb-6">
        <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Journal de sécurité</h3>
            <button
              onClick={handleClearLog}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-700/50 hover:bg-neutral-600 text-gray-300 text-sm rounded transition-colors"
            >
              <Trash2 size={14} />
              Effacer
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {securityLog.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 bg-neutral-700/30 rounded-lg">
                {getStatusIcon(entry.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-sm font-medium">{entry.action}</span>
                    <span className={`text-xs px-2 py-1 rounded-full bg-neutral-700 ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mb-1">{entry.details}</p>
                  <span className="text-gray-400 text-xs">{formatTimestamp(entry.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informations de sécurité */}
      <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
        <h3 className="text-white font-medium mb-4">Informations de sécurité</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white mb-1">Chiffrement de bout en bout</p>
              <p className="text-gray-400">Toutes vos conversations sont chiffrées de bout en bout, ce qui signifie que seuls vous et vos contacts pouvez lire les messages.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white mb-1">Clés locales</p>
              <p className="text-gray-400">Vos clés de chiffrement sont stockées localement sur votre appareil et ne sont jamais transmises à nos serveurs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white mb-1">Sauvegarde sécurisée</p>
              <p className="text-gray-400">Nous vous recommandons de sauvegarder vos clés de chiffrement dans un endroit sûr pour éviter de perdre l'accès à vos conversations.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-white font-medium mb-4">Activer le chiffrement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
                  placeholder="Entrez un nouveau mot de passe"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#1DAA61]"
                  placeholder="Confirmez le nouveau mot de passe"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 bg-[#1DAA61] hover:bg-[#1DAA61]/80 text-white rounded-lg transition-colors"
              >
                Activer
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
