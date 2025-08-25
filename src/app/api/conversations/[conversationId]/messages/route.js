import { NextResponse } from 'next/server';

// Simulation d'une base de données de messages
let mockMessages = {
  'conv_1': [
    {
      id: 'msg_1',
      content: 'Salut ! Comment ça va ?',
      type: 'text',
      sender: { id: 'contact_1', name: 'Jean Dupont' },
      timestamp: '2024-01-15T10:30:00.000Z',
      status: 'read',
      isEdited: false,
      reactions: [
        { userId: 'user_1', type: '👍', timestamp: '2024-01-15T10:31:00.000Z' }
      ],
      replies: [],
      metadata: {}
    },
    {
      id: 'msg_2',
      content: 'Très bien, merci ! Et toi ?',
      type: 'text',
      sender: { id: 'user_1', name: 'Utilisateur Demo' },
      timestamp: '2024-01-15T10:32:00.000Z',
      status: 'delivered',
      isEdited: false,
      reactions: [],
      replies: [],
      metadata: {}
    },
    {
      id: 'msg_3',
      content: 'Parfait ! On se voit demain ?',
      type: 'text',
      sender: { id: 'contact_1', name: 'Jean Dupont' },
      timestamp: '2024-01-15T10:33:00.000Z',
      status: 'sent',
      isEdited: false,
      reactions: [],
      replies: [],
      metadata: {}
    }
  ],
  'conv_2': [
    {
      id: 'msg_4',
      content: 'Merci pour l\'information !',
      type: 'text',
      sender: { id: 'user_1', name: 'Utilisateur Demo' },
      timestamp: '2024-01-15T09:15:00.000Z',
      status: 'read',
      isEdited: false,
      reactions: [],
      replies: [],
      metadata: {}
    }
  ]
};

// GET - Récupérer les messages d'une conversation
export async function GET(request, { params }) {
  try {
    const { conversationId } = params;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const messages = mockMessages[conversationId] || [];
    
    // Pagination
    const paginatedMessages = messages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(offset, offset + limit);
    
    return NextResponse.json({
      messages: paginatedMessages,
      total: messages.length,
      hasMore: offset + limit < messages.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Envoyer un nouveau message
export async function POST(request, { params }) {
  try {
    const { conversationId } = params;
    const messageData = await request.json();
    
    // Validation des données
    if (!messageData.content || !messageData.sender) {
      return NextResponse.json(
        { error: 'Le contenu et l\'expéditeur sont requis' },
        { status: 400 }
    );
    }
    
    // Créer un nouveau message
    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: messageData.content,
      type: messageData.type || 'text',
      sender: messageData.sender,
      timestamp: new Date().toISOString(),
      status: 'sent',
      isEdited: false,
      reactions: [],
      replies: [],
      metadata: messageData.metadata || {}
    };
    
    // Ajouter le message à la conversation
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);
    
    return NextResponse.json({
      message: newMessage,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
