import { NextResponse } from 'next/server';

// Simulation de la synchronisation des notifications
const syncNotificationsWithServer = async () => {
  // Simulation d'un délai de synchronisation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Retourner des notifications synchronisées
  return [
    {
      id: 'notif_sync_1',
      title: 'Synchronisation terminée',
      content: 'Vos notifications ont été synchronisées avec succès',
      category: 'system',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
      icon: '/favicon.ico',
      actions: [],
      metadata: {
        syncId: 'sync_1',
        timestamp: new Date().toISOString()
      }
    },
    {
      id: 'notif_sync_2',
      title: 'Nouveau message synchronisé',
      content: 'Un message a été reçu pendant la synchronisation',
      category: 'messages',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
      icon: '/favicon.ico',
      actions: [
        {
          id: 'view',
          title: 'Voir',
          icon: '/icons/view.svg'
        }
      ],
      metadata: {
        conversationId: 'conv_sync_1',
        messageId: 'msg_sync_1'
      }
    }
  ];
};

export async function GET(request) {
  try {
    // Simulation de la synchronisation
    const syncedNotifications = await syncNotificationsWithServer();
    
    return NextResponse.json({
      notifications: syncedNotifications,
      total: syncedNotifications.length,
      syncedAt: new Date().toISOString(),
      message: 'Synchronisation terminée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}
