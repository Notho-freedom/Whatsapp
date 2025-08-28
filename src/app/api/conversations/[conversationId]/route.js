import { NextResponse } from 'next/server';
import conversationService from '@/utils/conversationDatabaseService';
import authService from '@/utils/authDatabaseService';

// GET /api/conversations/[conversationId] - Récupérer une conversation spécifique
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

    // Récupérer la conversation
    const conversation = await conversationService.getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est participant
    const participants = await conversationService.getParticipants(conversationId);
    const isParticipant = participants.some(p => p.user_id === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      conversation: {
        ...conversation,
        participants
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[conversationId] - Mettre à jour une conversation
export async function PUT(request, { params }) {
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
    const userParticipant = participants.find(p => p.user_id === user.id);
    
    if (!userParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // Vérifier les permissions pour les modifications de groupe
    const conversation = await conversationService.getConversationById(conversationId);
    if (conversation.is_group && body.title && !userParticipant.is_admin) {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent modifier le titre du groupe' },
        { status: 403 }
      );
    }

    // Mettre à jour la conversation
    const updatedConversation = await conversationService.updateConversation(conversationId, body);

    return NextResponse.json({
      conversation: updatedConversation,
      message: 'Conversation mise à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[conversationId] - Supprimer une conversation
export async function DELETE(request, { params }) {
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
    const userParticipant = participants.find(p => p.user_id === user.id);
    
    if (!userParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // Vérifier les permissions pour la suppression
    const conversation = await conversationService.getConversationById(conversationId);
    if (conversation.is_group && !userParticipant.is_admin) {
      return NextResponse.json(
        { error: 'Seuls les administrateurs peuvent supprimer un groupe' },
        { status: 403 }
      );
    }

    // Supprimer la conversation
    await conversationService.deleteConversation(conversationId);

    return NextResponse.json({
      message: 'Conversation supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
