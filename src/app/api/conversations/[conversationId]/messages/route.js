import { NextResponse } from 'next/server';
const messageService = require('@/utils/messageDatabaseService');
const conversationService = require('@/utils/conversationDatabaseService');
const authService = require('@/utils/authDatabaseService');

// GET /api/conversations/[conversationId]/messages - Récupérer les messages d'une conversation
export async function GET(request, { params }) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await authService.verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { conversationId } = params;

    // Vérifier que l'utilisateur est participant
    const participants = await conversationService.getParticipants(conversationId);
    const isParticipant = participants.some(p => p.user_id === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const messageType = searchParams.get('type');
    const senderId = searchParams.get('senderId');
    const isDeleted = searchParams.get('isDeleted');
    const isEdited = searchParams.get('isEdited');
    const isPinned = searchParams.get('isPinned');
    const isStarred = searchParams.get('isStarred');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Construire les filtres
    const filters = {};
    if (messageType) filters.messageType = messageType;
    if (senderId) filters.senderId = senderId;
    if (isDeleted !== null) filters.isDeleted = isDeleted === 'true';
    if (isEdited !== null) filters.isEdited = isEdited === 'true';
    if (isPinned !== null) filters.isPinned = isPinned === 'true';
    if (isStarred !== null) filters.isStarred = isStarred === 'true';
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    // Récupérer les messages
    const messages = await messageService.getMessagesByConversationId(
      conversationId, 
      limit, 
      offset, 
      filters
    );

    // Récupérer les statistiques
    const stats = await messageService.getMessageStats(conversationId);

    return NextResponse.json({
      messages,
      stats,
      pagination: {
        limit,
        offset,
        total: messages.length,
        hasMore: messages.length === limit
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[conversationId]/messages - Envoyer un message
export async function POST(request, { params }) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await authService.verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { conversationId } = params;
    const body = await request.json();

    // Vérifier que l'utilisateur est participant
    const participants = await conversationService.getParticipants(conversationId);
    const isParticipant = participants.some(p => p.user_id === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    const {
      message_type = 'text',
      content,
      media_url,
      media_type,
      media_size,
      media_duration,
      media_thumbnail,
      media_metadata = {},
      reply_to_message_id = null,
      forward_from_message_id = null,
      forward_from_conversation_id = null,
      forward_from_sender_id = null
    } = body;

    // Validation des données
    if (!content && message_type === 'text') {
      return NextResponse.json(
        { error: 'Le contenu est requis pour les messages texte' },
        { status: 400 }
      );
    }

    if (message_type !== 'text' && !media_url) {
      return NextResponse.json(
        { error: 'L\'URL du média est requise pour les messages multimédias' },
        { status: 400 }
      );
    }

    // Vérifier le message de réponse s'il existe
    if (reply_to_message_id) {
      const replyMessage = await messageService.getMessageById(reply_to_message_id);
      if (!replyMessage || replyMessage.conversation_id !== parseInt(conversationId)) {
        return NextResponse.json(
          { error: 'Message de réponse invalide' },
          { status: 400 }
        );
      }
    }

    // Créer le message
    const messageData = {
      conversation_id: parseInt(conversationId),
      sender_id: user.id,
      message_type,
      content,
      media_url,
      media_type,
      media_size,
      media_duration,
      media_thumbnail,
      media_metadata,
      reply_to_message_id,
      forward_from_message_id,
      forward_from_conversation_id,
      forward_from_sender_id
    };

    const message = await messageService.createMessage(messageData);

    // Mettre à jour la conversation avec le dernier message
    await conversationService.updateConversation(conversationId, {
      last_message: content || `[${message_type}]`,
      last_message_sender_id: user.id,
      last_message_timestamp: message.created_at
    });

    return NextResponse.json({
      message,
      message: 'Message envoyé avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
