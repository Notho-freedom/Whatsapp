/**
 * Gestionnaire d'événements centralisé pour WhatsApp Desktop
 * Gère tous les événements personnalisés entre composants
 */

class EventManager {
  constructor() {
    this.listeners = new Map();
    this.isInitialized = false;
  }

  // Initialiser les écouteurs globaux seulement côté client
  initializeGlobalListeners() {
    // Vérifier si on est côté client et si pas déjà initialisé
    if (typeof window === 'undefined' || this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // Événements d'appels
    this.addGlobalListener('create-call', this.handleCreateCall.bind(this));
    this.addGlobalListener('start-call', this.handleStartCall.bind(this));
    this.addGlobalListener('call-started', this.handleCallStarted.bind(this));
    this.addGlobalListener('call-accepted', this.handleCallAccepted.bind(this));
    this.addGlobalListener('call-declined', this.handleCallDeclined.bind(this));
    this.addGlobalListener('call-control-changed', this.handleCallControlChanged.bind(this));
    this.addGlobalListener('open-calls', this.handleOpenCalls.bind(this));
    this.addGlobalListener('video-call-started', this.handleVideoCallStarted.bind(this));
    this.addGlobalListener('voice-call-started', this.handleVoiceCallStarted.bind(this));

    // Événements de chat
    this.addGlobalListener('chat-selected', this.handleChatSelected.bind(this));
    this.addGlobalListener('new-chat', this.handleNewChat.bind(this));
    this.addGlobalListener('filter-chats', this.handleFilterChats.bind(this));
    this.addGlobalListener('open-chat', this.handleOpenChat.bind(this));
    this.addGlobalListener('search-chat', this.handleSearchChat.bind(this));
    this.addGlobalListener('chat-search-opened', this.handleChatSearchOpened.bind(this));
    this.addGlobalListener('open-chat-menu', this.handleOpenChatMenu.bind(this));
    this.addGlobalListener('chat-menu-opened', this.handleChatMenuOpened.bind(this));

    // Événements de messages
    this.addGlobalListener('start-voice-recording', this.handleStartVoiceRecording.bind(this));
    this.addGlobalListener('open-emoji-picker', this.handleOpenEmojiPicker.bind(this));
    this.addGlobalListener('open-attachment-menu', this.handleOpenAttachmentMenu.bind(this));

    // Événements de navigation
    this.addGlobalListener('tab-changed', this.handleTabChanged.bind(this));
    this.addGlobalListener('open-status', this.handleOpenStatus.bind(this));
    this.addGlobalListener('open-starred', this.handleOpenStarred.bind(this));
    this.addGlobalListener('open-archived', this.handleOpenArchived.bind(this));
    this.addGlobalListener('open-settings', this.handleOpenSettings.bind(this));
    this.addGlobalListener('open-profile', this.handleOpenProfile.bind(this));

    // Événements utilitaires
    this.addGlobalListener('open-keypad', this.handleOpenKeypad.bind(this));
    this.addGlobalListener('add-participant', this.handleAddParticipant.bind(this));
    this.addGlobalListener('open-call-settings', this.handleOpenCallSettings.bind(this));
    this.addGlobalListener('show-notification', this.handleShowNotification.bind(this));
    this.addGlobalListener('open-favorites', this.handleOpenFavorites.bind(this));
    this.addGlobalListener('add-contact', this.handleAddContact.bind(this));
    this.addGlobalListener('open-call-options', this.handleOpenCallOptions.bind(this));
  }

  // Ajouter un écouteur global
  addGlobalListener(eventName, handler) {
    if (typeof window === 'undefined') {
      return;
    }
    
    window.addEventListener(eventName, handler);
    this.listeners.set(eventName, handler);
  }

  // Supprimer un écouteur global
  removeGlobalListener(eventName) {
    if (typeof window === 'undefined') {
      return;
    }
    
    const handler = this.listeners.get(eventName);
    if (handler) {
      window.removeEventListener(eventName, handler);
      this.listeners.delete(eventName);
    }
  }

  // Gestionnaires d'événements d'appels
  handleCreateCall(event) {
    console.log('📞 Creating call:', event.detail);
    // Ici on peut implémenter la logique de création d'appel
    // Par exemple, ouvrir l'écran d'appel, démarrer l'appel, etc.
  }

  handleStartCall(event) {
    console.log('📞 Starting call:', event.detail);
    const { type, participant, fromChat } = event.detail;
    
    if (fromChat) {
      // L'appel vient du chat, on peut fermer le chat et ouvrir l'écran d'appel
      window.dispatchEvent(new CustomEvent('switch-to-call', { 
        detail: { type, participant } 
      }));
    }
  }

  handleCallStarted(event) {
    console.log('📞 Call started:', event.detail);
    // Notifier l'interface que l'appel a commencé
  }

  handleCallAccepted(event) {
    console.log('📞 Call accepted:', event.detail);
    // Mettre à jour l'interface pour l'appel accepté
  }

  handleCallDeclined(event) {
    console.log('📞 Call declined:', event.detail);
    // Mettre à jour l'interface pour l'appel refusé
  }

  handleCallControlChanged(event) {
    console.log('📞 Call control changed:', event.detail);
    const { action, value, callId } = event.detail;
    
    // Mettre à jour l'état de l'appel selon l'action
    switch (action) {
      case 'mute':
        console.log(`Microphone ${value ? 'muted' : 'unmuted'}`);
        break;
      case 'video':
        console.log(`Video ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'speaker':
        console.log(`Speaker ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'screen-share':
        console.log(`Screen sharing ${value ? 'started' : 'stopped'}`);
        break;
      default:
        break;
    }
  }

  handleOpenCalls(event) {
    console.log('📞 Opening calls:', event.detail);
    // Ouvrir l'écran des appels
  }

  handleVideoCallStarted(event) {
    console.log('📹 Video call started:', event.detail);
    const { participant, fromChat, timestamp } = event.detail;
    
    // Logique spécifique pour l'appel vidéo
    if (fromChat) {
      console.log(`Starting video call with ${participant.name} from chat`);
      // Ici on peut implémenter la logique spécifique à l'appel vidéo
    }
  }

  handleVoiceCallStarted(event) {
    console.log('📞 Voice call started:', event.detail);
    const { participant, fromChat, timestamp } = event.detail;
    
    // Logique spécifique pour l'appel vocal
    if (fromChat) {
      console.log(`Starting voice call with ${participant.name} from chat`);
      // Ici on peut implémenter la logique spécifique à l'appel vocal
    }
  }

  // Gestionnaires d'événements de chat
  handleChatSelected(event) {
    console.log('💬 Chat selected:', event.detail);
    const { chat, timestamp } = event.detail;
    
    // Mettre à jour l'interface pour le chat sélectionné
    // Marquer les messages comme lus, etc.
  }

  handleNewChat(event) {
    console.log('💬 New chat:', event.detail);
    // Ouvrir l'interface de création de nouveau chat
  }

  handleFilterChats(event) {
    console.log('💬 Filter chats:', event.detail);
    // Ouvrir l'interface de filtrage des chats
  }

  handleOpenChat(event) {
    console.log('💬 Open chat:', event.detail);
    const { userId, action } = event.detail;
    
    if (action === 'reply-to-call') {
      // Ouvrir le chat pour répondre à un appel
      console.log('Opening chat to reply to call');
    }
  }

  handleSearchChat(event) {
    console.log('💬 Search chat:', event.detail);
    // Ouvrir la recherche dans le chat spécifié
  }

  handleChatSearchOpened(event) {
    console.log('🔍 Chat search opened:', event.detail);
    const { chatId, participant, timestamp } = event.detail;
    
    // Logique spécifique pour l'ouverture de la recherche
    console.log(`Search opened in chat with ${participant.name}`);
    // Ici on peut implémenter la logique d'ouverture de la recherche
  }

  handleOpenChatMenu(event) {
    console.log('📋 Chat menu opened:', event.detail);
    const { chatId, participant, action, timestamp } = event.detail;
    
    // Logique spécifique pour l'ouverture du menu du chat
    console.log(`Menu opened for chat with ${participant.name}`);
    // Ici on peut implémenter la logique d'ouverture du menu
  }

  handleChatMenuOpened(event) {
    console.log('📋 Chat menu notification:', event.detail);
    const { chatId, participant, timestamp } = event.detail;
    
    // Notification que le menu du chat a été ouvert
    console.log(`Menu notification for chat with ${participant.name}`);
    // Ici on peut implémenter des notifications ou des actions secondaires
  }

  // Gestionnaires d'événements de messages
  handleStartVoiceRecording(event) {
    console.log('🎤 Start voice recording:', event.detail);
    // Démarrer l'enregistrement vocal
  }

  handleOpenEmojiPicker(event) {
    console.log('😊 Open emoji picker:', event.detail);
    // Ouvrir le sélecteur d'emojis
  }

  handleOpenAttachmentMenu(event) {
    console.log('📎 Open attachment menu:', event.detail);
    // Ouvrir le menu des pièces jointes
  }

  // Gestionnaires d'événements de navigation
  handleTabChanged(event) {
    console.log('🔄 Tab changed:', event.detail);
    const { tab, timestamp } = event.detail;
    
    // Mettre à jour l'interface selon l'onglet sélectionné
  }

  handleOpenStatus(event) {
    console.log('📱 Open status:', event.detail);
    // Ouvrir l'écran des statuts
  }

  handleOpenStarred(event) {
    console.log('⭐ Open starred:', event.detail);
    // Ouvrir les messages favoris
  }

  handleOpenArchived(event) {
    console.log('📦 Open archived:', event.detail);
    // Ouvrir les chats archivés
  }

  handleOpenSettings(event) {
    console.log('⚙️ Open settings:', event.detail);
    // Ouvrir les paramètres
  }

  handleOpenProfile(event) {
    console.log('👤 Open profile:', event.detail);
    // Ouvrir le profil utilisateur
  }

  // Gestionnaires d'événements utilitaires
  handleOpenKeypad(event) {
    console.log('🔢 Open keypad:', event.detail);
    // Ouvrir le pavé numérique
  }

  handleAddParticipant(event) {
    console.log('👥 Add participant:', event.detail);
    // Ouvrir le sélecteur de participants
  }

    handleOpenCallSettings(event) {
    console.log('⚙️ Open call settings:', event.detail);
    // Ouvrir les paramètres d'appel
  }

  handleOpenFavorites(event) {
    console.log('⭐ Open favorites:', event.detail);
    // Ouvrir la liste complète des favoris
  }

  handleAddContact(event) {
    console.log('👤 Add contact:', event.detail);
    // Ouvrir l'interface d'ajout de contact
  }

  handleOpenCallOptions(event) {
    console.log('📱 Open call options:', event.detail);
    // Ouvrir le menu des options d'appel
  }

  handleShowNotification(event) {
    console.log('🔔 Show notification:', event.detail);
    const { type, message } = event.detail;

    // Afficher la notification selon le type
    switch (type) {
      case 'success':
        console.log(`✅ ${message}`);
        break;
      case 'error':
        console.log(`❌ ${message}`);
        break;
      case 'warning':
        console.log(`⚠️ ${message}`);
        break;
      case 'info':
        console.log(`ℹ️ ${message}`);
        break;
      default:
        console.log(message);
    }
  }

  // Méthode pour nettoyer tous les écouteurs
  cleanup() {
    if (typeof window === 'undefined') {
      return;
    }
    
    this.listeners.forEach((handler, eventName) => {
      window.removeEventListener(eventName, handler);
    });
    this.listeners.clear();
  }
}

// Créer et exporter une instance singleton
const eventManager = new EventManager();

export default eventManager;
