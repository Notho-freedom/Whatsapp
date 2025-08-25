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
  },
  {
    id: 'notif_2',
    title: 'Appel manqué',
    content: 'Marie Martin a essayé de vous appeler',
    category: 'calls',
    priority: 'high',
    timestamp: '2024-01-15T09:15:00.000Z',
    isRead: true,
    isDismissed: false,
    icon: '/favicon.ico',
    actions: [
      {
        id: 'call_back',
        title: 'Rappeler',
        icon: '/icons/call.svg'
      }
    ],
    metadata: {
      callerId: 'contact_2',
      callId: 'call_1'
    }
  },
  {
    id: 'notif_3',
    title: 'Nouveau statut',
    content: 'Pierre Durand a mis à jour son statut',
    category: 'status',
    priority: 'low',
    timestamp: '2024-01-15T08:45:00.000Z',
    isRead: false,
    isDismissed: false,
    icon: '/favicon.ico',
    actions: [
      {
        id: 'view_status',
        title: 'Voir le statut',
        icon: '/icons/status.svg'
      }
    ],
    metadata: {
      userId: 'contact_3',
      statusId: 'status_1'
    }
  },
  {
    id: 'notif_4',
    title: 'Média reçu',
    content: 'Jean Dupont vous a envoyé une photo',
    category: 'media',
    priority: 'normal',
    timestamp: '2024-01-15T07:30:00.000Z',
    isRead: false,
    isDismissed: false,
    icon: '/favicon.ico',
    actions: [
      {
        id: 'view_media',
        title: 'Voir',
        icon: '/icons/media.svg'
      },
      {
        id: 'download',
        title: 'Télécharger',
        icon: '/icons/download.svg'
      }
    ],
    metadata: {
      conversationId: 'conv_1',
      mediaId: 'media_1',
      mediaType: 'image'
    }
  }
];

// GET - Récupérer toutes les notifications
export async function GET(request) {
  try {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const unread = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    
    let filteredNotifications = mockNotifications;
    
    // Filtrage par catégorie
    if (category) {
      filteredNotifications = filteredNotifications.filter(n => n.category === category);
    }
    
    // Filtrage par priorité
    if (priority) {
      filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
    }
    
    // Filtrage par statut de lecture
    if (unread) {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }
    
    // Trier par timestamp (plus récent en premier)
    filteredNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Pagination
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);
    
    return NextResponse.json({
      notifications: paginatedNotifications,
      total: filteredNotifications.length,
      hasMore: offset + limit < filteredNotifications.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle notification
export async function POST(request) {
  try {
    const notificationData = await request.json();

    // Validation des données
    if (!notificationData.title) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    // Créer une nouvelle notification
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: notificationData.title,
      content: notificationData.content || '',
      category: notificationData.category || 'system',
      priority: notificationData.priority || 'normal',
      timestamp: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
      icon: notificationData.icon || '/favicon.ico',
      actions: notificationData.actions || [],
      metadata: notificationData.metadata || {}
    };

    // Ajouter à la liste
    mockNotifications.unshift(newNotification);

    return NextResponse.json({
      notification: newNotification,
      message: 'Notification créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
