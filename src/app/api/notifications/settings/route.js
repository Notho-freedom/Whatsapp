import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { NotificationService } from '@/services/notification.service';

// GET /api/notifications/settings - Récupérer les paramètres de notification
export const GET = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    
    const settings = await NotificationService.getUserNotificationSettings(userId);
    
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// PUT /api/notifications/settings - Mettre à jour les paramètres
export const PUT = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const settings = await request.json();
    
    await NotificationService.updateNotificationSettings(userId, settings);
    
    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// POST /api/notifications/settings - Enregistrer un token FCM
export const POST = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { fcmToken } = await request.json();
    
    if (!fcmToken) {
      return NextResponse.json(
        { error: 'Token FCM requis' },
        { status: 400 }
      );
    }
    
    await NotificationService.registerFCMToken(userId, fcmToken);
    
    return NextResponse.json({
      success: true,
      message: 'Token FCM enregistré avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement du token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});