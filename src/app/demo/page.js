import { NativeNotificationDemo } from '@/features';
import { GoogleAuthDemo, GoogleContactsManager } from '@/components/auth';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Titre de la page */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚀 Démonstrations WhatsApp Clone
          </h1>
          <p className="text-xl text-gray-600">
            Testez toutes les fonctionnalités : Notifications natives et Authentification Google
          </p>
        </div>

        {/* Grille des démonstrations */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Démonstration des notifications natives */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 p-4">
              <h2 className="text-xl font-semibold text-white">
                🔔 Notifications Natives Electron
              </h2>
              <p className="text-blue-100 text-sm">
                Testez les notifications natives du système d'exploitation
              </p>
            </div>
            <div className="p-6">
              <NativeNotificationDemo />
            </div>
          </div>

          {/* Démonstration de l'authentification Google */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-green-600 p-4">
              <h2 className="text-xl font-semibold text-white">
                🔐 Authentification Google
              </h2>
              <p className="text-green-100 text-sm">
                Testez la connexion et l'enregistrement automatiques
              </p>
            </div>
            <div className="p-6">
              <GoogleAuthDemo />
            </div>
          </div>
        </div>

        {/* Gestionnaire de contacts Google */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-purple-600 p-4">
            <h2 className="text-xl font-semibold text-white">
              📱 Gestionnaire de Contacts Google
            </h2>
            <p className="text-purple-100 text-sm">
              Synchronisez et gérez vos contacts Google
            </p>
          </div>
          <div className="p-6">
            <GoogleContactsManager />
          </div>
        </div>

        {/* Informations sur les fonctionnalités */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            ✨ Fonctionnalités Disponibles
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Notifications natives */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-4xl mb-3">🔔</div>
              <h4 className="font-semibold text-blue-800 mb-2">Notifications Natives</h4>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Notifications du système</li>
                <li>• Actions cliquables</li>
                <li>• Auto-fermeture</li>
                <li>• Gestion des erreurs</li>
              </ul>
            </div>

            {/* Authentification Google */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-4xl mb-3">🔐</div>
              <h4 className="font-semibold text-green-800 mb-2">Auth Google</h4>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• Connexion automatique</li>
                <li>• Enregistrement fallback</li>
                <li>• Persistance des sessions</li>
                <li>• Validation des tokens</li>
              </ul>
            </div>

            {/* Intégration Electron */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-semibold text-purple-800 mb-2">Electron</h4>
              <ul className="text-sm text-purple-700 space-y-1 text-left">
                <li>• Menus contextuels natifs</li>
                <li>• Raccourcis globaux</li>
                <li>• API système</li>
                <li>• Cross-platform</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions de test */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4">
            📋 Instructions de Test
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Notifications Natives</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Cliquez sur les boutons de test</li>
                <li>2. Vérifiez l'affichage des notifications</li>
                <li>3. Testez les actions cliquables</li>
                <li>4. Vérifiez l'auto-fermeture</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-700 mb-2">Authentification Google</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Cliquez sur "Se connecter avec Google"</li>
                <li>2. Suivez le processus de connexion</li>
                <li>3. Testez la persistance de session</li>
                <li>4. Testez la déconnexion</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Pour tester l'authentification Google, vous devez configurer un projet Google Cloud 
              et définir la variable d'environnement <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>. 
              Consultez le fichier <code>GOOGLE_AUTH_SETUP.md</code> pour plus de détails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
