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
    }
  ]
};

// GET - Récupérer un message spécifique
export async function GET(request, { params }) {
  try {
    const { conversationId, messageId } = params;
    
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const messages = mockMessages[conversationId] || [];
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un message
export async function PUT(request, { params }) {
  try {
    const { conversationId, messageId } = params;
    const updates = await request.json();
    
    const messages = mockMessages[conversationId] || [];
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }
    
    // Mettre à jour le message
    mockMessages[conversationId][messageIndex] = {
      ...mockMessages[conversationId][messageIndex],
      ...updates,
      isEdited: true,
      editedAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: mockMessages[conversationId][messageIndex],
      message: 'Message mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un message
export async function DELETE(request, { params }) {
  try {
    const { conversationId, messageId } = params;
    
    const messages = mockMessages[conversationId] || [];
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { error: 'Message non trouvé' },
        { status: 404 }
      );
    }
    
    // Supprimer le message
    const deletedMessage = mockMessages[conversationId].splice(messageIndex, 1)[0];
    
    return NextResponse.json({
      message: 'Message supprimé avec succès',
      message: deletedMessage
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
