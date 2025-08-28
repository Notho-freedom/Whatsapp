import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { MessageService } from '@/services/message.service';
import { ConversationService } from '@/services/conversation.service';
import { NotificationService } from '@/services/notification.service';
import { AuthService } from '@/services/auth.service';

// GET /api/conversations/[conversationId]/messages - Récupérer les messages
export const GET = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { conversationId } = params;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 50;
    const lastDoc = searchParams.get('lastDoc') || null;

    const result = await MessageService.getMessages(conversationId, userId, limit, lastDoc);

    return NextResponse.json({
      messages: result.messages,
      hasMore: result.hasMore,
      lastDoc: result.lastDoc?.id || null
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    
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

// POST /api/conversations/[conversationId]/messages - Envoyer un message
export const POST = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { conversationId } = params;
    const messageData = await request.json();

    // Validation
    if (!messageData.content && !messageData.media) {
      return NextResponse.json(
        { error: 'Contenu ou média requis' },
        { status: 400 }
      );
    }

    // Envoyer le message
    const message = await MessageService.sendMessage(conversationId, userId, messageData);

    // Récupérer la conversation et l'expéditeur pour les notifications
    const [conversation, sender] = await Promise.all([
      ConversationService.getConversation(conversationId, userId),
      AuthService.getUser(userId)
    ]);

    // Créer les notifications en arrière-plan (ne pas attendre)
    NotificationService.createMessageNotifications(message, conversation, sender)
      .catch(error => console.error('Erreur création notifications:', error));

    return NextResponse.json({
      message,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message:', error);
    
    if (error.message.includes('non trouvée') || error.message.includes('non trouvé')) {
      return NextResponse.json(
        { error: error.message },
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
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});