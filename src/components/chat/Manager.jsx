import ConversationManager from '@/components/conversations/ConversationManager';
import MessageManager from '@/components/messages/MessageManager';
import { useRealtime } from '@/hooks';

const conversationManager = ConversationManager({ currentUser });
const messageManager = MessageManager();

/**
 * Envoie un message, crée la conversation si elle n'existe pas
 * @param {Object} contact - Le destinataire (utilisateur/contact)
 * @param {Object} messageData - Les données du message à envoyer
 */
export const sendMessageWithAutoConversation = async (contact, messageData) => {
    const currentUser = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
    const currentUserId = currentUser?.id;
    const { sendNotification } = useRealtime(currentUserId);
  // 1. Vérifier si la conversation existe déjà
  let conversation = null;
  const userConversations = await conversationManager.getUserConversations();

  // Recherche par participants (adapte selon ta structure)
  conversation = userConversations.find(conv =>
    conv.participants &&
    conv.participants.includes(currentUser.id) &&
    conv.participants.includes(contact.id)
  );

  // 2. Créer la conversation si elle n'existe pas
  if (!conversation) {
    const newConvData = {
      type: 'individual',
      name: contact.displayName || contact.name || 'Nouveau contact',
      avatar_url: contact.avatar || contact.photos?.[0]?.url || '/default-avatar.png',
      description: `Conversation avec ${contact.displayName || contact.name || 'Contact'}`,
      participants: [currentUser.id, contact.id],
      created_by: currentUser.id,
      custom_settings: { contact }
    };
    conversation = await conversationManager.createConversation(newConvData);
  }

  // 3. Envoyer le message
  const response = await messageManager.addMessage(conversation.id, {
    ...messageData,
    sender: currentUser.id,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString('fr-FR')
  });

  if (response && response.id) {
    // 4. Envoyer une notification au destinataire
    sendNotification(contact.id, {
        title: `Nouveau message de ${currentUser.name || 'un contact'}`,
        body: messageData.text || 'Vous avez reçu un nouveau message.',
        conversationId: conversation.id
    });
  }

  return conversation.id;
};