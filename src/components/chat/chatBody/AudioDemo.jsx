import { useState } from 'react';
import MediaGroup from './MediaGroup';

export default function AudioDemo() {
  const [demoAudio] = useState({
    duration: '1:23',
    timestamp: '9:18 PM',
    waveform: Array.from({ length: 35 }, () => Math.random() * 0.7 + 0.3),
    size: '312 KB',
    quality: '128 kbps'
  });

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header de démonstration */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            🎵 Démonstration des Messages Audio WhatsApp
          </h1>
          <p className="text-gray-300 mb-4">
            Testez la nouvelle fonctionnalité de progression visuelle des messages audio.
            L'indicateur bleu se déplace le long de la forme d'onde pour montrer la progression.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <h3 className="font-medium text-white mb-2">✅ Fonctionnalités</h3>
              <ul className="space-y-1">
                <li>• Indicateur de progression qui se déplace</li>
                <li>• Forme d'onde avec couleurs dynamiques</li>
                <li>• Temps de lecture en temps réel</li>
                <li>• Barre de progression linéaire</li>
                <li>• Contrôles play/pause interactifs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">🎯 Instructions</h3>
              <ul className="space-y-1">
                <li>• Cliquez sur l'icône play pour démarrer</li>
                <li>• Observez la progression sur la forme d'onde</li>
                <li>• L'indicateur bleu suit la progression</li>
                <li>• Le temps s'actualise en temps réel</li>
                <li>• Cliquez sur pause pour arrêter</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Zone de test des messages audio */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">📱 Messages Audio de Test</h2>
          
          <div className="space-y-6">
            {/* Message audio reçu */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Message Reçu (Contact)</h3>
              <MediaGroup 
                media={[demoAudio]}
                isMe={false}
                isMobile={false}
                messageId="demo-received"
                onAudioStateChange={(state) => console.log('État audio reçu:', state)}
              />
            </div>

            {/* Message audio envoyé */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Message Envoyé (Vous)</h3>
              <MediaGroup 
                media={[{
                  ...demoAudio,
                  duration: '0:45',
                  timestamp: '9:19 PM',
                  size: '198 KB'
                }]}
                isMe={true}
                isMobile={false}
                messageId="demo-sent"
                onAudioStateChange={(state) => console.log('État audio envoyé:', state)}
              />
            </div>

            {/* Message audio mobile */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Version Mobile</h3>
              <MediaGroup 
                media={[{
                  ...demoAudio,
                  duration: '2:15',
                  timestamp: '9:20 PM',
                  size: '456 KB'
                }]}
                isMe={false}
                isMobile={true}
                messageId="demo-mobile"
                onAudioStateChange={(state) => console.log('État audio mobile:', state)}
              />
            </div>
          </div>
        </div>

        {/* Légende et explications */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">🔍 Détails Techniques</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h3 className="font-medium text-white mb-2">Indicateur de Progression</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Boule bleue qui se déplace le long de la forme d'onde</li>
                <li>• Position calculée selon `currentTime * 100%`</li>
                <li>• Transition fluide avec `duration-100 ease-out`</li>
                <li>• Ombre portée pour un effet de profondeur</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-white mb-2">Forme d'Onde Dynamique</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Barres colorées selon l'état de lecture</li>
                <li>• Barre actuelle en bleu vif</li>
                <li>• Barres jouées en bleu avec opacité 0.8</li>
                <li>• Barres non jouées en gris avec opacité 0.4</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Temps de Lecture</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Calcul automatique du temps écoulé</li>
                <li>• Format MM:SS / MM:SS</li>
                <li>• Mise à jour en temps réel</li>
                <li>• Synchronisé avec la progression</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white mb-2">Barre de Progression</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Barre linéaire sous la forme d'onde</li>
                <li>• Largeur proportionnelle à la progression</li>
                <li>• Couleur bleue avec transition fluide</li>
                <li>• Complémentaire à l'indicateur circulaire</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
