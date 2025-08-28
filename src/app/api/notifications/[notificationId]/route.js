import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { NotificationService } from '@/services/notification.service';

// PUT /api/notifications/[notificationId] - Marquer une notification comme lue
export const PUT = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { notificationId } = params;
    
    await NotificationService.markAsRead(notificationId, userId);
    
    return NextResponse.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('❌ Erreur lors du marquage de la notification:', error);
    
    if (error.message === 'Notification non trouvée') {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// DELETE /api/notifications/[notificationId] - Supprimer une notification
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const userId = request.user.uid;
    const { notificationId } = params;
    
    await NotificationService.deleteNotification(notificationId, userId);
    
    return NextResponse.json({
      success: true,
      message: 'Notification supprimée avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la notification:', error);
    
    if (error.message === 'Notification non trouvée') {
      return NextResponse.json(
        { error: 'Notification non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});