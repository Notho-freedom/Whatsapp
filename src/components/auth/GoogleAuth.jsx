'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function GoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [authStep, setAuthStep] = useState('idle'); // 'idle', 'login', 'register', 'success'
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Animation de l'arrière-plan avec particules
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 100;

    // Configuration du canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Classe particule améliorée avec couleurs WhatsApp
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 3 + 1;
        this.opacity = Math.random() * 0.6 + 0.1;
        // Utiliser les couleurs WhatsApp avec plus de variété
        this.color = Math.random() > 0.6 ? '#00a884' : 
                    Math.random() > 0.3 ? '#53bdeb' : '#667781';
        this.originalSize = this.size;
        this.pulse = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.02;

        // Effet de pulsation
        this.size = this.originalSize + Math.sin(this.pulse) * 0.5;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Créer les particules
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dessiner les particules
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Dessiner les connexions avec couleurs WhatsApp
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + 
            Math.pow(particle.y - otherParticle.y, 2)
          );
          
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.4;
            ctx.save();
            ctx.globalAlpha = opacity;
            // Utiliser la couleur primaire WhatsApp
            ctx.strokeStyle = '#00a884';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
          // Essayer de récupérer l'utilisateur depuis Firebase
          try {
            const userService = (await import('@/utils/userService')).default;
            const existingUser = await userService.getUserByGoogleId(userInfo.sub);
            
            if (existingUser) {
              // Mettre à jour les informations de connexion
              await userService.updateUserLoginInfo(existingUser.id);
              console.log('✅ Utilisateur existant récupéré depuis Firebase:', existingUser);
              setUser(existingUser);
              setAuthStep('success');
              return;
            }
          } catch (firebaseError) {
            console.log('⚠️ Erreur Firebase, utilisation des données locales:', firebaseError);
          }
          
          // Fallback vers les données locales
          const localUserData = localStorage.getItem('userData');
          if (localUserData) {
            try {
              const parsedUser = JSON.parse(localUserData);
              setUser(parsedUser);
              setAuthStep('success');
              return;
            } catch (parseError) {
              console.log('⚠️ Erreur de parsing des données locales');
            }
          }
          
          // Créer un utilisateur temporaire avec les infos Google
          const tempUser = {
            id: userInfo.sub,
            googleId: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            firstName: userInfo.name ? userInfo.name.split(' ')[0] : '',
            lastName: userInfo.name ? userInfo.name.split(' ').slice(1).join(' ') : '',
            displayName: userInfo.name,
            username: userInfo.email ? userInfo.email.split('@')[0] : `user_${Date.now()}`,
            avatar: userInfo.picture,
            avatarUrl: userInfo.picture,
            avatarThumbnail: userInfo.picture,
            status: 'Disponible',
            statusMessage: 'Salut ! Je suis sur WhatsApp.',
            isOnline: true,
            lastSeen: null,
            lastSeenTimestamp: null,
            bio: '',
            location: '',
            website: '',
            birthday: null,
            gender: '',
            isVerified: false,
            isPremium: false,
            twoFactorEnabled: false,
            backupEnabled: false,
            contacts: [],
            blockedUsers: [],
            favoriteContacts: [],
            pushTokens: [],
            syncPreferences: {
              contacts: true,
              messages: true,
              media: true,
              settings: true
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date(),
            loginCount: 1
          };
          
          setUser(tempUser);
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
      
      // Créer ou mettre à jour l'utilisateur dans Firebase
      try {
        const userService = (await import('@/utils/userService')).default;
        const userData = await userService.createOrUpdateGoogleUser(userInfo);
        console.log('✅ Utilisateur synchronisé avec Firebase:', userData);
        
        // Sauvegarder le token et les données utilisateur
        localStorage.setItem('googleAuthToken', response.access_token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setUser(userData);
        setAuthStep('success');
        setIsLoading(false);
        
        // Émettre un événement de connexion réussie
        window.dispatchEvent(new CustomEvent('google-auth-success', {
          detail: { user: userData, type: 'login' }
        }));
        
      } catch (firebaseError) {
        console.error('❌ Erreur lors de la synchronisation Firebase:', firebaseError);
        
        // Fallback : utiliser les données locales si Firebase échoue
        const fallbackUserData = {
          id: userInfo.sub,
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          firstName: userInfo.name ? userInfo.name.split(' ')[0] : '',
          lastName: userInfo.name ? userInfo.name.split(' ').slice(1).join(' ') : '',
          displayName: userInfo.name,
          username: userInfo.email ? userInfo.email.split('@')[0] : `user_${Date.now()}`,
          avatar: userInfo.picture,
          avatarUrl: userInfo.picture,
          avatarThumbnail: userInfo.picture,
          status: 'Disponible',
          statusMessage: 'Salut ! Je suis sur WhatsApp.',
          isOnline: true,
          lastSeen: null,
          lastSeenTimestamp: null,
          bio: '',
          location: '',
          website: '',
          birthday: null,
          gender: '',
          isVerified: false,
          isPremium: false,
          twoFactorEnabled: false,
          backupEnabled: false,
          contacts: [],
          blockedUsers: [],
          favoriteContacts: [],
          pushTokens: [],
          syncPreferences: {
            contacts: true,
            messages: true,
            media: true,
            settings: true
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          loginCount: 1
        };
        
        // Sauvegarder le token et les données utilisateur
        localStorage.setItem('googleAuthToken', response.access_token);
        localStorage.setItem('userData', JSON.stringify(fallbackUserData));
        
        setUser(fallbackUserData);
        setAuthStep('success');
        setIsLoading(false);
        
        // Émettre un événement de connexion réussie
        window.dispatchEvent(new CustomEvent('google-auth-success', {
          detail: { user: fallbackUserData, type: 'login' }
        }));
      }

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

  // Composant de chargement amélioré
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-3">
      <div className="w-3 h-3 bg-whatsapp-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-3 bg-whatsapp-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-3 h-3 bg-whatsapp-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );

  // Rendu du bouton de connexion amélioré
  const renderLoginButton = () => (
    <div className="flex justify-center mb-8">
      <div className="relative group w-full max-w-xs">
        {/* Effet de lueur amélioré */}
        <div className="absolute -inset-1 bg-gradient-to-r from-whatsapp-primary via-[#00a884] to-[#008f72] rounded-2xl blur opacity-20 group-hover:opacity-50 transition-all duration-500 group-hover:duration-300 animate-pulse"></div>
        
        <button
          onClick={handleGoogleLogin}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          className="relative w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white py-4 px-8 rounded-2xl font-medium focus:outline-none focus:ring-4 focus:ring-whatsapp-primary/50 focus:ring-offset-2 focus:ring-offset-whatsapp-dark-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 group-hover:bg-white/20 group-hover:border-white/30 group-hover:scale-[1.02] transform shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              <span className="text-lg">Connexion en cours...</span>
            </>
          ) : (
            <>
              <FcGoogle className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-lg group-hover:tracking-wide transition-all duration-300">
                Continuer avec Google
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Rendu du profil utilisateur amélioré
  const renderUserProfile = () => (
    <div className="relative z-10 w-full max-w-md mx-auto text-center px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.picture}
            alt={user.name}
            className="w-16 h-16 rounded-full border-4 border-whatsapp-primary shadow-lg"
          />
          <div className="text-left">
            <h3 className="text-xl font-semibold text-white">{user.name}</h3>
            <p className="text-whatsapp-secondary">{user.email}</p>
            {user.isNewUser && (
              <span className="inline-block px-2 py-1 bg-whatsapp-primary/20 text-whatsapp-primary text-xs rounded-full mt-1">
                Nouveau compte
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 bg-red-500/80 backdrop-blur-xl text-white rounded-lg hover:bg-red-600/80 transition-all duration-300 border border-red-400/30"
          >
            Se déconnecter
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-profile-settings'))}
            className="flex-1 px-4 py-2 bg-whatsapp-dark-700/80 backdrop-blur-xl text-white rounded-lg hover:bg-whatsapp-dark-600/80 transition-all duration-300 border border-whatsapp-dark-500/30"
          >
            Paramètres
          </button>
        </div>
      </div>
    </div>
  );

  // Rendu des états de chargement et d'erreur améliorés
  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2029&q=80")'
          }}
        />
        
        {/* Overlay avec fondu progressif vers le bas */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
        
        {/* Canvas animé en arrière-plan */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
        
        {/* Overlay subtil avec thème WhatsApp */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-whatsapp-dark-900/20 to-whatsapp-dark-900/40" style={{ zIndex: 2 }} />
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-primary mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {authStep === 'login' ? 'Connexion en cours...' : 'Création du compte...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2029&q=80")'
          }}
        />
        
        {/* Overlay avec fondu progressif vers le bas */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
        
        {/* Canvas animé en arrière-plan */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
        
        {/* Overlay subtil avec thème WhatsApp */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-whatsapp-dark-900/20 to-whatsapp-dark-900/40" style={{ zIndex: 2 }} />
        
        <div className="relative z-10 w-full max-w-md mx-auto text-center px-4">
          <div className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 rounded-2xl p-6 shadow-2xl">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Erreur d'authentification</h3>
              <p className="text-red-300 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full px-4 py-2 bg-whatsapp-primary/80 backdrop-blur-xl text-white rounded-lg hover:bg-whatsapp-primary transition-all duration-300 border border-whatsapp-primary/30"
                >
                  Réessayer la connexion
                </button>
                <button
                  onClick={handleGoogleRegister}
                  className="w-full px-4 py-2 bg-blue-500/80 backdrop-blur-xl text-white rounded-lg hover:bg-blue-600/80 transition-all duration-300 border border-blue-400/30"
                >
                  Créer un nouveau compte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user && authStep === 'success') {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Image de fond */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2029&q=80")'
          }}
        />
        
        {/* Overlay avec fondu progressif vers le bas */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
        
        {/* Canvas animé en arrière-plan */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
        
        {/* Overlay subtil avec thème WhatsApp */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-whatsapp-dark-900/20 to-whatsapp-dark-900/40" style={{ zIndex: 2 }} />
        
        {renderUserProfile()}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Image de fond */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2029&q=80")'
        }}
      />
      
      {/* Overlay avec fondu progressif vers le bas */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
      
      {/* Canvas animé en arrière-plan */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
      
      {/* Overlay subtil avec thème WhatsApp */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-whatsapp-dark-900/20 to-whatsapp-dark-900/40" style={{ zIndex: 2 }} />
      
      {/* Contenu principal - parfaitement centré */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center px-4">
        {/* Logo animé avec thème WhatsApp - centré */}
        <div className="mb-12 flex justify-center">
          <div className={`w-32 h-32 transition-all duration-700 ease-out ${
            isHovered ? 'scale-105 rotate-2' : 'scale-100 rotate-0'
          } group-hover:shadow-2xl animate-float`} style={{
            animation: 'float 6s ease-in-out infinite'
          }}>
            <div className="relative w-full h-full">
              {/* Goutte d'eau déformée avec effet verre et superposition verte WhatsApp - morphing continu */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 border border-white/30 animate-morph" style={{
                filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))'
              }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-whatsapp-primary/40 via-[#00a884]/30 to-[#008f72]/40 animate-morph"></div>
             
             {/* Logo WhatsApp centré avec effet de pulse au survol */}
             <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
               <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.242.489 1.668.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
               </svg>
             </div>

           </div>
         </div>
       </div>

       {/* Titre avec typographie WhatsApp - centré */}
       <div className="text-center mb-12 animate-fadeIn" style={{animationDelay: '0.2s'}}>
         <h1 className="text-4xl font-light text-white mb-3 tracking-wider font-segoe">
           WhatsApp
         </h1>
         <p className="text-whatsapp-secondary text-lg font-light">
           Connectez-vous pour continuer
         </p>
       </div>

       {renderLoginButton()}

       {/* Texte de footer avec thème WhatsApp - centré */}
       <div className="text-center mt-16">
         <p 
           className="text-whatsapp-secondary text-sm font-light cursor-pointer hover:text-whatsapp-primary transition-colors duration-300"
           onClick={() => setShowTerms(!showTerms)}
         >
           En continuant, vous acceptez nos {showTerms ? 'conditions d\'utilisation' : 'termes et politiques'}
         </p>
         
         {showTerms && (
           <div className="mt-4 p-4 bg-whatsapp-dark-800/80 backdrop-blur-md rounded-lg text-left text-whatsapp-secondary text-xs animate-fadeIn">
             <p className="mb-2">
               En vous connectant, vous acceptez notre politique de confidentialité et nos conditions d'utilisation.
               WhatsApp partage certaines informations avec Google pour assurer le fonctionnement du service.
             </p>
             <p>
               Nous ne publierons jamais rien sans votre permission.
             </p>
           </div>
         )}
       </div>

       {/* Footer avec copyright */}
       <div className="absolute bottom-8 left-0 right-0 text-center">
         <p className="text-whatsapp-secondary/70 text-xs font-light">
           © {new Date().getFullYear()} WhatsApp LLC. Tous droits réservés.
         </p>
       </div>
     </div>

     {/* Styles CSS intégrés pour les animations */}
     <style jsx>{`
       @keyframes fadeIn {
         from { opacity: 0; transform: translateY(10px); }
         to { opacity: 1; transform: translateY(0); }
       }
       .animate-fadeIn {
         animation: fadeIn 0.5s ease-out forwards;
       }
       
       @keyframes float {
         0%, 100% { 
           transform: translateY(0px) rotate(-5deg) scale(1.1); 
         }
         25% { 
           transform: translateY(-8px) rotate(-3deg) scale(1.08); 
         }
         50% { 
           transform: translateY(-12px) rotate(-1deg) scale(1.12); 
         }
         75% { 
           transform: translateY(-6px) rotate(-4deg) scale(1.09); 
         }
       }
       
       .animate-float {
         animation: float 6s ease-in-out infinite;
       }
       
       @keyframes morph {
         0% { 
           border-radius: 47% 53% 61% 39% / 52% 48% 52% 48%;
           transform: rotate(-2deg) scale(1.05);
         }
         12.5% { 
           border-radius: 73% 27% 59% 41% / 57% 43% 57% 43%;
           transform: rotate(1deg) scale(1.12);
         }
         25% { 
           border-radius: 31% 69% 41% 59% / 43% 57% 43% 57%;
           transform: rotate(-3deg) scale(0.98);
         }
         37.5% { 
           border-radius: 67% 33% 51% 49% / 49% 51% 49% 51%;
           transform: rotate(2deg) scale(1.08);
         }
         50% { 
           border-radius: 53% 47% 39% 61% / 48% 52% 48% 52%;
           transform: rotate(-1deg) scale(1.15);
         }
         62.5% { 
           border-radius: 29% 71% 69% 31% / 51% 49% 51% 49%;
           transform: rotate(3deg) scale(0.95);
         }
         75% { 
           border-radius: 71% 29% 33% 67% / 47% 53% 47% 53%;
           transform: rotate(-2deg) scale(1.1);
         }
         87.5% { 
           border-radius: 41% 59% 47% 53% / 54% 46% 54% 46%;
           transform: rotate(1deg) scale(1.03);
         }
         100% { 
           border-radius: 47% 53% 61% 39% / 52% 48% 52% 48%;
           transform: rotate(-2deg) scale(1.05);
         }
       }
       
       .animate-morph {
         animation: morph 12s ease-in-out infinite;
       }
     `}</style>
   </div>
  );
}

