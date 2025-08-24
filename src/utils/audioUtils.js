// Utilitaires pour la gestion audio des messages vocaux

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.currentMessageId = null;
    this.audioContext = null;
    this.audioBuffer = null;
  }

  // Initialiser le contexte audio
  async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du contexte audio:', error);
      return false;
    }
  }

  // Charger un fichier audio
  async loadAudio(url) {
    try {
      if (!this.audioContext) {
        await this.initAudioContext();
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return true;
    } catch (error) {
      console.error('Erreur lors du chargement audio:', error);
      return false;
    }
  }

  // Lire un message audio
  async playAudio(messageId, url, onProgress, onComplete) {
    try {
      // Arrêter l'audio en cours
      this.stopAudio();

      // Charger le nouvel audio
      const loaded = await this.loadAudio(url);
      if (!loaded) return false;

      // Créer la source audio
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.audioBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Gérer la progression
      const startTime = this.audioContext.currentTime;
      const duration = this.audioBuffer.duration;
      
      const progressInterval = setInterval(() => {
        const elapsed = this.audioContext.currentTime - startTime;
        const progress = elapsed / duration;
        
        if (onProgress) {
          onProgress(progress, elapsed, duration);
        }
        
        if (progress >= 1) {
          clearInterval(progressInterval);
          if (onComplete) onComplete();
        }
      }, 100);

      // Démarrer la lecture
      source.start(0);
      this.currentAudio = { source, gainNode, progressInterval };
      this.currentMessageId = messageId;

      return true;
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
      return false;
    }
  }

  // Mettre en pause l'audio
  pauseAudio() {
    if (this.currentAudio && this.audioContext) {
      this.audioContext.suspend();
    }
  }

  // Reprendre l'audio
  resumeAudio() {
    if (this.currentAudio && this.audioContext) {
      this.audioContext.resume();
    }
  }

  // Arrêter l'audio
  stopAudio() {
    if (this.currentAudio) {
      if (this.currentAudio.source) {
        this.currentAudio.source.stop();
      }
      if (this.currentAudio.progressInterval) {
        clearInterval(this.currentAudio.progressInterval);
      }
      this.currentAudio = null;
    }
    this.currentMessageId = null;
  }

  // Obtenir l'état actuel
  getCurrentState() {
    return {
      messageId: this.currentMessageId,
      isPlaying: !!this.currentAudio,
      audioContext: this.audioContext?.state || 'suspended'
    };
  }

  // Nettoyer les ressources
  cleanup() {
    this.stopAudio();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Instance singleton
const audioManager = new AudioManager();

// Fonctions utilitaires
export const playVoiceMessage = (messageId, url, onProgress, onComplete) => {
  return audioManager.playAudio(messageId, url, onProgress, onComplete);
};

export const pauseVoiceMessage = () => {
  audioManager.pauseAudio();
};

export const resumeVoiceMessage = () => {
  audioManager.resumeAudio();
};

export const stopVoiceMessage = () => {
  audioManager.stopAudio();
};

export const getAudioState = () => {
  return audioManager.getCurrentState();
};

export const cleanupAudio = () => {
  audioManager.cleanup();
};

export default audioManager;
