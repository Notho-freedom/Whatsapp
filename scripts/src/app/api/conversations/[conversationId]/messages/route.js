import { NextResponse } from 'next/server';
import firebaseServerService from '@/utils/firebaseServerService';

// GET /api/conversations/[conversationId]/messages - Récupérer les messages d'une conversation
export async function GET(request, { params }) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation requis' },
        { status: 400 }
      );
    }

    const messages = await firebaseServerService.getMessages(conversationId, limit, offset);

    return NextResponse.json({
      messages,
      conversationId,
      limit,
      offset,
      total: messages.length
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[conversationId]/messages - Créer un nouveau message
export async function POST(request, { params }) {
  try {
    const { conversationId } = await params;
    const body = await request.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: 'ID de conversation requis' },
        { status: 400 }
      );
    }

    if (!body.text || !body.sender) {
      return NextResponse.json(
        { error: 'Texte et expéditeur requis' },
        { status: 400 }
      );
    }

                    const messageData = {
                  text: body.text,
                  sender: body.sender,
                  type: body.type || 'text',
                  media: body.media || null, // Ajout du champ media
                  replyTo: body.replyTo || null,
                  reactions: body.reactions || [],
                  isStarred: body.isStarred || false,
                  isRead: body.isRead || false,
                  metadata: body.metadata || {}
                };

    const savedMessage = await firebaseServerService.saveMessage(conversationId, messageData);

    return NextResponse.json({
      message: savedMessage,
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Erreur lors de la création du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
