import React, { useState, useEffect, useCallback } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [authStep, setAuthStep] = useState('idle'); // 'idle', 'login', 'register', 'success'

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    checkExistingAuth();
  }, []);

    // Initialiser l'authentification Google avec la nouvelle API
  const initializeGoogleAuth = useCallback(async () => {
    try {
      // Charger l'API Google Identity Services
      await loadGoogleAPI();
      
      // Initialiser le client Google
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
                      const client = window.google.accounts.oauth2.initTokenClient({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '425288140548-qi3u0acra5jnitnr2d2ac4m3gdcg35eq.apps.googleusercontent.com',
              scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/contacts.readonly',
              callback: (response) => {
               // Le callback sera géré par le composant
               if (response.error) {
                 setError(`Erreur d'authentification: ${response.error}`);
                 setIsLoading(false);
               } else {
                 handleAuthResponse(response);
               }
             },
          });
          resolve(client);
        } else {
          reject(new Error('Google Identity Services non disponible'));
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Google Auth:', error);
      setError('Impossible d\'initialiser l\'authentification Google');
      throw error;
    }
  }, []);
  // Initialiser l'authentification Google au chargement
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeGoogleAuth();
      } catch (error) {
        console.log('Initialisation de Google Auth reportée');
      }
    };
    
    initAuth();
  }, [initializeGoogleAuth]);



  // Vérifier l'authentification existante
  const checkExistingAuth = useCallback(async () => {
    try {
      // Vérifier si un token existe dans le localStorage
      const token = localStorage.getItem('googleAuthToken');
      if (token) {
        // Valider le token avec Google
        const userInfo = await validateGoogleToken(token);
        if (userInfo) {
          setUser(userInfo);
          setAuthStep('success');
          return;
        }
      }
    } catch (error) {
      console.log('Aucune authentification existante');
    }
  }, []);

  // Valider un token Google
  const validateGoogleToken = async (token) => {
    try {
      // Appel direct à l'endpoint Google userinfo pour avoir toutes les infos
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userInfo = await response.json();
        console.log('Validation token - Informations utilisateur:', userInfo);
        
        return {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          token: token
        };
      }
      
      // Fallback vers notre API route si l'appel direct échoue
      console.log('Fallback vers API route pour validation...');
      const fallbackResponse = await fetch(`/api/google/validate?token=${encodeURIComponent(token)}`);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture,
          token: token
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return null;
    }
  };


  // Charger l'API Google Identity Services
  const loadGoogleAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Attendre que l'API soit complètement initialisée
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            resolve();
          } else {
            reject(new Error('Google Identity Services non disponible'));
          }
        }, 500);
      };
      script.onerror = () => reject(new Error('Impossible de charger Google Identity Services'));
      document.head.appendChild(script);
    });
  };

  // Tenter la connexion Google
  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAuthStep('login');

    try {
      // S'assurer que Google Auth est initialisé
      let client = window.googleAuthClient;
      if (!client) {
        client = await initializeGoogleAuth();
        window.googleAuthClient = client;
      }

      // Tenter la connexion avec la nouvelle API
      client.requestAccessToken();

    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      setError('Erreur lors de l\'initialisation de l\'authentification Google');
      setIsLoading(false);
    }
  }, [initializeGoogleAuth]);

  // Gérer la réponse de l'authentification
  const handleAuthResponse = useCallback(async (response) => {
    try {
      if (response.error) {
        throw new Error(response.error);
      }

      console.log('Token reçu:', response.access_token);

      // Récupérer les informations utilisateur avec le token
      const userInfo = await getUserInfo(response.access_token);
      console.log('Informations utilisateur récupérées:', userInfo);
      
      const userData = {
        id: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        token: response.access_token
      };

      console.log('Données utilisateur finales:', userData);

      // Sauvegarder le token
      localStorage.setItem('googleAuthToken', response.access_token);
      
      setUser(userData);
      setAuthStep('success');
      setIsLoading(false);
      
      // Émettre un événement de connexion réussie
      window.dispatchEvent(new CustomEvent('google-auth-success', {
        detail: { user: userData, type: 'login' }
      }));

    } catch (error) {
      console.error('Erreur lors du traitement de la réponse:', error);
      setError('Erreur lors de la récupération des informations utilisateur');
      setIsLoading(false);
    }
  }, []);

  // Récupérer les informations utilisateur avec le token
  const getUserInfo = async (accessToken) => {
    try {
      // Appel direct à l'endpoint Google userinfo pour avoir toutes les infos
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Impossible de récupérer les informations utilisateur depuis Google');
      }
      
      const userInfo = await response.json();
      console.log('Informations complètes récupérées de Google:', userInfo);
      
      return {
        sub: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      
      // Fallback vers notre API route si l'appel direct échoue
      console.log('Tentative de fallback vers notre API route...');
      const fallbackResponse = await fetch(`/api/google/validate?token=${encodeURIComponent(accessToken)}`);
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return {
          sub: data.user.id,
          email: data.user.email,
          name: data.user.name,
          picture: data.user.picture
        };
      }
      
      throw error;
    }
  };

  // Tenter l'enregistrement Google (même logique que la connexion)
  const handleGoogleRegister = useCallback(async () => {
    // Pour l'enregistrement, on utilise la même logique que la connexion
    // Google gère automatiquement la création de compte si nécessaire
    await handleGoogleLogin();
  }, [handleGoogleLogin]);

  // Déconnexion
  const handleLogout = useCallback(() => {
    if (window.googleAuthClient) {
      // La nouvelle API gère automatiquement la déconnexion
      // On peut aussi appeler window.google.accounts.oauth2.revoke si nécessaire
    }
    
    localStorage.removeItem('googleAuthToken');
    setUser(null);
    setAuthStep('idle');
    setError(null);
    
    // Émettre un événement de déconnexion
    window.dispatchEvent(new CustomEvent('google-auth-logout'));
  }, []);

  // Rendu du bouton de connexion
  const renderLoginButton = () => (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white text-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FcGoogle size={24} />
      <span className="font-medium">
        {isLoading ? 'Connexion en cours...' : 'Se connecter avec Google'}
      </span>
    </button>
  );

  // Rendu du profil utilisateur
  const renderUserProfile = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user.picture}
          alt={user.name}
          className="w-16 h-16 rounded-full border-4 border-green-500"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.isNewUser && (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
              Nouveau compte
            </span>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleLogout}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Se déconnecter
        </button>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-profile-settings'))}
          className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Paramètres
        </button>
      </div>
    </div>
  );

  // Rendu des états de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {authStep === 'login' ? 'Connexion en cours...' : 'Création du compte...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur d'authentification</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Réessayer la connexion
            </button>
            <button
              onClick={handleGoogleRegister}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Créer un nouveau compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user && authStep === 'success') {
    return renderUserProfile();
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connexion WhatsApp Clone
        </h2>
        <p className="text-gray-600">
          Connectez-vous avec votre compte Google pour continuer
        </p>
      </div>
      
      {renderLoginButton()}
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
        </p>
      </div>
    </div>
  );
}

