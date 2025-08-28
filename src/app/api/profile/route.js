import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';

// GET /api/profile - Récupérer le profil de l'utilisateur connecté
export const GET = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    
    const [user, stats] = await Promise.all([
      AuthService.getUser(userId),
      UserService.getUserStats(userId)
    ]);
    
    return NextResponse.json({
      profile: {
        ...user,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// PUT /api/profile - Mettre à jour le profil utilisateur
export const PUT = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const updates = await request.json();
    
    await AuthService.updateUserProfile(userId, updates);
    
    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
});

// PATCH /api/profile - Mettre à jour les paramètres utilisateur
export const PATCH = withAuth(async (request) => {
  try {
    const userId = request.user.uid;
    const { settings } = await request.json();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Paramètres requis' },
        { status: 400 }
      );
    }
    
    await UserService.updateUserSettings(userId, settings);
    
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