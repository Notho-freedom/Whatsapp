import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { NotificationService } from '@/services/notification.service';

// GET /api/notifications - Récupérer les notifications
export const GET = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit')) || 50;
    const lastDoc = searchParams.get('lastDoc') || null;
    
    const result = await NotificationService.getUserNotifications(userId, limit, lastDoc);
    
    return NextResponse.json({
      notifications: result.notifications,
      hasMore: result.hasMore,
      lastDoc: result.lastDoc?.id || null
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// POST /api/notifications - Créer une notification (usage interne)
export const POST = withAuth(async (request) => {
  try {
    const { targetUserId, notification } = await request.json();
    
    if (!targetUserId || !notification) {
      return NextResponse.json(
        { error: 'Utilisateur cible et notification requis' },
        { status: 400 }
      );
    }
    
    const result = await NotificationService.createNotification(targetUserId, notification);
    
    return NextResponse.json({
      notification: result,
      success: true
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la notification:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// PUT /api/notifications - Marquer toutes comme lues
export const PUT = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    
    const result = await NotificationService.markAllAsRead(userId);
    
    return NextResponse.json({
      success: true,
      count: result.count,
      message: `${result.count} notifications marquées comme lues`
    });
  } catch (error) {
    console.error('❌ Erreur lors du marquage des notifications:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});