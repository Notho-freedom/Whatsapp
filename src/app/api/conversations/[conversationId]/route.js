import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { ConversationService } from '@/services/conversation.service';

// GET /api/conversations/[conversationId] - Récupérer une conversation spécifique
export const GET = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { conversationId } = params;

    const conversation = await ConversationService.getConversation(conversationId, userId);

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la conversation:', error);
    
    if (error.message === 'Conversation non trouvée') {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }
    
    if (error.message === 'Accès non autorisé') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// PUT /api/conversations/[conversationId] - Mettre à jour une conversation
export const PUT = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { conversationId } = params;
    const updates = await request.json();

    await ConversationService.updateConversation(conversationId, userId, updates);

    return NextResponse.json({
      success: true,
      message: 'Conversation mise à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de la conversation:', error);
    
    if (error.message.includes('non trouvée')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes('autorisé') || error.message.includes('créateur')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// DELETE /api/conversations/[conversationId] - Supprimer/archiver une conversation
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { conversationId } = params;

    const result = await ConversationService.deleteConversation(conversationId, userId);

    return NextResponse.json({
      success: true,
      message: result.deleted ? 'Conversation supprimée' : 'Conversation archivée',
      ...result
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la conversation:', error);
    
    if (error.message.includes('non trouvée')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes('créateur')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// PATCH /api/conversations/[conversationId] - Mettre à jour les paramètres utilisateur
export const PATCH = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { conversationId } = params;
    const settings = await request.json();

    await ConversationService.updateUserSettings(conversationId, userId, settings);

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});