'use client';

import { firebaseService } from './firebaseService';

class CallService {
  constructor() {
    this.activeCalls = new Map();
    this.callListeners = new Map();
    this.mediaStream = null;
    this.peerConnection = null;
    this.isInitialized = false;
  }

  // Initialisation du service
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Configuration WebRTC
      this.rtcConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      this.isInitialized = true;
      console.log('📞 CallService initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation CallService:', error);
    }
  }

  // Créer un nouvel appel
  async createCall(participantId, isVideo = false, fromProfile = false, fromChat = false, chatId = null) {
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const callData = {
        id: callId,
        type: isVideo ? 'video' : 'voice',
        isVideo,
        state: 'outgoing',
        participant: await this.getParticipantData(participantId),
        participants: [await this.getParticipantData(participantId)],
        startTime: new Date(),
        fromProfile,
        fromChat,
        chatId,
        metadata: {
          createdBy: this.getCurrentUserId(),
          createdAt: new Date().toISOString()
        }
      };

      // Sauvegarder l'appel dans Firebase
      await this.saveCallToFirebase(callData);
      
      // Ajouter à la liste des appels actifs
      this.activeCalls.set(callId, callData);
      
      // Émettre l'événement de création d'appel
      this.emitCallEvent('call-created', callData);
      
      return callData;
    } catch (error) {
      console.error('❌ Erreur création appel:', error);
      throw error;
    }
  }

  // Accepter un appel
  async acceptCall(callId) {
    try {
      const call = this.activeCalls.get(callId);
      if (!call) throw new Error('Appel non trouvé');

      // Mettre à jour l'état de l'appel
      call.state = 'active';
      call.acceptedAt = new Date();
      
      // Initialiser WebRTC
      await this.initializeWebRTC(call);
      
      // Mettre à jour dans Firebase
      await this.updateCallInFirebase(callId, { state: 'active', acceptedAt: call.acceptedAt });
      
      // Émettre l'événement d'acceptation
      this.emitCallEvent('call-accepted', call);
      
      return call;
    } catch (error) {
      console.error('❌ Erreur acceptation appel:', error);
      throw error;
    }
  }

  // Refuser un appel
  async declineCall(callId, reason = 'declined') {
    try {
      const call = this.activeCalls.get(callId);
      if (!call) throw new Error('Appel non trouvé');

      // Mettre à jour l'état de l'appel
      call.state = 'declined';
      call.declinedAt = new Date();
      call.declineReason = reason;
      
      // Mettre à jour dans Firebase
      await this.updateCallInFirebase(callId, { 
        state: 'declined', 
        declinedAt: call.declinedAt,
        declineReason: reason
      });
      
      // Nettoyer l'appel
      this.cleanupCall(callId);
      
      // Émettre l'événement de refus
      this.emitCallEvent('call-declined', call);
      
      return call;
    } catch (error) {
      console.error('❌ Erreur refus appel:', error);
      throw error;
    }
  }

  // Terminer un appel
  async endCall(callId, reason = 'ended') {
    try {
      const call = this.activeCalls.get(callId);
      if (!call) throw new Error('Appel non trouvé');

      // Mettre à jour l'état de l'appel
      call.state = 'ended';
      call.endedAt = new Date();
      call.endReason = reason;
      call.duration = this.calculateCallDuration(call);
      
      // Arrêter les médias
      await this.stopMediaStream();
      
      // Fermer la connexion WebRTC
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Mettre à jour dans Firebase
      await this.updateCallInFirebase(callId, { 
        state: 'ended', 
        endedAt: call.endedAt,
        endReason: reason,
        duration: call.duration
      });
      
      // Nettoyer l'appel
      this.cleanupCall(callId);
      
      // Émettre l'événement de fin d'appel
      this.emitCallEvent('call-ended', call);
      
      return call;
    } catch (error) {
      console.error('❌ Erreur fin appel:', error);
      throw error;
    }
  }

  // Contrôles d'appel
  async toggleMute(callId, isMuted) {
    try {
      if (this.mediaStream) {
        this.mediaStream.getAudioTracks().forEach(track => {
          track.enabled = !isMuted;
        });
      }
      
      this.emitCallEvent('call-mute-toggled', { callId, isMuted });
    } catch (error) {
      console.error('❌ Erreur toggle mute:', error);
    }
  }

  async toggleVideo(callId, isVideoEnabled) {
    try {
      if (this.mediaStream) {
        this.mediaStream.getVideoTracks().forEach(track => {
          track.enabled = isVideoEnabled;
        });
      }
      
      this.emitCallEvent('call-video-toggled', { callId, isVideoEnabled });
    } catch (error) {
      console.error('❌ Erreur toggle video:', error);
    }
  }

  async toggleSpeaker(callId, isSpeakerOn) {
    try {
      // Logique pour activer/désactiver le haut-parleur
      this.emitCallEvent('call-speaker-toggled', { callId, isSpeakerOn });
    } catch (error) {
      console.error('❌ Erreur toggle speaker:', error);
    }
  }

  // Gestion des médias
  async initializeWebRTC(call) {
    try {
      // Créer la connexion peer
      this.peerConnection = new RTCPeerConnection(this.rtcConfiguration);
      
      // Obtenir le stream média
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: call.isVideo
      });
      
      // Ajouter les tracks au peer connection
      this.mediaStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.mediaStream);
      });
      
      // Configuration des événements WebRTC
      this.setupWebRTCEvents();
      
      console.log('📞 WebRTC initialisé pour l\'appel:', call.id);
    } catch (error) {
      console.error('❌ Erreur initialisation WebRTC:', error);
      throw error;
    }
  }

  setupWebRTCEvents() {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Envoyer le candidat ICE à l'autre participant
        this.sendIceCandidate(event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      // Gérer le stream reçu de l'autre participant
      const remoteStream = event.streams[0];
      this.emitCallEvent('remote-stream-received', { stream: remoteStream });
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('📞 État connexion WebRTC:', this.peerConnection.connectionState);
      this.emitCallEvent('connection-state-changed', { 
        state: this.peerConnection.connectionState 
      });
    };
  }

  async stopMediaStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
    }
  }

  // Gestion des appels entrants
  async handleIncomingCall(callData) {
    try {
      // Ajouter à la liste des appels actifs
      this.activeCalls.set(callData.id, callData);
      
      // Émettre l'événement d'appel entrant
      this.emitCallEvent('incoming-call', callData);
      
      return callData;
    } catch (error) {
      console.error('❌ Erreur gestion appel entrant:', error);
      throw error;
    }
  }

  // Utilitaires
  async getParticipantData(participantId) {
    try {
      // Récupérer les données du participant depuis Firebase ou le cache
      const user = await firebaseService.getUserById(participantId);
      return {
        id: user.id,
        name: user.name || user.displayName,
        avatar: user.avatar || user.profilePicture,
        phone: user.phone || user.phoneNumber,
        isOnline: user.isOnline || false
      };
    } catch (error) {
      console.error('❌ Erreur récupération participant:', error);
      return {
        id: participantId,
        name: 'Utilisateur inconnu',
        avatar: '/default-avatar.jpg',
        phone: 'N/A',
        isOnline: false
      };
    }
  }

  getCurrentUserId() {
    // Récupérer l'ID de l'utilisateur actuel depuis le contexte ou localStorage
    return localStorage.getItem('currentUserId') || 'current_user';
  }

  calculateCallDuration(call) {
    if (!call.startTime) return 0;
    const start = new Date(call.startTime);
    const end = call.endedAt ? new Date(call.endedAt) : new Date();
    return Math.floor((end - start) / 1000);
  }

  // Gestion des événements
  emitCallEvent(eventType, data) {
    const event = new CustomEvent(eventType, { detail: data });
    window.dispatchEvent(event);
  }

  addCallListener(eventType, callback) {
    if (!this.callListeners.has(eventType)) {
      this.callListeners.set(eventType, []);
    }
    this.callListeners.get(eventType).push(callback);
  }

  removeCallListener(eventType, callback) {
    if (this.callListeners.has(eventType)) {
      const listeners = this.callListeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Firebase
  async saveCallToFirebase(callData) {
    try {
      await firebaseService.createCall(callData);
    } catch (error) {
      console.error('❌ Erreur sauvegarde appel Firebase:', error);
    }
  }

  async updateCallInFirebase(callId, updates) {
    try {
      await firebaseService.updateCall(callId, updates);
    } catch (error) {
      console.error('❌ Erreur mise à jour appel Firebase:', error);
    }
  }

  // Nettoyage
  cleanupCall(callId) {
    this.activeCalls.delete(callId);
  }

  cleanup() {
    // Nettoyer tous les appels actifs
    this.activeCalls.clear();
    
    // Arrêter les médias
    this.stopMediaStream();
    
    // Fermer les connexions WebRTC
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Nettoyer les listeners
    this.callListeners.clear();
  }

  // Getters
  getActiveCalls() {
    return Array.from(this.activeCalls.values());
  }

  getActiveCall(callId) {
    return this.activeCalls.get(callId);
  }

  isCallActive(callId) {
    return this.activeCalls.has(callId);
  }
}

// Instance singleton
export const callService = new CallService();
export default callService;
