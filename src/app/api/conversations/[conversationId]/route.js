import { NextResponse } from 'next/server';

// Simulation d'une base de données de conversations
let mockConversations = [
  {
    id: 'conv_1',
    participants: [
      { id: 'user_1', name: 'Utilisateur Demo', profilePhoto: 'https://via.placeholder.com/150' },
      { id: 'contact_1', name: 'Jean Dupont', profilePhoto: 'https://via.placeholder.com/150' }
    ],
    type: 'individual',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastMessage: {
      id: 'msg_1',
      content: 'Salut ! Comment ça va ?',
      timestamp: '2024-01-15T10:30:00.000Z',
      sender: { id: 'contact_1', name: 'Jean Dupont' }
    },
    unreadCount: 2,
    isPinned: true,
    isArchived: false,
    isMuted: false,
    theme: 'default',
    customName: null
  }
];

// GET - Récupérer une conversation spécifique
export async function GET(request, { params }) {
  try {
    const { conversationId } = params;
    
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      conversation
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une conversation
export async function PUT(request, { params }) {
  try {
    const { conversationId } = params;
    const updates = await request.json();
    
    const conversationIndex = mockConversations.findIndex(conv => conv.id === conversationId);
    
    if (conversationIndex === -1) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }
    
    // Mettre à jour la conversation
    mockConversations[conversationIndex] = {
      ...mockConversations[conversationIndex],
      ...updates
    };
    
    return NextResponse.json({
      conversation: mockConversations[conversationIndex],
      message: 'Conversation mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une conversation
export async function DELETE(request, { params }) {
  try {
    const { conversationId } = params;
    
    const conversationIndex = mockConversations.findIndex(conv => conv.id === conversationId);
    
    if (conversationIndex === -1) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }
    
    // Supprimer la conversation
    const deletedConversation = mockConversations.splice(conversationIndex, 1)[0];
    
    return NextResponse.json({
      message: 'Conversation supprimée avec succès',
      conversation: deletedConversation
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
