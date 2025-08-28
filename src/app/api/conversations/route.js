import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { ConversationService } from '@/services/conversation.service';

// GET /api/conversations - Récupérer les conversations de l'utilisateur
export const GET = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 50;
    const lastDoc = searchParams.get('lastDoc') || null;

    const result = await ConversationService.getUserConversations(userId, limit, lastDoc);

    return NextResponse.json({
      conversations: result.conversations,
      hasMore: result.hasMore,
      lastDoc: result.lastDoc?.id || null
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// POST /api/conversations - Créer une nouvelle conversation
export const POST = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const body = await request.json();

    const {
      participants,
      type = 'individual',
      name,
      description,
      photoURL
    } = body;

    // Validation
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: 'Participants requis' },
        { status: 400 }
      );
    }

    // S'assurer que le créateur est dans les participants
    if (!participants.includes(userId)) {
      participants.push(userId);
    }

    // Créer la conversation
    const conversation = await ConversationService.createConversation(
      userId,
      participants,
      type,
      {
        name,
        description,
        photoURL
      }
    );

    if (conversation.isExisting) {
      return NextResponse.json({
        conversation,
        message: 'Conversation existante récupérée'
      });
    }

    return NextResponse.json({
      conversation,
      message: 'Conversation créée avec succès'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});