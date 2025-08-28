import { NextResponse } from 'next/server';
import messageService from '@/utils/messageDatabaseService';
import conversationService from '@/utils/conversationDatabaseService';
import authService from '@/utils/authDatabaseService';

// GET /api/conversations/[conversationId]/messages/[messageId] - Récupérer un message spécifique
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

    const { conversationId, messageId } = params;

    // Vérifier que l'utilisateur est participant
    const participants = await conversationService.getParticipants(conversationId);
    const isParticipant = participants.some(p => p.user_id === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // Récupérer le message
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le message appartient à la conversation
    if (message.conversation_id !== parseInt(conversationId)) {
      return NextResponse.json(
        { error: 'Message non trouvé dans cette conversation' },
        { status: 404 }
      );
    }

    // Récupérer les réactions et lectures
    const reactions = await messageService.getMessageReactions(messageId);
    const reads = await messageService.getMessageReads(messageId);

    return NextResponse.json({
      message: {
        ...message,
        reactions,
        reads
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/conversations/[conversationId]/messages/[messageId] - Modifier un message
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

    const { conversationId, messageId } = params;
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

    // Récupérer le message
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le message appartient à la conversation
    if (message.conversation_id !== parseInt(conversationId)) {
      return NextResponse.json(
        { error: 'Message non trouvé dans cette conversation' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'expéditeur du message
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez modifier que vos propres messages' },
        { status: 403 }
      );
    }

    // Préparer les données de mise à jour
    const updateData = {};

    // Gestion de l'édition de contenu
    if (body.content !== undefined) {
      updateData.content = body.content;
      updateData.is_edited = true;
      updateData.edited_at = new Date().toISOString();
      
      // Ajouter à l'historique d'édition
      const editHistory = message.edit_history || [];
      editHistory.push({
        content: message.content,
        edited_at: updateData.edited_at
      });
      updateData.edit_history = editHistory;
    }

    // Gestion des autres champs
    if (body.is_pinned !== undefined) {
      updateData.is_pinned = body.is_pinned;
      updateData.pinned_at = body.is_pinned ? new Date().toISOString() : null;
      updateData.pinned_by = body.is_pinned ? user.id : null;
    }

    if (body.is_starred !== undefined) {
      updateData.is_starred = body.is_starred;
      updateData.starred_at = body.is_starred ? new Date().toISOString() : null;
      updateData.starred_by = body.is_starred ? user.id : null;
    }

    // Mettre à jour le message
    const updatedMessage = await messageService.updateMessage(messageId, updateData);

    return NextResponse.json({
      message: updatedMessage,
      message: 'Message mis à jour avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la modification du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[conversationId]/messages/[messageId] - Supprimer un message
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

    const { conversationId, messageId } = params;

    // Vérifier que l'utilisateur est participant
    const participants = await conversationService.getParticipants(conversationId);
    const isParticipant = participants.some(p => p.user_id === user.id);
    
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Accès non autorisé à cette conversation' },
        { status: 403 }
      );
    }

    // Récupérer le message
    const message = await messageService.getMessageById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le message appartient à la conversation
    if (message.conversation_id !== parseInt(conversationId)) {
      return NextResponse.json(
        { error: 'Message non trouvé dans cette conversation' },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    const isSender = message.sender_id === user.id;
    const isAdmin = participants.find(p => p.user_id === user.id)?.is_admin;

    if (!isSender && !isAdmin) {
      return NextResponse.json(
        { error: 'Vous ne pouvez supprimer que vos propres messages' },
        { status: 403 }
      );
    }

    // Supprimer le message
    const reason = isAdmin && !isSender ? 'Supprimé par un administrateur' : null;
    await messageService.deleteMessage(messageId, user.id, reason);

    return NextResponse.json({
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
