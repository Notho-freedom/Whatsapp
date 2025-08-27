import { NextResponse } from 'next/server';
const conversationService = require('@/utils/conversationDatabaseService');
const authService = require('@/utils/authDatabaseService');

// GET /api/conversations - Récupérer les conversations de l'utilisateur
export async function GET(request) {
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

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const query = searchParams.get('query') || '';
    const type = searchParams.get('type');
    const isGroup = searchParams.get('isGroup');
    const isPinned = searchParams.get('isPinned');
    const isArchived = searchParams.get('isArchived');

    // Construire les filtres
    const filters = {};
    if (type) filters.type = type;
    if (isGroup !== null) filters.isGroup = isGroup === 'true';
    if (isPinned !== null) filters.isPinned = isPinned === 'true';
    if (isArchived !== null) filters.isArchived = isArchived === 'true';
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;

    // Récupérer les conversations
    let conversations;
    if (query) {
      conversations = await conversationService.searchConversations(user.id, query, filters);
    } else {
      conversations = await conversationService.getConversationsByUserId(user.id, limit, offset);
    }

    // Récupérer les statistiques
    const stats = await conversationService.getConversationStats(user.id);

    return NextResponse.json({
      conversations,
      stats,
      pagination: {
        limit,
        offset,
        total: conversations.length,
        hasMore: conversations.length === limit
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(request) {
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

    const body = await request.json();
    const {
      conversation_type = 'individual',
      title,
      description,
      is_group = false,
      group_photo_url,
      group_settings = {},
      participants = []
    } = body;

    // Validation des données
    if (!title && is_group) {
      return NextResponse.json(
        { error: 'Le titre est requis pour les conversations de groupe' },
        { status: 400 }
      );
    }

    if (is_group && participants.length < 2) {
      return NextResponse.json(
        { error: 'Une conversation de groupe doit avoir au moins 2 participants' },
        { status: 400 }
      );
    }

    // Créer la conversation
    const conversationData = {
      conversation_type,
      title: is_group ? title : null,
      description,
      created_by: user.id,
      is_group,
      group_photo_url,
      group_settings
    };

    const conversation = await conversationService.createConversation(conversationData);

    // Ajouter le créateur comme participant
    await conversationService.addParticipant(conversation.id, user.id, {
      role: is_group ? 'admin' : 'participant',
      is_admin: is_group
    });

    // Ajouter les autres participants
    for (const participantId of participants) {
      if (participantId !== user.id) {
        await conversationService.addParticipant(conversation.id, participantId, {
          role: 'participant'
        });
      }
    }

    // Récupérer la conversation avec les participants
    const participantsList = await conversationService.getParticipants(conversation.id);

    return NextResponse.json({
      conversation: {
        ...conversation,
        participants: participantsList
      },
      message: 'Conversation créée avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
