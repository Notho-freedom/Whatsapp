/**
 * Utilitaires pour la gestion des conversations
 * Système déterministe : chaque paire d'utilisateurs a une conversation unique
 */

/**
 * Génère un ID de conversation unique et déterministe basé sur les IDs des deux participants
 * Exemple : avec userId1="user-b" et userId2="user-a" => "conv-user-a_user-b"
 * L'ordre est toujours le même peu importe qui initie
 *
 * @param {string} userId1 - ID du premier utilisateur
 * @param {string} userId2 - ID du deuxième utilisateur
 * @returns {string} - ID de conversation unique et déterministe
 */
export function generateConversationId(userId1, userId2) {
  if (!userId1 || !userId2) {
    console.error(
      '⚠️ Les deux IDs utilisateur sont requis pour générer un ID de conversation'
    );
    return null;
  }

  // Trier les IDs pour assurer le même ordre peu importe qui les passe
  const ids = [userId1, userId2].sort();
  return `conv-${ids[0]}_${ids[1]}`;
}

/**
 * Extrait les IDs des participants d'un ID de conversation
 * @param {string} conversationId - ID de conversation au format "conv-userId1_userId2"
 * @returns {object} - { userId1, userId2 }
 */
export function extractParticipantsFromConversationId(conversationId) {
  if (!conversationId || !conversationId.startsWith('conv-')) {
    return { userId1: null, userId2: null };
  }

  const parts = conversationId.replace('conv-', '').split('_');
  return {
    userId1: parts[0] || null,
    userId2: parts[1] || null,
  };
}

/**
 * Obtient l'autre participant d'une conversation
 * @param {string} conversationId - ID de conversation
 * @param {string} currentUserId - ID de l'utilisateur courant
 * @returns {string} - ID de l'autre participant
 */
export function getOtherParticipantId(conversationId, currentUserId) {
  const { userId1, userId2 } =
    extractParticipantsFromConversationId(conversationId);

  if (userId1 === currentUserId) {
    return userId2;
  } else if (userId2 === currentUserId) {
    return userId1;
  }

  return null;
}

/**
 * Crée les données de base pour une nouvelle conversation
 * @param {string} userId1 - ID du premier participant
 * @param {string} userId2 - ID du deuxième participant
 * @param {object} user1Info - Infos du participant 1 { name, avatar }
 * @param {object} user2Info - Infos du participant 2 { name, avatar }
 * @returns {object} - Objet conversation à stocker dans Firebase
 */
export function createConversationData(userId1, userId2, user1Info, user2Info) {
  const conversationId = generateConversationId(userId1, userId2);

  return {
    id: conversationId,
    type: 'individual',
    participants: [userId1, userId2],
    participants_info: {
      [userId1]: {
        name: user1Info.name || 'Utilisateur',
        avatar: user1Info.avatar || '/default-avatar.png',
      },
      [userId2]: {
        name: user2Info.name || 'Utilisateur',
        avatar: user2Info.avatar || '/default-avatar.png',
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_message: null,
    last_message_time: null,
    created_by: userId1, // L'utilisateur qui a envoyé le premier message
  };
}

/**
 * Transforme une conversation pour l'affichage selon l'utilisateur connecté
 * @param {object} conversation - Objet conversation depuis Firebase
 * @param {string} currentUserId - ID de l'utilisateur connecté
 * @returns {object} - Conversation transformée pour affichage
 */
export function transformConversationForDisplay(conversation, currentUserId) {
  if (!conversation || !conversation.participants) {
    return null;
  }

  // Trouver l'autre participant (pas l'utilisateur courant)
  const otherParticipantId = conversation.participants.find(
    p => p !== currentUserId
  );

  if (!otherParticipantId) {
    return null;
  }

  // Récupérer les infos de l'autre participant
  let otherParticipantName =
    conversation.participants_info?.[otherParticipantId]?.name ||
    conversation.name ||
    otherParticipantId ||
    'Contact';

  let otherParticipantAvatar =
    conversation.participants_info?.[otherParticipantId]?.avatar ||
    conversation.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      otherParticipantName
    )}&background=6a7175&color=fff&size=40`;

  return {
    id: conversation.id,
    conversationId: conversation.id,
    name: otherParticipantName,
    avatar: otherParticipantAvatar,
    otherParticipantId,
    lastMessage: conversation.last_message,
    lastMessageTime: conversation.last_message_time,
    unreadCount: conversation.unread_count || 0,
    isPinned: conversation.is_pinned || false,
    isMuted: conversation.is_muted || false,
    isContact: false,
    isConversation: true,
    participants: conversation.participants,
  };
}
