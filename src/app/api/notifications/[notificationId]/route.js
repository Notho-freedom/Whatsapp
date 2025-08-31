import { NextResponse } from 'next/server';

// Simulation d'une base de données de notifications
let mockNotifications = [
  {
    id: 'notif_1',
    title: 'Nouveau message',
    content: 'Jean Dupont vous a envoyé un message',
    category: 'messages',
    priority: 'normal',
    timestamp: '2024-01-15T10:30:00.000Z',
    isRead: false,
    isDismissed: false,
    icon: '/favicon.ico',
    actions: [
      {
        id: 'reply',
        title: 'Répondre',
        icon: '/icons/reply.svg'
      },
      {
        id: 'view',
        title: 'Voir',
        icon: '/icons/view.svg'
      }
    ],
    metadata: {
      conversationId: 'conv_1',
      senderId: 'contact_1',
      messageId: 'msg_1'
    }
  }
];

// GET - Récupérer une notification spécifique
export async function GET(request, { params }) {
  try {
    const { notificationId } = await params;
    
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      notification
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une notification
export async function PUT(request, { params }) {
  try {
    const { notificationId } = await params;
    const updates = await request.json();
    
    const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    // Mettre à jour la notification
    mockNotifications[notificationIndex] = {
      ...mockNotifications[notificationIndex],
      ...updates
    };
    
    return NextResponse.json({
      notification: mockNotifications[notificationIndex],
      message: 'Notification mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une notification
export async function DELETE(request, { params }) {
  try {
    const { notificationId } = await params;
    
    const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    // Supprimer la notification
    const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0];
    
    return NextResponse.json({
      message: 'Notification supprimée avec succès',
      notification: deletedNotification
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
