import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { MessageService } from '@/services/message.service';

// PUT /api/conversations/[conversationId]/messages/[messageId] - Modifier un message
export const PUT = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { messageId } = params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le contenu ne peut pas être vide' },
        { status: 400 }
      );
    }

    await MessageService.editMessage(messageId, userId, content);

    return NextResponse.json({
      success: true,
      message: 'Message modifié avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la modification du message:', error);
    
    if (error.message.includes('non trouvé')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes('auteur') || error.message.includes('ancien')) {
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

// DELETE /api/conversations/[conversationId]/messages/[messageId] - Supprimer un message
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { messageId } = params;

    await MessageService.deleteMessage(messageId, userId);

    return NextResponse.json({
      success: true,
      message: 'Message supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du message:', error);
    
    if (error.message.includes('non trouvé')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message.includes('Permission')) {
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

// PATCH /api/conversations/[conversationId]/messages/[messageId] - Actions sur un message
export const PATCH = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { messageId } = params;
    const { action, data } = await request.json();

    let result;

    switch (action) {
      case 'addReaction':
        if (!data?.reaction) {
          return NextResponse.json(
            { error: 'Réaction requise' },
            { status: 400 }
          );
        }
        result = await MessageService.addReaction(messageId, userId, data.reaction);
        break;

      case 'removeReaction':
        if (!data?.reaction) {
          return NextResponse.json(
            { error: 'Réaction requise' },
            { status: 400 }
          );
        }
        result = await MessageService.removeReaction(messageId, userId, data.reaction);
        break;

      case 'markAsRead':
        result = await MessageService.markAsRead(messageId, userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Action non supportée' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Action effectuée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'action sur le message:', error);
    
    if (error.message.includes('non trouvé')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});