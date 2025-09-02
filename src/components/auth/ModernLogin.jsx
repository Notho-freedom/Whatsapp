'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FcGoogle } from 'react-icons/fc';

export default function ModernLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Animation de l'arrière-plan avec particules
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 80;

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
        // Utiliser les couleurs WhatsApp
        this.color = Math.random() > 0.7 ? '#00a884' : '#667781';
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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      // Simulation d'authentification Google
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Authentification Google en cours...');
    } catch (err) {
      console.error('Erreur lors de l\'authentification Google');
    } finally {
      setIsLoading(false);
    }
  };

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
            isHovered ? 'scale-10 rotate-3' : 'scale-100 rotate-0'
          }`}>
            <div className="relative w-full h-full">
              {/* Cercle de fond avec gradient WhatsApp */}
              <div className="absolute inset-0 bg-gradient-to-br from-whatsapp-primary via-[#00a884] to-[#008f72] rounded-full shadow-2xl animate-pulse"></div>
              
              {/* Logo WhatsApp centré */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.242.489 1.668.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </div>
              
              {/* Anneaux orbitaux avec couleurs WhatsApp */}
              <div className="absolute inset-0 border-2 border-whatsapp-primary/30 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
              <div className="absolute inset-2 border border-whatsapp-secondary/20 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
            </div>
          </div>
        </div>

        {/* Titre avec typographie WhatsApp - centré */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-white mb-3 tracking-wider font-segoe">
            WhatsApp
          </h1>
          <p className="text-whatsapp-secondary text-lg font-light">
            Connectez-vous pour continuer
          </p>
        </div>

        {/* Bouton Google avec thème WhatsApp - centré */}
        <div className="flex justify-center mb-16">
          <div className="relative group">
            {/* Effet de lueur avec couleur WhatsApp */}
            <div className="absolute -inset-1 bg-gradient-to-r from-whatsapp-primary to-[#008f72] rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Bouton principal avec thème WhatsApp */}
            <button
              onClick={handleGoogleAuth}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              disabled={isLoading}
              className="relative bg-whatsapp-dark-700/80 backdrop-blur-xl border-none text-white py-4 px-8 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-whatsapp-primary focus:ring-offset-2 focus:ring-offset-whatsapp-dark-950 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 group-hover:bg-whatsapp-dark-700 group-hover:border-whatsapp-dark-500 group-hover:scale-10 transform"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-whatsapp-primary"></div>
                  <span className="text-lg">Connexion en cours...</span>
                </>
              ) : (
                <>
                  <FcGoogle className="w-6 h-6 group-hover:scale-10 transition-transform duration-300" />
                  <span className="text-lg group-hover:tracking-wider transition-all duration-300">
                    Continuer avec Google
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Texte de footer avec thème WhatsApp - centré */}
        <div className="text-center">
          <p className="text-whatsapp-secondary text-sm font-light">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
