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
  },
  {
    id: 'conv_2',
    participants: [
      { id: 'user_1', name: 'Utilisateur Demo', profilePhoto: 'https://via.placeholder.com/150' },
      { id: 'contact_2', name: 'Marie Martin', profilePhoto: 'https://via.placeholder.com/150' }
    ],
    type: 'individual',
    createdAt: '2024-01-02T00:00:00.000Z',
    lastMessage: {
      id: 'msg_2',
      content: 'Merci pour l\'information !',
      timestamp: '2024-01-15T09:15:00.000Z',
      sender: { id: 'user_1', name: 'Utilisateur Demo' }
    },
    unreadCount: 0,
    isPinned: false,
    isArchived: false,
    isMuted: false,
    theme: 'default',
    customName: null
  },
  {
    id: 'conv_3',
    participants: [
      { id: 'user_1', name: 'Utilisateur Demo', profilePhoto: 'https://via.placeholder.com/150' },
      { id: 'contact_3', name: 'Pierre Durand', profilePhoto: 'https://via.placeholder.com/150' },
      { id: 'contact_1', name: 'Jean Dupont', profilePhoto: 'https://via.placeholder.com/150' }
    ],
    type: 'group',
    createdAt: '2024-01-03T00:00:00.000Z',
    lastMessage: {
      id: 'msg_3',
      content: 'Rendez-vous demain à 14h ?',
      timestamp: '2024-01-15T08:45:00.000Z',
      sender: { id: 'contact_3', name: 'Pierre Durand' }
    },
    unreadCount: 1,
    isPinned: false,
    isArchived: false,
    isMuted: true,
    theme: 'default',
    customName: 'Groupe Projet'
  }
];

// GET - Récupérer toutes les conversations
export async function GET(request) {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { searchParams } = new URL(request.url);
    const archived = searchParams.get('archived') === 'true';
    const pinned = searchParams.get('pinned') === 'true';
    
    let filteredConversations = mockConversations;
    
    if (archived) {
      filteredConversations = filteredConversations.filter(conv => conv.isArchived);
    } else {
      filteredConversations = filteredConversations.filter(conv => !conv.isArchived);
    }
    
    if (pinned) {
      filteredConversations = filteredConversations.filter(conv => conv.isPinned);
    }
    
    // Trier par dernière activité
    filteredConversations.sort((a, b) => 
      new Date(b.lastMessage?.timestamp || b.createdAt) - 
      new Date(a.lastMessage?.timestamp || a.createdAt)
    );
    
    return NextResponse.json({
      conversations: filteredConversations,
      total: filteredConversations.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle conversation
export async function POST(request) {
  try {
    const { participants, type, customName } = await request.json();

    // Validation des données
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        { error: 'Les participants sont requis' },
        { status: 400 }
      );
    }

    // Créer une nouvelle conversation
    const newConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants,
      type: type || 'individual',
      createdAt: new Date().toISOString(),
      lastMessage: null,
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      isMuted: false,
      theme: 'default',
      customName: customName || null
    };

    // Ajouter à la liste
    mockConversations.unshift(newConversation);

    return NextResponse.json({
      conversation: newConversation,
      message: 'Conversation créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
